import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {user?.name} 👋</h1>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500 text-sm">Role: <span className="font-medium text-gray-800">{user?.role}</span></p>
          <p className="text-gray-400 text-sm mt-2">More features coming soon...</p>
        </div>
      </div>
    </div>
  )
}