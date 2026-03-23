import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const instructorService = {
  async getInstructors() {
    await delay()
    return [...adminData.instructors]
  },
}
