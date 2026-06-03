import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AppLayout from '../components/AppLayout'

// ── Filter config ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',     label: 'All' },
  { id: 'school',  label: 'School' },
  { id: 'college', label: 'College' },
  { id: 'company', label: 'Company / Tech' },
  { id: 'exam',    label: 'Competitive Exams' },
  { id: 'neet',    label: 'NEET' },
]

const SUB_FILTERS = {
  school: {
    Class: ['Class 1–5', 'Class 6–8', 'Class 9–10', 'Class 11–12'],
    Subject: ['Maths', 'Physics', 'Chemistry', 'Biology', 'English', 'Economics', 'Art'],
  },
  college: {
    College: ['IIT Roorkee', 'IIT Delhi', 'IIT Bombay', 'NIT', 'BITS', 'Delhi University'],
    Subject: ['DSA', 'Maths', 'Physics', 'Chemistry', 'DBMS', 'OS', 'Networks'],
  },
  company: {
    Company: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Flipkart', 'Startup'],
    Topic: ['DSA', 'System Design', 'React', 'Node.js', 'Machine Learning', 'DevOps'],
  },
  exam: {
    Exam: ['JEE Main', 'JEE Advanced', 'CAT', 'GATE', 'UPSC', 'GRE'],
    Subject: ['Maths', 'Physics', 'Chemistry', 'Quantitative Aptitude'],
  },
  neet: {
    Subject: ['Biology', 'Chemistry', 'Physics', 'Botany', 'Zoology'],
    Level: ['Class 11', 'Class 12', 'Dropper batch'],
  },
}

// ── Star rating component ─────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'fill-yellow-400' : 'fill-gray-200'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating?.toFixed(1)}</span>
    </div>
  )
}

