import express from 'express'
import { getOrCreateRoom } from '../controllers/videoController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/:bookingId/room', protect, getOrCreateRoom)

export default router