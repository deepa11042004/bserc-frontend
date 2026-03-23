const PURCHASE_KEY = 'purchasedCourses'

const slugify = (text = '') => encodeURIComponent(text.toLowerCase().trim().replace(/\s+/g, '-'))

const normalizeCourse = (course) => {
  if (!course) return null
  const id = course.courseId || course.id || slugify(course.title || '')
  return {
    courseId: id,
    title: course.title || 'Untitled course',
    instructor: course.instructor || 'Instructor',
    image: course.image,
    price: course.price,
  }
}

export const getPurchasedCourses = () => {
  try {
    const raw = localStorage.getItem(PURCHASE_KEY)
    return raw ? JSON.parse(raw) : []
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
  const existingIds = new Set(existing.map((c) => c.courseId))

  const merged = [...existing]
  normalized.forEach((course) => {
    if (!existingIds.has(course.courseId)) {
      merged.push(course)
      existingIds.add(course.courseId)
    }
  })

  localStorage.setItem(PURCHASE_KEY, JSON.stringify(merged))
  window.dispatchEvent(new Event('purchased-courses-changed'))
  return merged
}

export const removePurchasedCourse = (courseId) => {
  if (!courseId) return getPurchasedCourses()
  const existing = getPurchasedCourses()
  const filtered = existing.filter((c) => c.courseId !== courseId)
  localStorage.setItem(PURCHASE_KEY, JSON.stringify(filtered))
  window.dispatchEvent(new Event('purchased-courses-changed'))
  return filtered
}
