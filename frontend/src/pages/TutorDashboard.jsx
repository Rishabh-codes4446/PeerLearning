import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, color, sub }) {
  return (
    <div className={`${color} rounded-2xl p-4 flex-1`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs font-medium opacity-70 mt-0.5">{label}</p>
      {sub && <p className="text-xs opacity-50 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Add slot modal ────────────────────────────────────────────
function AddSlotModal({ onClose, onAdded }) {
  const [date, setDate]   = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const submit = async () => {
    if (!date || !start || !end) return setError('Please fill all fields')
    const startTime = new Date(`${date}T${start}`)
    const endTime   = new Date(`${date}T${end}`)
    if (endTime <= startTime) return setError('End time must be after start time')

    setLoading(true)
    setError('')
    try {
      await axios.post('http://localhost:8000/api/slots', 
        { startTime, endTime },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      onAdded()
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create slot')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center pb-24 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-800 font-bold text-lg">Add Available Slot</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">✕</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-gray-500 text-xs font-medium mb-1.5 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-gray-500 text-xs font-medium mb-1.5 block">Start time</label>
              <input type="time" value={start} onChange={e => setStart(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="text-gray-500 text-xs font-medium mb-1.5 block">End time</label>
              <input type="time" value={end} onChange={e => setEnd(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100" />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

        <button onClick={submit} disabled={loading}
          className="mt-5 w-full bg-[#2563EB] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Adding...' : 'Add slot'}
        </button>
      </div>
    </div>
  )
}

// ── Main Tutor Dashboard ──────────────────────────────────────
export default function TutorDashboard() {
  const [bookings, setBookings]   = useState([])
  const [slots, setSlots]         = useState([])
  const [tab, setTab]             = useState('bookings')
  const [showAddSlot, setShowAddSlot] = useState(false)
  const [loading, setLoading]     = useState(true)
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    if (!user.isTutor) return navigate('/dashboard')
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [b, s] = await Promise.all([
        axios.get('http://localhost:8000/api/slots/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/slots/my-slots', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])
      setBookings(b.data)
      setSlots(s.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const deleteSlot = async (slotId) => {
    try {
      await axios.delete(`http://localhost:8000/api/slots/${slotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSlots(prev => prev.filter(s => s.id !== slotId))
    } catch (err) {
      console.error(err)
    }
  }

  const confirmedBookings  = bookings.filter(b => b.status === 'CONFIRMED')
  const completedBookings  = bookings.filter(b => b.status === 'COMPLETED')
  const availableSlots     = slots.filter(s => s.status === 'AVAILABLE')

  const statusColor = (status) => {
    if (status === 'CONFIRMED') return 'bg-green-50 text-green-600 border-green-100'
    if (status === 'COMPLETED') return 'bg-blue-50 text-blue-600 border-blue-100'
    if (status === 'CANCELLED') return 'bg-red-50 text-red-500 border-red-100'
    return 'bg-gray-50 text-gray-500 border-gray-100'
  }

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen pb-24">

        {/* Header */}
        <div className="bg-[#2563EB] px-5 pt-10 pb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Tutor Dashboard</p>
              <h1 className="text-white text-xl font-bold">{user.name}</h1>
            </div>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-white text-xs font-medium">Active</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 -mt-1 mb-4">
          <div className="flex gap-3">
            <StatCard
              label="Upcoming"
              value={confirmedBookings.length}
              color="bg-white border border-gray-100 text-[#2563EB] shadow-sm"
            />
            <StatCard
              label="Completed"
              value={completedBookings.length}
              color="bg-white border border-gray-100 text-green-600 shadow-sm"
            />
            <StatCard
              label="Open slots"
              value={availableSlots.length}
              color="bg-white border border-gray-100 text-purple-600 shadow-sm"
            />
            <StatCard
              label="Rating"
              value={user.rating ? `${Number(user.rating).toFixed(1)}★` : 'New'}
              color="bg-white border border-gray-100 text-yellow-500 shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-5 mb-4">
          {['bookings', 'slots'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition
                ${tab === t ? 'bg-[#2563EB] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {t === 'bookings'
                ? `Bookings (${bookings.length})`
                : `My Slots (${slots.length})`}
            </button>
          ))}
        </div>

        {/* ── Bookings tab ── */}
        {tab === 'bookings' && (
          <div className="px-5 space-y-3">
            {loading && [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}

            {!loading && bookings.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-gray-500 font-medium">No bookings yet</p>
                <p className="text-gray-400 text-xs mt-1">Add slots so students can book you</p>
                <button onClick={() => setTab('slots')}
                  className="mt-4 bg-[#2563EB] text-white text-sm px-5 py-2 rounded-xl font-semibold">
                  Add slots
                </button>
              </div>
            )}

            {!loading && bookings.map(b => (
              <div key={b.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {b.student?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">{b.student?.name || 'Student'}</p>
                      <p className="text-gray-400 text-xs">{b.student?.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusColor(b.status)}`}>
                    {b.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(b.slot?.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(b.slot?.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(b.slot?.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Reviews received */}
                {b.reviews?.length > 0 && (
                  <div className="mt-3 bg-yellow-50 border border-yellow-100 rounded-xl px-3 py-2 flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">★</span>
                    <span className="text-yellow-700 text-xs font-medium">{b.reviews[0].rating}/5</span>
                    {b.reviews[0].comment && (
                      <span className="text-yellow-600 text-xs truncate">"{b.reviews[0].comment}"</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Slots tab ── */}
        {tab === 'slots' && (
          <div className="px-5">
            <button onClick={() => setShowAddSlot(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#2563EB] text-white py-3 rounded-2xl font-semibold text-sm mb-4 hover:bg-blue-700 transition">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add new slot
            </button>

            {loading && [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 mb-3 animate-pulse">
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}

            {!loading && slots.length === 0 && (
              <div className="text-center py-16">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="text-gray-500 font-medium">No slots added yet</p>
                <p className="text-gray-400 text-xs mt-1">Add your availability so students can book you</p>
              </div>
            )}

            <div className="space-y-2">
              {!loading && slots.map(s => {
                const start = new Date(s.startTime)
                const end   = new Date(s.endTime)
                return (
                  <div key={s.id} className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0
                        ${s.status === 'AVAILABLE' ? 'bg-green-400' : s.status === 'BOOKED' ? 'bg-blue-400' : 'bg-gray-300'}`} />
                      <div>
                        <p className="text-gray-800 text-sm font-semibold">
                          {start.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' – '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium
                        ${s.status === 'AVAILABLE' ? 'bg-green-50 text-green-600' : s.status === 'BOOKED' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        {s.status}
                      </span>
                      {s.status === 'AVAILABLE' && (
                        <button onClick={() => deleteSlot(s.id)}
                          className="w-7 h-7 bg-red-50 rounded-full flex items-center justify-center text-red-400 hover:bg-red-100 transition">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {showAddSlot && (
        <AddSlotModal
          onClose={() => setShowAddSlot(false)}
          onAdded={fetchAll}
        />
      )}
    </AppLayout>
  )
}