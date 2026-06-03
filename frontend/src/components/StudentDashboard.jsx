import { useEffect, useState } from 'react'
import axios from 'axios'
import ChatBox from './ChatBox'

export default function StudentDashboard({ user }) {
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('browse')
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchSlots()
    fetchBookings()
  }, [])

  const fetchSlots = async () => {
    const res = await axios.get('http://localhost:8000/api/slots')
    setSlots(res.data)
  }

  const fetchBookings = async () => {
    const res = await axios.get('http://localhost:8000/api/slots/my-bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setBookings(res.data)
  }

  const bookSlot = async (slotId) => {
    try {
      await axios.post(`http://localhost:8000/api/slots/${slotId}/book`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchSlots()
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed')
    }
  }

  const filtered = slots.filter(s =>
    search === '' ||
    s.tutor?.subjects?.some(sub => sub.toLowerCase().includes(search.toLowerCase())) ||
    s.tutor?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Dashboard</h1>
        <p className="text-gray-400 text-sm">Find tutors and manage your sessions</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {['browse', 'bookings'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${tab === t
                ? 'bg-[#2563EB] text-white'
                : 'text-gray-400 border border-gray-200 hover:border-blue-300'}`}>
            {t === 'browse' ? 'Browse tutors' : `My bookings (${bookings.length})`}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <div className="mb-6">
            <input
              className="w-full max-w-sm border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition"
              placeholder="Search by subject or tutor name..."
              value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && (
              <p className="text-gray-400 text-sm col-span-3">No slots found.</p>
            )}
            {filtered.map(slot => (
              <div key={slot.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:border-blue-200 hover:shadow-sm transition">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-[#2563EB] font-semibold text-sm">
                      {slot.tutor?.name?.[0]}
                    </div>
                    <div>
                      <p className="text-gray-800 text-sm font-medium">{slot.tutor?.name}</p>
                      <p className="text-gray-400 text-xs">⭐ {slot.tutor?.rating?.toFixed(1) || 'New'}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full border border-green-100">
                    Available
                  </span>
                </div>
                {slot.tutor?.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {slot.tutor.subjects.map(s => (
                      <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-400 text-xs mb-4">
                  {new Date(slot.startTime).toLocaleString()} — {new Date(slot.endTime).toLocaleTimeString()}
                </p>
                <button onClick={() => bookSlot(slot.id)}
                  className="w-full bg-[#2563EB] text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                  Book session
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 && (
            <p className="text-gray-400 text-sm">No bookings yet.</p>
          )}
          {bookings.map(b => (
            <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-gray-800 font-medium">Session</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(b.slot.startTime).toLocaleString()}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium
                  ${b.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border border-green-100' :
                    b.status === 'COMPLETED' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                    'bg-red-50 text-red-500 border border-red-100'}`}>
                  {b.status}
                </span>
              </div>
              <ChatBox bookingId={b.id} currentUserId={user.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}