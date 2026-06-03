import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.post('http://localhost:8000/api/auth/register', form)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center">
            <span className="text-black font-bold text-sm">P</span>
          </div>
          <span className="text-white font-semibold text-lg">PeerLearning</span>
        </div>

        <h1 className="text-2xl font-semibold text-white mb-1">Create account</h1>
        <p className="text-white/40 text-sm mb-8">Join thousands of students and tutors</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">Full name</label>
            <input type="text" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              placeholder="Rishabh Yadav"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">Email</label>
            <input type="email" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">Password</label>
            <input type="password" required
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              placeholder="••••••••"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label className="text-white/60 text-xs mb-1.5 block">I am a</label>
            <div className="grid grid-cols-2 gap-3">
              {['STUDENT', 'TUTOR'].map(r => (
                <button type="button" key={r}
                  onClick={() => setForm({...form, role: r})}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition
                    ${form.role === r
                      ? 'bg-white text-black border-white'
                      : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20'}`}>
                  {r === 'STUDENT' ? 'Student' : 'Tutor'}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-white text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-white/90 transition disabled:opacity-50 mt-2">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-white/30 text-sm mt-6 text-center">
          Already have an account?{' '}
          <Link to="/" className="text-white/70 hover:text-white transition">Sign in</Link>
        </p>
      </div>
    </div>
  )
}