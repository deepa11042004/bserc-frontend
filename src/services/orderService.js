import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const orderService = {
  async getOrders() {
    await delay()
    return [...adminData.orders]
  },
}
