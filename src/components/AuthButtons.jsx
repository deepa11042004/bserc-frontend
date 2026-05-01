import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const PROFILE_HOVER_CLOSE_DELAY = 280

const AuthButtons = ({ user, onLogout }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { items: cartItems } = useCart()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const hoverTimerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMouseEnter = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    setOpen(true)
  }

  const handleMouseLeave = () => {
    if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    hoverTimerRef.current = window.setTimeout(() => setOpen(false), PROFILE_HOVER_CLOSE_DELAY)
  }

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) window.clearTimeout(hoverTimerRef.current)
    }
  }, [])

  const handleLogout = () => {
    setOpen(false)
    onLogout?.()
  }

  if (user) {
    if (user.role && user.role !== 'user') return null
    const displayName = user.full_name || user.name || user.username || 'John Doe'
    const initials = displayName.slice(0, 2).toUpperCase()
    const displayEmail = user.email || 'john@example.com'
    const cartCount = cartItems?.length || 0

    return (
      <div className="flex items-center gap-3" onMouseLeave={handleMouseLeave}>
        <Link
          to="/my-learning"
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#1f2937]"
        >
          My Learning
        </Link>

        <div
          className="relative"
          ref={menuRef}
          onMouseEnter={handleMouseEnter}
        >
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1f2937] text-sm font-semibold text-slate-100 ring-1 ring-indigo-500/40 focus:outline-none"
          >
            {initials}
          </button>

          {open && (
            <div
              className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-indigo-500/30 bg-[#0b1224] shadow-2xl shadow-black/50 backdrop-blur transition duration-150"
              onMouseLeave={handleMouseLeave}
            >
              <div className="flex items-center gap-3 border-b border-slate-800/60 px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                  {initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{displayName}</div>
                  <div className="text-xs text-slate-400">{displayEmail}</div>
                </div>
              </div>

              <div className="py-1 text-sm text-slate-100">
                <div className="px-4 py-1 text-xs uppercase tracking-[0.12em] text-slate-500">Learning & Shopping</div>
                <Link
                  to="/my-learning"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/my-learning' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  My Learning
                </Link>
                <Link
                  to="/cart"
                  className={`flex items-center justify-between px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/cart' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span>My Cart</span>
                  {cartCount > 0 && (
                    <span className="rounded-full bg-indigo-500 px-2 text-xs font-semibold text-white">{cartCount}</span>
                  )}
                </Link>
                <Link
                  to="/wishlist"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/wishlist' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Wishlist
                </Link>

                <div className="my-2 h-px bg-slate-800" />
                <div className="px-4 py-1 text-xs uppercase tracking-[0.12em] text-slate-500">Account</div>
                <Link
                  to="/profile"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/profile' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/settings' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Account Settings
                </Link>
                <Link
                  to="/billing"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/billing' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Billing & Payments
                </Link>
                <Link
                  to="/purchase-history"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/purchase-history' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Purchase History
                </Link>

                <div className="my-2 h-px bg-slate-800" />
                <div className="px-4 py-1 text-xs uppercase tracking-[0.12em] text-slate-500">User Features</div>
                <Link
                  to="/notifications"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/notifications' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Notifications
                </Link>
                <Link
                  to="/messages"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/messages' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Messages
                </Link>

                <div className="my-2 h-px bg-slate-800" />
                <div className="px-4 py-1 text-xs uppercase tracking-[0.12em] text-slate-500">Support</div>
                <Link
                  to="/support"
                  className={`block px-4 py-2 transition hover:bg-[#111827] ${location.pathname === '/support' ? 'bg-[#111827]' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  Help Center
                </Link>

                <div className="my-2 h-px bg-slate-800" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left font-semibold text-red-300 transition hover:bg-[#111827]"
                >
                  Logout
                </button>
              </div>
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
