import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:8000/api/auth/login', form)
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden flex min-h-[560px]">

        {/* Left panel */}
        <div className="hidden md:flex w-5/12 bg-[#2563EB] flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-24 -translate-x-16" />

          <div className="flex items-center gap-2 relative z-10">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <span className="text-[#2563EB] font-bold text-sm">P</span>
            </div>
            <span className="text-white font-bold text-lg">PeerLearning</span>
          </div>

          <div className="relative z-10">
          <div className="bg-white/10 rounded-2xl overflow-hidden mb-6 h-48">
          <img 
          src="/login-illustration.jpg" 
          alt="Students learning" 
          className="w-full h-full object-cover opacity-90"
           />
           </div>
            <h2 className="text-white text-2xl font-bold leading-snug mb-3">
              Learn from peers.<br />Grow together.
            </h2>
            <p className="text-blue-200 text-sm leading-relaxed">
              Connect with expert students at your college. Book sessions, learn at your pace, and teach what you know.
            </p>
          </div>

          <div className="relative z-10 space-y-3">
            {[
              { stat: '500+', label: 'Active tutors' },
              { stat: '2,000+', label: 'Sessions booked' },
            ].map(item => (
              <div key={item.stat} className="flex items-center gap-3">
                <span className="text-white font-bold text-lg">{item.stat}</span>
                <span className="text-blue-200 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex-1 flex flex-col justify-center px-10 py-12">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-[#2563EB] font-bold text-lg">PeerLearning</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Sign in to your account</h1>
            <p className="text-gray-400 text-sm">Welcome back! Please enter your details.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-gray-600 text-sm font-medium mb-1.5 block">Email address</label>
              <input type="email" required
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition"
                placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-gray-600 text-sm font-medium">Password</label>
                <button type="button" className="text-[#2563EB] text-xs hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition pr-10"
                  placeholder="••••••••"
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="remember"
                className="w-4 h-4 rounded border-gray-300 text-[#2563EB] accent-[#2563EB]" />
              <label htmlFor="remember" className="text-sm text-gray-500">Keep me logged in</label>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-[#2563EB] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#2563EB] font-medium hover:underline">Sign up for free</Link>
          </p>

          <p className="text-gray-300 text-xs text-center mt-8">
            © 2024 PeerLearning. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}