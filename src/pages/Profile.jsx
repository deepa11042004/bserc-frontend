import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { footerColumns } from '../data/homeData'
import { useAuthState, setStoredUser } from '../hooks/useAuth'

const Profile = () => {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    username: '',
    email: '',
    dob: '',
    location: '',
    bio: '',
  })

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/profile' } })
      return
    }
    setForm({
      username: user.username || '',
      email: user.email || '',
      dob: user.dob || '',
      location: user.location || '',
      bio: user.bio || '',
    })
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    const updatedUser = { ...user, ...form }
    setStoredUser(updatedUser)
    window.dispatchEvent(new Event('auth-changed'))
    window.alert('Profile updated')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold">
            {(form.username || 'ME').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="text-sm text-slate-400">Update your personal details</p>
          </div>
        </header>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
          <div className="flex items-center justify-between pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">Profile Sections</p>
              <p className="text-sm text-slate-400">Keep your info tidy and up to date</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 border-b border-slate-800 pb-4 sm:col-span-2">
              <div className="text-sm font-semibold text-slate-200">Personal</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Name</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2 border-b border-slate-800 pb-4 sm:col-span-2">
              <div className="text-sm font-semibold text-slate-200">Contact</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Email</label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2 border-b border-slate-800 pb-4 sm:col-span-2">
              <div className="text-sm font-semibold text-slate-200">About</div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm text-slate-300">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.35)] transition hover:scale-[1.01] hover:bg-[#2563eb]"
          >
            Save changes
          </button>
          <button
            type="button"
            onClick={() => setForm({ username: '', email: '', dob: '', location: '', bio: '' })}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-800"
          >
            Reset
          </button>
        </div>
      </main>
      <Footer columns={footerColumns} />
    </div>
  )
}

export default Profile
