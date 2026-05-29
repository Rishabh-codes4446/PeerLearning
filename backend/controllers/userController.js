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