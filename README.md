# PeerLearning 🎓

A full-stack peer-to-peer learning platform where skilled individuals — IITians, working professionals, college seniors — can list their available time slots and earn money by teaching, while students can find, book, and learn directly from real people through live video sessions.

## 🎬 Demo Video
Link for demo video on youtube
https://youtu.be/_FPgj-EFz8Q

---

## Motivation

Imagine you're in Class 11 preparing for IIT-JEE. You can watch hundreds of YouTube videos — but you can never actually *talk* to someone who cracked it. Or imagine you want to work at Google or Microsoft — wouldn't it be powerful to have a real one-on-one conversation with someone who actually works there?

**That's the gap PeerLearning solves.**

- Students get real guidance from real people — not just passive content
- Skilled individuals (IITians, engineers, seniors) can monetize their free time
- Even one hour of your time can earn you ₹500–₹2000+

---

## ✨ Features

- 🔐 **Authentication** — Secure register/login with JWT tokens and bcrypt password hashing
- 👨‍🏫 **Dual Role System** — Any user can switch between Student and Tutor mode
- 📅 **Slot Booking** — Tutors create available time slots; students can browse and book instantly
- 💬 **Real-time Chat** — Live messaging between student and tutor per booking, powered by Socket.io
- 🎥 **Video Calling** — One-click live video sessions using Jitsi Meet (WebRTC)
- ⭐ **Ratings & Reviews** — Students can rate and review tutors after completed sessions
- 🏫 **Group Classes** — Tutors can create group sessions with pricing and seat limits
- 🔍 **Explore & Search** — Browse tutors by subject, category, rating, and availability
- 📊 **Tutor Dashboard** — Stats, bookings overview, slot management all in one place
- ⏰ **Cron Jobs** — Auto-complete sessions after their end time passes
- 📱 **Mobile-first UI** — Fully responsive design with bottom navigation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth | JWT, bcryptjs |
| Real-time | Socket.io |
| Video Call | Jitsi Meet (WebRTC) |
| Background Jobs | node-cron |
| Email | Nodemailer |

---

## 📁 Project Structure

```
PeerLearning/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── slotController.js
│   │   ├── groupClassController.js
│   │   ├── videoController.js
│   │   └── userController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── slotRoutes.js
│   │   ├── groupClassRoutes.js
│   │   ├── videoRoutes.js
│   │   └── userRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── prisma/
│   │   └── schema.prisma
│   ├── utils/
│   │   └── prisma.js
│   └── server.js
└── frontend/
    └── src/
        ├── pages/
        │   ├── Home.jsx
        │   ├── Explore.jsx
        │   ├── MySessions.jsx
        │   ├── Messages.jsx
        │   ├── Profile.jsx
        │   ├── TutorDashboard.jsx
        │   ├── TutorProfile.jsx
        │   └── VideoCall.jsx
        └── components/
            ├── AppLayout.jsx
            ├── BottomNav.jsx
            └── ChatBox.jsx
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL database (or Supabase account)

### 1. Clone the repository
```bash
git clone https://github.com/Rishabh-codes4446/PeerLearning.git
cd PeerLearning
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
DAILY_API_KEY=your_daily_co_api_key (optional)
PORT=8000
```

Run Prisma migrations:
```bash
npx prisma db push
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Go to `http://localhost:5173` in your browser.

---

## 📊 Database Schema

The app uses 5 core Prisma models:

- **User** — stores both students and tutors, with `isTutor` flag
- **Slot** — time slots created by tutors (AVAILABLE / BOOKED)
- **Booking** — links a student to a slot
- **Review** — star rating + comment after a completed session
- **Message** — real-time chat messages per booking

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and get JWT |
| GET | `/api/slots` | Get all available slots |
| POST | `/api/slots` | Create a slot (tutor only) |
| POST | `/api/slots/:slotId/book` | Book a slot |
| GET | `/api/slots/my-bookings` | Get my bookings |
| POST | `/api/video/:bookingId/room` | Get video call room URL |
| GET | `/api/group-classes` | Get all group classes |
| PUT | `/api/users/profile` | Update profile |
| POST | `/api/users/toggle-tutor` | Toggle tutor mode |

---