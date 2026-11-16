import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth.js'
import * as approvals from '../controllers/approvalController.js'

const router = Router()

// Is file ke har route ke liye login zaroori hai
router.use(requireAuth)

// Sirf Manager approve ya reject kar sakta hai
router.post('/:id/approve', requireRole('manager'), approvals.approvePost)
router.post('/:id/reject', requireRole('manager'), approvals.rejectPost)

export default router