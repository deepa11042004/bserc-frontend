import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const statsService = {
  async getStats() {
    await delay()
    return { ...adminData.stats }
  },
}
