import express from 'express'
import { createSlot, getAvailableSlots, bookSlot, getMyBookings, getSlotsByTutor, getMySlots, deleteSlot } from '../controllers/slotController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createSlot)
router.get('/', getAvailableSlots)
router.post('/:slotId/book', protect, bookSlot)
router.get('/my-bookings', protect, getMyBookings)
router.get('/tutor/:id', protect, getSlotsByTutor)
router.get('/my-slots', protect, getMySlots)
router.delete('/:slotId', protect, deleteSlot)

export default router