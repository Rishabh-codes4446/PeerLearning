import express from 'express'
import { createSlot, getAvailableSlots, bookSlot, getMyBookings } from '../controllers/slotController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createSlot)
router.get('/', getAvailableSlots)
router.post('/:slotId/book', protect, bookSlot)
router.get('/my-bookings', protect, getMyBookings)

export default router