import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getToken } from '../utils/auth'
import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'

const ChangePassword = () => {
  const navigate = useNavigate()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    try {
      const token = getToken()
      const res = await fetch(buildApiUrl('/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      const data = await parseJsonSafe(res)

      if (!res.ok) {
        setMessage(data.message || 'Failed to change password')
        setIsSubmitting(false)
        return
      }

      setMessage('Password updated successfully')
      setOldPassword('')
      setNewPassword('')
      setIsSubmitting(false)
      navigate('/profile', { replace: true })
    } catch (err) {
      console.error(err)
      setMessage(err?.message === 'API URL is not configured' ? 'Server config error: missing API URL' : 'Server error')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B0F1A]/80 p-8 shadow-2xl">
          <h1 className="mb-4 text-2xl font-semibold">Change Password</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="oldPassword">Current Password</label>
              <input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#3B82F6]/60"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300" htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#3B82F6]/60"
                required
              />
            </div>

            {message && (
              <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">{message}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB] disabled:opacity-70"
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ChangePassword
