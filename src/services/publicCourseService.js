import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'

const asArray = (value) => (Array.isArray(value) ? value : [])

const normalizeText = (value = '') => String(value ?? '').trim()

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
  const parsed = Number.parseInt(String(value), 10)
  return Number.isInteger(parsed) ? parsed : null
}

const toBoolean = (value, fallback = false) => {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1

  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(String(value || ''))
  } catch {
    return String(value || '')
  }
}

const slugify = (text = '') =>
  normalizeText(text)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

const formatCurrency = (amount, currency = 'INR') => {
  if (!Number.isFinite(amount) || amount <= 0) return 'Free'

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: normalizeText(currency) || 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  } catch {
    return `${normalizeText(currency) || 'INR'} ${amount}`
  }
}

const formatMonthYear = (value) => {
  if (!value) return 'Recently updated'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently updated'

  return date.toLocaleDateString('en-IN', {
    month: 'numeric',
    year: 'numeric',
  })
}

const formatStudents = (value) => {
  const count = toFiniteNumber(value, 0)
  return count.toLocaleString('en-IN')
}

const formatMinutesCompact = (minutesValue) => {
  const minutes = Math.max(0, Math.round(toFiniteNumber(minutesValue, 0)))
  if (minutes === 0) return '0m'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (!hours) return `${mins}m`
  return `${hours}h ${String(mins).padStart(2, '0')}m`
}

const formatSecondsToLessonLabel = (secondsValue) => {
  const seconds = Math.max(0, Math.round(toFiniteNumber(secondsValue, 0)))
  if (seconds <= 0) return '0m'

  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60

  if (!minutes) return `${remainder}s`
  if (!remainder) return `${minutes}m`
  return `${minutes}m ${String(remainder).padStart(2, '0')}s`
}

const buildHttpError = (message, status = 500) => {
  const error = new Error(message)
  error.status = status
  return error
}

const fetchJson = async (path, options = {}) => {
  const response = await fetch(buildApiUrl(path), {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.headers || {}),
    },
  })

  const payload = await parseJsonSafe(response)

  return {
    ok: response.ok,
    status: response.status,
    payload,
  }
}

const normalizeCourseSummary = (course = {}) => {
  const id = toNullableInt(course.id) ?? course.id
  const title = normalizeText(course.title) || 'Untitled course'
  const slug = normalizeText(course.slug) || slugify(title || `course-${Date.now()}`)

  const price = toNullableFiniteNumber(course.price) ?? 0
  const discountPrice = toNullableFiniteNumber(course.discount_price)
  const effectivePrice = discountPrice !== null ? discountPrice : price

  const level = normalizeText(course.level) || 'Beginner'
  const language = normalizeText(course.language) || 'English'
  const category = normalizeText(course.category) || 'Course'
  const updatedAt = course.updated_at || course.created_at || null
  const thumbnail = normalizeText(course.thumbnail)
  const enrolledStudents = formatStudents(course.enrolled_students)

  return {
    id,
    apiCourseId: toNullableInt(id),
    courseId: slug,
    slug,
    title,
    subtitle: normalizeText(course.subtitle),
    description: normalizeText(course.description || course.subtitle) || 'Course description coming soon.',
    instructorId: toNullableInt(course.instructor_id),
    instructor: toNullableInt(course.instructor_id)
      ? `Instructor #${toNullableInt(course.instructor_id)}`
      : 'Instructor',
    rating: toFiniteNumber(course.rating, 4.7).toFixed(1),
    ratingsCount: `${enrolledStudents} enrollments`,
    learners: `${enrolledStudents} learners`,
    students: enrolledStudents,
    image: thumbnail,
    thumbnail,
    thumbnailUrl: thumbnail,
    price: formatCurrency(effectivePrice, course.currency),
    rawPrice: price,
    rawDiscountPrice: discountPrice,
    currency: normalizeText(course.currency) || 'INR',
    isPaid: toBoolean(course.is_paid, price > 0),
    lifetimeAccess: toBoolean(course.lifetime_access, true),
    certificateAvailable: toBoolean(course.certificate_available, true),
    category,
    level,
    language,
    tags: [category, level, language].filter(Boolean),
    relatedTopics: [category, level, language].filter(Boolean),
    totalDurationMinutes: Math.max(0, Math.round(toFiniteNumber(course.total_duration_minutes, 0))),
    lastUpdated: formatMonthYear(updatedAt),
    updatedAt,
    createdAt: course.created_at || null,
  }
}

