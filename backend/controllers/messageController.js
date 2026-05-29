import prisma from '../utils/prisma.js'
import { io } from '../server.js'

export const sendMessage = async (req, res) => {
  const { bookingId, content } = req.body
  const senderId = req.user.userId
  try {
    const message = await prisma.message.create({
      data: { bookingId, senderId, content },
      include: { sender: { select: { name: true } } }
    })

    // emit to everyone in that booking room
    io.to(bookingId).emit('new-message', message)

    res.status(201).json(message)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

export const getMessages = async (req, res) => {
  const { bookingId } = req.params
  try {
    const messages = await prisma.message.findMany({
      where: { bookingId },
      include: { sender: { select: { name: true } } },
      orderBy: { createdAt: 'asc' }
    })
    res.json(messages)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}