import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentDashboard from '../components/StudentDashboard'
import TutorDashboard from '../components/TutorDashboard'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return navigate('/')
    setUser(JSON.parse(stored))
  }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="border-b border-white/10 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-xs">P</span>
          </div>
          <span className="text-white font-semibold">PeerLearning</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-white/40 text-sm">{user.name}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium
            ${user.role === 'TUTOR' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
            {user.role}
          </span>
          <button onClick={() => navigate('/profile')}
            className="text-white/40 text-sm hover:text-white transition">Profile</button>
          <button onClick={logout}
            className="text-sm bg-white/5 border border-white/10 text-white/70 px-4 py-1.5 rounded-lg hover:bg-white/10 transition">
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-6xl mx-auto p-8">
        {user.role === 'STUDENT' ? <StudentDashboard user={user} /> : <TutorDashboard user={user} />}
      </div>
    </div>
  )
}