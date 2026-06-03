import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function VideoCall() {
  const { bookingId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    getRoom()
  }, [])

  const getRoom = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/video/${bookingId}/room`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      // Open Jitsi in a new tab directly
      window.open(res.data.url, '_blank')
      // Go back to sessions
      navigate('/sessions')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join call')
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-white font-semibold mb-1">Could not join session</p>
        <p className="text-gray-400 text-sm mb-4">{error}</p>
        <button onClick={() => navigate('/sessions')}
          className="bg-blue-500 text-white px-5 py-2 rounded-lg text-sm font-semibold">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-sm">Opening your session...</p>
        <p className="text-gray-400 text-xs mt-2">A new tab will open with your video call</p>
      </div>
    </div>
  )
}