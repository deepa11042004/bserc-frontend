import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const userService = {
  async getUsers() {
    await delay()
    return [...adminData.users]
  },
  async searchUsers(term) {
    await delay()
    const q = term.toLowerCase()
    return adminData.users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  },
  async updateUserStatus(id, status) {
    await delay()
    return { id, status }
  },
}
