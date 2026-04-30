const PURCHASE_KEY = 'purchasedCourses'

const slugify = (text = '') =>
  String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(String(value || ''))
  } catch {
    return String(value || '')
  }
}

const toNullableInt = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) ? parsed : null
}

const normalizeCourse = (course) => {
  if (!course) return null

  const title = course.title || 'Untitled course'
  const apiCourseId = toNullableInt(course.apiCourseId ?? course.id)
  const decodedCourseId = safeDecodeURIComponent(course.courseId || '')
  const slug =
    safeDecodeURIComponent(course.slug || '') ||
    (decodedCourseId && !Number.isInteger(Number(decodedCourseId)) ? decodedCourseId : slugify(title))

  const id = slug || (apiCourseId ? String(apiCourseId) : decodedCourseId || slugify(title))

  return {
    courseId: id,
    slug: slug || null,
    apiCourseId,
    title,
    instructor: course.instructor || 'Instructor',
    image: course.image || course.thumbnail || course.thumbnailUrl,
    thumbnail: course.thumbnail || course.thumbnailUrl || course.image,
    price: course.price || 'Free',
    purchasedAt: course.purchasedAt || new Date().toISOString(),
  }
}

const getPurchaseKey = (course) => {
  if (!course) return ''
  if (course.slug) return `slug:${course.slug}`
  if (course.apiCourseId) return `id:${course.apiCourseId}`
  return `course:${course.courseId}`
}

export const getPurchasedCourses = () => {
  try {
    const raw = localStorage.getItem(PURCHASE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.map(normalizeCourse).filter(Boolean) : []
  } catch (err) {
    return []
  }
}

export const addPurchasedCourses = (courses = []) => {
  const normalized = courses
    .map(normalizeCourse)
    .filter(Boolean)

  if (!normalized.length) return getPurchasedCourses()

  const existing = getPurchasedCourses()
  const existingIds = new Set(existing.map((c) => getPurchaseKey(c)))

  const merged = [...existing]
  normalized.forEach((course) => {
    const key = getPurchaseKey(course)
    if (!existingIds.has(key)) {
      merged.push(course)
      existingIds.add(key)
    }
  })

  localStorage.setItem(PURCHASE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new Event('purchased-courses-changed'))
  return merged
}

export const removePurchasedCourse = (courseId) => {
  if (!courseId) return getPurchasedCourses()

  const decodedId = safeDecodeURIComponent(courseId)
  const parsedId = toNullableInt(courseId)
  const existing = getPurchasedCourses()
  const filtered = existing.filter(
    (c) => c.courseId !== decodedId && c.slug !== decodedId && (!parsedId || c.apiCourseId !== parsedId),
  )

  localStorage.setItem(PURCHASE_KEY, JSON.stringify(filtered))
  window.dispatchEvent(new Event('purchased-courses-changed'))
  return filtered
}
