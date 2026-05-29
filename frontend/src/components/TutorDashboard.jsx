import { useEffect, useState } from 'react'
import axios from 'axios'

export default function TutorDashboard({ user }) {
  const [bookings, setBookings] = useState([])
  const [tab, setTab] = useState('bookings')
  const [form, setForm] = useState({ startTime: '', endTime: '' })
  const [msg, setMsg] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    const res = await axios.get('http://localhost:8000/api/slots/my-bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    setBookings(res.data)
  }

  const createSlot = async (e) => {
    e.preventDefault()
    try {
      await axios.post('http://localhost:8000/api/slots', form, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMsg('Slot created!')
      setForm({ startTime: '', endTime: '' })
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed')
    }
  }

  return (
    <div>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'bookings' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
          My Bookings ({bookings.length})
        </button>
        <button onClick={() => setTab('create')}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === 'create' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-600'}`}>
          + Create Slot
        </button>
      </div>

      {tab === 'create' && (
        <div className="bg-white rounded-xl border p-6 max-w-md">
          <h2 className="font-semibold text-gray-800 mb-4">Create a new slot</h2>
          {msg && <p className="text-sm text-green-600 mb-3">{msg}</p>}
          <form onSubmit={createSlot} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
              <input type="datetime-local" required
                className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Time</label>
              <input type="datetime-local" required
                className="w-full border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            </div>
            <button className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm hover:bg-blue-700">
              Create Slot
            </button>
          </form>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 && <p className="text-gray-400 text-sm">No bookings yet.</p>}
          {bookings.map(b => (
            <div key={b.id} className="bg-white rounded-xl border p-5 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{b.student?.name}</p>
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
          ))}
        </div>
      )}
    </div>
  )
}