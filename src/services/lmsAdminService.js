import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'
import { getToken, getUser } from '../utils/auth'

const STORAGE_KEY = 'bserc-lms-super-admin-state-v1'

const clone = (value) => JSON.parse(JSON.stringify(value))

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : null
}

const asArray = (payload, keys = ['data', 'results', 'workshops', 'participants']) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key]
  }

  return []
}

const reorder = (list, sourceIndex, targetIndex) => {
  if (sourceIndex === targetIndex) return [...list]
  if (sourceIndex < 0 || targetIndex < 0) return [...list]
  if (sourceIndex >= list.length || targetIndex >= list.length) return [...list]

  const next = [...list]
  const [moved] = next.splice(sourceIndex, 1)
  next.splice(targetIndex, 0, moved)
  return next
}

const makeId = (prefix = 'id') => `${prefix}-${Math.random().toString(36).slice(2, 9)}-${Date.now().toString(36)}`

const COURSE_WORKSHOP_PREFIX = 'course-'
const normalizeText = (value = '') => String(value ?? '').trim()

const normalizeNullableText = (value = '') => {
  const cleaned = normalizeText(value)
  return cleaned || null
}

const toNullableFiniteNumber = (value) => {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const toBoolean = (value, fallback = false) => {
  if (value === null || value === undefined || value === '') return fallback
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value === 1
  const normalized = String(value).trim().toLowerCase()
  return normalized === '1' || normalized === 'true' || normalized === 'yes'
}

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const toCourseWorkshopId = (courseId) => `${COURSE_WORKSHOP_PREFIX}${courseId}`

const buildCreateCoursePayload = (payload = {}) => {
  const authUser = getUser() || {}
  const title = normalizeText(payload.title)
  const slug = normalizeText(payload.slug) || slugify(title || `course-${Date.now()}`)
  const rawPrice = toNullableFiniteNumber(payload.price)
  const discountPrice = toNullableFiniteNumber(payload.discountPrice ?? payload.discount_price)
  const inferredIsPaidFromAmount =
    (rawPrice !== null && rawPrice > 0) || (discountPrice !== null && discountPrice > 0)
  const requestedIsPaid = toBoolean(payload.isPaid ?? payload.is_paid, inferredIsPaidFromAmount)
  const isPaid = requestedIsPaid || inferredIsPaidFromAmount
  const price = isPaid ? (rawPrice ?? 0) : 0

  return {
    title,
    slug,
    subtitle: normalizeNullableText(payload.subtitle),
    description: normalizeNullableText(payload.description),
    category: normalizeNullableText(payload.category),
    level: normalizeText(payload.level),
    language: normalizeText(payload.language) || 'English',
    price,
    discount_price: discountPrice,
    currency: normalizeText(payload.currency) || 'INR',
    is_paid: isPaid,
    lifetime_access: toBoolean(payload.lifetimeAccess ?? payload.lifetime_access, true),
    certificate_available: toBoolean(payload.certificateAvailable ?? payload.certificate_available, true),
    instructor_id: toInt(payload.instructorId ?? authUser.id ?? authUser.userId),
    total_duration_minutes: toInt(payload.totalDurationMinutes) || 0,
  }
}

const buildCreateCourseFormData = (payload = {}, thumbnailFile = null) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) return
    formData.append(key, typeof value === 'boolean' ? String(value) : String(value))
  })

  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile)
  }

  return formData
}

const SEED_STATE = {
  workshops: [],
  accessEntries: [],
  uploadJobs: [],
  settings: {
    profile: {
      displayName: 'Super Admin',
      email: 'superadmin@bserc.in',
      designation: 'Platform Lead',
      notificationsEmail: 'superadmin@bserc.in',
      bio: '',
      description: '',
    },
    storage: {
      provider: 'Blob Storage',
      maxUploadMb: 2048,
      allowedFormats: 'mp4,mov,webm',
      retentionDays: 365,
    },
    permissions: {
      allowManualAccessGrant: true,
      enableMultiAdminPreview: false,
      writeAuditLog: true,
    },
  },
  activityLogs: [],
}

const BASE_STATE = {
  ...SEED_STATE,
}

const ensureArray = (value) => (Array.isArray(value) ? value : [])

const hydrateState = (rawState) => {
  const state = rawState && typeof rawState === 'object' ? rawState : {}
  const merged = {
    ...clone(BASE_STATE),
    ...state,
    workshops: ensureArray(state.workshops).map((workshop) => ({
      ...workshop,
      modules: ensureArray(workshop.modules).map((module) => ({
        ...module,
        videos: ensureArray(module.videos),
      })),
    })),
    accessEntries: ensureArray(state.accessEntries),
    uploadJobs: ensureArray(state.uploadJobs),
    activityLogs: ensureArray(state.activityLogs),
    settings: {
      ...SEED_STATE.settings,
      ...(state.settings || {}),
      profile: {
        ...SEED_STATE.settings.profile,
        ...((state.settings || {}).profile || {}),
      },
      storage: {
        ...SEED_STATE.settings.storage,
        ...((state.settings || {}).storage || {}),
      },
      permissions: {
        ...SEED_STATE.settings.permissions,
        ...((state.settings || {}).permissions || {}),
      },
    },
  }

  return merged
}

let memoryState = clone(BASE_STATE)

const readState = () => {
  if (typeof window === 'undefined') return hydrateState(memoryState)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(BASE_STATE))
      memoryState = clone(BASE_STATE)
      return hydrateState(memoryState)
    }

    const parsed = JSON.parse(raw)
    const hydrated = hydrateState(parsed)
    memoryState = clone(hydrated)
    return hydrated
  } catch {
    memoryState = clone(BASE_STATE)
    return hydrateState(memoryState)
  }
}

const writeState = (nextState) => {
  const hydrated = hydrateState(nextState)
  memoryState = clone(hydrated)

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hydrated))
  }

  return hydrated
}