const normalizeLesson = (lesson = {}, fallbackThumbnail = '') => {
  const durationSeconds = Math.max(0, Math.round(toFiniteNumber(lesson.duration_seconds, 0)))
  const durationMinutes = Math.max(0, Math.round(durationSeconds / 60))

  return {
    id: toNullableInt(lesson.id) ?? lesson.id,
    title: normalizeText(lesson.title) || 'Untitled lesson',
    description: normalizeText(lesson.description),
    youtubeUrl: normalizeText(lesson.youtube_url),
    durationSeconds,
    durationMinutes,
    duration: formatSecondsToLessonLabel(durationSeconds),
    preview: toBoolean(lesson.is_free_preview, false),
    isFreePreview: toBoolean(lesson.is_free_preview, false),
    thumbnail: fallbackThumbnail,
    resources: [],
  }
}

const normalizeModule = (module = {}, fallbackThumbnail = '') => {
  const lessons = asArray(module.lessons).map((lesson) => normalizeLesson(lesson, fallbackThumbnail))

  return {
    id: toNullableInt(module.id) ?? module.id,
    title: normalizeText(module.title) || 'Untitled module',
    description: normalizeText(module.description),
    orderIndex: toFiniteNumber(module.order_index, 0),
    lessons,
  }
}

const buildWhatYouWillLearn = (modules = [], fallbackDescription = '') => {
  const lessonTitles = modules
    .flatMap((module) => module.lessons || [])
    .map((lesson) => normalizeText(lesson.title))
    .filter(Boolean)

  if (lessonTitles.length) {
    return lessonTitles.slice(0, 8)
  }

  if (fallbackDescription) {
    return [fallbackDescription]
  }

  return []
}

const buildCourseIncludes = ({ totalDurationMinutes, lessonCount, lifetimeAccess, certificateAvailable }) => {
  const includes = [
    `${formatMinutesCompact(totalDurationMinutes)} on-demand video`,
    `${lessonCount} lessons`,
    lifetimeAccess ? 'Full lifetime access' : null,
    certificateAvailable ? 'Certificate of completion' : null,
    'Access on mobile and TV',
  ].filter(Boolean)

  return includes
}

const normalizeCourseFull = (course = {}) => {
  const summary = normalizeCourseSummary(course)
  const modules = asArray(course.modules).map((module) => normalizeModule(module, summary.thumbnailUrl))

  const lessonCount = modules.reduce((sum, module) => sum + (module.lessons || []).length, 0)

  const minutesFromLessons = modules.reduce(
    (sum, module) =>
      sum + (module.lessons || []).reduce((lessonSum, lesson) => lessonSum + (lesson.durationMinutes || 0), 0),
    0,
  )

  const totalDurationMinutes = summary.totalDurationMinutes > 0 ? summary.totalDurationMinutes : minutesFromLessons

  const courseContent = modules.map((module) => ({
    title: module.title,
    lectures: (module.lessons || []).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      duration: lesson.duration,
      durationMinutes: lesson.durationMinutes,
      preview: lesson.preview,
      thumbnail: lesson.thumbnail,
      youtubeUrl: lesson.youtubeUrl,
    })),
  }))

  return {
    ...summary,
    price: summary.price,
    guarantee: summary.isPaid ? '30-day money-back guarantee' : 'Free course access',
    videoPreview: summary.thumbnailUrl,
    modules,
    courseContent,
    whatYouWillLearn: buildWhatYouWillLearn(modules, summary.description),
    includes: buildCourseIncludes({
      totalDurationMinutes,
      lessonCount,
      lifetimeAccess: summary.lifetimeAccess,
      certificateAvailable: summary.certificateAvailable,
    }),
    tags: [summary.category].filter(Boolean),
    relatedTopics: summary.relatedTopics,
    ratingsCount: summary.ratingsCount,
    learners: summary.learners,
    captions: [],
    totalDurationMinutes,
    lastUpdated: summary.lastUpdated,
    instructorProfile: {
      name: summary.instructor,
      title: summary.instructorId ? `Instructor #${summary.instructorId}` : 'Instructor',
      rating: summary.rating,
      reviews: summary.ratingsCount,
      students: `${summary.students} students`,
      courses: '—',
      bioShort: '',
      bioLong: '',
      profileUrl: '#',
    },
  }
}