// ── Tutor card ────────────────────────────────────────────────
function TutorCard({ tutor, onClick }) {
  const initials = tutor.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const colors = ['from-blue-500 to-blue-600', 'from-violet-500 to-purple-600',
    'from-teal-500 to-emerald-600', 'from-orange-400 to-rose-500', 'from-pink-500 to-rose-600']
  const color = colors[tutor.name?.charCodeAt(0) % colors.length]

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-blue-100 transition-all cursor-pointer active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-base flex-shrink-0`}>
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-gray-800 text-sm leading-tight">{tutor.name}</p>
            <Stars rating={tutor.rating} />
          </div>

          {tutor.bio && (
            <p className="text-gray-400 text-xs mt-0.5 line-clamp-2 leading-relaxed">{tutor.bio}</p>
          )}

          {/* Subject tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tutor.subjects?.slice(0, 3).map(s => (
              <span key={s} className="bg-blue-50 text-blue-600 text-[10px] font-medium px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
            {tutor.subjects?.length > 3 && (
              <span className="bg-gray-50 text-gray-400 text-[10px] px-2 py-0.5 rounded-full">
                +{tutor.subjects.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

     {/* Bottom row */}
     <div className="mt-3 flex items-center justify-between">
     <div className="text-xs text-gray-400">
       {tutor.slots?.length > 0
        ? <span className="text-green-500 font-medium">● {tutor.slots.length}+ slots open</span>
        : <span className="text-gray-300">No slots yet</span>
       }
     </div>
     <button
      onClick={e => { e.stopPropagation(); onClick() }}
      className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2 rounded-xl transition"
      >
      Book session
     </button>
     </div>
     </div>
  )
}

// ── Main Explore page ─────────────────────────────────────────
export default function Explore() {
  const [tab, setTab] = useState('tutors')           // 'tutors' | 'groups'
  const [tutors, setTutors] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [subFilters, setSubFilters] = useState({})   // { Class: 'Class 9–10', Subject: 'Maths' }
  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  useEffect(() => {
    fetchTutors()
    fetchGroups()
  }, [])

  const fetchTutors = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/users/tutors', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setTutors(res.data)
    } catch (err) {
      console.error('Failed to fetch tutors', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGroups = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/group-classes', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setGroups(res.data)
    } catch (err) {
      console.error('Failed to fetch group classes', err)
    }
  }

  // ── When category changes, reset sub-filters ──────────────
  const handleCategory = (id) => {
    setCategory(id)
    setSubFilters({})
  }

  const handleSubFilter = (filterKey, value) => {
    setSubFilters(prev => ({
      ...prev,
      [filterKey]: prev[filterKey] === value ? null : value
    }))
  }

  // ── Filter tutors client-side ─────────────────────────────
  const filtered = tutors.filter(t => {
    const q = search.toLowerCase()
    const matchesSearch = !q ||
      t.name?.toLowerCase().includes(q) ||
      t.bio?.toLowerCase().includes(q) ||
      t.subjects?.some(s => s.toLowerCase().includes(q))

    // Category filter — match against subjects/bio keywords
    const categoryKeywords = {
      school:  ['class', 'school', 'cbse', 'icse', 'maths', 'physics', 'chemistry', 'biology', 'english'],
      college: ['iit', 'nit', 'bits', 'university', 'btech', 'mtech', 'engineering', 'dsa', 'dbms', 'os'],
      company: ['google', 'microsoft', 'amazon', 'meta', 'flipkart', 'sde', 'react', 'node', 'system design', 'machine learning'],
      exam:    ['jee', 'cat', 'gate', 'upsc', 'gre', 'competitive'],
      neet:    ['neet', 'mbbs', 'botany', 'zoology', 'biology'],
    }

    const matchesCategory = category === 'all' || (() => {
      const keywords = categoryKeywords[category] || []
      const haystack = [t.bio, ...(t.subjects || [])].join(' ').toLowerCase()
      return keywords.some(kw => haystack.includes(kw))
    })()

    // Sub-filter: match selected sub-filter values against subjects/bio
    const matchesSubFilters = Object.entries(subFilters).every(([, val]) => {
      if (!val) return true
      const haystack = [t.bio, ...(t.subjects || [])].join(' ').toLowerCase()
      return haystack.includes(val.toLowerCase().replace('class ', ''))
    })

    return matchesSearch && matchesCategory && matchesSubFilters
  })

  const activeSubs = SUB_FILTERS[category] || {}

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">

        {/* ── Header ── */}
        <div className="bg-[#2563EB] px-5 pt-10 pb-5">
          <h1 className="text-white text-xl font-bold mb-3">Explore</h1>
          {/* Search bar */}
          <div className="relative">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search subjects, tutors, classes..."
              className="w-full bg-white rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
        </div>

        {/* ── 1-on-1 / Group tab ── */}
        <div className="flex gap-2 px-5 pt-4 pb-0">
          {['tutors', 'groups'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${tab === t ? 'bg-[#2563EB] text-white' : 'bg-white text-gray-500 border border-gray-200'}`}>
              {t === 'tutors' ? '1-on-1 Tutors' : 'Group Classes'}
            </button>
          ))}
        </div>

        {tab === 'tutors' && (
          <>
            {/* ── Category filters ── */}
            <div className="px-5 pt-4">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => handleCategory(cat.id)}
                    className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                      category === cat.id
                        ? 'bg-[#2563EB] text-white border-transparent'
                        : 'bg-white text-gray-500 border-gray-200'
                    }`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Sub-filters (cascading) ── */}
            {Object.keys(activeSubs).length > 0 && (
              <div className="px-5 pt-3 space-y-2">
                {Object.entries(activeSubs).map(([filterKey, options]) => (
                  <div key={filterKey}>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-1.5">{filterKey}</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {options.map(opt => (
                        <button key={opt} onClick={() => handleSubFilter(filterKey, opt)}
                          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs border transition ${
                            subFilters[filterKey] === opt
                              ? 'bg-blue-50 text-blue-600 border-blue-300 font-semibold'
                              : 'bg-white text-gray-500 border-gray-200'
                          }`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── Active filter pills ── */}
            {Object.values(subFilters).some(Boolean) && (
              <div className="flex flex-wrap gap-2 px-5 pt-2">
                {Object.entries(subFilters).map(([key, val]) => val ? (
                  <span key={key} className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs px-2.5 py-1 rounded-full border border-blue-100">
                    {val}
                    <button onClick={() => handleSubFilter(key, val)} className="text-blue-400 hover:text-blue-600">×</button>
                  </span>
                ) : null)}
              </div>
            )}

            {/* ── Results count ── */}
            <div className="px-5 pt-3 pb-1">
              <p className="text-xs text-gray-400">{filtered.length} tutor{filtered.length !== 1 ? 's' : ''} found</p>
            </div>

            {/* ── Tutor cards ── */}
            <div className="px-5 pb-24 space-y-3">
              {loading ? (
                // Skeleton loader
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-500 font-medium">No tutors found</p>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                  <button onClick={() => { setCategory('all'); setSubFilters({}); setSearch('') }}
                    className="mt-4 text-blue-500 text-sm underline">Clear all filters</button>
                </div>
              ) : (
                filtered.map(tutor => (
                  <TutorCard
                    key={tutor.id}
                    tutor={tutor}
                    onClick={() => navigate(`/tutor/${tutor.id}`)}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* ── Group classes tab ── */}
        {tab === 'groups' && (
          <div className="px-5 pt-4 pb-24 space-y-3">
            {groups.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">📚</div>
                <p className="text-gray-500 font-medium">No group classes yet</p>
              </div>
            ) : (
              groups.map(cls => (
                <div key={cls.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{cls.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{cls.tutor?.name}</p>
                      <span className="inline-block bg-violet-50 text-violet-600 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2">
                        {cls.subject}
                      </span>
                    </div>
                    <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2.5 py-1 rounded-xl flex-shrink-0">
                      ₹{cls.price}
                    </span>
                  </div>
                  {cls.description && (
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{cls.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(cls.startTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {cls.enrollments?.length ?? 0}/{cls.maxSeats} seats
                      </div>
                    </div>
                    <button className="bg-[#2563EB] text-white text-xs font-semibold px-4 py-1.5 rounded-xl hover:bg-blue-700 transition">
                      Join class
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
