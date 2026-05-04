const RAZORPAY_SCRIPT_ID = 'razorpay-checkout-script'

const isRazorpayReady = () =>
  typeof window !== 'undefined' && typeof window.Razorpay === 'function'

export const loadRazorpayScript = () => {
  if (isRazorpayReady()) {
    return Promise.resolve(true)
  }

  if (typeof document === 'undefined') {
    return Promise.resolve(false)
  }

  const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID)
  if (existingScript) {
    return new Promise((resolve) => {
      existingScript.addEventListener('load', () => resolve(true), { once: true })
      existingScript.addEventListener('error', () => resolve(false), { once: true })
    })
  }

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.id = RAZORPAY_SCRIPT_ID
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}
