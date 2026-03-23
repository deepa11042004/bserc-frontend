import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const cartService = {
  async getCarts() {
    await delay()
    return [...adminData.carts]
  },
}
