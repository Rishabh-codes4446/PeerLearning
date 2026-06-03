import { useEffect, useState } from 'react'
import axios from 'axios'
import AppLayout from '../components/AppLayout'
import BottomNav from '../components/BottomNav'
import ChatBox from '../components/ChatBox'

export default function Messages() {
  const [bookings, setBookings] = useState([])
  const [openChat, setOpenChat] = useState(null)
  const [loading, setLoading] = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/slots/my-bookings', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookings(res.data)
      if (res.data.length > 0) setOpenChat(res.data[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const selectedBooking = bookings.find(b => b.id === openChat)

  const avatarColor = (name) => {
    const colors = ['from-blue-500 to-blue-600', 'from-violet-500 to-purple-600',
      'from-teal-500 to-emerald-600', 'from-orange-400 to-rose-500', 'from-pink-500 to-rose-600']
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  }

  if (loading) return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <BottomNav />
    </div>
  )

  if (bookings.length === 0) return (
    <div className="flex flex-col h-screen">
      <div className="bg-white flex overflow-hidden flex-1" style={{ minHeight: 0 }}>
        <div className="bg-[#2563EB] px-6 pt-10 pb-6">
          <h1 className="text-white text-xl font-bold">Messages</h1>
          <p className="text-blue-200 text-sm mt-1">Your conversations</p>
        </div>
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold">No messages yet</p>
          <p className="text-gray-400 text-sm mt-1">Book a session to start chatting</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )

  return (
    <AppLayout>
      <div className="bg-white flex h-screen overflow-hidden">

        {/* ── Left sidebar — conversation list ── */}
        <div className={`${openChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r border-gray-100 flex-shrink-0 overflow-hidden`}>
       {/* Sidebar header */}
       <div className="bg-[#2563EB] px-5 pt-5 pb-5 flex-shrink-0">
            <h1 className="text-white text-xl font-bold">Messages</h1>
            <p className="text-blue-200 text-xs mt-0.5">{bookings.length} conversation{bookings.length !== 1 ? 's' : ''}</p>
          </div>

          {/* Search bar */}
          <div className="px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search conversations..."
                className="bg-transparent text-sm text-gray-700 outline-none w-full placeholder-gray-400"
              />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {bookings.map(b => {
              const name = b.student?.id === user.id
              ? (b.slot?.tutor?.name || 'Tutor')
              : (b.student?.name || 'Student')
              const isActive = openChat === b.id
              const date = new Date(b.slot?.startTime)
              const timeStr = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

              return (
                <button key={b.id} onClick={() => setOpenChat(b.id)}
                  className={`w-full px-4 py-3.5 flex items-center gap-3 text-left border-b border-gray-50 transition-all
                    ${isActive ? 'bg-blue-50 border-l-4 border-l-[#2563EB]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>

                  {/* Avatar */}
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColor(name)} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
                    {name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold truncate ${isActive ? 'text-[#2563EB]' : 'text-gray-800'}`}>
                        {name}
                      </p>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">{timeStr}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-400 truncate">
                        {b.status === 'CONFIRMED' ? '1-on-1 Session · Confirmed' : `1-on-1 · ${b.status}`}
                      </p>
                      {b.status === 'CONFIRMED' && (
                        <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-1" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Right — chat area ── */}
        <div className={`${openChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
          {openChat && selectedBooking ? (
            <>
              {/* Chat topbar */}
              <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 shadow-sm">
                {/* Back button — mobile only */}
                <button onClick={() => setOpenChat(null)} className="md:hidden text-gray-400 mr-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(selectedBooking.student?.name || 'S')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {(selectedBooking.student?.name || 'S')[0].toUpperCase()}
                </div>

                <div className="flex-1">
                  <p className="text-gray-800 font-semibold text-sm">{selectedBooking.student?.id === user.id
                 ? (selectedBooking.slot?.tutor?.name || 'Tutor')
                 : (selectedBooking.student?.name || 'Student')}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(selectedBooking.slot?.startTime).toLocaleDateString('en-IN', {
                      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>

                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
                  ${selectedBooking.status === 'CONFIRMED'
                    ? 'bg-green-50 text-green-600 border border-green-100'
                    : 'bg-gray-100 text-gray-500'}`}>
                  {selectedBooking.status}
                </span>
              </div>

              {/* ChatBox */}
              <div className="flex-1 overflow-hidden">
                <ChatBox
                  bookingId={openChat}
                  currentUserId={user.id}
                />
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-gray-500 font-semibold">Select a conversation</p>
              <p className="text-gray-400 text-sm mt-1">Choose from the left to start chatting</p>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  )
}