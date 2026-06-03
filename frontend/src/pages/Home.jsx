import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-0.5">{rating?.toFixed(1)}</span>
    </div>
  )
}

export default function Home() {
  const [notifs, setNotifs]         = useState([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [user, setUser]               = useState(null)
  const [tutors, setTutors]           = useState([])   // ← real tutors now
  const [groupClasses, setGroupClasses] = useState([])
  const [bookings, setBookings]       = useState([])
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return navigate('/')
    setUser(JSON.parse(stored))
    fetchData()
  }, [])

useEffect(() => {
  if (!user?.id) return
  const socket = io('http://localhost:8000')
  socket.emit('join', user.id)

  socket.on('new-booking', (data) => {
    setNotifs(prev => [{
      message: data.message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev])
  })

  return () => socket.disconnect()
}, [user])

  const fetchData = async () => {
    try {
      const [tutorsRes, classesRes, bookingsRes] = await Promise.all([
        // ✅ fetch actual tutors — not slots
        axios.get('http://localhost:8000/api/users/tutors', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/group-classes'),
        axios.get('http://localhost:8000/api/slots/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ])
      setTutors(tutorsRes.data)
      setGroupClasses(classesRes.data)
      setBookings(bookingsRes.data)
    } catch (err) {
      console.error(err)
    }
  }

  const upcomingBookings = bookings.filter(b => b.status === 'CONFIRMED')

  // avatar colour based on first letter
  const avatarColor = (name) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-violet-500 to-purple-600',
      'from-teal-500 to-emerald-600',
      'from-orange-400 to-rose-500',
      'from-pink-500 to-rose-600',
    ]
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  }

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning,'
    if (h < 17) return 'Good afternoon,'
    return 'Good evening,'
  }

  if (!user) return null

  return (
    <AppLayout>
      <div className="bg-white min-h-screen">

        {/* ── Header ── */}
<div className="bg-[#2563EB] px-6 pt-10 pb-16">
  <div className="flex justify-between items-start mb-6">
    <div>
      <p className="text-blue-200 text-sm">{greeting()}</p>
      <h1 className="text-white text-2xl font-bold">{user.name} 👋</h1>
    </div>
    <div className="relative">
      <button
        onClick={() => setShowNotifs(!showNotifs)}
        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center relative">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifs.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
        )}
      </button>

      {/* Dropdown */}
      {showNotifs && (
        <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-gray-800 font-semibold text-sm">Notifications</p>
            {notifs.length > 0 && (
              <button onClick={() => setNotifs([])}
                className="text-xs text-gray-400 hover:text-gray-600">
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              notifs.map((n, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-50 flex items-start gap-3 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-xs leading-relaxed">{n.message}</p>
                    <p className="text-gray-400 text-[10px] mt-1">{n.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  </div>

          {/* Search — tapping navigates to Explore */}
          <div className="relative" onClick={() => navigate('/explore')}>
            <div className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer shadow-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-gray-400 text-sm">Search subjects, tutors...</span>
            </div>
          </div>
        </div>

        {/* ── Stats — now shows tutors.length ✅ ── */}
        <div className="px-6 -mt-8">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Available tutors', value: tutors.length,          color: 'bg-blue-50 border-blue-100',   text: 'text-[#2563EB]'  },
              { label: 'My sessions',      value: upcomingBookings.length, color: 'bg-green-50 border-green-100', text: 'text-green-600'  },
              { label: 'Live classes',     value: groupClasses.length,     color: 'bg-purple-50 border-purple-100', text: 'text-purple-600' },
            ].map(s => (
              <div key={s.label} className={`${s.color} border rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-bold ${s.text}`}>{s.value}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Upcoming sessions ── */}
        {upcomingBookings.length > 0 && (
          <div className="px-6 mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-gray-800 font-bold text-base">Upcoming sessions</h2>
              <button onClick={() => navigate('/sessions')} className="text-[#2563EB] text-xs font-medium">See all</button>
            </div>
            <div className="space-y-3">
              {upcomingBookings.slice(0, 2).map(b => (
                <div key={b.id} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-800 text-sm font-semibold">1-on-1 Session</p>
                    <p className="text-gray-400 text-xs mt-0.5">{new Date(b.slot?.startTime).toLocaleString()}</p>
                  </div>
                  <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-medium">
                    Confirmed
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Featured tutors — unique tutors ✅ ── */}
        <div className="mt-8">
          <div className="px-6 flex justify-between items-center mb-4">
            <h2 className="text-gray-800 font-bold text-base">Featured tutors</h2>
            <button onClick={() => navigate('/explore')} className="text-[#2563EB] text-xs font-medium">See all</button>
          </div>

          {tutors.length === 0 ? (
            <p className="px-6 text-gray-400 text-sm">No tutors available yet.</p>
          ) : (
            <div className="flex gap-4 px-6 overflow-x-auto pb-2 scrollbar-hide">
              {/* ✅ tutors array — each tutor shown once */}
              {tutors.slice(0, 6).map(tutor => (
                <div
                  key={tutor.id}
                  onClick={() => navigate(`/tutor/${tutor.id}`)}
                  className="min-w-[150px] bg-white border border-gray-100 rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-100 transition-all active:scale-95"
                >
                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor(tutor.name)} flex items-center justify-center text-white font-bold text-lg mb-3`}>
                    {tutor.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>

                  <p className="text-gray-800 text-sm font-semibold truncate">{tutor.name}</p>

                  <div className="mt-1">
                    <Stars rating={tutor.rating} />
                  </div>

                  {/* First subject tag */}
                  {tutor.subjects?.[0] && (
                    <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                      {tutor.subjects[0]}
                    </span>
                  )}

                  {/* Available slots count */}
                  {tutor.slots?.length > 0 && (
                    <p className="text-[10px] text-green-500 font-medium mt-1.5">
                      ● {tutor.slots.length}+ slots open
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Group classes ── */}
        <div className="mt-8 px-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-gray-800 font-bold text-base">Upcoming group classes</h2>
            <button onClick={() => navigate('/explore')} className="text-[#2563EB] text-xs font-medium">See all</button>
          </div>
          <div className="space-y-3">
            {groupClasses.slice(0, 3).map(gc => (
              <div key={gc.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-gray-800 font-semibold text-sm">{gc.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{gc.tutor?.name}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ml-2 flex-shrink-0
                    ${gc.price === 0
                      ? 'bg-green-50 text-green-600 border border-green-100'
                      : 'bg-blue-50 text-[#2563EB] border border-blue-100'}`}>
                    {gc.price === 0 ? 'Free' : `₹${gc.price}`}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100 font-medium">
                    {gc.subject}
                  </span>
                  <span className="text-gray-400 text-xs flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(gc.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <span className="text-gray-400 text-xs">
                    {gc._count?.enrollments ?? gc.enrollments?.length ?? 0}/{gc.maxSeats} seats
                  </span>
                  <button
                    onClick={() => navigate('/explore')}
                    className="text-xs bg-[#2563EB] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Join class
                  </button>
                </div>
              </div>
            ))}
            {groupClasses.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No group classes scheduled yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
