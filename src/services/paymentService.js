import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'
import { getToken } from '../utils/auth'

const requestPayment = async (path, payload, fallbackMessage) => {
  const token = getToken()

  const response = await fetch(buildApiUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  })

  const parsed = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(parsed?.message || fallbackMessage)
  }

  return parsed
}

export const paymentService = {
  createOrder: async (courseId) =>
    requestPayment('/api/payment/create-order', { course_id: courseId }, 'Could not create payment order.'),

  verifyPayment: async (paymentData) =>
    requestPayment('/api/payment/verify-payment', paymentData, 'Payment verification failed.'),
}
