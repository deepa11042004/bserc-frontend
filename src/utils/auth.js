const USER_KEY = 'user'
const TOKEN_KEY = 'token'

const safeParse = (value) => {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export const getUser = () => {
  if (typeof window === 'undefined') return null
  return safeParse(localStorage.getItem(USER_KEY))
}

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export const hasRole = (allowed = []) => {
  const current = getUser()
  if (!current || !current.role) return false
  return allowed.includes(current.role)
}

export const setAuth = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event('auth-changed'))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new Event('auth-changed'))
}

export const logoutUser = (navigate) => {
  clearAuth()
  if (navigate) navigate('/', { replace: true })
}

export const logoutAdmin = (navigate) => {
  clearAuth()
  if (navigate) navigate('/', { replace: true })
}
