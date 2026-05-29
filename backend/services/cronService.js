import cron from 'node-cron'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    const now = new Date()
    try {
      const expiredSlots = await prisma.slot.updateMany({
        where: {
          status: 'AVAILABLE',
          endTime: { lt: now }
        },
        data: { status: 'EXPIRED' }
      })

      const completedBookings = await prisma.booking.updateMany({
        where: {
          status: 'CONFIRMED',
          slot: { endTime: { lt: now } }
        },
        data: { status: 'COMPLETED' }
      })

      if (expiredSlots.count > 0 || completedBookings.count > 0) {
        console.log(`⏰ Cron: ${expiredSlots.count} slots expired, ${completedBookings.count} bookings completed`)
      }
    } catch (err) {
      console.error('Cron error:', err.message)
    }
  })

  console.log('✅ Cron jobs started')
}