import cron from 'node-cron'
import pool from '../config/db.js'
import { publishToPlatform } from './publisher.js'

function numberFromEnv(name, fallback) {
  const value = Number(process.env[name])
  return process.env[name] !== undefined && Number.isFinite(value) && value >= 0 ? value : fallback
}

const MAX_ATTEMPTS = numberFromEnv('MAX_RETRIES', 3) || 3 // kul kitni koshishein
const RETRY_DELAY_MINUTES = numberFromEnv('RETRY_DELAY_MINUTES', 1) // fail ke baad kitni der baad dobara
const STUCK_MINUTES = 5 // "processing" me itni der atki rahe to wapas queue me
const BATCH_SIZE = 10 // ek minute me zyada se zyada itni posts

let running = false

function log(...args) {
  console.log('[scheduler]', ...args)
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

// Timeline me entry. changed_by NULL ka matlab "system ne kiya"
async function addHistory(conn, postId, from, to, note) {
  await conn.query(
    'INSERT INTO post_status_history (post_id, from_status, to_status, changed_by, note) VALUES (?, ?, ?, NULL, ?)',
    [postId, from, to, note.slice(0, 250)]
  )
}

async function notify(conn, userIds, post, type, message) {
  for (const userId of [...new Set(userIds)]) {
    await conn.query(
      'INSERT INTO notifications (user_id, post_id, type, message) VALUES (?, ?, ?, ?)',
      [userId, post.id, type, message.slice(0, 250)]
    )
  }
}

// Server band hone par jo posts "processing" me atak gayi thin unhein wapas queue me daalo
async function releaseStuckSchedules() {
  const [result] = await pool.query(
    "UPDATE schedules SET status = 'waiting' WHERE status = 'processing' AND last_attempt_at < DATE_SUB(UTC_TIMESTAMP(), INTERVAL ? MINUTE)",
    [STUCK_MINUTES]
  )
  if (result.affectedRows > 0) log(`${result.affectedRows} stuck schedule(s) put back in the queue`)
}

async function finishSuccess(schedule, post) {
  const [published] = await pool.query(
    `SELECT sa.platform FROM post_targets pt
     JOIN social_accounts sa ON sa.id = pt.social_account_id
     WHERE pt.post_id = ? AND pt.publish_status = 'published'`,
    [post.id]
  )
  const names = published.map((p) => p.platform).join(', ')

  await withTransaction(async (conn) => {
    await conn.query("UPDATE schedules SET status = 'done' WHERE id = ?", [schedule.id])
    await conn.query("UPDATE posts SET status = 'published' WHERE id = ? AND status = 'scheduled'", [post.id])
    await addHistory(conn, post.id, 'scheduled', 'published', `Published automatically on ${names} (simulated)`)
    await notify(conn, [post.author_id], post, 'published', `Your post "${post.title}" was published`)
  })
  log(`post ${post.id} published (${names})`)
}

async function handleFailure(schedule, post, failures) {
  const attempts = schedule.retry_count + 1
  const names = failures.map((f) => f.platform).join(', ')

  if (attempts < MAX_ATTEMPTS) {
    // Dobara koshish: thori der baad phir queue me
    await withTransaction(async (conn) => {
      await conn.query(
        "UPDATE schedules SET status = 'waiting', retry_count = ?, scheduled_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE) WHERE id = ?",
        [attempts, RETRY_DELAY_MINUTES, schedule.id]
      )
      await addHistory(
        conn,
        post.id,
        'scheduled',
        'scheduled',
        `Attempt ${attempts} of ${MAX_ATTEMPTS} failed on ${names}. Retrying in ${RETRY_DELAY_MINUTES} minute(s)`
      )
    })
    log(`post ${post.id} failed on ${names}, retry ${attempts}/${MAX_ATTEMPTS}`)
    return
  }

  // Aakhri koshish bhi fail: post "failed" ho jati hai
  await withTransaction(async (conn) => {
    await conn.query("UPDATE schedules SET status = 'failed', retry_count = ? WHERE id = ?", [attempts, schedule.id])
    await conn.query("UPDATE posts SET status = 'failed' WHERE id = ? AND status = 'scheduled'", [post.id])
    await addHistory(conn, post.id, 'scheduled', 'failed', `Failed after ${attempts} attempts on ${names}: ${failures[0].reason}`)
    await notify(
      conn,
      [post.author_id, schedule.scheduled_by],
      post,
      'failed',
      `Your post "${post.title}" could not be published on ${names}`
    )
  })
  log(`post ${post.id} FAILED after ${attempts} attempts (${names})`)
}

// Ek schedule ko publish karo
export async function processSchedule(scheduleId) {
  // Pehle "claim" karo: do jagah se ek saath chalne par bhi sirf ek jeete (double publish nahi hoga)
  const [claim] = await pool.query(
    "UPDATE schedules SET status = 'processing', last_attempt_at = UTC_TIMESTAMP() WHERE id = ? AND status = 'waiting' AND scheduled_at <= UTC_TIMESTAMP()",
    [scheduleId]
  )
  if (claim.affectedRows === 0) return

  const [[schedule]] = await pool.query(
    'SELECT id, post_id, scheduled_by, retry_count FROM schedules WHERE id = ?',
    [scheduleId]
  )
  const [[post]] = await pool.query(
    'SELECT id, author_id, title, content, status FROM posts WHERE id = ?',
    [schedule.post_id]
  )
  if (!post || post.status !== 'scheduled') {
    await pool.query("UPDATE schedules SET status = 'failed' WHERE id = ?", [scheduleId])
    log(`schedule ${scheduleId} skipped: post is not in scheduled state`)
    return
  }

  // Jo platform pehle publish ho chuke unhein dobara nahi chheerte
  const [targets] = await pool.query(
    `SELECT pt.id, sa.platform, sa.account_name
     FROM post_targets pt
     JOIN social_accounts sa ON sa.id = pt.social_account_id
     WHERE pt.post_id = ? AND pt.publish_status <> 'published'`,
    [post.id]
  )

  const failures = []
  for (const target of targets) {
    try {
      const result = await publishToPlatform({ post, account: target })
      await pool.query(
        "UPDATE post_targets SET publish_status = 'published', external_post_id = ?, published_at = UTC_TIMESTAMP(), error_message = NULL WHERE id = ?",
        [result.externalId, target.id]
      )
    } catch (err) {
      const reason = String(err.message || 'Unknown error').slice(0, 450)
      await pool.query(
        "UPDATE post_targets SET publish_status = 'failed', error_message = ? WHERE id = ?",
        [reason, target.id]
      )
      failures.push({ platform: target.platform, reason })
    }
  }

  if (failures.length === 0) await finishSuccess(schedule, post)
  else await handleFailure(schedule, post, failures)
}

// Har minute chalta hai: "kis post ka waqt aa gaya?"
export async function runDuePosts() {
  if (running) return { skipped: true } // pichla round abhi khatam nahi hua
  running = true
  try {
    await releaseStuckSchedules()
    const [due] = await pool.query(
      "SELECT id FROM schedules WHERE status = 'waiting' AND scheduled_at <= UTC_TIMESTAMP() ORDER BY scheduled_at, id LIMIT ?",
      [BATCH_SIZE]
    )
    for (const row of due) {
      try {
        await processSchedule(row.id)
      } catch (err) {
        console.error(`[scheduler] schedule ${row.id} crashed:`, err.message)
      }
    }
    return { checked: due.length }
  } catch (err) {
    console.error('[scheduler] check failed:', err.message)
    return { error: true }
  } finally {
    running = false
  }
}

export function startScheduler() {
  if (process.env.SCHEDULER_ENABLED === 'false') {
    log('disabled (SCHEDULER_ENABLED=false)')
    return
  }
  cron.schedule('* * * * *', () => {
    runDuePosts()
  })
  log('started, checking every minute')
  // Server chalte hi ek baar foran check: band rehne ke dauran jo posts ka waqt guzar gaya
  runDuePosts()
}