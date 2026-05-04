import { loadRazorpayScript } from '../utils/razorpay'
import { paymentService } from './paymentService'

const normalizeCheckoutKey = (orderData = {}) => String(orderData.keyId || '').trim()

const toPositiveAmount = (value) => {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

const toPositiveInteger = (value) => {
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export const startRazorpayCheckout = async ({ courseId, amount, description, user, onVerified }) => {
  const normalizedCourseId = toPositiveInteger(courseId)
  if (!normalizedCourseId) {
    throw new Error('Valid course id is required for checkout.')
  }

  const payableAmount = toPositiveAmount(amount)

  if (!payableAmount) {
    throw new Error('Invalid payment amount.')
  }

  const isLoaded = await loadRazorpayScript()
  if (!isLoaded || typeof window.Razorpay !== 'function') {
    throw new Error('Razorpay SDK failed to load. Please check your connection and try again.')
  }

  const orderData = await paymentService.createOrder(normalizedCourseId)
  if (!orderData?.success || !orderData?.order?.id) {
    throw new Error(orderData?.message || 'Could not create payment order.')
  }

  const key = normalizeCheckoutKey(orderData)
  if (!key) {
    throw new Error('Razorpay public key is missing from backend response.')
  }

  return new Promise((resolve, reject) => {
    const paymentObject = new window.Razorpay({
      key,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: 'BSERC LMS',
      description: description || 'Course Purchase',
      order_id: orderData.order.id,
      handler: async (response) => {
        try {
          const verifyResult = await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })

          if (!verifyResult?.success) {
            reject(new Error(verifyResult?.message || 'Payment verification failed.'))
            return
          }

          if (typeof onVerified === 'function') {
            await onVerified({ response, verifyResult, orderData })
          }

          resolve({ response, verifyResult, orderData })
        } catch (error) {
          reject(error)
        }
      },
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: {
        color: '#3B82F6',
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled.')),
      },
    })

    paymentObject.on('payment.failed', (event) => {
      const reason =
        event?.error?.description ||
        event?.error?.reason ||
        event?.error?.source ||
        'Payment failed.'

      reject(new Error(reason))
    })

    paymentObject.open()
  })
}