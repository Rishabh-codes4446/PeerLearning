import express from 'express'
import { createReview, getTutorReviews } from '../controllers/reviewController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', protect, createReview)
router.get('/:tutorId', getTutorReviews)

export default router