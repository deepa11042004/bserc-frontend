import { useEffect, useState } from 'react'
import { clearAuth, getToken, getUser, setAuth } from '../utils/auth'

export const getStoredUser = () => getUser()

export const setStoredUser = (user, token = getToken()) => setAuth(token, user)

export const clearStoredUser = () => clearAuth()

export const useAuthState = () => {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const handleChange = () => setUser(getStoredUser())

    window.addEventListener('storage', handleChange)
    window.addEventListener('auth-changed', handleChange)

    return () => {
      window.removeEventListener('storage', handleChange)
      window.removeEventListener('auth-changed', handleChange)
    }
  }, [])

  return { user, setUser }
}
