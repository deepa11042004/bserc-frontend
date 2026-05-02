import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { footerColumns } from '../data/homeData'
import { useAuthState, setStoredUser } from '../hooks/useAuth'
import { fetchUserProfile, updateUserProfile } from '../services/profileService'

const normalize = (value = '') => String(value ?? '').trim()

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  city: '',
  institution: '',
  bio: '',
}

const toFormState = (source = {}) => ({
  fullName: normalize(source.full_name || source.fullName || source.name || source.username),
  email: normalize(source.email),
  phone: normalize(source.phone || source.mobile || source.contact),
  city: normalize(source.city || source.location),
  institution: normalize(source.institution || source.college || source.organization),
  bio: normalize(source.bio || source.about),
})

const hasFormChanged = (current, initial) =>
  Object.keys(EMPTY_FORM).some((key) => normalize(current[key]) !== normalize(initial[key]))

const Profile = () => {
  const { user } = useAuthState()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [initialForm, setInitialForm] = useState(EMPTY_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isDirty = useMemo(() => hasFormChanged(form, initialForm), [form, initialForm])

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/profile' } })
      return
    }

    let ignore = false

    const loadProfile = async () => {
      setIsLoading(true)
      setError('')
      setSuccessMessage('')

      const response = await fetchUserProfile()
      if (ignore) return

      if (response.ok && response.user) {
        const nextForm = toFormState(response.user)
        setForm(nextForm)
        setInitialForm(nextForm)
      } else {
        const fallbackForm = toFormState(user)
        setForm(fallbackForm)
        setInitialForm(fallbackForm)
        if (response.message) setError(response.message)
      }

      setIsLoading(false)
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [user, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (error) setError('')
    if (successMessage) setSuccessMessage('')
  }

  const handleSave = async () => {
    if (!user || isSaving) return

    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const response = await updateUserProfile(form)

      const savedForm = toFormState(
        response.user || {
          ...user,
          full_name: form.fullName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          institution: form.institution,
          bio: form.bio,
        },
      )

      const updatedUser = {
        ...user,
        ...(response.user || {}),
        full_name: savedForm.fullName,
        fullName: savedForm.fullName,
        name: savedForm.fullName,
        username: savedForm.fullName || user?.username,
        email: savedForm.email,
        phone: savedForm.phone,
        city: savedForm.city,
        institution: savedForm.institution,
        location: savedForm.city,
        bio: savedForm.bio,
      }

      setStoredUser(updatedUser)
      setForm(savedForm)
      setInitialForm(savedForm)
      setSuccessMessage(response.message || 'Profile updated successfully.')
    } catch (err) {
      setError(err?.message || 'Could not update profile.')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#090b0f] text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-[#2a323e] bg-gradient-to-b from-[#12161d] via-[#10151b] to-[#0d1218] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.38)] sm:p-6">
          <header>
            <h1 className="text-2xl font-semibold tracking-tight text-white">My Profile</h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Update your identity, contact details, and profile information used across your dashboard.
            </p>
          </header>

          {error && (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {successMessage}
            </div>
          )}

          {isLoading && (
            <div className="mt-4 rounded-lg border border-[#2c3644] bg-[#151c25] px-3 py-2 text-sm text-slate-300">
              Loading profile from database...
            </div>
          )}

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-[#2c3644] bg-[#151c25] px-3.5 py-2.5 text-base font-medium text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Email</label>
              <input
                name="email"
                value={form.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-[#2a323f] bg-[#111821] px-3.5 py-2.5 text-base font-medium text-slate-200 outline-none"
              />
              <p className="text-xs text-slate-500">Email cannot be changed.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-[#2c3644] bg-[#151c25] px-3.5 py-2.5 text-base font-medium text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300">City</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-[#2c3644] bg-[#151c25] px-3.5 py-2.5 text-base font-medium text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium text-slate-300">Institution</label>
              <input
                name="institution"
                value={form.institution}
                onChange={handleChange}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-[#2c3644] bg-[#151c25] px-3.5 py-2.5 text-base font-medium text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="School, college, or organization"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <div className="flex items-end justify-between gap-3">
                <label className="text-sm font-medium text-slate-300">Bio</label>
                <span className="text-xs text-slate-400">{form.bio.length}/320</span>
              </div>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                maxLength={320}
                disabled={isLoading || isSaving}
                className="w-full rounded-lg border border-[#2c3644] bg-[#151c25] px-3.5 py-2.5 text-base font-medium leading-relaxed text-white outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Tell learners and instructors a bit about yourself"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving || !isDirty}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-[0_8px_20px_rgba(16,185,129,0.28)] transition hover:scale-[1.01] hover:bg-emerald-400"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => setForm(initialForm)}
              disabled={isLoading || isSaving || !isDirty}
              className="rounded-lg border border-[#374152] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-[#1b2330]"
            >
              Reset
            </button>
          </div>
        </section>
      </main>
      <Footer columns={footerColumns} />
    </div>
  )
}

export default Profile
