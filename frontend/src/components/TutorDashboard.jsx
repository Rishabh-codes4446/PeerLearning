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
      setMsg('Slot created successfully!')
      setForm({ startTime: '', endTime: '' })
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg(err.response?.data?.error || 'Failed')
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white mb-1">Tutor Dashboard</h1>
        <p className="text-white/40 text-sm">Manage your sessions and availability</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        {['bookings', 'create'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition
              ${tab === t ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
            {t === 'bookings' ? `Bookings (${bookings.length})` : '+ New slot'}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 max-w-md">
          <h2 className="text-white font-medium mb-4">Create availability slot</h2>
          {msg && <p className="text-green-400 text-sm mb-4">{msg}</p>}
          <form onSubmit={createSlot} className="space-y-4">
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">Start time</label>
              <input type="datetime-local" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/30 transition"
                value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} />
            </div>
            <div>
              <label className="text-white/40 text-xs mb-1.5 block">End time</label>
              <input type="datetime-local" required
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-white/30 transition"
                value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
            </div>
            <button className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition">
              Create slot
            </button>
          </form>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 && <p className="text-white/30 text-sm">No bookings yet.</p>}
          {bookings.map(b => (
            <div key={b.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm">
                  {b.student?.name?.[0]}
                </div>
                <div>
                  <p className="text-white font-medium text-sm">{b.student?.name}</p>
                  <p className="text-white/30 text-xs mt-0.5">
                    {new Date(b.slot.startTime).toLocaleString()}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium
                ${b.status === 'CONFIRMED' ? 'bg-green-500/10 text-green-400' :
                  b.status === 'COMPLETED' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-red-500/10 text-red-400'}`}>
                {b.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}