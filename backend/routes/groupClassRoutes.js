import express from 'express'
import {
  createGroupClass,
  getAllGroupClasses,
  enrollInClass,
  getMyGroupClasses
} from '../controllers/groupClassController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createGroupClass)
router.get('/', getAllGroupClasses)
router.post('/:classId/enroll', protect, enrollInClass)
router.get('/my-classes', protect, getMyGroupClasses)

export default router