const withActivity = (state, activity) => {
  if (!activity) return state

  const log = {
    id: makeId('log'),
    actor: activity.actor || 'Super Admin',
    action: activity.action,
    target: activity.target,
    at: new Date().toISOString(),
  }

  return {
    ...state,
    activityLogs: [log, ...state.activityLogs].slice(0, 80),
  }
}

const patchWorkshop = (state, workshopId, updater) => {
  const workshops = state.workshops.map((workshop) => {
    if (workshop.id !== workshopId) return workshop
    return updater(workshop)
  })

  return {
    ...state,
    workshops,
  }
}

const getModuleIndex = (workshop, moduleId) => workshop.modules.findIndex((module) => module.id === moduleId)

const getDashboardMetrics = (state) => {
  const totalWorkshops = state.workshops.length
  const totalVideos = state.workshops.reduce(
    (sum, workshop) => sum + workshop.modules.reduce((moduleSum, module) => moduleSum + module.videos.length, 0),
    0,
  )

  const grantedStudents = new Set(
    state.accessEntries
      .filter((entry) => entry.status === 'granted')
      .map((entry) => entry.email || entry.userId)
      .filter(Boolean),
  )

  const recentUploads = state.uploadJobs
    .filter((job) => job.status === 'completed')
    .sort((a, b) => new Date(b.completedAt || b.startedAt || 0) - new Date(a.completedAt || a.startedAt || 0))

  return {
    totalWorkshops,
    totalVideos,
    totalStudents: grantedStudents.size,
    recentUploads: recentUploads.length,
  }
}

const getAnalytics = (state) => {
  const workshopViews = state.workshops.map((workshop) => {
    const videos = workshop.modules.flatMap((module) => module.videos)
    const totalViews = videos.reduce((sum, video) => sum + Number(video.views || 0), 0)
    const totalCompletions = videos.reduce((sum, video) => sum + Number(video.completions || 0), 0)

    return {
      workshopId: workshop.id,
      title: workshop.title,
      views: totalViews,
      videos: videos.length,
      completionRate: totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0,
    }
  })

  const topVideos = state.workshops
    .flatMap((workshop) =>
      workshop.modules.flatMap((module) =>
        module.videos.map((video) => ({
          id: video.id,
          title: video.title,
          workshopTitle: workshop.title,
          views: Number(video.views || 0),
          completions: Number(video.completions || 0),
        })),
      ),
    )
    .sort((a, b) => b.views - a.views)
    .slice(0, 8)

  const totalViews = topVideos.reduce((sum, video) => sum + video.views, 0)
  const totalCompletions = topVideos.reduce((sum, video) => sum + video.completions, 0)

  return {
    workshopViews,
    topVideos,
    engagement: {
      totalViews,
      totalCompletions,
      completionRatio: totalViews > 0 ? Math.round((totalCompletions / totalViews) * 100) : 0,
    },
  }
}

const tryFetchJson = async (path, init = undefined) => {
  try {
    const url = buildApiUrl(path)
    const response = await fetch(url, init)
    const payload = await parseJsonSafe(response)

    if (!response.ok) {
      return { ok: false, payload, status: response.status }
    }

    return { ok: true, payload, status: response.status }
  } catch (error) {
    return { ok: false, payload: null, status: 0, error }
  }
}

const toApiId = (value) => {
  const parsed = toInt(value)
  if (Number.isInteger(parsed) && parsed > 0) return parsed

  const text = normalizeText(value)
  const match = text.match(/(\d+)/)
  if (!match) return null

  const extracted = toInt(match[1])
  return Number.isInteger(extracted) && extracted > 0 ? extracted : null
}

const toApiCourseId = (value) => {
  if (value && typeof value === 'object') {
    const byApiField = toApiId(value.apiCourseId)
    if (byApiField) return byApiField

    return toApiId(value.id)
  }

  return toApiId(value)
}

const getBuilderAuthToken = () => {
  const token = getToken()
  if (!token) {
    throw new Error('Authentication token missing. Please login again.')
  }

  return token
}

const getApiErrorMessage = (response, fallback) => {
  const statusLabel = response?.status ? ` (HTTP ${response.status})` : ''
  return `${response?.payload?.message || fallback}${statusLabel}`
}

const normalizeBuilderLesson = (lesson = {}) => ({
  id: toApiId(lesson.id) || lesson.id,
  moduleId: toApiId(lesson.module_id || lesson.moduleId),
  title: normalizeText(lesson.title),
  videoUrl: normalizeText(lesson.youtube_url || lesson.youtubeUrl || lesson.videoUrl),
  description: normalizeText(lesson.description),
  isPreview: Boolean(lesson.is_free_preview ?? lesson.isPreview ?? false),
  durationSeconds: Number.isFinite(Number(lesson.duration_seconds ?? lesson.durationSeconds))
    ? Number(lesson.duration_seconds ?? lesson.durationSeconds)
    : 0,
  orderIndex: Number.isFinite(Number(lesson.order_index ?? lesson.orderIndex))
    ? Number(lesson.order_index ?? lesson.orderIndex)
    : 0,
})

const normalizeBuilderModule = (module = {}) => ({
  id: toApiId(module.id) || module.id,
  courseId: toApiId(module.course_id || module.courseId),
  title: normalizeText(module.title),
  description: normalizeText(module.description),
  orderIndex: Number.isFinite(Number(module.order_index ?? module.orderIndex))
    ? Number(module.order_index ?? module.orderIndex)
    : 0,
  lessons: ensureArray(module.lessons).map(normalizeBuilderLesson),
})

const getCourseBuilderModules = async (courseIdInput) => {
  const courseId = toApiCourseId(courseIdInput)
  if (!courseId) {
    throw new Error('Valid course id is required to load modules.')
  }

  const response = await tryFetchJson(`/api/courses/${courseId}/modules`)
  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not load modules for this course.'))
  }

  return asArray(response.payload, ['modules', 'data', 'results']).map(normalizeBuilderModule)
}

