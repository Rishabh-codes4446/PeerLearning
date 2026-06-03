import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  )
}

export default function TutorProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const [tutor, setTutor]           = useState(null)
  const [slots, setSlots]           = useState([])
  const [reviews, setReviews]       = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [booking, setBooking]       = useState(false)
  const [booked, setBooked]         = useState(false)
  const [error, setError]           = useState('')
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    fetchTutor()
    fetchSlots()
    fetchReviews()
  }, [id])

  const fetchTutor = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/users/tutor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTutor(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchSlots = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/slots/tutor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSlots(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/reviews/tutor/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setReviews(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const confirmBooking = async () => {
    if (!selectedSlot) return
    setBooking(true)
    setError('')
    try {
      await axios.post(`http://localhost:8000/api/slots/${selectedSlot.id}/book`,
       {},
       { headers: { Authorization: `Bearer ${token}` } }
     )
      setBooked(true)
      setSlots(prev => prev.filter(s => s.id !== selectedSlot.id))
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Slot may already be taken.')
    } finally {
      setBooking(false)
    }
  }

  const avatarColor = (name) => {
    const colors = ['from-blue-500 to-blue-600','from-violet-500 to-purple-600',
      'from-teal-500 to-emerald-600','from-orange-400 to-rose-500','from-pink-500 to-rose-600']
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  }

  const formatSlotTime = (slot) => {
    const start = new Date(slot.startTime)
    const end   = new Date(slot.endTime)
    const date  = start.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })
    const time  = `${start.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} – ${end.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`
    return { date, time }
  }

  // Group slots by date
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = new Date(slot.startTime).toDateString()
    if (!acc[date]) acc[date] = []
    acc[date].push(slot)
    return acc
  }, {})

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </AppLayout>
  )

  if (!tutor) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-gray-500">Tutor not found</p>
        <button onClick={() => navigate('/explore')} className="text-blue-500 underline text-sm">Back to Explore</button>
      </div>
    </AppLayout>
  )

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen pb-24">

        {/* Header */}
        <div className="bg-[#2563EB] px-5 pt-10 pb-8 relative">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-blue-200 text-sm mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-white text-xl font-bold">Tutor Profile</h1>
        </div>

        {/* Profile card — overlaps header */}
        <div className="px-5 mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${avatarColor(tutor.name)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                {tutor.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-gray-800 font-bold text-lg leading-tight">{tutor.name}</h2>
                <div className="mt-1">
                  <Stars rating={tutor.rating} />
                </div>
                <p className="text-gray-400 text-xs mt-1">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Bio */}
            {tutor.bio && (
              <p className="text-gray-600 text-sm mt-4 leading-relaxed">{tutor.bio}</p>
            )}

            {/* Subjects */}
            {tutor.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tutor.subjects.map(s => (
                  <span key={s} className="bg-blue-50 text-blue-600 text-xs font-medium px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Booking success banner */}
        {booked && (
          <div className="mx-5 mt-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-green-700 font-semibold text-sm">Session booked!</p>
              <p className="text-green-500 text-xs mt-0.5">Check My Sessions for details</p>
            </div>
            <button onClick={() => navigate('/sessions')}
              className="ml-auto text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl font-semibold">
              View
            </button>
          </div>
        )}

        {/* Available slots */}
        <div className="px-5 mt-5">
          <h3 className="text-gray-800 font-bold text-base mb-3">Available Slots</h3>

          {slots.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-2xl mb-2">📅</p>
              <p className="text-gray-500 text-sm font-medium">No slots available right now</p>
              <p className="text-gray-400 text-xs mt-1">Check back later</p>
            </div>
          ) : (
            Object.entries(slotsByDate).map(([date, daySlots]) => (
              <div key={date} className="mb-4">
                {/* Date header */}
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'short' })}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {daySlots.map(slot => {
                    const { time } = formatSlotTime(slot)
                    const isSelected = selectedSlot?.id === slot.id
                    return (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(isSelected ? null : slot)}
                        className={`p-3 rounded-xl border text-left transition ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-100 text-gray-700 hover:border-blue-200'
                        }`}
                      >
                        <p className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                          {time.split('–')[0].trim()}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-blue-100' : 'text-gray-400'}`}>
                          to {time.split('–')[1]?.trim()}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mt-3 bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="px-5 mt-6">
            <h3 className="text-gray-800 font-bold text-base mb-3">Reviews</h3>
            <div className="space-y-3">
              {reviews.slice(0, 5).map(r => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {r.giver?.name?.[0]}
                      </div>
                      <span className="text-gray-700 text-sm font-medium">{r.giver?.name}</span>
                    </div>
                    <div className="flex">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i <= r.rating ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  {r.comment && <p className="text-gray-500 text-xs leading-relaxed">{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sticky book button */}
        {selectedSlot && !booked && (
          <div className="fixed bottom-20 left-0 right-0 px-5 z-50">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="text-gray-800 text-sm font-semibold">Selected slot</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {formatSlotTime(selectedSlot).date} · {formatSlotTime(selectedSlot).time}
                </p>
              </div>
              <button
                onClick={confirmBooking}
                disabled={booking}
                className="bg-[#2563EB] text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 flex-shrink-0"
              >
                {booking ? 'Booking...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}