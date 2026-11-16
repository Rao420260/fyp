import fs from 'node:fs/promises'
import path from 'node:path'
import pool from '../config/db.js'
import { UPLOAD_DIR } from '../middleware/upload.js'

const PLATFORMS = ['facebook', 'instagram', 'linkedin']
const STATUSES = ['draft', 'pending', 'approved', 'rejected', 'scheduled', 'published', 'failed']
const EDITABLE = ['draft', 'rejected'] // sirf in halat me creator edit kar sakta hai
const MAX_IMAGES = 4

// ---------- Chhote helpers ----------

function serverError(res, err) {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}

function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

// Frontend se aane wala data saaf karo
function readInput(body) {
  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  const platforms = Array.isArray(body.platforms)
    ? [...new Set(body.platforms.map(String))]
    : []
  return { title, content, platforms }
}

function validate({ title, content, platforms }) {
  if (!title) return 'Title is required'
  if (title.length > 150) return 'Title must be 150 characters or less'
  if (!content) return 'Post text is required'
  if (content.length > 3000) return 'Post text is too long (maximum 3000 characters)'
  if (platforms.some((p) => !PLATFORMS.includes(p))) return 'Invalid platform selected'
  return null
}

// Kai database kaam ek saath: ya sab hon, ya koi nahi (transaction)
async function withTransaction(work) {
  const conn = await pool.getConnection()
  try {
    await conn.beginTransaction()
    const result = await work(conn)
    await conn.commit()
    return result
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

// Timeline me ek entry likho
async function addHistory(conn, postId, from, to, userId, note) {
  await conn.query(
    'INSERT INTO post_status_history (post_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
    [postId, from, to, userId, note]
  )
}

// Platform ke naam se connected account dhoondo (har platform ka pehla)
async function findAccounts(platforms) {
  if (platforms.length === 0) return { ids: [], missing: [] }
  const [rows] = await pool.query(
    "SELECT id, platform FROM social_accounts WHERE status = 'connected' AND platform IN (?) ORDER BY id",
    [platforms]
  )
  const byPlatform = new Map()
  for (const row of rows) {
    if (!byPlatform.has(row.platform)) byPlatform.set(row.platform, row.id)
  }
  const missing = platforms.filter((p) => !byPlatform.has(p))
  return { ids: [...byPlatform.values()], missing }
}

async function loadPost(id) {
  const [rows] = await pool.query(
    `SELECT p.id, p.author_id, p.title, p.content, p.status,
            p.submitted_at, p.created_at, p.updated_at,
            u.name AS author_name
     FROM posts p
     JOIN users u ON u.id = p.author_id
     WHERE p.id = ?`,
    [id]
  )
  return rows[0]
}

// Kaun kaunsi post dekh sakta hai
function canView(user, post) {
  if (user.role === 'admin') return true
  if (user.role === 'creator') return post.author_id === user.id
  if (user.role === 'manager') return post.status !== 'draft'
  return false
}

// Creator ke liye: post uski apni ho aur edit ke qabil ho.
// Masla ho to jawab khud bhej deta hai aur null lautata hai.
async function loadOwnEditablePost(req, res) {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ message: 'Invalid post id' })
    return null
  }
  const post = await loadPost(id)
  if (!post || post.author_id !== req.user.id) {
    res.status(404).json({ message: 'Post not found' })
    return null
  }
  if (!EDITABLE.includes(post.status)) {
    res.status(409).json({ message: `A ${post.status} post cannot be changed` })
    return null
  }
  return post
}

async function removeUploadedFile(fileUrl) {
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(fileUrl))).catch(() => {})
}

async function discardFile(file) {
  if (file) await fs.unlink(file.path).catch(() => {})
}

// ---------- Posts ----------