const createCourseBuilderModule = async (courseIdInput, payload = {}) => {
  const courseId = toApiCourseId(courseIdInput)
  if (!courseId) {
    throw new Error('Valid course id is required to create a module.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/courses/${courseId}/modules`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: normalizeText(payload.title),
      description: normalizeNullableText(payload.description),
    }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not create module.'))
  }

  return normalizeBuilderModule(response.payload?.module || {})
}

const updateCourseBuilderModule = async (moduleIdInput, payload = {}) => {
  const moduleId = toApiId(moduleIdInput)
  if (!moduleId) {
    throw new Error('Valid module id is required.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/modules/${moduleId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title !== undefined ? normalizeText(payload.title) : undefined,
      description: payload.description !== undefined ? normalizeNullableText(payload.description) : undefined,
    }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not update module.'))
  }

  return normalizeBuilderModule(response.payload?.module || {})
}

const deleteCourseBuilderModule = async (moduleIdInput) => {
  const moduleId = toApiId(moduleIdInput)
  if (!moduleId) {
    throw new Error('Valid module id is required.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/modules/${moduleId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not delete module.'))
  }

  return { success: true }
}

const createCourseBuilderLesson = async (moduleIdInput, payload = {}) => {
  const moduleId = toApiId(moduleIdInput)
  if (!moduleId) {
    throw new Error('Valid module id is required to create a lesson.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/modules/${moduleId}/lessons`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: normalizeText(payload.title),
      description: normalizeNullableText(payload.description),
      youtube_url: normalizeText(payload.videoUrl || payload.youtube_url || payload.youtubeUrl),
      is_free_preview: Boolean(payload.isPreview ?? payload.is_free_preview),
    }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not create lesson.'))
  }

  return normalizeBuilderLesson(response.payload?.lesson || {})
}

const updateCourseBuilderLesson = async (lessonIdInput, payload = {}) => {
  const lessonId = toApiId(lessonIdInput)
  if (!lessonId) {
    throw new Error('Valid lesson id is required.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/lessons/${lessonId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: payload.title !== undefined ? normalizeText(payload.title) : undefined,
      description: payload.description !== undefined ? normalizeNullableText(payload.description) : undefined,
      module_id: payload.module_id !== undefined ? toApiId(payload.module_id) : undefined,
      order_index:
        payload.order_index !== undefined
          ? toApiId(payload.order_index)
          : payload.orderIndex !== undefined
          ? toApiId(payload.orderIndex)
          : undefined,
      duration_seconds:
        payload.duration_seconds !== undefined
          ? toApiId(payload.duration_seconds)
          : payload.durationSeconds !== undefined
          ? toApiId(payload.durationSeconds)
          : undefined,
      youtube_url:
        payload.videoUrl !== undefined || payload.youtube_url !== undefined || payload.youtubeUrl !== undefined
          ? normalizeText(payload.videoUrl || payload.youtube_url || payload.youtubeUrl)
          : undefined,
      is_free_preview:
        payload.isPreview !== undefined || payload.is_free_preview !== undefined
          ? Boolean(payload.isPreview ?? payload.is_free_preview)
          : undefined,
    }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not update lesson.'))
  }

  return normalizeBuilderLesson(response.payload?.lesson || {})
}

const deleteCourseBuilderLesson = async (lessonIdInput) => {
  const lessonId = toApiId(lessonIdInput)
  if (!lessonId) {
    throw new Error('Valid lesson id is required.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not delete lesson.'))
  }

  return { success: true }
}

const reorderCourseBuilderModules = async (courseIdInput, moduleIds = []) => {
  const courseId = toApiCourseId(courseIdInput)
  if (!courseId) {
    throw new Error('Valid course id is required to reorder modules.')
  }

  const normalizedIds = ensureArray(moduleIds).map(toApiId).filter(Boolean)
  if (!normalizedIds.length) {
    return []
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/courses/${courseId}/modules/reorder`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ moduleIds: normalizedIds }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not reorder modules.'))
  }

  return asArray(response.payload, ['modules', 'data', 'results']).map(normalizeBuilderModule)
}

const reorderCourseBuilderLessons = async (moduleIdInput, lessonIds = []) => {
  const moduleId = toApiId(moduleIdInput)
  if (!moduleId) {
    throw new Error('Valid module id is required to reorder lessons.')
  }

  const normalizedIds = ensureArray(lessonIds).map(toApiId).filter(Boolean)
  if (!normalizedIds.length) {
    return []
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/modules/${moduleId}/lessons/reorder`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lessonIds: normalizedIds }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not reorder lessons.'))
  }

  return asArray(response.payload, ['lessons', 'data', 'results']).map(normalizeBuilderLesson)
}

const normalizeLiveWorkshop = (workshop) => {
  const id = toInt(workshop.id)

  return {
    id: Number.isInteger(id) ? id : workshop.id,
    title: workshop.title || workshop.workshop_title || `Course ${workshop.id || '-'}`,
    workshop_date: workshop.workshop_date || null,
    mode: workshop.mode || null,
    total_enrollments: Number.isFinite(Number(workshop.total_enrollments)) ? Number(workshop.total_enrollments) : 0,
  }
}

const normalizeParticipant = (participant) => ({
  id: participant.id || makeId('participant'),
  userId: participant.user_id || participant.userId || participant.id || null,
  fullName: participant.full_name || participant.fullName || 'Unknown User',
  email: participant.email || participant.alternative_email || 'unknown@example.com',
  paymentStatus: participant.payment_status || null,
})

