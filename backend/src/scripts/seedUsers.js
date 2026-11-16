import bcrypt from 'bcryptjs'
import pool from '../config/db.js'

const demoUsers = [
  { name: 'Admin User', email: 'admin@postflow.com', role: 'admin' },
  { name: 'Shanza Imran', email: 'manager@postflow.com', role: 'manager' },
  { name: 'Fatima Maryam', email: 'creator@postflow.com', role: 'creator' },
]
const password = 'Demo@1234'

const hash = await bcrypt.hash(password, 10)

for (const u of demoUsers) {
  const [result] = await pool.query(
    'INSERT IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [u.name, u.email, hash, u.role]
  )
  console.log(result.affectedRows ? `Created: ${u.email}` : `Already exists: ${u.email}`)
}

console.log(`Demo password for all three: ${password}`)
await pool.end()