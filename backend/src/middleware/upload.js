import multer from 'multer'
import crypto from 'node:crypto'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

// Tasveerein backend/uploads folder me save hongi
export const UPLOAD_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'uploads'
)
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

// Sirf ye 3 qisam ki tasveerein chalengi
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Asli naam use nahi karte (security), random naam banate hain
  filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXTENSIONS[file.mimetype]),
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (EXTENSIONS[file.mimetype]) cb(null, true)
    else cb(new Error('INVALID_TYPE'))
  },
})

// Multer ke errors ko saaf jawab me badalta hai
export function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next()
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Image must be 5 MB or smaller' })
    }
    if (err.message === 'INVALID_TYPE') {
      return res.status(400).json({ message: 'Only JPG, PNG or WebP images are allowed' })
    }
    console.error(err)
    res.status(400).json({ message: 'Could not upload the image' })
  })
}