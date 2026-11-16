import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import pool from './src/config/db.js'
import authRoutes from './src/routes/authRoutes.js'
import postRoutes from './src/routes/postRoutes.js'
import approvalRoutes from './src/routes/approvalRoutes.js'
import notificationRoutes from './src/routes/notificationRoutes.js'
import { UPLOAD_DIR } from './src/middleware/upload.js'
import { startScheduler } from './src/services/scheduler.js'

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing in .env')
  process.exit(1)
}

const app = express()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// Upload ki hui tasveerein browser me dikhane ke liye
app.use('/uploads', express.static(UPLOAD_DIR))

app.get('/', (req, res) => {
  res.json({ message: 'PostFlow API is running' })
})

app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS tables_count FROM information_schema.tables WHERE table_schema = ?',
      [process.env.DB_NAME]
    )
    res.json({
      status: 'ok',
      database: process.env.DB_NAME,
      tables: rows[0].tables_count,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      reason: err.code,
    })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
// Approve aur reject bhi /api/posts/:id/... par hain, is liye postRoutes ke baad
app.use('/api/posts', approvalRoutes)
app.use('/api/notifications', notificationRoutes)

// Koi aisa rasta jo exist nahi karta
app.use('/api', (req, res) => {
  res.status(404).json({ message: 'API route not found' })
})

// Galat JSON bhejne par saaf jawab
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' })
  }
  console.error(err)
  res.status(500).json({ message: 'Something went wrong' })
})

try {
  const conn = await pool.getConnection()
  conn.release()
  console.log('MySQL connected')
} catch (err) {
  console.error('MySQL connection failed:', err.code)
}

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  // Server chalte hi scheduler bhi shuru
  startScheduler()
})