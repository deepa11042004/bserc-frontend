import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import ExploreMenu from './ExploreMenu'
import SearchBar from './SearchBar'
import AuthButtons from './AuthButtons'
import CartIcon from './CartIcon'
import { clearStoredUser, useAuthState } from '../hooks/useAuth'

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthState()
  const isStaff = user?.role && user.role !== 'user'

  useEffect(() => {
    if (isStaff && !location.pathname.startsWith('/admin')) {
      clearStoredUser()
      navigate('/admin/login', { replace: true })
    }
  }, [isStaff, location.pathname, navigate])

  const handleLogout = () => {
    clearStoredUser()
      const isAdmin = user?.role && user.role !== 'user'
      navigate(isAdmin ? '/admin/login' : '/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-[100] border-b border-indigo-500/20 bg-[#0c1324]/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Logo to={user ? '/dashboard' : '/'} />
        <ExploreMenu />
        <SearchBar />
        <CartIcon />
        <AuthButtons user={user} onLogout={handleLogout} />
      </div>
    </header>
  )
}

export default Navbar
