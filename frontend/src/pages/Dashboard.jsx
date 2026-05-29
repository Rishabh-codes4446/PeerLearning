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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
  <h1 className="text-lg font-bold text-blue-600">PeerLearning</h1>
  <div className="flex items-center gap-4">
    <span className="text-sm text-gray-500">{user.name} · <span className="text-blue-500">{user.role}</span></span>
    <button onClick={() => navigate('/profile')}
      className="text-sm text-gray-500 hover:text-blue-600">My Profile</button>
    <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
     </div>
     </nav>
      <div className="max-w-5xl mx-auto p-8">
        {user.role === 'STUDENT' ? <StudentDashboard user={user} /> : <TutorDashboard user={user} />}
      </div>
    </div>
  )
}