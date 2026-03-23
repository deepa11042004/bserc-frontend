import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const slugify = (text = '') =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

export const courseService = {
  async getCourses() {
    await delay()
    return [...adminData.courses]
  },
  async addCourse(payload) {
    await delay()
    const id = payload.id || `c-${Date.now()}`
    const slug = payload.slug || slugify(payload.title || id)
    return {
      ...payload,
      id,
      slug,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  async updateCourse(id, payload) {
    await delay()
    return { ...payload, id, updatedAt: new Date().toISOString() }
  },
  async deleteCourse(id) {
    await delay()
    return { success: true, id }
  },
}
