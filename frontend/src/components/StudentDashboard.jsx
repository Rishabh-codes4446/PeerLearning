import { useEffect, useState } from 'react'
import axios from 'axios'
import ChatBox from './ChatBox'

export default function StudentDashboard({ user }) {
  const [slots, setSlots] = useState([])
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('browse')
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
      alert('Slot booked successfully!')
      fetchSlots()
      fetchBookings()
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed')
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('browse')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'browse' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
          Browse Tutors
        </button>
        <button onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
          My Bookings ({bookings.length})
        </button>
      </div>

      {tab === 'browse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slots.length === 0 && <p className="text-gray-400 text-sm">No available slots right now.</p>}
          {slots.map(slot => (
            <div key={slot.id} className="bg-white rounded-xl shadow-sm border p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{slot.tutor?.name}</p>
                  <p className="text-xs text-gray-400 mt-1">⭐ {slot.tutor?.rating?.toFixed(1) || 'New'}</p>
                </div>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Available</span>
              </div>
              {slot.tutor?.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {slot.tutor.subjects.map(s => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mb-4">
                🕐 {new Date(slot.startTime).toLocaleString()} — {new Date(slot.endTime).toLocaleTimeString()}
              </p>
              <button onClick={() => bookSlot(slot.id)}
                className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
                Book Session
              </button>
            </div>
          ))}
        </div>
      )}

      {bookings.map(b => (
     <div key={b.id} className="bg-white rounded-xl border p-5">
     <div className="flex justify-between items-center mb-4">
      <div>
        <p className="font-medium text-gray-800">Session booked</p>
        <p className="text-xs text-gray-400 mt-1">
          🕐 {new Date(b.slot.startTime).toLocaleString()}
        </p>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full font-medium
        ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
          b.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'}`}>
        {b.status}
      </span>
    </div>
    <ChatBox bookingId={b.id} currentUserId={user.id} />
   </div>
   ))}
    </div>
  )
}