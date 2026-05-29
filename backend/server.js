import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import authRoutes from './routes/authRoutes.js'
import slotRoutes from './routes/slotRoutes.js'
import { startCronJobs } from './services/cronService.js'
import { initSocket } from './services/socketService.js'
import reviewRoutes from './routes/reviewRoutes.js'

dotenv.config()

const app = express()
const server = createServer(app)

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/slots', slotRoutes)

// after slots route
app.use('/api/reviews', reviewRoutes)

export const io = initSocket(server)

app.get('/', (req, res) => res.json({ message: 'PeerLearning API running ✅' }))

server.listen(8000, () => {
  console.log('Server running on port 8000')
  startCronJobs()
})