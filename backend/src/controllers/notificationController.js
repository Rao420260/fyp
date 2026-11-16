import pool from '../config/db.js'

function serverError(res, err) {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong. Please try again.' })
}

// Login kiye hue user ki apni notifications (nayi pehle) aur unread ki ginti
export async function listNotifications(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT id, post_id, type, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 50`,
      [req.user.id]
    )
    const [[unread]] = await pool.query(
      'SELECT COUNT(*) AS total FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.id]
    )
    res.json({ notifications: rows, unreadCount: unread.total })
  } catch (err) {
    serverError(res, err)
  }
}

// Ek notification "parh li" ka nishan lagao (sirf apni)
export async function markRead(req, res) {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid notification id' })
    }
    const [rows] = await pool.query(
      'SELECT id FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    )
    if (rows.length === 0) return res.status(404).json({ message: 'Notification not found' })

    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [
      id,
      req.user.id,
    ])
    res.json({ message: 'Marked as read' })
  } catch (err) {
    serverError(res, err)
  }
}

// Sab ko "parh li" ka nishan lagao
export async function markAllRead(req, res) {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id])
    res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    serverError(res, err)
  }
}