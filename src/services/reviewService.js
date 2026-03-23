import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const reviewService = {
  async getReviews() {
    await delay()
    return [...adminData.reviews]
  },
  async deleteReview(id) {
    await delay()
    return { success: true, id }
  },
}
