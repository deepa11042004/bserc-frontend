import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { setAuth } from '../utils/auth'
import { useAuthState } from '../hooks/useAuth'

const API_URL = import.meta.env.VITE_API_URL

const AdminLogin = () => {
  const navigate = useNavigate()
  const { user } = useAuthState()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (user && ['admin', 'instructor', 'super_admin'].includes(user.role)) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.message || 'Login failed')
        setIsSubmitting(false)
        return
      }

      const role = data?.user?.role
      const allowed = ['admin', 'instructor', 'super_admin']

      if (!allowed.includes(role)) {
        setError('This account is not allowed in admin panel.')
        setIsSubmitting(false)
        return
      }

      setAuth(data.token, data.user)
      if (role === 'super_admin') {
        navigate('/admin/super-admin-dashboard', { replace: true })
      } else if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true })
      } else if (role === 'instructor') {
        navigate('/admin/instructor-dashboard', { replace: true })
      }
    } catch (err) {
      console.error(err)
      setError('Server error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1220] px-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl shadow-black/50">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="text-sm text-slate-400">Enter admin credentials to continue.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm text-slate-300" htmlFor="email">Email or Username</label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-blue-500"
              placeholder="admin@example.com"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-slate-300" htmlFor="password">Password</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 pr-11 text-sm outline-none focus:border-blue-500"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-white"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>

          {error && <div className="rounded-lg border border-red-700 bg-red-900/30 px-3 py-2 text-sm text-red-200">{error}</div>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-500 disabled:opacity-70"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminLogin
