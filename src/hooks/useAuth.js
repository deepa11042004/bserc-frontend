import { useEffect, useState } from 'react'

const AUTH_KEY = 'authUser'

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    return null
  }
}

export const setStoredUser = (user) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-changed'))
}

export const clearStoredUser = () => {
  localStorage.removeItem(AUTH_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

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
