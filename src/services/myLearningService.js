import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'
import { getToken } from '../utils/auth'

const normalizeText = (value = '') => String(value ?? '').trim()

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) ? parsed : null
}

const toCurrencyLabel = (price, discountPrice, currency = 'INR') => {
  const numericPrice = Number(discountPrice ?? price ?? 0)
  if (!Number.isFinite(numericPrice) || numericPrice <= 0) return 'Free'

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: normalizeText(currency) || 'INR',
      maximumFractionDigits: 0,
    }).format(numericPrice)
  } catch {
    return `${normalizeText(currency) || 'INR'} ${numericPrice}`
  }
}

const normalizeCourseForPurchase = (course = {}) => {
  const apiCourseId = toNullableInt(course.id)
  const slug = normalizeText(course.slug)

  return {
    courseId: slug || (apiCourseId ? String(apiCourseId) : ''),
    slug: slug || null,
    apiCourseId,
    title: normalizeText(course.title) || 'Untitled course',
    instructor: normalizeText(course.instructor) || 'Instructor',
    image: normalizeText(course.thumbnail),
    thumbnail: normalizeText(course.thumbnail),
    price: toCurrencyLabel(course.price, course.discount_price, course.currency),
    purchasedAt: course.enrollment?.enrolled_at || new Date().toISOString(),
  }
}

const getMyLearningCourses = async () => {
  const token = getToken()
  if (!token) return []

  const response = await fetch(buildApiUrl('/api/my-learning/courses'), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const parsed = await parseJsonSafe(response)

  if (!response.ok) {
    throw new Error(parsed?.message || 'Could not load your enrolled courses.')
  }

  return Array.isArray(parsed?.courses)
    ? parsed.courses.map(normalizeCourseForPurchase).filter((course) => course.courseId)
    : []
}

export const myLearningService = {
  getMyLearningCourses,
}
