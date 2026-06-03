import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import authRoutes from './routes/authRoutes.js'
import slotRoutes from './routes/slotRoutes.js'
import userRoutes from './routes/userRoutes.js'
import messageRoutes from './routes/messageRoutes.js'
import groupClassRoutes from './routes/groupClassRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import { startCronJobs } from './services/cronService.js'
import { initSocket } from './services/socketService.js'
import videoRoutes from './routes/videoRoutes.js'

dotenv.config()

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/slots', slotRoutes)
app.use('/api/users', userRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/group-classes', groupClassRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/video', videoRoutes)

export const io = initSocket(server)

app.get('/', (req, res) => res.json({ message: 'PeerLearning API running ✅' }))

server.listen(8000, () => {
  console.log('Server running on port 8000')
  startCronJobs()
})