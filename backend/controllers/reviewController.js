import prisma from '../utils/prisma.js'

export const createReview = async (req, res) => {
  const { bookingId, receiverId, rating, comment } = req.body
  const giverId = req.user.userId
  try {
    // Check booking exists and is completed
    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking || booking.status !== 'COMPLETED')
      return res.status(400).json({ error: 'Can only review completed sessions' })

    const review = await prisma.review.create({
      data: { bookingId, giverId, receiverId, rating, comment }
    })

    // Update tutor average rating
    const allReviews = await prisma.review.findMany({ where: { receiverId } })
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await prisma.user.update({
      where: { id: receiverId },
      data: { rating: avg }
    })

    res.status(201).json(review)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getTutorReviews = async (req, res) => {
  const { tutorId } = req.params
  try {
    const reviews = await prisma.review.findMany({
      where: { receiverId: tutorId },
      include: { giver: { select: { name: true } } }
    })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}