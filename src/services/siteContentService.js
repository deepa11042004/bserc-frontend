import { adminData } from '../data/adminData'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

export const siteContentService = {
  async getSiteContent() {
    await delay()
    return { ...adminData.siteContent }
  },
  async updateHomepage(payload) {
    await delay()
    return { ...adminData.siteContent.homepage, ...payload }
  },
  async updateFooter(payload) {
    await delay()
    return { ...adminData.siteContent.footer, ...payload }
  },
  async updateNavbar(payload) {
    await delay()
    return { ...adminData.siteContent.navbar, ...payload }
  },
  async updateSpecials(payload) {
    await delay()
    return [...payload]
  },
}
