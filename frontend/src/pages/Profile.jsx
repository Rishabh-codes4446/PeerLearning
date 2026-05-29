import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState('')
  const [bio, setBio] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return navigate('/')
    const u = JSON.parse(stored)
    setUser(u)
    setBio(u.bio || '')
    setSubjects(u.subjects?.join(', ') || '')
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put('http://localhost:8000/api/users/profile', {
        bio,
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }))
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed to update')
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-lg font-bold text-blue-600">PeerLearning</h1>
        <button onClick={() => navigate('/dashboard')}
          className="text-sm text-blue-500 hover:underline">← Back to Dashboard</button>
      </nav>
      <div className="max-w-xl mx-auto p-8">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
              {user.name?.[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
              <p className="text-sm text-gray-400">{user.role} · ⭐ {user.rating?.toFixed(1) || 'No rating yet'}</p>
            </div>
          </div>

          {msg && <p className="text-sm text-green-600 mb-4">{msg}</p>}

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Bio</label>
              <textarea rows={3}
                className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tell students about yourself..."
                value={bio} onChange={e => setBio(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Subjects you can teach <span className="text-gray-400">(comma separated)</span>
              </label>
              <input type="text"
                className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Maths, Physics, DSA, React"
                value={subjects} onChange={e => setSubjects(e.target.value)} />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
              Save Profile
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}