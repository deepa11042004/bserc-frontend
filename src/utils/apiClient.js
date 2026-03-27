const rawApiUrl = import.meta.env.VITE_API_URL?.trim()
export const API_URL = rawApiUrl && rawApiUrl.toLowerCase() !== 'undefined' && rawApiUrl.toLowerCase() !== 'null'
  ? rawApiUrl.replace(/\/?$/, '')
  : ''

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
  } catch (err) {
    return {}
  }
}
