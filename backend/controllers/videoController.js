import prisma from '../utils/prisma.js'

export const getOrCreateRoom = async (req, res) => {
  const { bookingId } = req.params
  const userId = req.user.userId

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true }
    })

    if (!booking) return res.status(404).json({ error: 'Booking not found' })

    const isStudent = booking.studentId === userId
    const isTutor = booking.slot.tutorId === userId

    if (!isStudent && !isTutor)
      return res.status(403).json({ error: 'Not authorised' })

    const roomName = `peerlearning-${bookingId.slice(0, 8)}`
    const url = `https://meet.jit.si/${roomName}`

    res.json({ url, name: roomName })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}