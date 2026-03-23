import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiUser, FiLock, FiChevronRight } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import { getStoredUser } from '../hooks/useAuth'

const Signup = () => {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (getStoredUser()) {
      navigate('/')
    }
  }, [navigate])

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('Signal Transmitted. Initializing profile...')
    
    setTimeout(() => {
      navigate('/login')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-[#3B82F6]/30">
      <Navbar />

      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] bg-[#3B82F6]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-[#22D3EE]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-3">
              Join the <span className="text-[#3B82F6]">Fleet</span>
            </h1>
            <p className="text-slate-400">Establish your presence across the orbital network</p>
          </div>

          <div className="relative group">
            {/* Form Glow Effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#22D3EE] to-[#3B82F6] rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

            <form 
              onSubmit={handleSubmit} 
              className="relative space-y-6 rounded-2xl border border-white/10 bg-[#0B0F1A]/80 backdrop-blur-xl p-8 shadow-2xl"
            >
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] ml-1">
                    Username
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#3B82F6]/50 focus:ring-4 focus:ring-[#3B82F6]/10"
                      placeholder="SpaceExplorer_01"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#3B82F6]/50 focus:ring-4 focus:ring-[#3B82F6]/10"
                      placeholder="explorer@orbit.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#3B82F6] ml-1">
                    Security Key
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#3B82F6]/50 focus:ring-4 focus:ring-[#3B82F6]/10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {message && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center gap-2 text-[#22D3EE] bg-[#22D3EE]/10 p-3 rounded-lg border border-[#22D3EE]/20"
                  >
                    <span className="text-xs font-medium">{message}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isSubmitting}
                className="group/btn relative w-full overflow-hidden rounded-xl bg-[#3B82F6] py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] transition-all active:scale-95 disabled:opacity-70"
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    <>
                      Register Profile
                      <FiChevronRight className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              <div className="pt-2 text-center">
                <p className="text-sm text-slate-400">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-[#3B82F6] hover:text-[#22D3EE] transition-colors">
                    Login
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

export default Signup
