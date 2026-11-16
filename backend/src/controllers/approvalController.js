import pool from '../config/db.js'

// ---------- Chhote helpers ----------

function serverError(res, err) {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}

function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
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
    [postId, from, to, userId, note.slice(0, 250)]
  )
}

// Manager ka faisla approvals table me likho (kisne, kab, kya, kyun)
async function recordDecision(conn, postId, reviewerId, decision, comment) {
  await conn.query(
    'INSERT INTO approvals (post_id, reviewer_id, decision, comment) VALUES (?, ?, ?, ?)',
    [postId, reviewerId, decision, comment]
  )
}

// Creator ko notification (bell icon ke liye)
async function notifyAuthor(conn, post, type, message) {
  await conn.query(
    'INSERT INTO notifications (user_id, post_id, type, message) VALUES (?, ?, ?, ?)',
    [post.author_id, post.id, type, message.slice(0, 250)]
  )
}

// Manager ke liye: post maujood ho aur approval ka intezar kar rahi ho.
// Masla ho to jawab khud bhej deta hai aur null lautata hai.
async function loadReviewablePost(req, res) {
  const id = parseId(req.params.id)
  if (!id) {
    res.status(400).json({ message: 'Invalid post id' })
    return null
  }
  const [rows] = await pool.query(
    'SELECT id, author_id, title, status FROM posts WHERE id = ?',
    [id]
  )
  const post = rows[0]
  // Manager draft nahi dekh sakta, is liye draft ke liye "not found"
  if (!post || post.status === 'draft') {
    res.status(404).json({ message: 'Post not found' })
    return null
  }
  if (post.status !== 'pending') {
    res.status(409).json({ message: `A ${post.status} post is not waiting for review` })
    return null
  }
  return post
}

// Waqt aisa hona chahiye: 2026-11-20T10:00:00Z (time zone ke saath)
const ISO_WITH_ZONE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/

function parsePublishTime(value) {
  if (!value) return { error: 'Publish time is required' }
  if (typeof value !== 'string' || !ISO_WITH_ZONE.test(value)) {
    return { error: 'Publish time must look like 2026-11-20T10:00:00Z' }
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return { error: 'Publish time is not a valid date' }

  const now = Date.now()
  if (date.getTime() < now + 60 * 1000) {
    return { error: 'Publish time must be at least 1 minute in the future' }
  }
  if (date.getTime() > now + 365 * 24 * 60 * 60 * 1000) {
    return { error: 'Publish time cannot be more than 1 year ahead' }
  }
  // Database me hamesha UTC waqt save hota hai
  return { sql: date.toISOString().slice(0, 19).replace('T', ' ') }
}

// Optional comment: khali ho to null
function readComment(value) {
  const text = String(value || '').trim()
  return text || null
}

// ---------- Approve ----------

export async function approvePost(req, res) {
  try {
    const post = await loadReviewablePost(req, res)
    if (!post) return

    const body = req.body || {}
    const publish = parsePublishTime(body.scheduledAt)
    if (publish.error) return res.status(400).json({ message: publish.error })

    const comment = readComment(body.comment)
    if (comment && comment.length > 200) {
      return res.status(400).json({ message: 'Comment must be 200 characters or less' })
    }

    const [[reviewer]] = await pool.query('SELECT name FROM users WHERE id = ?', [req.user.id])

    await withTransaction(async (conn) => {
      // "AND status = 'pending'" ka matlab: do manager ek saath approve karen to sirf ek chale
      const [result] = await conn.query(
        "UPDATE posts SET status = 'approved' WHERE id = ? AND status = 'pending'",
        [post.id]
      )
      if (result.affectedRows === 0) throw new Error('NOT_PENDING')

      await recordDecision(conn, post.id, req.user.id, 'approved', comment)
      await addHistory(conn, post.id, 'pending', 'approved', req.user.id, `Approved by ${reviewer.name}`)

      // Ek post ka ek hi schedule hota hai, purana ho to hata do
      await conn.query('DELETE FROM schedules WHERE post_id = ?', [post.id])
      await conn.query(
        'INSERT INTO schedules (post_id, scheduled_by, scheduled_at) VALUES (?, ?, ?)',
        [post.id, req.user.id, publish.sql]
      )
      await conn.query("UPDATE posts SET status = 'scheduled' WHERE id = ?", [post.id])
      await addHistory(
        conn,
        post.id,
        'approved',
        'scheduled',
        req.user.id,
        `Scheduled for ${publish.sql} UTC`
      )

      await notifyAuthor(conn, post, 'approved', `Your post "${post.title}" was approved and scheduled`)
    })

    res.json({ message: 'Post approved and scheduled' })
  } catch (err) {
    if (err.message === 'NOT_PENDING') {
      return res.status(409).json({ message: 'This post is no longer waiting for review' })
    }
    serverError(res, err)
  }
}

// ---------- Reject ----------

export async function rejectPost(req, res) {
  try {
    const post = await loadReviewablePost(req, res)
    if (!post) return

    const reason = String((req.body || {}).reason || '').trim()
    if (reason.length < 3) return res.status(400).json({ message: 'Rejection reason is required' })
    if (reason.length > 200) {
      return res.status(400).json({ message: 'Reason must be 200 characters or less' })
    }

    await withTransaction(async (conn) => {
      const [result] = await conn.query(
        "UPDATE posts SET status = 'rejected' WHERE id = ? AND status = 'pending'",
        [post.id]
      )
      if (result.affectedRows === 0) throw new Error('NOT_PENDING')

      await recordDecision(conn, post.id, req.user.id, 'rejected', reason)
      await addHistory(conn, post.id, 'pending', 'rejected', req.user.id, `Rejected: ${reason}`)
      await notifyAuthor(conn, post, 'rejected', `Your post "${post.title}" was rejected: ${reason}`)
    })

    res.json({ message: 'Post rejected' })
  } catch (err) {
    if (err.message === 'NOT_PENDING') {
      return res.status(409).json({ message: 'This post is no longer waiting for review' })
    }
    serverError(res, err)
  }
}