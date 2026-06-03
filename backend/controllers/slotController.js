import prisma from '../utils/prisma.js'
import { io } from '../server.js'

export const createSlot = async (req, res) => {
  const { startTime, endTime } = req.body
  const tutorId = req.user.userId
  try {
    const slot = await prisma.slot.create({
      data: { tutorId, startTime: new Date(startTime), endTime: new Date(endTime) }
    })
    res.status(201).json(slot)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAvailableSlots = async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      where: { status: 'AVAILABLE' },
      include: { tutor: { select: { id: true, name: true, subjects: true, rating: true } } }
    })
    res.json(slots)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const bookSlot = async (req, res) => {
  const { slotId } = req.params
  const studentId = req.user.userId
  try {
    const slot = await prisma.slot.findUnique({ where: { id: slotId } })
    if (!slot || slot.status !== 'AVAILABLE')
      return res.status(400).json({ error: 'Slot not available' })

    const [updatedSlot, booking] = await prisma.$transaction([
      prisma.slot.update({
        where: { id: slotId },
        data: { status: 'BOOKED' }
      }),
      prisma.booking.create({
        data: { slotId, studentId }
      })
    ])

    io.to(slot.tutorId).emit('new-booking', {
      message: `Your slot on ${slot.startTime} has been booked!`,
      bookingId: booking.id
    })

    res.status(201).json({ booking, slot: updatedSlot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getSlotsByTutor = async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      where: {
        tutorId: req.params.id,
        status: 'AVAILABLE',
        startTime: { gte: new Date() }
      },
      orderBy: { startTime: 'asc' }
    })
    res.json(slots)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch slots' })
  }
}

export const getMyBookings = async (req, res) => {
  const userId = req.user.userId
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        OR: [
          { studentId: userId },
          { slot: { tutorId: userId } }
        ]
      },
      include: {
        slot: {
          include: {
            tutor: { select: { id: true, name: true, email: true } }
          }
        },
        student: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
export const getMySlots = async (req, res) => {
  try {
    const slots = await prisma.slot.findMany({
      where: { tutorId: req.user.userId },
      orderBy: { startTime: 'asc' }
    })
    res.json(slots)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const deleteSlot = async (req, res) => {
  try {
    const slot = await prisma.slot.findUnique({ where: { id: req.params.slotId } })
    if (!slot) return res.status(404).json({ error: 'Slot not found' })
    if (slot.tutorId !== req.user.userId) return res.status(403).json({ error: 'Not authorised' })
    if (slot.status === 'BOOKED') return res.status(400).json({ error: 'Cannot delete a booked slot' })
    await prisma.slot.delete({ where: { id: req.params.slotId } })
    res.json({ message: 'Slot deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}