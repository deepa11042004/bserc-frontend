import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff, FiLock, FiUser } from 'react-icons/fi'
import { AnimatePresence } from 'framer-motion'
import Navbar from '../components/Navbar'
import { getStoredUser } from '../hooks/useAuth'
import { setAuth } from '../utils/auth'
import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'

const Login = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (getStoredUser()) {
      navigate('/dashboard')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      })

      const data = await parseJsonSafe(res)

      if (!res.ok) {
        setError(data?.message || 'Login failed')
        setIsSubmitting(false)
        return
      }

      if (data?.user?.role !== 'user') {
        setError('Please use the admin login page.')
        setIsSubmitting(false)
        return
      }

      setAuth(data.token, data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error(err)
      setError(err?.message === 'API URL is not configured' ? 'Server config error: missing API URL' : 'Server error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#3B82F6]/30">
      <Navbar />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#3B82F6]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22D3EE]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Mission <span className="text-[#3B82F6]">Control</span>
            </h1>
            <p className="text-slate-400">Initialize your orbital sequence to continue</p>
          </div>

          <div className="relative group">
            {/* Form Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#3B82F6] to-[#22D3EE] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            
            <form
              onSubmit={handleSubmit}
              className="relative space-y-6 rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl p-8 shadow-2xl"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] ml-1">
                    Pilot ID
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#3B82F6]/50 focus:ring-4 focus:ring-[#3B82F6]/10"
                      placeholder="admin"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] ml-1">
                    Access Key
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-12 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#3B82F6]/50 focus:ring-4 focus:ring-[#3B82F6]/10"
                      placeholder="admin123"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-white"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg border border-red-400/20"
                  >
                    <span className="text-xs font-medium">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="relative w-full overflow-hidden group/btn rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : 'Login'}
                </div>
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-slate-400">
                  New User?{' '}
                  <Link to="/signup" className="font-bold text-[#3B82F6] hover:text-[#22D3EE] transition-colors">
                    Register Here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Login
