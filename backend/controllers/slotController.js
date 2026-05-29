import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tutor creates a slot
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

// Get all available slots (students browse these)
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

// Student books a slot
export const bookSlot = async (req, res) => {
  const { slotId } = req.params
  const studentId = req.user.userId
  try {
    const slot = await prisma.slot.findUnique({ where: { id: slotId } })
    if (!slot || slot.status !== 'AVAILABLE')
      return res.status(400).json({ error: 'Slot not available' })

    // Transaction — lock slot and create booking together
    const [updatedSlot, booking] = await prisma.$transaction([
      prisma.slot.update({
        where: { id: slotId },
        data: { status: 'BOOKED' }
      }),
      prisma.booking.create({
        data: { slotId, studentId }
      })
    ])
    res.status(201).json({ booking, slot: updatedSlot })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get all bookings for logged-in user
export const getMyBookings = async (req, res) => {
  const userId = req.user.userId
  const role = req.user.role
  try {
    const bookings = await prisma.booking.findMany({
      where: role === 'STUDENT' ? { studentId: userId } : { slot: { tutorId: userId } },
      include: { slot: true, student: { select: { name: true, email: true } } }
    })
    res.json(bookings)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}