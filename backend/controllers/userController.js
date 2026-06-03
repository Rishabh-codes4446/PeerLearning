import prisma from '../utils/prisma.js'

export const updateProfile = async (req, res) => {
  const userId = req.user.userId
  const { bio, subjects } = req.body
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { bio, subjects },
      select: { id: true, name: true, email: true, role: true, bio: true, subjects: true, rating: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getProfile = async (req, res) => {
  const userId = req.user.userId
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, bio: true, subjects: true, rating: true }
    })
    res.json(user)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getAllTutors = async (req, res) => {
  try {
    const tutors = await prisma.user.findMany({
      where: { isTutor: true },
      select: {
        id:       true,
        name:     true,
        bio:      true,
        subjects: true,
        rating:   true,
        slots: {
          where:  { status: 'AVAILABLE' },
          select: { id: true, startTime: true, endTime: true },
          take:   3,
        },
      },
      orderBy: { rating: 'desc' },
    })
    res.json(tutors)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch tutors' })
  }
}
export const getTutorById = async (req, res) => {
  try {
    const tutor = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, bio: true, subjects: true, rating: true }
    })
    if (!tutor) return res.status(404).json({ error: 'Tutor not found' })
    res.json(tutor)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tutor' })
  }
}

export const toggleTutorMode = async (req, res) => {
  const userId = req.user.userId
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isTutor: !user.isTutor },
      select: { id: true, name: true, isTutor: true, bio: true, subjects: true, rating: true }
    })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}