const getPublishedCoursesRaw = async () => {
  const response = await fetchJson('/api/courses')

  if (!response.ok) {
    throw buildHttpError(response.payload?.message || 'Could not fetch published courses.', response.status)
  }

  return asArray(response.payload?.courses)
}

const getCourseFullById = async (courseId) => {
  const id = toNullableInt(courseId)
  if (!id) {
    throw buildHttpError('Valid course id is required.', 400)
  }

  const response = await fetchJson(`/api/courses/${id}/full`)
  if (!response.ok) {
    throw buildHttpError(response.payload?.message || 'Could not fetch course details.', response.status)
  }

  return normalizeCourseFull(response.payload?.course || {})
}

const getCourseFullBySlug = async (slugValue) => {
  const decodedSlug = safeDecodeURIComponent(slugValue)
  const slug = normalizeText(decodedSlug)

  if (!slug) {
    throw buildHttpError('Valid course slug is required.', 400)
  }

  const response = await fetchJson(`/api/courses/slug/${encodeURIComponent(slug)}/full`)
  if (response.ok) {
    return normalizeCourseFull(response.payload?.course || {})
  }

  if (response.status !== 404) {
    throw buildHttpError(response.payload?.message || 'Could not fetch course details.', response.status)
  }

  // Backward compatibility fallback when slug endpoint is not yet deployed.
  const courses = await getPublishedCoursesRaw()
  const matched = courses.find((course) => normalizeText(course.slug) === slug)

  if (!matched?.id) {
    throw buildHttpError('Course not found.', 404)
  }

  return getCourseFullById(matched.id)
}

const getCourseFullByIdentifier = async (identifier) => {
  const decoded = normalizeText(safeDecodeURIComponent(identifier))
  const numericId = toNullableInt(decoded)

  if (numericId) {
    try {
      return await getCourseFullById(numericId)
    } catch (error) {
      if (error?.status !== 404) {
        throw error
      }
    }
  }

  return getCourseFullBySlug(decoded)
}

const hydratePurchasedCourses = async (entries = []) => {
  const purchasedEntries = asArray(entries)
  if (!purchasedEntries.length) return []

  const catalog = await publicCourseService.getPublishedCourses()
  const bySlug = new Map(catalog.map((course) => [normalizeText(course.slug), course]))
  const byId = new Map(catalog.filter((course) => course.apiCourseId).map((course) => [course.apiCourseId, course]))

  return purchasedEntries.map((entry) => {
    const slug = normalizeText(entry?.slug || safeDecodeURIComponent(entry?.courseId || ''))
    const apiCourseId = toNullableInt(entry?.apiCourseId ?? entry?.id)

    const matched = (slug && bySlug.get(slug)) || (apiCourseId && byId.get(apiCourseId)) || null

    if (!matched) {
      return {
        courseId: normalizeText(entry?.courseId) || slug || (apiCourseId ? String(apiCourseId) : ''),
        slug: slug || null,
        apiCourseId,
        title: normalizeText(entry?.title) || 'Course unavailable',
        instructor: normalizeText(entry?.instructor) || 'Instructor',
        image: normalizeText(entry?.image || entry?.thumbnail),
        thumbnail: normalizeText(entry?.image || entry?.thumbnail),
        price: normalizeText(entry?.price) || 'Free',
      }
    }

    return {
      ...matched,
      courseId: matched.slug || (matched.apiCourseId ? String(matched.apiCourseId) : matched.courseId),
      image: matched.image || matched.thumbnail,
    }
  })
}

export const publicCourseService = {
  async getPublishedCourses() {
    const courses = await getPublishedCoursesRaw()
    return courses.map((course) => normalizeCourseSummary(course))
  },

  getCourseFullById,
  getCourseFullBySlug,
  getCourseFullByIdentifier,
  hydratePurchasedCourses,
}
