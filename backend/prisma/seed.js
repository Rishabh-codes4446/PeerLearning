const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt')
const prisma = new PrismaClient()

async function main() {
  const tutors = [
    { name: 'Sneha Rao', email: 'sneha@test.com', subjects: ['DSA', 'System Design'], bio: '4th year CSE, IIT Roorkee. Cracked Google internship.' },
    { name: 'Aryan Kumar', email: 'aryan@test.com', subjects: ['Physics', 'Maths'], bio: 'JEE Advanced AIR 42. Teaching since 2022.' },
    { name: 'Priya Nair', email: 'priya@test.com', subjects: ['React', 'Node.js'], bio: 'SDE-2 at Microsoft. 5 years experience.' },
    { name: 'Mihir Verma', email: 'mihir@test.com', subjects: ['Chemistry', 'Biology'], bio: 'NEET AIR 120. Loves teaching concepts from scratch.' },
    { name: 'Rohan Das', email: 'rohan@test.com', subjects: ['Machine Learning', 'Python'], bio: 'MS from IIT Delhi. Working in AI startup.' },
  ]

  for (const t of tutors) {
    await prisma.user.create({
      data: {
        name: t.name,
        email: t.email,
        password: await bcrypt.hash('test1234', 10),
        isTutor: true,
        bio: t.bio,
        subjects: t.subjects,
        rating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
      }
    })
  }
  console.log('Seeded 5 tutors!')
}

main().then(() => prisma.$disconnect())