export async function createPost(req, res) {
  try {
    const input = readInput(req.body || {})
    const error = validate(input)
    if (error) return res.status(400).json({ message: error })

    const { ids, missing } = await findAccounts(input.platforms)
    if (missing.length > 0) {
      return res.status(400).json({ message: `No connected account for: ${missing.join(', ')}` })
    }

    const postId = await withTransaction(async (conn) => {
      const [result] = await conn.query(
        'INSERT INTO posts (author_id, title, content) VALUES (?, ?, ?)',
        [req.user.id, input.title, input.content]
      )
      for (const accountId of ids) {
        await conn.query(
          'INSERT INTO post_targets (post_id, social_account_id) VALUES (?, ?)',
          [result.insertId, accountId]
        )
      }
      await addHistory(conn, result.insertId, null, 'draft', req.user.id, 'Post created')
      return result.insertId
    })

    res.status(201).json({ message: 'Draft saved', id: postId })
  } catch (err) {
    serverError(res, err)
  }
}

export async function listPosts(req, res) {
  try {
    const status = req.query.status ? String(req.query.status) : ''
    if (status && !STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status filter' })
    }

    const where = []
    const params = []
    if (req.user.role === 'creator') {
      where.push('p.author_id = ?')
      params.push(req.user.id)
    } else if (req.user.role === 'manager') {
      where.push("p.status <> 'draft'")
    }
    if (status) {
      where.push('p.status = ?')
      params.push(status)
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.title, p.content, p.status, p.created_at, p.submitted_at,
              u.name AS author_name,
              s.scheduled_at,
              (SELECT GROUP_CONCAT(sa.platform)
               FROM post_targets pt
               JOIN social_accounts sa ON sa.id = pt.social_account_id
               WHERE pt.post_id = p.id) AS platforms
       FROM posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN schedules s ON s.post_id = p.id
       ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
       ORDER BY p.created_at DESC, p.id DESC
       LIMIT 200`,
      params
    )

    res.json({
      posts: rows.map((r) => ({
        ...r,
        platforms: r.platforms ? r.platforms.split(',') : [],
      })),
    })
  } catch (err) {
    serverError(res, err)
  }
}

export async function getPost(req, res) {
  try {
    const id = parseId(req.params.id)
    if (!id) return res.status(400).json({ message: 'Invalid post id' })

    const post = await loadPost(id)
    if (!post || !canView(req.user, post)) {
      return res.status(404).json({ message: 'Post not found' })
    }

    const [platforms] = await pool.query(
      `SELECT sa.platform, sa.account_name, pt.publish_status
       FROM post_targets pt
       JOIN social_accounts sa ON sa.id = pt.social_account_id
       WHERE pt.post_id = ?`,
      [id]
    )
    const [media] = await pool.query(
      'SELECT id, file_url, file_type FROM post_media WHERE post_id = ? ORDER BY id',
      [id]
    )
    const [history] = await pool.query(
      `SELECT h.from_status, h.to_status, h.note, h.changed_at, u.name AS changed_by
       FROM post_status_history h
       LEFT JOIN users u ON u.id = h.changed_by
       WHERE h.post_id = ?
       ORDER BY h.changed_at, h.id`,
      [id]
    )

    res.json({ post: { ...post, platforms, media, history } })
  } catch (err) {
    serverError(res, err)
  }
}

export async function updatePost(req, res) {
  try {
    const post = await loadOwnEditablePost(req, res)
    if (!post) return

    const input = readInput(req.body || {})
    const error = validate(input)
    if (error) return res.status(400).json({ message: error })

    const { ids, missing } = await findAccounts(input.platforms)
    if (missing.length > 0) {
      return res.status(400).json({ message: `No connected account for: ${missing.join(', ')}` })
    }

    await withTransaction(async (conn) => {
      // Rejected post edit karne par wapas draft ban jati hai
      await conn.query(
        "UPDATE posts SET title = ?, content = ?, status = 'draft' WHERE id = ?",
        [input.title, input.content, post.id]
      )
      await conn.query('DELETE FROM post_targets WHERE post_id = ?', [post.id])
      for (const accountId of ids) {
        await conn.query(
          'INSERT INTO post_targets (post_id, social_account_id) VALUES (?, ?)',
          [post.id, accountId]
        )
      }
      if (post.status !== 'draft') {
        await addHistory(conn, post.id, post.status, 'draft', req.user.id, 'Edited after rejection')
      }
    })

    res.json({ message: 'Post updated' })
  } catch (err) {
    serverError(res, err)
  }
}

export async function deletePost(req, res) {
  try {
    const post = await loadOwnEditablePost(req, res)
    if (!post) return

    const [media] = await pool.query('SELECT file_url FROM post_media WHERE post_id = ?', [post.id])
    await pool.query('DELETE FROM posts WHERE id = ?', [post.id])
    for (const m of media) await removeUploadedFile(m.file_url)

    res.json({ message: 'Post deleted' })
  } catch (err) {
    serverError(res, err)
  }
}

export async function submitPost(req, res) {
  try {
    const post = await loadOwnEditablePost(req, res)
    if (!post) return

    const [[targets]] = await pool.query(
      'SELECT COUNT(*) AS total FROM post_targets WHERE post_id = ?',
      [post.id]
    )
    if (targets.total === 0) {
      return res.status(400).json({ message: 'Choose at least one platform before submitting' })
    }

    const message = `${post.author_name} submitted "${post.title}" for approval`.slice(0, 250)

    await withTransaction(async (conn) => {
      await conn.query(
        "UPDATE posts SET status = 'pending', submitted_at = UTC_TIMESTAMP() WHERE id = ?",
        [post.id]
      )
      await addHistory(conn, post.id, post.status, 'pending', req.user.id, 'Submitted for approval')
      // Har manager ko notification (bell icon ke liye)
      await conn.query(
        `INSERT INTO notifications (user_id, post_id, type, message)
         SELECT id, ?, 'submitted', ? FROM users WHERE role = 'manager' AND is_active = 1`,
        [post.id, message]
      )
    })

    res.json({ message: 'Post submitted for approval' })
  } catch (err) {
    serverError(res, err)
  }
}

// ---------- Images ----------

export async function uploadMedia(req, res) {
  try {
    const post = await loadOwnEditablePost(req, res)
    if (!post) return discardFile(req.file)

    if (!req.file) {
      return res.status(400).json({ message: 'Please choose an image (field name: image)' })
    }

    const [[count]] = await pool.query(
      'SELECT COUNT(*) AS total FROM post_media WHERE post_id = ?',
      [post.id]
    )
    if (count.total >= MAX_IMAGES) {
      await discardFile(req.file)
      return res.status(400).json({ message: `A post can have at most ${MAX_IMAGES} images` })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    const [result] = await pool.query(
      'INSERT INTO post_media (post_id, file_url, file_type, file_size) VALUES (?, ?, ?, ?)',
      [post.id, fileUrl, req.file.mimetype, req.file.size]
    )

    res.status(201).json({
      message: 'Image uploaded',
      media: { id: result.insertId, file_url: fileUrl, file_type: req.file.mimetype },
    })
  } catch (err) {
    await discardFile(req.file)
    serverError(res, err)
  }
}

export async function deleteMedia(req, res) {
  try {
    const post = await loadOwnEditablePost(req, res)
    if (!post) return

    const mediaId = parseId(req.params.mediaId)
    if (!mediaId) return res.status(400).json({ message: 'Invalid image id' })

    const [rows] = await pool.query(
      'SELECT id, file_url FROM post_media WHERE id = ? AND post_id = ?',
      [mediaId, post.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Image not found' })

    await pool.query('DELETE FROM post_media WHERE id = ?', [mediaId])
    await removeUploadedFile(rows[0].file_url)

    res.json({ message: 'Image removed' })
  } catch (err) {
    serverError(res, err)
  }
}