import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const AuthButtons = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (user) {
    const initials = user.username ? user.username.slice(0, 2).toUpperCase() : 'ME'
    return (
      <div className="flex items-center gap-3">
        <Link
          to="/my-learning"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#1f2937]"
        >
          My Learning
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2937] text-sm font-semibold text-slate-100 ring-1 ring-indigo-500/40 focus:outline-none"
          >
            {initials}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-indigo-500/30 bg-[#0f172a] shadow-xl shadow-black/50 backdrop-blur">
              <div className="px-3 py-2 text-xs text-slate-400">Signed in as</div>
              <div className="px-3 pb-2 text-sm font-semibold text-white">{user.username}</div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLogout?.()
                }}
                className="block w-full px-3 py-2 text-left text-sm text-slate-100 transition hover:bg-[#111827]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-2">
      <Link
        to="/login"
        className="rounded-lg border border-indigo-500/50 px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#111827]"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
      >
        Signup
      </Link>
    </div>
  )
}

export default AuthButtons
