import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'
import ChatBox from '../components/ChatBox'

// ── Star picker component ─────────────────────────────────────
function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          <svg
            className={`w-8 h-8 transition ${i <= (hovered || value) ? 'fill-yellow-400' : 'fill-gray-200'}`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Review modal ──────────────────────────────────────────────
function ReviewModal({ booking, onClose, onSubmitted }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const token = localStorage.getItem('token')

  const submit = async () => {
    if (rating === 0) return setError('Please select a rating')
    setSubmitting(true)
    setError('')
    try {
      await axios.post('http://localhost:8000/api/reviews', {
        bookingId: booking.id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      onSubmitted(booking.id)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center pb-28 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-gray-800 font-bold text-lg">Leave a Review</h3>
          <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
            ✕
          </button>
        </div>

        {/* Tutor info */}
        <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-2xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold">
            {booking.slot?.tutor?.name?.[0] || '?'}
          </div>
          <div>
            <p className="text-gray-800 font-semibold text-sm">{booking.slot?.tutor?.name || 'Tutor'}</p>
            <p className="text-gray-400 text-xs">
              {new Date(booking.slot?.startTime).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
        </div>

        {/* Star picker */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm font-medium mb-2">How was your session?</p>
          <StarPicker value={rating} onChange={setRating} />
          <p className="text-xs text-gray-400 mt-1">
            {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very good' : rating === 5 ? 'Excellent!' : 'Tap to rate'}
          </p>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <p className="text-gray-600 text-sm font-medium mb-2">Add a comment <span className="text-gray-400 font-normal">(optional)</span></p>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Tell others about your experience..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 resize-none transition"
          />
        </div>

        {error && (
          <p className="text-red-500 text-xs mb-3">{error}</p>
        )}

        <button
          onClick={submit}
          disabled={submitting || rating === 0}
          className="w-full bg-[#2563EB] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit review'}
        </button>
      </div>
    </div>
  )
}

// ── Main Sessions page ────────────────────────────────────────
export default function MySessions() {
  const [tab, setTab]               = useState('sessions')
  const [bookings, setBookings]     = useState([])
  const [groupClasses, setGroupClasses] = useState([])
  const [openChat, setOpenChat]     = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [reviewed, setReviewed]     = useState(new Set())
  const [loading, setLoading]       = useState(true)
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      const [b, g] = await Promise.all([
        axios.get('http://localhost:8000/api/slots/my-bookings', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:8000/api/group-classes/my-classes', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])
      setBookings(b.data)
      setGroupClasses(g.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewed = (bookingId) => {
    setReviewed(prev => new Set([...prev, bookingId]))
  }

  const statusColor = (status) => {
    if (status === 'CONFIRMED') return 'bg-green-50 text-green-600 border-green-100'
    if (status === 'COMPLETED') return 'bg-blue-50 text-blue-600 border-blue-100'
    if (status === 'CANCELLED') return 'bg-red-50 text-red-500 border-red-100'
    if (status === 'NOSHOW')    return 'bg-orange-50 text-orange-500 border-orange-100'
    return 'bg-gray-50 text-gray-500 border-gray-100'
  }

  const tutorName = (b) =>
    b.student?.id === user.id
      ? (b.slot?.tutor?.name || 'Tutor')
      : (b.student?.name || 'Student')

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-[#2563EB] px-6 pt-10 pb-6">
          <h1 className="text-white text-xl font-bold">My Sessions</h1>
          <p className="text-blue-200 text-sm mt-1">Your learning journey</p>
        </div>

        <div className="px-6 py-4 flex gap-3 border-b border-gray-100 bg-white">
          {['sessions', 'classes'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition
                ${tab === t ? 'bg-[#2563EB] text-white' : 'bg-gray-100 text-gray-500'}`}>
              {t === 'sessions' ? `1-on-1 (${bookings.length})` : `Group (${groupClasses.length})`}
            </button>
          ))}
        </div>

        <div className="px-5 py-4">
          {loading && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── 1-on-1 Sessions ── */}
          {!loading && tab === 'sessions' && (
            <div className="space-y-3">
              {bookings.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No sessions booked yet</p>
                  <p className="text-gray-400 text-xs mt-1">Browse tutors to book your first session</p>
                  <button onClick={() => navigate('/explore')}
                    className="mt-4 bg-[#2563EB] text-white text-sm px-5 py-2 rounded-xl font-semibold">
                    Explore tutors
                  </button>
                </div>
              )}

              {bookings.map(b => (
                <div key={b.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                          {tutorName(b)[0]}
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">1-on-1 Session</p>
                          <p className="text-gray-400 text-xs">{tutorName(b)}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium border ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </div>

                    {/* Date + time */}
                    <div className="flex items-center gap-4 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-2.5 mb-3">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(b.slot.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {new Date(b.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

 {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-1">
                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setOpenChat(openChat === b.id ? null : b.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                          ${openChat === b.id
                            ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
                            : 'border-gray-200 text-gray-500 hover:border-blue-200 hover:text-[#2563EB] hover:bg-blue-50'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {openChat === b.id ? 'Close' : 'Chat'}
                      </button>
                    )}

                    {b.status === 'CONFIRMED' && (() => {
                      const now = new Date()
                      const start = new Date(b.slot.startTime)
                      const minsUntil = (start - now) / 60000
                      const isLive = minsUntil <= 30 && minsUntil > -60
                      const timeLabel = minsUntil > 1440
                        ? `Starts in ${Math.floor(minsUntil / 1440)}d`
                        : minsUntil > 60
                        ? `Starts in ${Math.floor(minsUntil / 60)}h`
                        : minsUntil > 0
                        ? `Starts in ${Math.floor(minsUntil)}m`
                        : 'Session ended'
                        return isLive ? (
                        <button
                          onClick={() => navigate(`/call/${b.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-500 text-white hover:bg-green-600 transition animate-pulse">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          Join Session
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 border border-gray-200 text-gray-400">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                          </svg>
                          {timeLabel}
                        </div>
                      )
                    })()}

                    {b.status === 'COMPLETED' && !reviewed.has(b.id) && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-yellow-50 border border-yellow-200 text-yellow-600 hover:bg-yellow-100 transition">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Rate session
                      </button>
                    )}

                    {b.status === 'COMPLETED' && reviewed.has(b.id) && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 border border-green-100 text-green-600">
                        ✓ Reviewed
                      </div>
                    )}
                  </div>
                </div>
                  {/* Inline chat */}
                  {openChat === b.id && (
                    <div className="border-t border-gray-100">
                      <ChatBox bookingId={b.id} currentUserId={user.id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Group classes ── */}
          {!loading && tab === 'classes' && (
            <div className="space-y-3">
              {groupClasses.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">No group classes yet</p>
                  <p className="text-gray-400 text-xs mt-1">Explore and join a live class</p>
                </div>
              )}
              {groupClasses.map(gc => (
                <div key={gc.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-gray-800 font-bold text-sm">{gc.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">by {gc.tutor?.name}</p>
                    </div>
                    <span className={`text-xs font-bold ${gc.price === 0 ? 'text-green-600' : 'text-[#2563EB]'}`}>
                      {gc.price === 0 ? 'Free' : `₹${gc.price}`}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-purple-50 text-purple-600 px-2.5 py-1 rounded-full border border-purple-100">{gc.subject}</span>
                    <span className="text-xs bg-gray-50 text-gray-500 px-2.5 py-1 rounded-full border border-gray-100">
                      {new Date(gc.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Review modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmitted={handleReviewed}
        />
      )}
    </AppLayout>
  )
}