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
          to="/dashboard"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
        >
          My Learning
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700 focus:outline-none"
          >
            {initials}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg">
              <div className="px-3 py-2 text-xs text-slate-500">Signed in as</div>
              <div className="px-3 pb-2 text-sm font-semibold text-slate-800">{user.username}</div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onLogout?.()
                }}
                className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
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
        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
      >
        Login
      </Link>
      <Link
        to="/signup"
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
      >
        Signup
      </Link>
    </div>
  )
}

export default AuthButtons
