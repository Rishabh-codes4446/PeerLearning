import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Explore from './pages/Explore'
import MySessions from './pages/MySessions'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import TutorProfile from './pages/TutorProfile'
import TutorDashboard from './pages/TutorDashboard'
import VideoCall from './pages/VideoCall'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/sessions" element={<MySessions />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/tutor-dashboard" element={<TutorDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tutor/:id" element={<TutorProfile />} />
        <Route path="/call/:bookingId" element={<VideoCall />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App