const sanitizeUrl = (value) => {
  const cleaned = String(value || '').trim()
  if (!cleaned) return ''

  const lowered = cleaned.toLowerCase()
  if (lowered === 'undefined' || lowered === 'null') return ''

  return cleaned.replace(/\/?$/, '')
}

const remoteApiUrl = sanitizeUrl(import.meta.env.VITE_API_URL)
const localApiUrl = sanitizeUrl(import.meta.env.VITE_LOCAL_API_URL) || 'http://localhost:5000'
const isBrowserLocalhost =
  typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const API_URL = import.meta.env.DEV && isBrowserLocalhost ? localApiUrl : (remoteApiUrl || localApiUrl)

export const buildApiUrl = (path = '') => {
  if (!API_URL || !/^https?:\/\//.test(API_URL)) {
    throw new Error('API URL is not configured')
  }
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${API_URL}${suffix}`
}

export const parseJsonSafe = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}
