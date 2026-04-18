import { buildApiUrl, parseJsonSafe } from '../utils/apiClient'

const STORAGE_KEY = 'bserc-lms-super-admin-state-v1'

const clone = (value) => JSON.parse(JSON.stringify(value))

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10)
  return Number.isInteger(parsed) ? parsed : null
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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

const SEED_STATE = {
  workshops: [
    {
      id: 'rw-1001',
      title: 'Space Systems Bootcamp (Recorded)',
      description: 'Recorded track with complete mission planning walkthroughs and post-session Q&A.',
      status: 'published',
      originalWorkshopId: 1,
      thumbnailBlobUrl: null,
      thumbnailName: 'space-systems-thumbnail.webp',
      createdAt: '2026-04-03T06:00:00.000Z',
      updatedAt: '2026-04-13T08:15:00.000Z',
      modules: [
        {
          id: 'mod-1001',
          title: 'Mission Fundamentals',
          order: 1,
          videos: [
            {
              id: 'vid-1001',
              title: 'Mission Lifecycle and Constraints',
              description: 'How real mission constraints shape architecture decisions.',
              duration: '18:24',
              order: 1,
              fileName: 'mission-lifecycle.mp4',
              fileSize: 84215812,
              videoBlobUrl: null,
              thumbnailBlobUrl: null,
              thumbnailName: 'mission-lifecycle-thumb.webp',
              views: 482,
              completions: 377,
              uploadedAt: '2026-04-03T08:00:00.000Z',
            },
            {
              id: 'vid-1002',
              title: 'Payload and Orbit Trade-offs',
              description: 'Balancing payload requirements, orbital mechanics, and mission budget.',
              duration: '22:10',
              order: 2,
              fileName: 'payload-orbit-trades.mp4',
              fileSize: 97354120,
              videoBlobUrl: null,
              thumbnailBlobUrl: null,
              thumbnailName: 'payload-orbit-thumb.webp',
              views: 421,
              completions: 298,
              uploadedAt: '2026-04-04T08:00:00.000Z',
            },
          ],
        },
        {
          id: 'mod-1002',
          title: 'Operations and Readiness',
          order: 2,
          videos: [
            {
              id: 'vid-1003',
              title: 'Telemetry Dashboard Deep Dive',
              description: 'Designing practical mission telemetry and alert thresholds.',
              duration: '16:55',
              order: 1,
              fileName: 'telemetry-dashboard.mp4',
              fileSize: 75823450,
              videoBlobUrl: null,
              thumbnailBlobUrl: null,
              thumbnailName: 'telemetry-thumb.webp',
              views: 349,
              completions: 231,
              uploadedAt: '2026-04-04T09:00:00.000Z',
            },
          ],
        },
      ],
    },
    {
      id: 'rw-1002',
      title: 'AI Product Engineering Masterclass (Recorded)',
      description: 'Recorded sessions covering deployment, observability, and safe rollout of AI features.',
      status: 'draft',
      originalWorkshopId: 2,
      thumbnailBlobUrl: null,
      thumbnailName: 'ai-masterclass-thumb.webp',
      createdAt: '2026-04-08T05:00:00.000Z',
      updatedAt: '2026-04-10T11:00:00.000Z',
      modules: [
        {
          id: 'mod-2001',
          title: 'Model Integration',
          order: 1,
          videos: [
            {
              id: 'vid-2001',
              title: 'Prompt Contracts and Evaluation',
              description: 'Building prompt contracts with measurable quality gates.',
              duration: '19:40',
              order: 1,
              fileName: 'prompt-contracts.mp4',
              fileSize: 88423110,
              videoBlobUrl: null,
              thumbnailBlobUrl: null,
              thumbnailName: 'prompt-contracts-thumb.webp',
              views: 266,
              completions: 190,
              uploadedAt: '2026-04-10T12:00:00.000Z',
            },
          ],
        },
      ],
    },
  ],
  accessEntries: [
    {
      id: 'acc-1001',
      workshopId: 'rw-1001',
      sourceWorkshopId: 1,
      userId: 'u-1',
      fullName: 'Aisha Khan',
      email: 'aisha.khan@example.com',
      status: 'granted',
      source: 'sync',
      grantedAt: '2026-04-10T07:00:00.000Z',
      updatedAt: '2026-04-10T07:00:00.000Z',
    },
    {
      id: 'acc-1002',
      workshopId: 'rw-1001',
      sourceWorkshopId: 1,
      userId: 'u-2',
      fullName: 'Rohan Mehta',
      email: 'rohan.mehta@example.com',
      status: 'granted',
      source: 'sync',
      grantedAt: '2026-04-10T07:05:00.000Z',
      updatedAt: '2026-04-10T07:05:00.000Z',
    },
  ],
  uploadJobs: [
    {
      id: 'up-1001',
      workshopId: 'rw-1001',
      moduleId: 'mod-1002',
      videoId: 'vid-1003',
      fileName: 'telemetry-dashboard.mp4',
      fileSize: 75823450,
      status: 'completed',
      progress: 100,
      type: 'video',
      previewBlobUrl: null,
      startedAt: '2026-04-04T08:45:00.000Z',
      completedAt: '2026-04-04T09:00:00.000Z',
    },
  ],
  settings: {
    profile: {
      displayName: 'Super Admin',
      email: 'superadmin@bserc.in',
      designation: 'Platform Lead',
      notificationsEmail: 'superadmin@bserc.in',
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
  activityLogs: [
    {
      id: 'log-1001',
      actor: 'Super Admin',
      action: 'Published recorded workshop',
      target: 'Space Systems Bootcamp (Recorded)',
      at: '2026-04-13T08:15:00.000Z',
    },
    {
      id: 'log-1002',
      actor: 'Super Admin',
      action: 'Granted LMS access',
      target: 'Aisha Khan',
      at: '2026-04-10T07:00:00.000Z',
    },
  ],
}

const ensureArray = (value) => (Array.isArray(value) ? value : [])

const hydrateState = (rawState) => {
  const state = rawState && typeof rawState === 'object' ? rawState : {}
  const merged = {
    ...clone(SEED_STATE),
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

let memoryState = clone(SEED_STATE)

const readState = () => {
  if (typeof window === 'undefined') return hydrateState(memoryState)

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_STATE))
      memoryState = clone(SEED_STATE)
      return hydrateState(memoryState)
    }

    const parsed = JSON.parse(raw)
    const hydrated = hydrateState(parsed)
    memoryState = clone(hydrated)
    return hydrated
  } catch {
    memoryState = clone(SEED_STATE)
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

const tryFetchJson = async (path) => {
  try {
    const url = buildApiUrl(path)
    const response = await fetch(url)
    const payload = await parseJsonSafe(response)

    if (!response.ok) {
      return { ok: false, payload, status: response.status }
    }

    return { ok: true, payload, status: response.status }
  } catch {
    return { ok: false, payload: null, status: 0 }
  }
}

const normalizeLiveWorkshop = (workshop) => {
  const id = toInt(workshop.id)

  return {
    id: Number.isInteger(id) ? id : workshop.id,
    title: workshop.title || workshop.workshop_title || `Workshop ${workshop.id || '-'}`,
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
      message: 'Could not fetch participants from live workshop API.',
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

const createWorkshop = async (payload) => {
  await delay(80)

  const state = readState()
  const now = new Date().toISOString()

  const workshop = {
    id: makeId('rw'),
    title: String(payload.title || '').trim(),
    description: String(payload.description || '').trim(),
    status: payload.status === 'published' ? 'published' : 'draft',
    originalWorkshopId: toInt(payload.originalWorkshopId),
    thumbnailBlobUrl: payload.thumbnailBlobUrl || null,
    thumbnailName: payload.thumbnailName || null,
    createdAt: now,
    updatedAt: now,
    modules: [],
  }

  if (!workshop.title) {
    throw new Error('Workshop title is required.')
  }

  const next = withActivity(
    {
      ...state,
      workshops: [workshop, ...state.workshops],
    },
    {
      action: 'Created recorded workshop',
      target: workshop.title,
    },
  )

  writeState(next)
  return workshop
}

const updateWorkshop = async (workshopId, payload) => {
  await delay(70)

  const state = readState()
  const current = state.workshops.find((workshop) => workshop.id === workshopId)
  if (!current) {
    throw new Error('Workshop not found.')
  }

  const updated = {
    ...current,
    title: payload.title !== undefined ? String(payload.title || '').trim() : current.title,
    description: payload.description !== undefined ? String(payload.description || '').trim() : current.description,
    status: payload.status === 'published' || payload.status === 'draft' ? payload.status : current.status,
    originalWorkshopId:
      payload.originalWorkshopId !== undefined
        ? toInt(payload.originalWorkshopId)
        : current.originalWorkshopId,
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
    throw new Error('Workshop title is required.')
  }

  const next = withActivity(
    {
      ...state,
      workshops: state.workshops.map((workshop) => (workshop.id === workshopId ? updated : workshop)),
    },
    {
      action: 'Updated workshop details',
      target: updated.title,
    },
  )

  writeState(next)
  return updated
}

const deleteWorkshop = async (workshopId) => {
  await delay(60)

  const state = readState()
  const deleting = state.workshops.find((workshop) => workshop.id === workshopId)
  if (!deleting) return { success: true }

  const next = withActivity(
    {
      ...state,
      workshops: state.workshops.filter((workshop) => workshop.id !== workshopId),
      accessEntries: state.accessEntries.filter((entry) => entry.workshopId !== workshopId),
      uploadJobs: state.uploadJobs.filter((job) => job.workshopId !== workshopId),
    },
    {
      action: 'Deleted recorded workshop',
      target: deleting.title,
    },
  )

  writeState(next)
  return { success: true }
}

const addModule = async (workshopId, title) => {
  await delay(60)

  const state = readState()
  const trimmedTitle = String(title || '').trim()
  if (!trimmedTitle) throw new Error('Module title is required.')

  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Workshop not found.')

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
      action: 'Added workshop module',
      target: `${workshop.title} / ${module.title}`,
    },
  )

  writeState(next)
  return module
}

const updateModule = async (workshopId, moduleId, payload) => {
  await delay(50)

  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Workshop not found.')

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
  await delay(60)

  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Workshop not found.')

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
  await delay(50)

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
  await delay(90)

  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Workshop not found.')

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
  await delay(60)

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
  await delay(60)

  const state = readState()
  const workshop = state.workshops.find((item) => item.id === workshopId)
  if (!workshop) throw new Error('Workshop not found.')

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
  await delay(50)

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

  if (!entry.workshopId) throw new Error('Workshop id is required for access control.')
  if (!entry.email) throw new Error('Email is required for access control.')

  const upserted = upsertAccessEntries(state.accessEntries, [entry])

  const next = withActivity(
    {
      ...state,
      accessEntries: upserted,
    },
    {
      action: 'Granted workshop access',
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
          action: normalizedStatus === 'granted' ? 'Restored workshop access' : 'Revoked workshop access',
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
    throw new Error('Workshop not found.')
  }

  if (!workshop.originalWorkshopId) {
    throw new Error('This recorded workshop is not linked with a source workshop.')
  }

  const result = await getSourceParticipants(workshop.originalWorkshopId)

  if (!result.ok) {
    throw new Error(result.message || 'Could not fetch participants from source workshop.')
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

  const next = withActivity(
    {
      ...state,
      settings: {
        ...state.settings,
        [section]: {
          ...state.settings[section],
          ...payload,
        },
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
  const state = readState()
  const liveWorkshops = await getLiveWorkshops()
  const metrics = getDashboardMetrics(state)
  const analytics = getAnalytics(state)

  return {
    ...state,
    liveWorkshops,
    metrics,
    analytics,
  }
}

export const lmsAdminService = {
  getDashboardSnapshot,
  getLiveWorkshops,
  getSourceParticipants,
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
