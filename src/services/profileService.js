import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'
import { getToken } from '../utils/auth'

const normalizeText = (value = '') => String(value ?? '').trim()

export const fetchUserProfile = async () => {
  const token = getToken()

  if (!token) {
    return {
      ok: false,
      user: null,
      profile: null,
      message: 'Authentication token missing. Please login again.',
    }
  }

  try {
    const response = await fetch(buildApiUrl('/auth/profile'), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await parseJsonSafe(response)

    if (!response.ok) {
      return {
        ok: false,
        user: null,
        profile: null,
        message: payload?.message || 'Could not load profile from database.',
      }
    }

    return {
      ok: true,
      user: payload?.user || null,
      profile: payload?.profile || null,
      message: '',
    }
  } catch (error) {
    return {
      ok: false,
      user: null,
      profile: null,
      message: error?.message || 'Could not load profile from database.',
    }
  }
}

export const updateUserProfile = async (profilePayload = {}) => {
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token missing. Please login again.')
  }

  const response = await fetch(buildApiUrl('/auth/profile'), {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fullName: normalizeText(profilePayload.fullName),
      phone: normalizeText(profilePayload.phone),
      city: normalizeText(profilePayload.city),
      institution: normalizeText(profilePayload.institution),
      bio: normalizeText(profilePayload.bio),
    }),
  })

  const payload = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(payload?.message || 'Could not update profile.')
  }

  return {
    message: payload?.message || 'Profile updated successfully.',
    user: payload?.user || null,
    profile: payload?.profile || null,
  }
}
