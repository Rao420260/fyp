import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'
import * as posts from '../controllers/postController.js'

const router = Router()

// Is file ke har route ke liye login zaroori hai
router.use(requireAuth)

router.get('/', posts.listPosts)
router.get('/:id', posts.getPost)

// Neeche ke kaam sirf Creator kar sakta hai
router.post('/', requireRole('creator'), posts.createPost)
router.put('/:id', requireRole('creator'), posts.updatePost)
router.delete('/:id', requireRole('creator'), posts.deletePost)
router.post('/:id/submit', requireRole('creator'), posts.submitPost)
router.post('/:id/media', requireRole('creator'), uploadImage, posts.uploadMedia)
router.delete('/:id/media/:mediaId', requireRole('creator'), posts.deleteMedia)

export default router