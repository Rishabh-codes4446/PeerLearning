import prisma from '../utils/prisma.js'

export const createReview = async (req, res) => {
  const { bookingId, rating, comment } = req.body
  const giverId = req.user.userId
  try {
    // fetch booking with slot to get tutorId
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true }
    })

    if (!booking || booking.status !== 'COMPLETED')
      return res.status(400).json({ error: 'Can only review completed sessions' })

    // figure out who is being reviewed
    // if the giver is the student → they're reviewing the tutor
    // if the giver is the tutor → they're reviewing the student
    const receiverId = booking.studentId === giverId
      ? booking.slot.tutorId
      : booking.studentId

    const review = await prisma.review.create({
      data: { bookingId, giverId, receiverId, rating, comment }
    })

    // update tutor average rating
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
  const tutorId = req.params.tutorId || req.params.id
  try {
    const reviews = await prisma.review.findMany({
      where: { receiverId: tutorId },
      include: { giver: { select: { name: true } } },
      orderBy: { createdAt: 'desc' }
    })
    res.json(reviews)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}