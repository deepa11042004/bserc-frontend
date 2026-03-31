import { adminData } from '../data/adminData'
import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'
import { getToken, getUser } from '../utils/auth'

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms))

const slugify = (text = '') =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const toFiniteNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const toNullableFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : null
}

const normalizeText = (value = '') => String(value ?? '').trim()

const normalizeNullableText = (value = '') => {
  const cleaned = normalizeText(value)
  return cleaned || null
}

const toBoolean = (value, fallback = false) => {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const buildCreateCoursePayload = (formData = {}) => {
  const authUser = getUser() || {}
  const priceSource = formData?.price?.amount ?? formData?.price
  const priceAmount = toFiniteNumber(priceSource, 0)

  const explicitDiscountPrice = formData?.discountPrice ?? formData?.discount_price
  const legacyDiscountPercent = formData?.price?.discount?.percent

  let discountPrice = toNullableFiniteNumber(explicitDiscountPrice)
  if (discountPrice === null && legacyDiscountPercent !== null && legacyDiscountPercent !== undefined && legacyDiscountPercent !== '') {
    const percent = toFiniteNumber(legacyDiscountPercent, 0)
    if (percent > 0) {
      discountPrice = Number((priceAmount - (priceAmount * percent) / 100).toFixed(2))
    }
  }

  const inferredIsPaid = priceAmount > 0
  const isPaid = toBoolean(formData?.isPaid ?? formData?.is_paid, inferredIsPaid)

  const status = (normalizeText(formData?.status) || 'published').toLowerCase()
  const visibility = (normalizeText(formData?.visibility) || 'public').toLowerCase()

  const instructorId = toNullableInt(formData?.instructorId ?? formData?.instructor_id ?? authUser?.id ?? null)

  return {
    title: normalizeText(formData.title),
    subtitle: normalizeNullableText(formData.subtitle),
    slug: normalizeText(formData.slug) || slugify(formData.title || `course-${Date.now()}`),
    description_short: normalizeNullableText(formData.descriptionShort ?? formData.description_short),
    description_long: normalizeNullableText(formData.descriptionLong ?? formData.description_long),
    category: normalizeNullableText(formData.category || formData.categories?.[0]),
    level: normalizeText(formData.level) || 'Beginner',
    language: normalizeText(formData.language) || 'English',
    price: isPaid ? priceAmount : 0,
    discount_price: isPaid ? discountPrice : null,
    is_paid: isPaid,
    thumbnail_small: normalizeNullableText(formData.thumbnailSmall ?? formData.thumbnail_small ?? formData.thumbnail),
    thumbnail_medium: normalizeNullableText(formData.thumbnailMedium ?? formData.thumbnail_medium ?? formData.thumbnail),
    thumbnail_large: normalizeNullableText(formData.thumbnailLarge ?? formData.thumbnail_large ?? formData.thumbnail),
    preview_video_url: normalizeNullableText(formData.previewVideoUrl ?? formData.preview_video_url ?? formData.previewVideo),
    instructor_id: instructorId,
    status,
    visibility,
    lifetime_access: toBoolean(formData.lifetimeAccess ?? formData.lifetime_access, true),
    certificate_available: toBoolean(formData.certificateAvailable ?? formData.certificate_available, true),
    currency: normalizeText(formData.currency ?? formData?.price?.currency) || 'INR',
  }
}

export const courseService = {
  async getCourses() {
    await delay()
    return [...adminData.courses]
  },
  async addCourse(payload) {
    const token = getToken()
    if (!token) {
      throw new Error('Authentication token missing. Please login again.')
    }

    const requestPayload = buildCreateCoursePayload(payload)

    const res = await fetch(buildApiUrl('/api/courses'), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })

    const data = await parseJsonSafe(res)
    if (!res.ok) {
      throw new Error(data?.message || 'Failed to create course')
    }

    console.log('Course created successfully', data)

    const id = data?.course?.id || payload.id || `c-${Date.now()}`
    const slug = data?.course?.slug || requestPayload.slug
    const priceAmount = toFiniteNumber(requestPayload.price, 0)
    const discountPercent =
      requestPayload.discount_price !== null && priceAmount > 0
        ? Math.max(0, Number((((priceAmount - requestPayload.discount_price) / priceAmount) * 100).toFixed(2)))
        : 0

    return {
      ...payload,
      id,
      slug,
      title: payload.title || requestPayload.title,
      subtitle: payload.subtitle || requestPayload.subtitle || '',
      descriptionShort: payload.descriptionShort || requestPayload.description_short || '',
      descriptionLong: payload.descriptionLong || requestPayload.description_long || '',
      language: requestPayload.language,
      category: requestPayload.category,
      categories: payload.categories?.length ? payload.categories : requestPayload.category ? [requestPayload.category] : [],
      thumbnailSmall: requestPayload.thumbnail_small,
      thumbnailMedium: requestPayload.thumbnail_medium,
      thumbnailLarge: requestPayload.thumbnail_large,
      thumbnail: requestPayload.thumbnail_medium || requestPayload.thumbnail_large || requestPayload.thumbnail_small || '',
      previewVideoUrl: requestPayload.preview_video_url,
      previewVideo: requestPayload.preview_video_url,
      price: {
        amount: priceAmount,
        currency: requestPayload.currency || 'INR',
        discount: {
          code: payload?.price?.discount?.code || '',
          percent: discountPercent,
        },
      },
      discountPrice: requestPayload.discount_price,
      isPaid: Boolean(requestPayload.is_paid),
      status: requestPayload.status,
      visibility: requestPayload.visibility,
      instructorId: requestPayload.instructor_id,
      lifetimeAccess: Boolean(requestPayload.lifetime_access),
      certificateAvailable: Boolean(requestPayload.certificate_available),
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