const normalizeCourseWorkshop = (course, previousWorkshop = null) => {
  const courseId = toInt(course?.id)
  const title = normalizeText(course?.title || course?.course_title)

  if (!courseId || !title) return null

  const now = new Date().toISOString()
  const isPublished = toBoolean(
    course?.is_published ?? course?.isPublished,
    previousWorkshop?.isPublished ?? previousWorkshop?.status === 'published',
  )

  return {
    id: toCourseWorkshopId(courseId),
    apiCourseId: courseId,
    slug: normalizeText(course?.slug) || previousWorkshop?.slug || '',
    title,
    subtitle: normalizeText(previousWorkshop?.subtitle || course?.subtitle || ''),
    description: normalizeText(previousWorkshop?.description || course?.description || ''),
    status: isPublished ? 'published' : 'draft',
    isPublished,
    category: normalizeText(course?.category || previousWorkshop?.category || 'Course'),
    level: normalizeText(course?.level || previousWorkshop?.level || 'Beginner'),
    language: normalizeText(course?.language || previousWorkshop?.language || 'English'),
    price: Number.isFinite(Number(course?.price)) ? Number(course.price) : Number(previousWorkshop?.price || 0),
    discountPrice: Number.isFinite(Number(course?.discount_price ?? course?.discountPrice))
      ? Number(course.discount_price ?? course.discountPrice)
      : Number.isFinite(Number(previousWorkshop?.discountPrice))
      ? Number(previousWorkshop.discountPrice)
      : null,
    currency: normalizeText(course?.currency || previousWorkshop?.currency || 'INR'),
    isPaid: Boolean(course?.is_paid ?? course?.isPaid ?? Number(course?.price) > 0),
    lifetimeAccess: Boolean(course?.lifetime_access ?? course?.lifetimeAccess ?? true),
    certificateAvailable: Boolean(course?.certificate_available ?? course?.certificateAvailable ?? true),
    instructorId: toInt(course?.instructor_id ?? course?.instructorId ?? previousWorkshop?.instructorId),
    totalDurationMinutes: Number.isFinite(Number(course?.total_duration_minutes ?? course?.totalDurationMinutes))
      ? Number(course.total_duration_minutes ?? course.totalDurationMinutes)
      : Number(previousWorkshop?.totalDurationMinutes || 0),
    rating: Number.isFinite(Number(course?.rating)) ? Number(course.rating) : Number(previousWorkshop?.rating || 0),
    enrolledStudents: Number.isFinite(Number(course?.enrolled_students ?? course?.enrolledStudents))
      ? Number(course.enrolled_students ?? course.enrolledStudents)
      : Number(previousWorkshop?.enrolledStudents || 0),
    originalWorkshopId: toInt(previousWorkshop?.originalWorkshopId),
    thumbnailUrl: normalizeNullableText(course?.thumbnail || previousWorkshop?.thumbnailUrl),
    thumbnailBlobUrl: previousWorkshop?.thumbnailBlobUrl || null,
    thumbnailName: previousWorkshop?.thumbnailName || null,
    createdAt: previousWorkshop?.createdAt || now,
    updatedAt: now,
    modules: ensureArray(previousWorkshop?.modules).map((module) => ({
      ...module,
      videos: ensureArray(module.videos),
    })),
    isManagedByApi: true,
  }
}

const syncCourseTableWorkshops = async (state) => {
  const token = getToken()

  let response = token
    ? await tryFetchJson('/api/admin/courses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    : { ok: false, payload: null, status: 0 }

  if (!response.ok) {
    response = await tryFetchJson('/api/courses')
  }

  if (!response.ok) {
    return {
      ok: false,
      state,
      message: response.payload?.message || 'Could not fetch courses from courses table.',
    }
  }

  const payloadCourses = asArray(response.payload, ['courses', 'data', 'results'])

  const previousByCourseId = new Map(
    ensureArray(state.workshops)
      .filter((workshop) => Number.isInteger(toInt(workshop.apiCourseId)))
      .map((workshop) => [toInt(workshop.apiCourseId), workshop]),
  )

  const apiWorkshops = payloadCourses
    .map((course) => {
      const courseId = toInt(course?.id)
      return normalizeCourseWorkshop(course, courseId ? previousByCourseId.get(courseId) : null)
    })
    .filter(Boolean)

  const workshops = [...apiWorkshops].sort(
    (left, right) => new Date(right.updatedAt || 0).getTime() - new Date(left.updatedAt || 0).getTime(),
  )

  const workshopIds = new Set(workshops.map((workshop) => workshop.id))

  return {
    ok: true,
    state: {
      ...state,
      workshops,
      accessEntries: ensureArray(state.accessEntries).filter((entry) => workshopIds.has(entry.workshopId)),
      uploadJobs: ensureArray(state.uploadJobs).filter((job) => !job.workshopId || workshopIds.has(job.workshopId)),
    },
    message: '',
  }
}

const publishCourseBuilderCourse = async (courseIdInput) => {
  const courseId = toApiCourseId(courseIdInput)
  if (!courseId) {
    throw new Error('Valid course id is required to publish.')
  }

  const token = getBuilderAuthToken()
  const response = await tryFetchJson(`/api/admin/courses/${courseId}/publish`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not publish course.'))
  }

  return normalizeCourseWorkshop(
    response.payload?.course || {
      id: courseId,
      title: `Course ${courseId}`,
      is_published: 1,
    },
  )
}

const getLiveWorkshops = async () => {
  const response = await tryFetchJson('/api/workshop-list/list')
  if (!response.ok) return []

  return asArray(response.payload, ['data', 'results', 'workshops']).map(normalizeLiveWorkshop)
}

const getSourceParticipants = async (sourceWorkshopId) => {
  const response = await tryFetchJson(`/api/workshop-list/${sourceWorkshopId}/participants`)

  if (!response.ok) {
    return {
      ok: false,
      participants: [],
      message: 'Could not fetch participants from live course API.',
    }
  }

  const payloadParticipants = asArray(response.payload, ['participants', 'data', 'results'])

  return {
    ok: true,
    participants: payloadParticipants.map(normalizeParticipant),
    message: '',
  }
}

const upsertAccessEntries = (entries, payloadEntries) => {
  const next = [...entries]

  for (const incoming of payloadEntries) {
    const existingIndex = next.findIndex(
      (entry) =>
        entry.workshopId === incoming.workshopId
        && ((entry.email && incoming.email && entry.email.toLowerCase() === incoming.email.toLowerCase())
          || (entry.userId && incoming.userId && String(entry.userId) === String(incoming.userId))),
    )

    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        ...incoming,
        updatedAt: new Date().toISOString(),
      }
      continue
    }

    next.push(incoming)
  }

  return next
}

