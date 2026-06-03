import prisma from '../utils/prisma.js'
import { io } from '../server.js'

export const createGroupClass = async (req, res) => {
  const { title, subject, description, startTime, endTime, maxSeats, price } = req.body
  const tutorId = req.user.userId
  try {
    const groupClass = await prisma.groupClass.create({
      data: {
        tutorId, title, subject, description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        maxSeats: parseInt(maxSeats) || 30,
        price: parseFloat(price) || 0
      }
    })
    res.status(201).json(groupClass)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAllGroupClasses = async (req, res) => {
  try {
    const classes = await prisma.groupClass.findMany({
      where: { status: 'UPCOMING' },
      include: {
        tutor: { select: { id: true, name: true, rating: true } },
        _count: { select: { enrollments: true } }
      },
      orderBy: { startTime: 'asc' }
    })
    res.json(classes)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const enrollInClass = async (req, res) => {
  const { classId } = req.params
  const studentId = req.user.userId
  try {
    const groupClass = await prisma.groupClass.findUnique({
      where: { id: classId },
      include: { _count: { select: { enrollments: true } } }
    })

    if (!groupClass) return res.status(404).json({ error: 'Class not found' })
    if (groupClass.status !== 'UPCOMING')
      return res.status(400).json({ error: 'Class is not open for enrollment' })
    if (groupClass._count.enrollments >= groupClass.maxSeats)
      return res.status(400).json({ error: 'Class is full' })

    const enrollment = await prisma.enrollment.create({
      data: { groupClassId: classId, studentId }
    })

    io.to(groupClass.tutorId).emit('new-enrollment', {
      message: `Someone enrolled in your class "${groupClass.title}"!`
    })

    res.status(201).json(enrollment)
  } catch (err) {
    if (err.code === 'P2002')
      return res.status(400).json({ error: 'Already enrolled in this class' })
    res.status(500).json({ error: err.message })
  }
}

export const getMyGroupClasses = async (req, res) => {
  const userId = req.user.userId
  const isTutor = req.user.isTutor
  try {
    if (isTutor) {
      const classes = await prisma.groupClass.findMany({
        where: { tutorId: userId },
        include: { _count: { select: { enrollments: true } } },
        orderBy: { startTime: 'asc' }
      })
      return res.json(classes)
    }
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        groupClass: {
          include: {
            tutor: { select: { name: true } },
            _count: { select: { enrollments: true } }
          }
        }
      }
    })
    res.json(enrollments.map(e => e.groupClass))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}