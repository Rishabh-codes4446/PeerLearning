import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [subjects, setSubjects] = useState('')
  const [bio, setBio] = useState('')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')
  const [toggling, setToggling] = useState(false)
  const [avatar, setAvatar] = useState(null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (!stored) return navigate('/')
    const u = JSON.parse(stored)
    setUser(u)
    setBio(u.bio || '')
    setSubjects(u.subjects?.join(', ') || '')
    const savedAvatar = localStorage.getItem(`avatar_${u.id}`)
    if (savedAvatar) setAvatar(savedAvatar)
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await axios.put('http://localhost:8000/api/users/profile', {
        bio,
        subjects: subjects.split(',').map(s => s.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${token}` } })
      const updated = { ...user, ...res.data }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
      setMsg('Profile updated successfully!')
      setMsgType('success')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Failed to update profile')
      setMsgType('error')
    } finally {
      setSaving(false)
    }
  }

  const toggleTutor = async () => {
    setToggling(true)
    try {
      const res = await axios.post('http://localhost:8000/api/users/toggle-tutor', {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const updated = { ...user, isTutor: res.data.isTutor }
      localStorage.setItem('user', JSON.stringify(updated))
      setUser(updated)
    } catch (err) {
      console.error(err)
    } finally {
      setToggling(false)
    }
  }

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatar(ev.target.result)
      localStorage.setItem(`avatar_${user.id}`, ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (!user) return null

  const initials = user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen pb-8">

        {/* Hero header */}
        <div className="relative bg-[#2563EB] pt-10 pb-24 px-6">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute top-16 -left-8 w-32 h-32 bg-white/5 rounded-full" />
          </div>
          <h1 className="text-white text-xl font-bold relative">My Profile</h1>
        </div>

        {/* Profile card floating over header */}
        <div className="px-5 -mt-16 relative z-10">
          <div className="bg-white rounded-3xl shadow-lg p-5">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
                  {avatar ? (
                    <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {initials}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileRef.current.click()}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-[#2563EB] rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-blue-700 transition">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-gray-900 font-bold text-lg leading-tight">{user.name}</h2>
                  {user.isTutor && (
                    <span className="text-xs bg-blue-50 text-[#2563EB] border border-blue-100 px-2 py-0.5 rounded-full font-semibold">
                      Tutor
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-0.5 truncate">{user.email}</p>
                {user.rating > 0 ? (
                  <div className="flex items-center gap-1 mt-1.5">
                    {[1,2,3,4,5].map(i => (
                      <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(user.rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 font-medium ml-0.5">{user.rating?.toFixed(1)}</span>
                  </div>
                ) : (
                  <span className="inline-block mt-1.5 text-xs text-gray-400">No ratings yet</span>
                )}
              </div>
            </div>

            {/* Subjects tags */}
            {user.subjects?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-50">
                {user.subjects.map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-[#2563EB] px-2.5 py-1 rounded-full border border-blue-100 font-medium">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-5 mt-4 space-y-3">

          {/* Tutor mode */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user.isTutor ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <svg className={`w-5 h-5 ${user.isTutor ? 'text-[#2563EB]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <p className="text-gray-800 font-semibold text-sm">Tutor mode</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {user.isTutor ? 'Active — you can create slots' : 'Off — switch on to teach'}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleTutor}
                disabled={toggling}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${user.isTutor ? 'bg-[#2563EB]' : 'bg-gray-200'}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${user.isTutor ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Tutor dashboard button */}
          {user.isTutor && (
            <button
              onClick={() => navigate('/tutor-dashboard')}
              className="w-full bg-[#2563EB] text-white py-3 rounded-2xl text-sm font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012 2h2a2 2 0 012-2V7" />
              </svg>
              Tutor Dashboard
            </button>
          )}

          {/* Edit profile */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50">
              <h3 className="text-gray-800 font-semibold text-sm">Edit profile</h3>
            </div>

            {msg && (
              <div className={`mx-5 mt-4 px-4 py-2.5 rounded-xl text-sm font-medium
                ${msgType === 'success'
                  ? 'bg-green-50 border border-green-100 text-green-600'
                  : 'bg-red-50 border border-red-100 text-red-500'}`}>
                {msg}
              </div>
            )}

            <form onSubmit={saveProfile} className="p-5 space-y-4">
              <div>
                <label className="text-gray-500 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Bio</label>
                <textarea
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition resize-none"
                  placeholder="Tell others about yourself..."
                  value={bio}
                  onChange={e => setBio(e.target.value)} />
              </div>

              {user.isTutor && (
                <div>
                  <label className="text-gray-500 text-xs font-semibold mb-1.5 block uppercase tracking-wide">Subjects you teach</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition"
                    placeholder="e.g. DSA, React, Maths, Physics"
                    value={subjects}
                    onChange={e => setSubjects(e.target.value)} />
                  <p className="text-gray-300 text-xs mt-1.5">Separate subjects with commas</p>
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#2563EB] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : 'Save changes'}
              </button>
            </form>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 border border-red-100 text-red-500 py-3 rounded-2xl text-sm font-semibold hover:bg-red-50 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log out
          </button>

        </div>
      </div>
    </AppLayout>
  )
}