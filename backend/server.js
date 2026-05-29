import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import slotRoutes from './routes/slotRoutes.js'
import { startCronJobs } from './services/cronService.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/slots', slotRoutes)

app.get('/', (req, res) => res.json({ message: 'PeerLearning API running ✅' }))

app.listen(8000, () => {
  console.log('Server running on port 8000')
  startCronJobs()
})