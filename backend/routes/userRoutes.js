import express from 'express'
import {
  updateProfile,
  getProfile,
  toggleTutorMode,
  getAllTutors,
  getTutorById,
} from '../controllers/userController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/profile',       protect, getProfile)
router.put('/profile',       protect, updateProfile)
router.post('/toggle-tutor', protect, toggleTutorMode)
router.get('/tutors',        protect, getAllTutors)
router.get('/tutor/:id',     protect, getTutorById)

export default router