const normalizeDashboardProfileSettings = (profile = {}) => ({
  displayName: normalizeText(profile.displayName || profile.display_name || profile.full_name || ''),
  email: normalizeText(profile.email || profile.primaryEmail || profile.primary_email || ''),
  designation: normalizeText(profile.designation || ''),
  notificationsEmail: normalizeText(
    profile.notificationsEmail || profile.alternativeEmail || profile.alternative_email || '',
  ),
  bio: normalizeText(profile.bio || ''),
  description: normalizeText(profile.description || profile.profile_description || ''),
})

const fetchDashboardProfileFromApi = async () => {
  const token = getToken()

  if (!token) {
    return {
      ok: false,
      profile: null,
      message: 'Authentication token missing.',
    }
  }

  const response = await tryFetchJson('/auth/instructor-profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    return {
      ok: false,
      profile: null,
      message: response.payload?.message || 'Could not load profile from database.',
    }
  }

  return {
    ok: true,
    profile: normalizeDashboardProfileSettings(response.payload?.profile || {}),
    message: '',
  }
}

const saveDashboardProfileToApi = async (profilePayload = {}) => {
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token missing. Please login again.')
  }

  const response = await tryFetchJson('/auth/instructor-profile', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      displayName: normalizeText(profilePayload.displayName),
      email: normalizeText(profilePayload.email),
      designation: normalizeText(profilePayload.designation),
      alternativeEmail: normalizeText(profilePayload.notificationsEmail),
      bio: normalizeText(profilePayload.bio),
      description: normalizeText(profilePayload.description),
    }),
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not update instructor profile.'))
  }

  return normalizeDashboardProfileSettings(response.payload?.profile || {})
}

const getAssignableInstructors = async () => {
  const token = getToken()

  if (!token) {
    throw new Error('Authentication token missing. Please login again.')
  }

  const response = await tryFetchJson('/auth/instructors', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(getApiErrorMessage(response, 'Could not fetch instructor ids.'))
  }

  const raw = asArray(response.payload, ['instructors', 'data', 'results'])

  return raw
    .map((item) => ({
      id: toInt(item.id),
      fullName: normalizeText(item.full_name || item.fullName),
      email: normalizeText(item.email),
    }))
    .filter((item) => Number.isInteger(item.id) && item.id > 0)
}

