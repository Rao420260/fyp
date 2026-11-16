import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

// Signup se sirf ye 2 roles ban sakte hain. Admin signup se nahi banta.
const SIGNUP_ROLES = ['creator', 'manager']
const emailPattern = /^\S+@\S+\.\S+$/

function createToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

// Frontend ko sirf wohi cheezein bhejo jo bhejni chahiyen (password_hash kabhi nahi)
function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role }
}

export async function signup(req, res) {
  try {
    const body = req.body || {}
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')
    const role = body.role || 'creator'

    if (!name) {
      return res.status(400).json({ message: 'Full name is required' })
    }
    if (!emailPattern.test(email)) {
      return res.status(400).json({ message: 'Enter a valid email' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' })
    }
    if (!SIGNUP_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(409).json({ message: 'This email is already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    )

    const user = { id: result.insertId, name, email, role }
    res.status(201).json({
      message: 'Account created successfully',
      token: createToken(user),
      user: publicUser(user),
    })
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'This email is already registered' })
    }
    console.error(err)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

export async function login(req, res) {
  try {
    const body = req.body || {}
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role, is_active FROM users WHERE email = ?',
      [email]
    )
    const user = rows[0]

    // Email galat ho ya password, jawab same dete hain taake koi andaza na laga sake
    const passwordOk = user ? await bcrypt.compare(password, user.password_hash) : false
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    if (!user.is_active) {
      return res.status(403).json({ message: 'This account has been disabled' })
    }

    res.json({
      message: 'Login successful',
      token: createToken(user),
      user: publicUser(user),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}

export async function me(req, res) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = ? AND is_active = 1',
      [req.user.id]
    )
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ user: rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Something went wrong. Please try again.' })
  }
}