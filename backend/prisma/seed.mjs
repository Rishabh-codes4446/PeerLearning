import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Clean existing seed data ──────────────────────────────
  await prisma.enrollment.deleteMany()
  await prisma.groupClass.deleteMany()
  await prisma.review.deleteMany()
  await prisma.message.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.user.deleteMany({ where: { email: { endsWith: '@peerlearn.dev' } } })

  const password = await bcrypt.hash('test1234', 10)

  // ── Create tutors ─────────────────────────────────────────
  const tutors = await Promise.all([
    prisma.user.create({ data: {
      name: 'Sneha Rao',
      email: 'sneha@peerlearn.dev',
      password,
      isTutor: true,
      bio: '4th year CSE at IIT Roorkee. Google intern 2024. Cracked 150+ LeetCode hard problems. Happy to help with DSA and System Design.',
      subjects: ['DSA', 'System Design', 'Competitive Programming'],
      rating: 4.9,
    }}),
    prisma.user.create({ data: {
      name: 'Aryan Kumar',
      email: 'aryan@peerlearn.dev',
      password,
      isTutor: true,
      bio: 'JEE Advanced AIR 42 (2022). 3rd year EE at IIT Bombay. Taught 80+ students for JEE. Strong in Physics and Maths.',
      subjects: ['JEE Physics', 'JEE Maths', 'Calculus', 'Electrostatics'],
      rating: 4.8,
    }}),
    prisma.user.create({ data: {
      name: 'Priya Nair',
      email: 'priya@peerlearn.dev',
      password,
      isTutor: true,
      bio: 'SDE-2 at Microsoft. 5 years building full-stack apps. I teach React, Node.js and System Design for placements.',
      subjects: ['React', 'Node.js', 'System Design', 'JavaScript'],
      rating: 4.7,
    }}),
    prisma.user.create({ data: {
      name: 'Mihir Verma',
      email: 'mihir@peerlearn.dev',
      password,
      isTutor: true,
      bio: 'NEET AIR 120. Final year MBBS. Specialise in Chemistry and Biology for Class 11/12 and NEET aspirants.',
      subjects: ['Chemistry', 'Biology', 'NEET Prep', 'Organic Chemistry'],
      rating: 4.6,
    }}),
    prisma.user.create({ data: {
      name: 'Rohan Das',
      email: 'rohan@peerlearn.dev',
      password,
      isTutor: true,
      bio: 'MS from IIT Delhi. Working as ML Engineer at a funded startup. Teach Python, ML fundamentals and interview prep.',
      subjects: ['Machine Learning', 'Python', 'Data Science', 'AI Fundamentals'],
      rating: 4.8,
    }}),
    prisma.user.create({ data: {
      name: 'Aisha Khan',
      email: 'aisha@peerlearn.dev',
      password,
      isTutor: true,
      bio: 'Economics honours from Delhi University. CAT 99.2 percentile. Teach Maths, Economics and help with CAT/MBA prep.',
      subjects: ['Economics', 'CAT Maths', 'Quantitative Aptitude', 'Statistics'],
      rating: 4.5,
    }}),
  ])

  console.log(`✅ Created ${tutors.length} tutors`)

  // ── Create slots for each tutor (next 7 days) ────────────
  const now = new Date()
  const slotData = []

  for (const tutor of tutors) {
    for (let day = 1; day <= 7; day++) {
      const morningStart = new Date(now)
      morningStart.setDate(now.getDate() + day)
      morningStart.setHours(10, 0, 0, 0)
      const morningEnd = new Date(morningStart)
      morningEnd.setHours(11, 0, 0, 0)

      const eveningStart = new Date(now)
      eveningStart.setDate(now.getDate() + day)
      eveningStart.setHours(18, 0, 0, 0)
      const eveningEnd = new Date(eveningStart)
      eveningEnd.setHours(19, 0, 0, 0)

      slotData.push(
        { tutorId: tutor.id, startTime: morningStart, endTime: morningEnd, status: 'AVAILABLE' },
        { tutorId: tutor.id, startTime: eveningStart, endTime: eveningEnd, status: 'AVAILABLE' },
      )
    }
  }

  await prisma.slot.createMany({ data: slotData })
  console.log(`✅ Created ${slotData.length} slots`)

  // ── Create group classes ──────────────────────────────────
  const classes = [
    {
      tutorId: tutors[0].id,
      title: 'DSA Crash Course — Arrays & Strings',
      subject: 'DSA',
      description: 'Cover the most asked array and string patterns for product company interviews. 20 problems solved live.',
      startTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxSeats: 30, price: 99, status: 'UPCOMING',
    },
    {
      tutorId: tutors[1].id,
      title: 'JEE Physics — Electrostatics Full Chapter',
      subject: 'JEE Physics',
      description: 'Complete electrostatics from basics to advanced PYQs. Ideal for class 12 students and JEE droppers.',
      startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxSeats: 50, price: 79, status: 'UPCOMING',
    },
    {
      tutorId: tutors[4].id,
      title: 'Python for Beginners — Zero to Hero',
      subject: 'Python',
      description: 'Start from scratch. Variables, loops, functions, OOP and a mini project by the end.',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxSeats: 40, price: 49, status: 'UPCOMING',
    },
    {
      tutorId: tutors[2].id,
      title: 'React Hooks Deep Dive',
      subject: 'React',
      description: 'useState, useEffect, useContext, useReducer and custom hooks — with live project examples.',
      startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      endTime:   new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
      maxSeats: 25, price: 129, status: 'UPCOMING',
    },
  ]

  await prisma.groupClass.createMany({ data: classes })
  console.log(`✅ Created ${classes.length} group classes`)

  console.log('\n🎉 Seeding complete!')
  console.log('─────────────────────────────────')
  console.log('All tutor accounts use password: test1234')
  console.log('Emails: sneha / aryan / priya / mihir / rohan / aisha @peerlearn.dev')
  console.log('─────────────────────────────────')
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect())
