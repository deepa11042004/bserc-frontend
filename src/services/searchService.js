import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const searchService = {
  async getSearchConfig() {
    await delay()
    return { ...adminData.search }
  },
  async updateSearchConfig(payload) {
    await delay()
    return { ...payload }
  },
}