const createWorkshop = async (payload) => {
  const token = getToken()
  if (!token) {
    throw new Error('Authentication token missing. Please login again.')
  }

  const requestPayload = buildCreateCoursePayload(payload)
  if (!requestPayload.title) {
    throw new Error('Course title is required.')
  }

  const formData = buildCreateCourseFormData(requestPayload, payload.thumbnailFile || null)

  let createResponse = await tryFetchJson('/api/admin/courses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  // Backward-compatibility for deployments that still expose only /api/courses.
  if (!createResponse.ok && createResponse.status === 404) {
    createResponse = await tryFetchJson('/api/courses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    })
  }

  if (!createResponse.ok) {
    if (createResponse.status === 404) {
      throw new Error('Create course route is not available on the configured backend. Deploy latest backend routes.')
    }

    const statusLabel = createResponse.status ? ` (HTTP ${createResponse.status})` : ''
    throw new Error((createResponse.payload?.message || 'Could not create course in courses table.') + statusLabel)
  }

  const createdCourse = createResponse.payload?.course || {}
  const createdCourseId = toInt(createdCourse.id)
  if (!createdCourseId) {
    throw new Error('Course created, but response is missing course id.')
  }

  const state = readState()
  const now = new Date().toISOString()

  const existing = state.workshops.find((workshop) => toInt(workshop.apiCourseId) === createdCourseId) || null

  const workshop = {
    ...existing,
    id: toCourseWorkshopId(createdCourseId),
    apiCourseId: createdCourseId,
    slug: normalizeText(createdCourse.slug || requestPayload.slug),
    title: normalizeText(createdCourse.title || requestPayload.title),
    subtitle: normalizeText(createdCourse.subtitle || requestPayload.subtitle || ''),
    description: normalizeText(createdCourse.description || requestPayload.description || ''),
    status: toBoolean(createdCourse.is_published ?? createdCourse.isPublished, false) ? 'published' : 'draft',
    isPublished: toBoolean(createdCourse.is_published ?? createdCourse.isPublished, false),
    category: normalizeText(createdCourse.category || requestPayload.category || 'Course'),
    level: normalizeText(createdCourse.level || requestPayload.level || 'Beginner'),
    language: normalizeText(createdCourse.language || requestPayload.language || 'English'),
    price: Number.isFinite(Number(createdCourse.price ?? requestPayload.price))
      ? Number(createdCourse.price ?? requestPayload.price)
      : 0,
    discountPrice: Number.isFinite(Number(createdCourse.discount_price ?? requestPayload.discount_price))
      ? Number(createdCourse.discount_price ?? requestPayload.discount_price)
      : null,
    currency: normalizeText(createdCourse.currency || requestPayload.currency || 'INR'),
    isPaid: Boolean(createdCourse.is_paid ?? requestPayload.is_paid),
    lifetimeAccess: Boolean(createdCourse.lifetime_access ?? requestPayload.lifetime_access),
    certificateAvailable: Boolean(createdCourse.certificate_available ?? requestPayload.certificate_available),
    instructorId: toInt(createdCourse.instructor_id ?? requestPayload.instructor_id),
    totalDurationMinutes: Number((createdCourse.total_duration_minutes ?? requestPayload.total_duration_minutes) || 0),
    rating: Number(existing?.rating || 0),
    enrolledStudents: Number(createdCourse.enrolled_students || existing?.enrolledStudents || 0),
    originalWorkshopId: null,
    thumbnailUrl: normalizeNullableText(createdCourse.thumbnail || existing?.thumbnailUrl),
    thumbnailBlobUrl: null,
    thumbnailName: payload.thumbnailFile?.name || null,
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    modules: ensureArray(existing?.modules).map((module) => ({
      ...module,
      videos: ensureArray(module.videos),
    })),
    isManagedByApi: true,
  }

  const createdState = withActivity(
    {
      ...state,
      workshops: [workshop, ...state.workshops.filter((entry) => entry.id !== workshop.id)],
    },
    {
      action: 'Created course in courses table',
      target: workshop.title,
    },
  )

  let nextState = writeState(createdState)

  const syncResult = await syncCourseTableWorkshops(nextState)
  if (syncResult.ok) {
    nextState = writeState(syncResult.state)
  }

  return nextState.workshops.find((entry) => entry.id === workshop.id) || workshop
}

const updateWorkshop = async (workshopId, payload) => {
  const state = readState()
  const current = state.workshops.find((workshop) => workshop.id === workshopId)
  if (!current) {
    throw new Error('Course not found.')
  }

  if (current.isManagedByApi) {
    throw new Error('Editing synced courses is not available yet.')
  }

  const updated = {
    ...current,
    title: payload.title !== undefined ? normalizeText(payload.title) : current.title,
    slug: payload.slug !== undefined ? normalizeText(payload.slug) : current.slug,
    subtitle: payload.subtitle !== undefined ? normalizeText(payload.subtitle) : current.subtitle,
    description: payload.description !== undefined ? normalizeText(payload.description) : current.description,
    status: payload.status === 'published' || payload.status === 'draft' ? payload.status : current.status,
    category: payload.category !== undefined ? normalizeText(payload.category) : current.category,
    level: payload.level !== undefined ? normalizeText(payload.level) : current.level,
    language: payload.language !== undefined ? normalizeText(payload.language) : current.language,
    price: payload.price !== undefined && Number.isFinite(Number(payload.price)) ? Number(payload.price) : current.price,
    originalWorkshopId:
      payload.originalWorkshopId !== undefined
        ? toInt(payload.originalWorkshopId)
        : current.originalWorkshopId,
    thumbnailUrl:
      payload.thumbnailUrl !== undefined
        ? normalizeNullableText(payload.thumbnailUrl)
        : current.thumbnailUrl,
    thumbnailBlobUrl:
      payload.thumbnailBlobUrl !== undefined
        ? payload.thumbnailBlobUrl
        : current.thumbnailBlobUrl,
    thumbnailName:
      payload.thumbnailName !== undefined
        ? payload.thumbnailName
        : current.thumbnailName,
    updatedAt: new Date().toISOString(),
  }

  if (!updated.title) {
    throw new Error('Course title is required.')
  }

  const next = withActivity(
    {
      ...state,
      workshops: state.workshops.map((workshop) => (workshop.id === workshopId ? updated : workshop)),
    },
    {
      action: 'Updated course details',
      target: updated.title,
    },
  )

  writeState(next)
  return updated
}

const deleteWorkshop = async (workshopId) => {
  const state = readState()
  const deleting = state.workshops.find((workshop) => workshop.id === workshopId)
  if (!deleting) return { success: true }

  if (deleting.isManagedByApi) {
    throw new Error('Deleting synced courses is not available yet.')
  }

  const next = withActivity(
    {
      ...state,
      workshops: state.workshops.filter((workshop) => workshop.id !== workshopId),
      accessEntries: state.accessEntries.filter((entry) => entry.workshopId !== workshopId),
      uploadJobs: state.uploadJobs.filter((job) => job.workshopId !== workshopId),
    },
    {
      action: 'Deleted recorded course',
      target: deleting.title,
    },
  )

  writeState(next)
  return { success: true }
}

const addModule = async (workshopId, title) => {
  const state = readState()
  const trimmedTitle = String(title || '').trim()
  if (!trimmedTitle) throw new Error('Module title is required.')

  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Course not found.')

  const module = {
    id: makeId('mod'),
    title: trimmedTitle,
    order: workshop.modules.length + 1,
    videos: [],
  }

  const next = withActivity(
    patchWorkshop(state, workshopId, (item) => ({
      ...item,
      modules: [...item.modules, module],
      updatedAt: new Date().toISOString(),
    })),
    {
      action: 'Added course module',
      target: `${workshop.title} / ${module.title}`,
    },
  )

  writeState(next)
  return module
}

const updateModule = async (workshopId, moduleId, payload) => {
  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Course not found.')

  const moduleIndex = getModuleIndex(workshop, moduleId)
  if (moduleIndex < 0) throw new Error('Module not found.')

  const currentModule = workshop.modules[moduleIndex]
  const nextModule = {
    ...currentModule,
    ...payload,
    title: payload.title !== undefined ? String(payload.title || '').trim() : currentModule.title,
  }

  if (!nextModule.title) throw new Error('Module title is required.')

  const nextState = withActivity(
    patchWorkshop(state, workshopId, (item) => {
      const modules = item.modules.map((module) => (module.id === moduleId ? nextModule : module))
      return {
        ...item,
        modules,
        updatedAt: new Date().toISOString(),
      }
    }),
    {
      action: 'Updated module',
      target: `${workshop.title} / ${nextModule.title}`,
    },
  )

  writeState(nextState)
  return nextModule
}

const deleteModule = async (workshopId, moduleId) => {
  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Course not found.')

  const module = workshop.modules.find((item) => item.id === moduleId)
  if (!module) return { success: true }

  const nextState = withActivity(
    patchWorkshop(state, workshopId, (item) => ({
      ...item,
      modules: item.modules.filter((entry) => entry.id !== moduleId).map((entry, index) => ({ ...entry, order: index + 1 })),
      updatedAt: new Date().toISOString(),
    })),
    {
      action: 'Removed module',
      target: `${workshop.title} / ${module.title}`,
    },
  )

  writeState(nextState)
  return { success: true }
}

const reorderModules = async (workshopId, sourceIndex, targetIndex) => {
  const state = readState()

  const nextState = patchWorkshop(state, workshopId, (workshop) => {
    const sorted = [...workshop.modules].sort((a, b) => a.order - b.order)
    const moved = reorder(sorted, sourceIndex, targetIndex).map((module, index) => ({
      ...module,
      order: index + 1,
    }))

    return {
      ...workshop,
      modules: moved,
      updatedAt: new Date().toISOString(),
    }
  })

  writeState(nextState)
  return { success: true }
}

const addVideo = async (workshopId, moduleId, payload) => {
  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Course not found.')

  const moduleIndex = getModuleIndex(workshop, moduleId)
  if (moduleIndex < 0) throw new Error('Module not found.')

  const title = String(payload.title || '').trim()
  if (!title) throw new Error('Video title is required.')

  const video = {
    id: makeId('vid'),
    title,
    description: String(payload.description || '').trim(),
    duration: String(payload.duration || '').trim() || '00:00',
    order: Number.isFinite(Number(payload.order)) ? Number(payload.order) : workshop.modules[moduleIndex].videos.length + 1,
    fileName: payload.fileName || payload.videoFile?.name || 'video.mp4',
    fileSize: Number(payload.fileSize || payload.videoFile?.size || 0),
    videoBlobUrl: payload.videoBlobUrl || null,
    thumbnailBlobUrl: payload.thumbnailBlobUrl || null,
    thumbnailName: payload.thumbnailName || payload.thumbnailFile?.name || null,
    views: Number.isFinite(Number(payload.views)) ? Number(payload.views) : 0,
    completions: Number.isFinite(Number(payload.completions)) ? Number(payload.completions) : 0,
    uploadedAt: new Date().toISOString(),
  }

  const nextState = withActivity(
    patchWorkshop(state, workshopId, (item) => {
      const modules = item.modules.map((module) => {
        if (module.id !== moduleId) return module

        const nextVideos = [...module.videos, video]
          .sort((a, b) => a.order - b.order)
          .map((entry, index) => ({ ...entry, order: index + 1 }))

        return {
          ...module,
          videos: nextVideos,
        }
      })

      return {
        ...item,
        modules,
        updatedAt: new Date().toISOString(),
      }
    }),
    {
      action: 'Uploaded recorded video',
      target: `${workshop.title} / ${video.title}`,
    },
  )

  writeState(nextState)
  return video
}

const updateVideo = async (workshopId, moduleId, videoId, payload) => {
  const state = readState()

  const nextState = patchWorkshop(state, workshopId, (workshop) => {
    const modules = workshop.modules.map((module) => {
      if (module.id !== moduleId) return module

      const videos = module.videos.map((video) => {
        if (video.id !== videoId) return video

        const merged = {
          ...video,
          ...payload,
          title: payload.title !== undefined ? String(payload.title || '').trim() : video.title,
          description: payload.description !== undefined ? String(payload.description || '').trim() : video.description,
          duration: payload.duration !== undefined ? String(payload.duration || '').trim() : video.duration,
        }

        return merged
      })

      return {
        ...module,
        videos,
      }
    })

    return {
      ...workshop,
      modules,
      updatedAt: new Date().toISOString(),
    }
  })

  writeState(nextState)
  return { success: true }
}

const deleteVideo = async (workshopId, moduleId, videoId) => {
  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Course not found.')

  const module = workshop.modules.find((item) => item.id === moduleId)
  if (!module) throw new Error('Module not found.')

  const video = module.videos.find((item) => item.id === videoId)

  const nextState = withActivity(
    patchWorkshop(state, workshopId, (item) => ({
      ...item,
      modules: item.modules.map((entry) => {
        if (entry.id !== moduleId) return entry

        return {
          ...entry,
          videos: entry.videos
            .filter((videoEntry) => videoEntry.id !== videoId)
            .map((videoEntry, index) => ({ ...videoEntry, order: index + 1 })),
        }
      }),
      updatedAt: new Date().toISOString(),
    })),
    video
      ? {
          action: 'Deleted video from module',
          target: `${workshop.title} / ${video.title}`,
        }
      : null,
  )

  writeState(nextState)
  return { success: true }
}

const reorderVideos = async (workshopId, moduleId, sourceIndex, targetIndex) => {
  const state = readState()

  const nextState = patchWorkshop(state, workshopId, (workshop) => ({
    ...workshop,
    modules: workshop.modules.map((module) => {
      if (module.id !== moduleId) return module

      const ordered = reorder(
        [...module.videos].sort((a, b) => a.order - b.order),
        sourceIndex,
        targetIndex,
      ).map((video, index) => ({
        ...video,
        order: index + 1,
      }))

      return {
        ...module,
        videos: ordered,
      }
    }),
    updatedAt: new Date().toISOString(),
  }))

  writeState(nextState)
  return { success: true }
}

const createUploadJob = async (payload) => {
  const state = readState()

  const job = {
    id: makeId('up'),
    workshopId: payload.workshopId || null,
    moduleId: payload.moduleId || null,
    videoId: payload.videoId || null,
    fileName: payload.fileName || 'upload-file',
    fileSize: Number(payload.fileSize || 0),
    status: payload.status || 'queued',
    progress: Number.isFinite(Number(payload.progress)) ? Number(payload.progress) : 0,
    type: payload.type || 'video',
    previewBlobUrl: payload.previewBlobUrl || null,
    startedAt: payload.startedAt || new Date().toISOString(),
    completedAt: payload.completedAt || null,
    error: payload.error || null,
  }

  const next = {
    ...state,
    uploadJobs: [job, ...state.uploadJobs].slice(0, 120),
  }

  writeState(next)
  return job
}

const updateUploadJob = async (jobId, patch) => {
  const state = readState()
  const next = {
    ...state,
    uploadJobs: state.uploadJobs.map((job) => {
      if (job.id !== jobId) return job
      return {
        ...job,
        ...patch,
      }
    }),
  }

  writeState(next)
  return { success: true }
}

const removeUploadJob = async (jobId) => {
  const state = readState()
  const next = {
    ...state,
    uploadJobs: state.uploadJobs.filter((job) => job.id !== jobId),
  }

  writeState(next)
  return { success: true }
}

const grantAccess = async (payload) => {
  const state = readState()
  const now = new Date().toISOString()

  const entry = {
    id: makeId('acc'),
    workshopId: payload.workshopId,
    sourceWorkshopId: toInt(payload.sourceWorkshopId),
    userId: payload.userId || payload.email || makeId('user'),
    fullName: String(payload.fullName || '').trim() || 'LMS Student',
    email: String(payload.email || '').trim().toLowerCase(),
    status: 'granted',
    source: payload.source || 'manual',
    grantedAt: now,
    updatedAt: now,
  }

  if (!entry.workshopId) throw new Error('Course id is required for access control.')
  if (!entry.email) throw new Error('Email is required for access control.')

  const upserted = upsertAccessEntries(state.accessEntries, [entry])

  const next = withActivity(
    {
      ...state,
      accessEntries: upserted,
    },
    {
      action: 'Granted course access',
      target: entry.email,
    },
  )

  writeState(next)
  return entry
}

const setAccessStatus = async (entryId, status) => {
  const state = readState()
  const normalizedStatus = status === 'revoked' ? 'revoked' : 'granted'

  const target = state.accessEntries.find((entry) => entry.id === entryId)

  const next = withActivity(
    {
      ...state,
      accessEntries: state.accessEntries.map((entry) => {
        if (entry.id !== entryId) return entry
        return {
          ...entry,
          status: normalizedStatus,
          updatedAt: new Date().toISOString(),
        }
      }),
    },
    target
      ? {
          action: normalizedStatus === 'granted' ? 'Restored course access' : 'Revoked course access',
          target: target.email || target.userId,
        }
      : null,
  )

  writeState(next)
  return { success: true }
}

const syncAccessFromSource = async (workshopId) => {
  const state = readState()
  const workshop = state.workshops.find((entry) => entry.id === workshopId)

  if (!workshop) {
    throw new Error('Course not found.')
  }

  if (!workshop.originalWorkshopId) {
    throw new Error('This recorded course is not linked with a source course.')
  }

  const result = await getSourceParticipants(workshop.originalWorkshopId)

  if (!result.ok) {
    throw new Error(result.message || 'Could not fetch participants from source course.')
  }

  const records = result.participants.map((participant) => ({
    id: makeId('acc'),
    workshopId: workshop.id,
    sourceWorkshopId: workshop.originalWorkshopId,
    userId: participant.userId || participant.email,
    fullName: participant.fullName,
    email: String(participant.email || '').trim().toLowerCase(),
    status: 'granted',
    source: 'sync',
    grantedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }))

  const upserted = upsertAccessEntries(state.accessEntries, records)

  const next = withActivity(
    {
      ...state,
      accessEntries: upserted,
    },
    {
      action: 'Synced enrollments to LMS access',
      target: `${workshop.title} (${records.length})`,
    },
  )

  writeState(next)

  return {
    syncedCount: records.length,
    participants: result.participants,
  }
}

const updateSettings = async (section, payload) => {
  const state = readState()
  const allowedSections = ['profile', 'storage', 'permissions']

  if (!allowedSections.includes(section)) {
    throw new Error('Invalid settings section.')
  }

  let nextSectionState = {
    ...state.settings[section],
    ...payload,
  }

  if (section === 'profile') {
    const savedProfile = await saveDashboardProfileToApi(payload)
    nextSectionState = {
      ...state.settings.profile,
      ...payload,
      ...savedProfile,
    }
  }

  const next = withActivity(
    {
      ...state,
      settings: {
        ...state.settings,
        [section]: nextSectionState,
      },
    },
    {
      action: 'Updated dashboard settings',
      target: section,
    },
  )

  writeState(next)
  return next.settings
}

const getDashboardSnapshot = async () => {
  let state = readState()
  const syncResult = await syncCourseTableWorkshops(state)

  if (syncResult.ok) {
    state = writeState(syncResult.state)
  }

  const profileSync = await fetchDashboardProfileFromApi()
  if (profileSync.ok && profileSync.profile) {
    state = writeState({
      ...state,
      settings: {
        ...state.settings,
        profile: {
          ...state.settings.profile,
          ...profileSync.profile,
        },
      },
    })
  }

  const liveWorkshops = await getLiveWorkshops()
  const metrics = getDashboardMetrics(state)
  const analytics = getAnalytics(state)

  return {
    ...state,
    liveWorkshops,
    metrics,
    analytics,
    courseSync: {
      ok: syncResult.ok,
      message: syncResult.message || '',
    },
    profileSync: {
      ok: profileSync.ok,
      message: profileSync.message || '',
    },
  }
}

export const lmsAdminService = {
  getDashboardSnapshot,
  getAssignableInstructors,
  getLiveWorkshops,
  getSourceParticipants,
  getCourseBuilderModules,
  createCourseBuilderModule,
  updateCourseBuilderModule,
  deleteCourseBuilderModule,
  createCourseBuilderLesson,
  updateCourseBuilderLesson,
  deleteCourseBuilderLesson,
  reorderCourseBuilderModules,
  reorderCourseBuilderLessons,
  publishCourseBuilderCourse,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  addVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
  createUploadJob,
  updateUploadJob,
  removeUploadJob,
  grantAccess,
  setAccessStatus,
  syncAccessFromSource,
  updateSettings,
}

