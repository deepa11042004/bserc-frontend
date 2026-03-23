import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const couponService = {
  async getCoupons() {
    await delay()
    return [...adminData.coupons]
  },
  async addCoupon(payload) {
    await delay()
    return { ...payload }
  },
  async updateCoupon(code, payload) {
    await delay()
    return { ...payload, code }
  },
  async deleteCoupon(code) {
    await delay()
    return { success: true, code }
  },
}
