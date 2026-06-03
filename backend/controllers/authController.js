import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../utils/prisma.js'

export const register = async (req, res) => {
  const { name, email, password } = req.body
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(400).json({ error: 'Email already in use' })

    const hashed = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashed }
    })
    res.status(201).json({ message: 'User created', userId: user.id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Wrong password' })

    const token = jwt.sign(
      { userId: user.id, isTutor: user.isTutor },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        isTutor: user.isTutor,
        bio: user.bio,
        subjects: user.subjects,
        rating: user.rating
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}