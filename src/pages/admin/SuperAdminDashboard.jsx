import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  FolderKanban,
  Headset,
  HelpCircle,
  LayoutDashboard,
  Megaphone,
  Pencil,
  PlayCircle,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserCheck,
} from 'lucide-react'
import SuperAdminSidebar from '../../components/superAdmin/SuperAdminSidebar'
import SuperAdminTopbar from '../../components/superAdmin/SuperAdminTopbar'
import SuperAdminMetricCard from '../../components/superAdmin/SuperAdminMetricCard'
import ProfileAvatar from '../../components/superAdmin/ProfileAvatar'
import { lmsAdminService } from '../../services/lmsAdminService'
import { useAuthState } from '../../hooks/useAuth'
import { logoutAdmin } from '../../utils/auth'
import WorkshopBuilder from './WorkshopBuilder'

const SECTION_IDS = {
  OVERVIEW: 'overview',
  WORKSHOPS: 'workshops',
  MODULES: 'modules',
  UPLOAD: 'upload',
  ACCESS: 'access',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
  ALL_WORKSHOPS: 'all-workshops',
  CREATE_WORKSHOP: 'create-workshop',
  ALL_MODULES: 'all-modules',
  CREATE_MODULE: 'create-module',
  ALL_VIDEOS: 'all-videos',
  UPLOAD_VIDEO: 'upload-video',
  UPLOAD_CENTER: 'upload-center',
  UPLOAD_PROGRESS: 'upload-progress',
  MEDIA_LIBRARY: 'media-library',
  ALL_STUDENTS: 'all-students',
  ENROLLED_STUDENTS: 'enrolled-students',
  GRANT_ACCESS: 'grant-access',
  REVOKE_ACCESS: 'revoke-access',
  ANALYTICS_OVERVIEW: 'analytics-overview',
  WORKSHOP_PERFORMANCE: 'workshop-performance',
  VIDEO_ENGAGEMENT: 'video-engagement',
  ANNOUNCEMENTS: 'announcements',
  NOTIFICATIONS: 'notifications',
  ADMIN_PROFILE: 'admin-profile',
  PLATFORM_SETTINGS: 'platform-settings',
  PERMISSIONS: 'permissions',
  HELP_DESK: 'help-desk',
  FAQ_MANAGEMENT: 'faq-management',
  EDIT_WORKSHOP: 'edit-workshop',
}

const INITIAL_WORKSHOP_FORM = {
  title: '',
  slug: '',
  subtitle: '',
  description: '',
  category: 'Course',
  level: 'Beginner',
  language: 'English',
  price: '',
  discountPrice: '',
  currency: 'INR',
  isPaid: false,
  lifetimeAccess: true,
  certificateAvailable: true,
  instructorId: '',
  totalDurationMinutes: '',
  thumbnailFile: null,
  status: 'draft',
}

const INITIAL_UPLOAD_FORM = {
  workshopId: '',
  moduleId: '',
  title: '',
  description: '',
  duration: '',
  order: '',
  videoFiles: [],
  thumbnailFile: null,
}

const INITIAL_SNAPSHOT = {
  workshops: [],
  accessEntries: [],
  uploadJobs: [],
  settings: {
    profile: {
      displayName: '',
      email: '',
      designation: '',
      notificationsEmail: '',
      bio: '',
      description: '',
    },
    storage: {
      provider: 'Blob Storage',
      maxUploadMb: 1024,
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
  liveWorkshops: [],
  metrics: {
    totalWorkshops: 0,
    totalVideos: 0,
    totalStudents: 0,
    recentUploads: 0,
  },
  analytics: {
    workshopViews: [],
    topVideos: [],
    engagement: {
      totalViews: 0,
      totalCompletions: 0,
      completionRatio: 0,
    },
  },
}

const formatDateTime = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFileSize = (bytes = 0) => {
  const value = Number(bytes)
  if (!Number.isFinite(value) || value <= 0) return '0 B'

  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

const formatInr = (value = 0) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return 'INR 0'

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

const parseMoneyValue = (value) => {
  if (value === null || value === undefined) return null

  const cleaned = String(value).trim().replace(/,/g, '')
  if (!cleaned) return null

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : NaN
}

const stripFileExtension = (name = '') => {
  const index = name.lastIndexOf('.')
  if (index <= 0) return name
  return name.slice(0, index)
}

const slugifyWorkshop = (value = '') =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

const sleep = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms))

const isValidEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim())

const validateProfileSettings = (profile = {}) => {
  const displayName = String(profile.displayName || '').trim()
  const email = String(profile.email || '').trim()
  const designation = String(profile.designation || '').trim()
  const alternativeEmail = String(profile.notificationsEmail || '').trim()

  if (!displayName) return 'Display Name is required.'
  if (!email) return 'Primary Email is required.'
  if (!isValidEmail(email)) return 'Primary Email must be a valid email address.'
  if (!designation) return 'Designation is required.'
  if (!alternativeEmail) return 'Alternative Email is required.'
  if (!isValidEmail(alternativeEmail)) return 'Alternative Email must be a valid email address.'

  return ''
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthState()
  const isInstructorAdmin = user?.role === 'instructor'
  const currentInstructorId = Number.parseInt(String(user?.id ?? user?.userId ?? ''), 10)
  const panelTitle =
    isInstructorAdmin && Number.isInteger(currentInstructorId) && currentInstructorId > 0
      ? `Instructor Panel (ID: ${currentInstructorId})`
      : isInstructorAdmin
        ? 'Instructor Panel'
        : 'Super Admin Panel'

  const [activeSection, setActiveSection] = useState(() =>
    isInstructorAdmin ? SECTION_IDS.ALL_WORKSHOPS : SECTION_IDS.OVERVIEW,
  )
  const [selectedWorkshopForBuilder, setSelectedWorkshopForBuilder] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [snapshot, setSnapshot] = useState(INITIAL_SNAPSHOT)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [workshopForm, setWorkshopForm] = useState(INITIAL_WORKSHOP_FORM)
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [workshopThumbPreview, setWorkshopThumbPreview] = useState('')
  const [workshopSlugEdited, setWorkshopSlugEdited] = useState(false)
  const [workshopSearch, setWorkshopSearch] = useState('')
  const [workshopStatusFilter, setWorkshopStatusFilter] = useState('all')
  const [assignableInstructors, setAssignableInstructors] = useState([])
  const [instructorsLoading, setInstructorsLoading] = useState(false)

  const [moduleWorkshopId, setModuleWorkshopId] = useState('')
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [videoSearch, setVideoSearch] = useState('')
  const [dragModuleIndex, setDragModuleIndex] = useState(null)
  const [dragVideoIndex, setDragVideoIndex] = useState(null)

  const [accessWorkshopId, setAccessWorkshopId] = useState('')
  const [manualAccessForm, setManualAccessForm] = useState({ fullName: '', email: '', userId: '' })
  const [sourceParticipants, setSourceParticipants] = useState([])
  const [participantsLoading, setParticipantsLoading] = useState(false)

  const [uploadForm, setUploadForm] = useState(INITIAL_UPLOAD_FORM)
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState('')
  const [uploadThumbPreviewUrl, setUploadThumbPreviewUrl] = useState('')
  const [previewJobId, setPreviewJobId] = useState('')

  const [settingsDraft, setSettingsDraft] = useState(INITIAL_SNAPSHOT.settings)

  const setFlash = (message) => {
    setNotice(message)

    window.setTimeout(() => {
      setNotice((prev) => (prev === message ? '' : prev))
    }, 2800)
  }

  const loadSnapshot = async ({ silent = false } = {}) => {
    if (!silent) setLoading(true)
    setError('')

    try {
      const next = await lmsAdminService.getDashboardSnapshot()
      setSnapshot(next)
      setSettingsDraft(next.settings)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Failed to load super admin dashboard data.')
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    void loadSnapshot()
  }, [])

  useEffect(() => {
    if (!snapshot.workshops.length) {
      setModuleWorkshopId('')
      setAccessWorkshopId('')
      setUploadForm((prev) => ({ ...prev, workshopId: '', moduleId: '' }))
      return
    }

    setModuleWorkshopId((prev) => {
      const valid = snapshot.workshops.some((workshop) => workshop.id === prev)
      return valid ? prev : snapshot.workshops[0].id
    })

    setAccessWorkshopId((prev) => {
      const valid = snapshot.workshops.some((workshop) => workshop.id === prev)
      return valid ? prev : snapshot.workshops[0].id
    })

    setUploadForm((prev) => {
      const workshopId = snapshot.workshops.some((workshop) => workshop.id === prev.workshopId)
        ? prev.workshopId
        : snapshot.workshops[0].id

      const workshop = snapshot.workshops.find((item) => item.id === workshopId)
      const moduleId = workshop?.modules.some((module) => module.id === prev.moduleId)
        ? prev.moduleId
        : workshop?.modules?.[0]?.id || ''

      if (workshopId === prev.workshopId && moduleId === prev.moduleId) return prev
      return { ...prev, workshopId, moduleId }
    })
  }, [snapshot.workshops])

  useEffect(() => {
    if (!isInstructorAdmin) return

    if (!Number.isInteger(currentInstructorId) || currentInstructorId <= 0) return

    setWorkshopForm((prev) => {
      const nextId = String(currentInstructorId)
      if (String(prev.instructorId || '') === nextId) return prev
      return { ...prev, instructorId: nextId }
    })
  }, [currentInstructorId, isInstructorAdmin])

  useEffect(() => {
    if (isInstructorAdmin) {
      setAssignableInstructors([])
      setInstructorsLoading(false)
      return
    }

    let active = true

    const loadAssignableInstructors = async () => {
      setInstructorsLoading(true)
      try {
        const rows = await lmsAdminService.getAssignableInstructors()
        if (!active) return

        setAssignableInstructors(rows)
        setWorkshopForm((prev) => {
          const validCurrent = rows.some((row) => String(row.id) === String(prev.instructorId || ''))
          if (validCurrent) return prev

          const fallback = rows[0]?.id ? String(rows[0].id) : ''
          return { ...prev, instructorId: fallback }
        })
      } catch (err) {
        if (!active) return
        console.error(err)
        setAssignableInstructors([])
        setError(err?.message || 'Could not load instructor ids.')
      } finally {
        if (active) setInstructorsLoading(false)
      }
    }

    void loadAssignableInstructors()

    return () => {
      active = false
    }
  }, [isInstructorAdmin])

  useEffect(() => {
    if (!moduleWorkshopId) {
      setSelectedModuleId('')
      return
    }

    const selectedWorkshop = snapshot.workshops.find((workshop) => workshop.id === moduleWorkshopId)
    if (!selectedWorkshop) {
      setSelectedModuleId('')
      return
    }

    setSelectedModuleId((prev) => {
      const valid = selectedWorkshop.modules.some((module) => module.id === prev)
      return valid ? prev : selectedWorkshop.modules?.[0]?.id || ''
    })
  }, [moduleWorkshopId, snapshot.workshops])

  useEffect(() => {
    if (workshopSlugEdited) return

    const nextSlug = slugifyWorkshop(workshopForm.title)
    setWorkshopForm((prev) => {
      if ((prev.slug || '') === nextSlug) return prev
      return { ...prev, slug: nextSlug }
    })
  }, [workshopForm.title, workshopSlugEdited])

  useEffect(() => {
    if (!workshopForm.thumbnailFile) {
      setWorkshopThumbPreview('')
      return undefined
    }

    const preview = URL.createObjectURL(workshopForm.thumbnailFile)
    setWorkshopThumbPreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [workshopForm.thumbnailFile])

  useEffect(() => {
    if (!uploadForm.videoFiles.length) {
      setUploadPreviewUrl('')
      return undefined
    }

    const preview = URL.createObjectURL(uploadForm.videoFiles[0])
    setUploadPreviewUrl(preview)

    return () => URL.revokeObjectURL(preview)
  }, [uploadForm.videoFiles])

  useEffect(() => {
    if (!uploadForm.thumbnailFile) {
      setUploadThumbPreviewUrl('')
      return undefined
    }

    const preview = URL.createObjectURL(uploadForm.thumbnailFile)
    setUploadThumbPreviewUrl(preview)

    return () => URL.revokeObjectURL(preview)
  }, [uploadForm.thumbnailFile])

  const baseSidebarSections = useMemo(
    () => [
      {
        title: 'Dashboard',
        collapsible: false,
        items: [
          {
            id: SECTION_IDS.OVERVIEW,
            label: 'Overview',
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: 'Content Management',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.ALL_WORKSHOPS,
            label: 'All Courses',
            icon: BookOpenCheck,
            badge: snapshot.workshops.length,
          },
        ],
      },
      {
        title: 'Media Management',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.UPLOAD_CENTER,
            label: 'Upload Center',
            icon: UploadCloud,
            badge: snapshot.uploadJobs.filter((job) => job.status === 'uploading' || job.status === 'queued').length,
          },
          {
            id: SECTION_IDS.UPLOAD_PROGRESS,
            label: 'Upload Progress',
            icon: Clock3,
          },
          {
            id: SECTION_IDS.MEDIA_LIBRARY,
            label: 'Media Library',
            icon: FolderKanban,
          },
        ],
      },
      {
        title: 'Student Management',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.ALL_STUDENTS,
            label: 'All Students',
            icon: UserCheck,
          },
          {
            id: SECTION_IDS.ENROLLED_STUDENTS,
            label: 'Enrolled Students',
            icon: UserCheck,
          },
          {
            id: SECTION_IDS.GRANT_ACCESS,
            label: 'Grant Access',
            icon: CheckCircle2,
          },
          {
            id: SECTION_IDS.REVOKE_ACCESS,
            label: 'Revoke Access',
            icon: Trash2,
          },
        ],
      },
      {
        title: 'Analytics',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.ANALYTICS_OVERVIEW,
            label: 'Overview Analytics',
            icon: BarChart3,
          },
          {
            id: SECTION_IDS.WORKSHOP_PERFORMANCE,
            label: 'Course Performance',
            icon: BarChart3,
          },
          {
            id: SECTION_IDS.VIDEO_ENGAGEMENT,
            label: 'Video Engagement',
            icon: BarChart3,
          },
        ],
      },
      {
        title: 'Communication',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.ANNOUNCEMENTS,
            label: 'Announcements',
            icon: Megaphone,
          },
          {
            id: SECTION_IDS.NOTIFICATIONS,
            label: 'Notifications',
            icon: Bell,
          },
        ],
      },
      {
        title: 'System / Settings',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.ADMIN_PROFILE,
            label: 'Admin Profile',
            icon: UserCheck,
          },
          {
            id: SECTION_IDS.PLATFORM_SETTINGS,
            label: 'Platform Settings',
            icon: Settings,
          },
          {
            id: SECTION_IDS.PERMISSIONS,
            label: 'Permissions',
            icon: ShieldCheck,
          },
        ],
      },
      {
        title: 'Support',
        collapsible: true,
        items: [
          {
            id: SECTION_IDS.HELP_DESK,
            label: 'Help Desk',
            icon: Headset,
          },
          {
            id: SECTION_IDS.FAQ_MANAGEMENT,
            label: 'FAQ Management',
            icon: HelpCircle,
          },
        ],
      },
    ],
    [snapshot.workshops.length, snapshot.uploadJobs],
  )

  const sidebarSections = useMemo(() => {
    if (!isInstructorAdmin) return baseSidebarSections

    const contentSection = baseSidebarSections.find((section) => section.title === 'Content Management')
    const allCoursesItem = contentSection?.items?.find((item) => item.id === SECTION_IDS.ALL_WORKSHOPS)
    const settingsSection = baseSidebarSections.find((section) => section.title === 'System / Settings')
    const profileItem = settingsSection?.items?.find((item) => item.id === SECTION_IDS.ADMIN_PROFILE)

    const instructorSections = []

    if (profileItem) {
      instructorSections.push({
        title: 'Account',
        collapsible: true,
        items: [{ ...profileItem, label: 'Profile' }],
      })
    }

    if (allCoursesItem) {
      instructorSections.push({
        title: 'Content Management',
        collapsible: true,
        items: [allCoursesItem],
      })
    }

    return instructorSections
  }, [baseSidebarSections, isInstructorAdmin])

  useEffect(() => {
    if (!sidebarSections.length) return

    const allowedIds = new Set(
      sidebarSections.flatMap((section) => section.items?.map((item) => item.id) || []),
    )

    // Create Course and Edit Course are launched from buttons inside All Courses, not from sidebar.
    if (allowedIds.has(SECTION_IDS.ALL_WORKSHOPS)) {
      allowedIds.add(SECTION_IDS.CREATE_WORKSHOP)
      allowedIds.add(SECTION_IDS.EDIT_WORKSHOP)
    }

    if (allowedIds.has(activeSection)) return

    setActiveSection(isInstructorAdmin ? SECTION_IDS.ALL_WORKSHOPS : SECTION_IDS.OVERVIEW)
  }, [activeSection, isInstructorAdmin, sidebarSections])

  const allMenuItems = useMemo(
    () => sidebarSections.flatMap((section) => section.items),
    [sidebarSections],
  )

  const activeSectionMeta = useMemo(() => {
    if (activeSection === SECTION_IDS.CREATE_WORKSHOP) {
      return {
        id: SECTION_IDS.CREATE_WORKSHOP,
        label: 'Create Course',
      }
    }

    if (activeSection === SECTION_IDS.EDIT_WORKSHOP) {
      return {
        id: SECTION_IDS.EDIT_WORKSHOP,
        label: 'Edit Course',
      }
    }

    return allMenuItems.find((item) => item.id === activeSection) || allMenuItems[0]
  }, [activeSection, allMenuItems])

  const visibleSection = useMemo(() => {
    if (activeSection === SECTION_IDS.CREATE_WORKSHOP) return SECTION_IDS.CREATE_WORKSHOP;
    if (activeSection === SECTION_IDS.EDIT_WORKSHOP) return SECTION_IDS.EDIT_WORKSHOP;
    if (activeSection === SECTION_IDS.ALL_WORKSHOPS) return SECTION_IDS.WORKSHOPS;
    if ([SECTION_IDS.UPLOAD_CENTER, SECTION_IDS.UPLOAD_PROGRESS, SECTION_IDS.MEDIA_LIBRARY].includes(activeSection)) return SECTION_IDS.UPLOAD;
    if ([SECTION_IDS.ALL_STUDENTS, SECTION_IDS.ENROLLED_STUDENTS, SECTION_IDS.GRANT_ACCESS, SECTION_IDS.REVOKE_ACCESS].includes(activeSection)) return SECTION_IDS.ACCESS;
    if ([SECTION_IDS.ANALYTICS_OVERVIEW, SECTION_IDS.WORKSHOP_PERFORMANCE, SECTION_IDS.VIDEO_ENGAGEMENT].includes(activeSection)) return SECTION_IDS.ANALYTICS;
    if ([SECTION_IDS.ANNOUNCEMENTS, SECTION_IDS.NOTIFICATIONS].includes(activeSection)) return 'communication';
    if ([SECTION_IDS.ADMIN_PROFILE, SECTION_IDS.PLATFORM_SETTINGS, SECTION_IDS.PERMISSIONS].includes(activeSection)) return SECTION_IDS.SETTINGS;
    if ([SECTION_IDS.HELP_DESK, SECTION_IDS.FAQ_MANAGEMENT].includes(activeSection)) return 'support';
    return SECTION_IDS.OVERVIEW;
  }, [activeSection]);

  const selectedModuleWorkshop = useMemo(
    () => snapshot.workshops.find((workshop) => workshop.id === moduleWorkshopId) || null,
    [snapshot.workshops, moduleWorkshopId],
  )

  const selectedModule = useMemo(
    () => selectedModuleWorkshop?.modules.find((module) => module.id === selectedModuleId) || null,
    [selectedModuleWorkshop, selectedModuleId],
  )

  const orderedModuleVideos = useMemo(
    () => (selectedModule?.videos ? [...selectedModule.videos].sort((a, b) => a.order - b.order) : []),
    [selectedModule],
  )

  const filteredModuleVideos = useMemo(() => {
    const query = videoSearch.trim().toLowerCase()
    if (!query) return orderedModuleVideos

    return orderedModuleVideos.filter(
      (video) => video.title.toLowerCase().includes(query) || video.description.toLowerCase().includes(query),
    )
  }, [orderedModuleVideos, videoSearch])

  const filteredWorkshops = useMemo(() => {
    const query = workshopSearch.trim().toLowerCase()

    return snapshot.workshops.filter((workshop) => {
      if (workshopStatusFilter !== 'all' && workshop.status !== workshopStatusFilter) return false
      if (!query) return true

      return [
        workshop.title,
        workshop.description,
        workshop.slug,
        workshop.category,
        workshop.language,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [snapshot.workshops, workshopSearch, workshopStatusFilter])

  const orderedUploadJobs = useMemo(
    () =>
      [...snapshot.uploadJobs].sort(
        (a, b) =>
          new Date(b.startedAt || b.completedAt || 0).getTime() - new Date(a.startedAt || a.completedAt || 0).getTime(),
      ),
    [snapshot.uploadJobs],
  )

  const accessWorkshop = useMemo(
    () => snapshot.workshops.find((workshop) => workshop.id === accessWorkshopId) || null,
    [snapshot.workshops, accessWorkshopId],
  )

  const accessRows = useMemo(
    () => snapshot.accessEntries.filter((entry) => entry.workshopId === accessWorkshopId),
    [snapshot.accessEntries, accessWorkshopId],
  )

  const sourceWorkshopLabel = useMemo(() => {
    if (!accessWorkshop?.originalWorkshopId) return 'No source course linked'

    const source = snapshot.liveWorkshops.find((workshop) => String(workshop.id) === String(accessWorkshop.originalWorkshopId))
    return source ? source.title : `Source course #${accessWorkshop.originalWorkshopId}`
  }, [accessWorkshop, snapshot.liveWorkshops])

  const handleLogout = () => logoutAdmin(navigate)

  const clearWorkshopForm = () => {
    setWorkshopForm(INITIAL_WORKSHOP_FORM)
    setEditingWorkshop(null)
    setWorkshopSlugEdited(false)
    setWorkshopThumbPreview('')
  }

  const handleWorkshopThumbChange = (file) => {
    setWorkshopForm((prev) => ({ ...prev, thumbnailFile: file || null }))
  }

  const handleEditWorkshop = (workshop) => {
    setEditingWorkshop(workshop)
    setWorkshopForm({
      title: workshop.title || '',
      slug: workshop.slug || '',
      subtitle: workshop.subtitle || '',
      description: workshop.description || '',
      category: workshop.category || 'Course',
      level: workshop.level || 'Beginner',
      language: workshop.language || 'English',
      price: workshop.price != null ? String(workshop.price) : '',
      discountPrice: workshop.discountPrice != null ? String(workshop.discountPrice) : '',
      currency: workshop.currency || 'INR',
      isPaid: Boolean(workshop.isPaid || (workshop.price > 0)),
      lifetimeAccess: workshop.lifetimeAccess !== undefined ? workshop.lifetimeAccess : true,
      certificateAvailable: workshop.certificateAvailable !== undefined ? workshop.certificateAvailable : true,
      instructorId: String(workshop.instructorId || workshop.instructor_id || ''),
      totalDurationMinutes: workshop.totalDurationMinutes != null ? String(workshop.totalDurationMinutes) : '',
      thumbnailFile: null,
      status: workshop.status || 'draft',
    })
    setWorkshopSlugEdited(true)
    setWorkshopThumbPreview(workshop.thumbnailBlobUrl || workshop.thumbnailUrl || '')
    setActiveSection(SECTION_IDS.EDIT_WORKSHOP)
  }

  const handleWorkshopSubmit = async (event) => {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError('')

    try {
      const title = workshopForm.title.trim()
      const slug = workshopForm.slug.trim() || slugifyWorkshop(title)
      const category = workshopForm.category.trim()
      const level = workshopForm.level.trim()
      const language = workshopForm.language.trim()
      const instructorId = Number.parseInt(String(workshopForm.instructorId || ''), 10)

      const parsedPrice = parseMoneyValue(workshopForm.price)
      const parsedDiscount = parseMoneyValue(workshopForm.discountPrice)
      const parsedDuration = workshopForm.totalDurationMinutes === '' ? 0 : Number(workshopForm.totalDurationMinutes)

      if (!title) throw new Error('Title is required.')
      if (!slug) throw new Error('Slug is required.')
      if (!category) throw new Error('Category is required.')
      if (!level) throw new Error('Level is required.')
      if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
        throw new Error('Level must be Beginner, Intermediate, or Advanced.')
      }
      if (!language) throw new Error('Language is required.')
      if (!Number.isInteger(instructorId) || instructorId <= 0) {
        throw new Error('Valid Instructor ID is required.')
      }

      const effectiveIsPaid =
        workshopForm.isPaid ||
        (parsedPrice !== null && Number.isFinite(parsedPrice) && parsedPrice > 0) ||
        (parsedDiscount !== null && Number.isFinite(parsedDiscount) && parsedDiscount > 0)

      if (effectiveIsPaid && (parsedPrice === null || !Number.isFinite(parsedPrice))) {
        throw new Error('Price is required when Is Paid is enabled.')
      }

      if (parsedPrice !== null && (!Number.isFinite(parsedPrice) || parsedPrice < 0)) {
        throw new Error('Price must be greater than or equal to 0.')
      }

      const price = effectiveIsPaid ? (parsedPrice ?? 0) : 0

      if (parsedDiscount !== null && (!Number.isFinite(parsedDiscount) || parsedDiscount < 0)) {
        throw new Error('Discount Price must be greater than or equal to 0.')
      }

      if (parsedDiscount !== null && parsedDiscount > price) {
        throw new Error('Discount Price cannot be greater than Price.')
      }

      if (!Number.isFinite(parsedDuration) || parsedDuration < 0) {
        throw new Error('Total Duration must be greater than or equal to 0.')
      }

      const payload = {
        title,
        slug,
        subtitle: workshopForm.subtitle,
        description: workshopForm.description,
        category,
        level,
        language,
        price,
        discountPrice: parsedDiscount,
        currency: workshopForm.currency || 'INR',
        isPaid: effectiveIsPaid,
        lifetimeAccess: workshopForm.lifetimeAccess,
        certificateAvailable: workshopForm.certificateAvailable,
        instructorId,
        totalDurationMinutes: Math.round(parsedDuration),
        thumbnailFile: workshopForm.thumbnailFile || null,
        status: workshopForm.status || 'draft',
      }

      if (editingWorkshop) {
        const apiCourseId = editingWorkshop.apiCourseId
        if (!apiCourseId) throw new Error('Cannot update: missing course API id.')
        await lmsAdminService.updateWorkshopApi(apiCourseId, payload)
        setFlash('Course updated successfully.')
      } else {
        await lmsAdminService.createWorkshop(payload)
        setFlash('Course created in courses table successfully.')
      }

      clearWorkshopForm()
      await loadSnapshot({ silent: true })
      setActiveSection(SECTION_IDS.ALL_WORKSHOPS)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not save course.')
    } finally {
      setBusy(false)
    }
  }

  const handleAddModule = async (event) => {
    event.preventDefault()
    if (!moduleWorkshopId || !newModuleTitle.trim()) return

    setBusy(true)
    setError('')

    try {
      const created = await lmsAdminService.addModule(moduleWorkshopId, newModuleTitle)
      setNewModuleTitle('')
      setSelectedModuleId(created.id)
      await loadSnapshot({ silent: true })
      setFlash('Module added.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not add module.')
    } finally {
      setBusy(false)
    }
  }

  const handleRenameModule = async (module) => {
    const nextTitle = window.prompt('Rename module', module.title)
    if (!nextTitle || nextTitle.trim() === module.title) return

    setBusy(true)

    try {
      await lmsAdminService.updateModule(moduleWorkshopId, module.id, { title: nextTitle })
      await loadSnapshot({ silent: true })
      setFlash('Module renamed.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not rename module.')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteModule = async (moduleId) => {
    setBusy(true)

    try {
      await lmsAdminService.deleteModule(moduleWorkshopId, moduleId)
      await loadSnapshot({ silent: true })
      setFlash('Module removed.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not remove module.')
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteVideo = async (videoId) => {
    if (!selectedModuleId) return

    setBusy(true)

    try {
      await lmsAdminService.deleteVideo(moduleWorkshopId, selectedModuleId, videoId)
      await loadSnapshot({ silent: true })
      setFlash('Video deleted from module.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not remove video.')
    } finally {
      setBusy(false)
    }
  }

  const handleModuleDrop = async (targetIndex) => {
    if (dragModuleIndex === null || dragModuleIndex === targetIndex || !moduleWorkshopId) {
      setDragModuleIndex(null)
      return
    }

    setBusy(true)

    try {
      await lmsAdminService.reorderModules(moduleWorkshopId, dragModuleIndex, targetIndex)
      await loadSnapshot({ silent: true })
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not reorder modules.')
    } finally {
      setDragModuleIndex(null)
      setBusy(false)
    }
  }

  const handleVideoDrop = async (targetIndex) => {
    if (!selectedModuleId || dragVideoIndex === null || dragVideoIndex === targetIndex) {
      setDragVideoIndex(null)
      return
    }

    const sourceId = filteredModuleVideos[dragVideoIndex]?.id
    const targetId = filteredModuleVideos[targetIndex]?.id

    const sourceIndex = orderedModuleVideos.findIndex((video) => video.id === sourceId)
    const destinationIndex = orderedModuleVideos.findIndex((video) => video.id === targetId)

    if (sourceIndex < 0 || destinationIndex < 0) {
      setDragVideoIndex(null)
      return
    }

    setBusy(true)

    try {
      await lmsAdminService.reorderVideos(moduleWorkshopId, selectedModuleId, sourceIndex, destinationIndex)
      await loadSnapshot({ silent: true })
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not reorder videos.')
    } finally {
      setDragVideoIndex(null)
      setBusy(false)
    }
  }

  const refreshSourceParticipants = useCallback(async () => {
    if (!accessWorkshop?.originalWorkshopId) {
      setSourceParticipants([])
      return
    }

    setParticipantsLoading(true)

    try {
      const result = await lmsAdminService.getSourceParticipants(accessWorkshop.originalWorkshopId)

      if (!result.ok) {
        setSourceParticipants([])
        setError(result.message || 'Could not fetch participants from source course.')
        return
      }

      setSourceParticipants(result.participants)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not fetch source participants.')
    } finally {
      setParticipantsLoading(false)
    }
  }, [accessWorkshop?.originalWorkshopId])

  useEffect(() => {
    void refreshSourceParticipants()
  }, [refreshSourceParticipants])

  const handleSyncAccess = async () => {
    if (!accessWorkshopId) return

    setBusy(true)
    setError('')

    try {
      const result = await lmsAdminService.syncAccessFromSource(accessWorkshopId)
      await loadSnapshot({ silent: true })
      setSourceParticipants(result.participants)
      setFlash(`Synced ${result.syncedCount} participants into LMS access.`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not sync enrollments.')
    } finally {
      setBusy(false)
    }
  }

  const handleManualGrant = async (event) => {
    event.preventDefault()
    if (!accessWorkshopId) return

    setBusy(true)
    setError('')

    try {
      await lmsAdminService.grantAccess({
        workshopId: accessWorkshopId,
        sourceWorkshopId: accessWorkshop?.originalWorkshopId || null,
        fullName: manualAccessForm.fullName,
        email: manualAccessForm.email,
        userId: manualAccessForm.userId,
        source: 'manual',
      })

      setManualAccessForm({ fullName: '', email: '', userId: '' })
      await loadSnapshot({ silent: true })
      setFlash('Access granted manually.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not grant access.')
    } finally {
      setBusy(false)
    }
  }

  const handleToggleAccess = async (entry) => {
    setBusy(true)

    try {
      const nextStatus = entry.status === 'granted' ? 'revoked' : 'granted'
      await lmsAdminService.setAccessStatus(entry.id, nextStatus)
      await loadSnapshot({ silent: true })
      setFlash(nextStatus === 'granted' ? 'Access restored.' : 'Access revoked.')
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not update access status.')
    } finally {
      setBusy(false)
    }
  }

  const handleUploadSubmit = async (event) => {
    event.preventDefault()
    if (!uploadForm.workshopId || !uploadForm.moduleId || !uploadForm.videoFiles.length) {
      setError('Choose course, module, and at least one video file.')
      return
    }

    setBusy(true)
    setError('')

    try {
      const files = uploadForm.videoFiles

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        const titleBase = uploadForm.title?.trim() || stripFileExtension(file.name)
        const resolvedTitle = files.length > 1 ? `${titleBase} ${index + 1}` : titleBase

        const uploadJob = await lmsAdminService.createUploadJob({
          workshopId: uploadForm.workshopId,
          moduleId: uploadForm.moduleId,
          fileName: file.name,
          fileSize: file.size,
          status: 'queued',
          progress: 0,
          type: 'video',
        })

        for (const progress of [14, 29, 47, 63, 78, 92]) {
          await sleep(130)
          await lmsAdminService.updateUploadJob(uploadJob.id, {
            status: 'uploading',
            progress,
          })
          await loadSnapshot({ silent: true })
        }

        const videoBlobUrl = URL.createObjectURL(file)
        const thumbBlobUrl = uploadForm.thumbnailFile ? URL.createObjectURL(uploadForm.thumbnailFile) : null

        const created = await lmsAdminService.addVideo(uploadForm.workshopId, uploadForm.moduleId, {
          title: resolvedTitle,
          description: uploadForm.description,
          duration: uploadForm.duration,
          order: uploadForm.order || undefined,
          fileName: file.name,
          fileSize: file.size,
          videoBlobUrl,
          thumbnailBlobUrl: thumbBlobUrl,
          thumbnailName: uploadForm.thumbnailFile?.name || null,
        })

        await lmsAdminService.updateUploadJob(uploadJob.id, {
          status: 'completed',
          progress: 100,
          videoId: created.id,
          completedAt: new Date().toISOString(),
          previewBlobUrl: created.videoBlobUrl,
        })

        await loadSnapshot({ silent: true })
      }

      setUploadForm((prev) => ({
        ...INITIAL_UPLOAD_FORM,
        workshopId: prev.workshopId,
        moduleId: prev.moduleId,
      }))

      setFlash(`${uploadForm.videoFiles.length} upload(s) completed successfully.`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Upload failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveUploadJob = async (jobId) => {
    await lmsAdminService.removeUploadJob(jobId)
    await loadSnapshot({ silent: true })
    setFlash('Upload record removed.')
  }

  const handleSaveSettings = async (section) => {
    setError('')

    if (section === 'profile') {
      const validationError = validateProfileSettings(settingsDraft.profile)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setBusy(true)

    try {
      await lmsAdminService.updateSettings(section, settingsDraft[section])
      await loadSnapshot({ silent: true })
      setFlash(`${section} settings updated.`)
    } catch (err) {
      console.error(err)
      setError(err?.message || 'Could not update settings.')
    } finally {
      setBusy(false)
    }
  }

  const totalVideosByWorkshop = (workshop) =>
    workshop.modules.reduce((sum, module) => sum + module.videos.length, 0)

  const renderOverview = () => (
    <section className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SuperAdminMetricCard
          label="Total Courses"
          value={snapshot.metrics.totalWorkshops}
          helper="Recorded courses in LMS"
          color="bg-gradient-to-br from-cyan-900 via-cyan-800 to-cyan-900 border-cyan-700"
          accent="text-cyan-300"
        />
        <SuperAdminMetricCard
          label="Total Videos"
          value={snapshot.metrics.totalVideos}
          helper="Across all modules"
          color="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 border-indigo-700"
          accent="text-indigo-300"
        />
        <SuperAdminMetricCard
          label="Total Students"
          value={snapshot.metrics.totalStudents}
          helper="With granted access"
          color="bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 border-emerald-700"
          accent="text-emerald-300"
        />
        <SuperAdminMetricCard
          label="Recent Uploads"
          value={snapshot.metrics.recentUploads}
          helper="Completed jobs"
          color="bg-gradient-to-br from-fuchsia-900 via-fuchsia-800 to-fuchsia-900 border-fuchsia-700"
          accent="text-fuchsia-300"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Recent Uploads</h2>
            <button
              type="button"
              onClick={() => setActiveSection(SECTION_IDS.UPLOAD)}
              className="text-xs text-cyan-300 transition hover:text-cyan-200"
            >
              Open Upload Center
            </button>
          </div>

          <div className="space-y-2">
            {orderedUploadJobs.slice(0, 6).map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-md border border-[#1F1F23] px-3 py-2 text-sm">
                <div className="truncate pr-3">
                  <div className="truncate text-slate-100">{job.fileName}</div>
                  <div className="text-xs text-slate-400">{formatFileSize(job.fileSize)}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${job.status === 'completed'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : job.status === 'failed'
                        ? 'bg-rose-500/15 text-rose-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                >
                  {job.status}
                </span>
              </div>
            ))}

            {!orderedUploadJobs.length && (
              <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-6 text-center text-sm text-slate-400">
                No uploads yet. Start from Upload Center.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Activity Logs</h2>
            <Clock3 className="h-4 w-4 text-slate-500" />
          </div>

          <div className="space-y-3">
            {snapshot.activityLogs.slice(0, 8).map((log) => (
              <div key={log.id} className="rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2">
                <div className="text-sm text-white">{log.action}</div>
                <div className="text-xs text-slate-400">
                  {log.actor} • {log.target} • {formatDateTime(log.at)}
                </div>
              </div>
            ))}

            {!snapshot.activityLogs.length && (
              <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-6 text-center text-sm text-slate-400">
                Activity logs will appear here after operations.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )

  const renderAllWorkshops = () => {
    if (selectedWorkshopForBuilder) {
      return (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setSelectedWorkshopForBuilder(null)}
              className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-slate-200 transition hover:bg-zinc-800"
            >
              Back to All Courses
            </button>
          </div>

          <WorkshopBuilder
            course={selectedWorkshopForBuilder}
            onPublished={(publishedCourse) => {
              setSelectedWorkshopForBuilder((current) => {
                if (!current) return current

                return {
                  ...current,
                  ...publishedCourse,
                  status: 'published',
                  isPublished: true,
                }
              })

              void loadSnapshot({ silent: true })
            }}
          />
        </section>
      )
    }

    return (
      <section className="space-y-4">
        {snapshot.courseSync && !snapshot.courseSync.ok && (
          <div className="rounded-xl border border-amber-700/70 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            Courses table sync is currently unavailable. Please ensure backend is running and reachable.
          </div>
        )}

        <div className="p-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">All Courses</h2>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-300">
                <Search className="h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={workshopSearch}
                  onChange={(event) => setWorkshopSearch(event.target.value)}
                  placeholder="Search title, slug, category"
                  className="w-52 bg-transparent outline-none"
                />
              </label>

              <select
                value={workshopStatusFilter}
                onChange={(event) => setWorkshopStatusFilter(event.target.value)}
                className="rounded-md border border-sky-700/40 bg-zinc-900 px-3 py-2 text-sm text-slate-200 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>

              <button
                type="button"
                onClick={() => {
                  void loadSnapshot({ silent: true })
                }}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-zinc-700"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              <button
                type="button"
                onClick={() => setActiveSection(SECTION_IDS.CREATE_WORKSHOP)}
                className="inline-flex items-center gap-2 rounded-md border border-sky-500/40 bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 shadow-sm shadow-sky-500/20"
              >
                <Plus className="h-4 w-4" /> Create Course
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredWorkshops.map((workshop) => {
              const thumbnailSource = workshop.thumbnailBlobUrl || workshop.thumbnailUrl || workshop.thumbnail || null

              return (
                <article
                  key={workshop.id}
                  onClick={() => setSelectedWorkshopForBuilder(workshop)}
                  className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 shadow-sm shadow-sky-500/5 cursor-pointer hover:border-sky-500/50 hover:shadow-sky-500/10 transition-all duration-200"
                >
                  {thumbnailSource ? (
                    <img src={thumbnailSource} alt={workshop.title} className="h-36 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-36 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
                  )}

                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-sky-100">{workshop.title}</h3>
                        <div className="mt-1 truncate text-xs text-slate-400">/{workshop.slug || 'slug-not-set'}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-[11px] text-sky-200">courses table</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] ${workshop.status === 'published'
                            ? 'bg-emerald-500/15 text-emerald-200'
                            : 'bg-amber-500/15 text-amber-200'
                            }`}
                        >
                          {workshop.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>

                    <p className="line-clamp-3 text-xs text-slate-400">{workshop.description || 'No description yet.'}</p>

                    <div className="grid gap-1 text-xs text-slate-300">
                      <div>Category: {workshop.category || 'Course'} | Level: {workshop.level || 'Beginner'}</div>
                      <div>Language: {workshop.language || 'English'}</div>
                      <div>Modules: {workshop.modules.length} | Videos: {totalVideosByWorkshop(workshop)}</div>
                      <div>Instructor ID: {workshop.instructorId || workshop.instructor_id || '—'}</div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-2 text-xs text-slate-200">
                      <span className="text-emerald-200">{formatInr(workshop.price || 0)}</span>
                      <span className="text-slate-300">{workshop.enrolledStudents || 0} enrolled</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleEditWorkshop(workshop) }}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-sky-700/40 bg-sky-600/10 px-3 py-1.5 text-xs font-medium text-sky-300 transition hover:bg-sky-600/20 hover:text-sky-200"
                    >
                      <Pencil className="h-3 w-3" /> Edit Course
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {!filteredWorkshops.length && (
            <div className="mt-3 rounded-md border border-dashed border-[#2B2B30] px-3 py-8 text-center text-sm text-slate-400">
              No courses match your filter.
            </div>
          )}
        </div>
      </section>
    )
  }

  const renderCreateWorkshop = () => {
    const isEditing = Boolean(editingWorkshop)
    return (
    <section className="space-y-4">
      {snapshot.courseSync && !snapshot.courseSync.ok && (
        <div className="rounded-xl border border-amber-700/70 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Courses table sync is currently unavailable. Please ensure backend is running and reachable.
        </div>
      )}

      <div className="space-y-4">
        <div className="rounded-xl border border-sky-600/20 bg-zinc-900 p-4 shadow-xl shadow-sky-500/10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-300">{isEditing ? 'Edit Course' : 'Create Course'}</h2>
            {isEditing && (
              <button
                type="button"
                onClick={() => { clearWorkshopForm(); setActiveSection(SECTION_IDS.ALL_WORKSHOPS) }}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                ← Back to All Courses
              </button>
            )}
          </div>

          <form className="space-y-3" onSubmit={handleWorkshopSubmit}>
            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Course title
              <input
                type="text"
                value={workshopForm.title}
                onChange={(event) => setWorkshopForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Satellite Design Foundation"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                required
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Slug
                <input
                  type="text"
                  value={workshopForm.slug}
                  onChange={(event) => {
                    setWorkshopSlugEdited(true)
                    setWorkshopForm((prev) => ({ ...prev, slug: event.target.value }))
                  }}
                  placeholder="satellite-design-foundation"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Subtitle
                <input
                  type="text"
                  value={workshopForm.subtitle}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, subtitle: event.target.value }))}
                  placeholder="Structured recording track for LMS"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Description
              <textarea
                value={workshopForm.description}
                onChange={(event) => setWorkshopForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder="What this course recording covers"
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Category
                <input
                  type="text"
                  value={workshopForm.category}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, category: event.target.value }))}
                  placeholder="Course"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Level
                <select
                  value={workshopForm.level}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, level: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Language
                <input
                  type="text"
                  value={workshopForm.language}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, language: event.target.value }))}
                  placeholder="English"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  required
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Instructor ID
                {isInstructorAdmin ? (
                  <>
                    <input
                      type="text"
                      value={workshopForm.instructorId}
                      readOnly
                      className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-slate-200 outline-none"
                      required
                    />
                    <div className="mt-1 text-[11px] normal-case tracking-normal text-slate-500">
                      Auto-selected from your account id.
                    </div>
                  </>
                ) : (
                  <>
                    <select
                      value={workshopForm.instructorId}
                      onChange={(event) => setWorkshopForm((prev) => ({ ...prev, instructorId: event.target.value }))}
                      className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                      required
                      disabled={instructorsLoading || !assignableInstructors.length}
                    >
                      {!assignableInstructors.length && (
                        <option value="">{instructorsLoading ? 'Loading instructors...' : 'No instructors available'}</option>
                      )}
                      {assignableInstructors.map((instructor) => (
                        <option key={instructor.id} value={String(instructor.id)}>
                          {`${instructor.id} - ${instructor.fullName || 'Unnamed Instructor'}${instructor.email ? ` (${instructor.email})` : ''}`}
                        </option>
                      ))}
                    </select>
                    <div className="mt-1 text-[11px] normal-case tracking-normal text-slate-500">
                      Select an instructor id from active instructor accounts.
                    </div>
                  </>
                )}
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={workshopForm.price}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, price: event.target.value }))}
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Discount Price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={workshopForm.discountPrice}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, discountPrice: event.target.value }))}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Currency
                <input
                  type="text"
                  value={workshopForm.currency}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, currency: event.target.value.toUpperCase() }))}
                  placeholder="INR"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Total Duration (minutes)
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={workshopForm.totalDurationMinutes}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, totalDurationMinutes: event.target.value }))}
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-300">
                <input
                  type="checkbox"
                  checked={workshopForm.isPaid}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, isPaid: event.target.checked }))}
                  className="h-4 w-4 accent-sky-400"
                />
                Is Paid
              </label>

              <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-300">
                <input
                  type="checkbox"
                  checked={workshopForm.lifetimeAccess}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, lifetimeAccess: event.target.checked }))}
                  className="h-4 w-4 accent-sky-400"
                />
                Lifetime Access
              </label>

              <label className="flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs uppercase tracking-[0.12em] text-slate-300">
                <input
                  type="checkbox"
                  checked={workshopForm.certificateAvailable}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, certificateAvailable: event.target.checked }))}
                  className="h-4 w-4 accent-sky-400"
                />
                Certificate Available
              </label>
            </div>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Thumbnail Upload
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleWorkshopThumbChange(event.target.files?.[0])}
                className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            {workshopThumbPreview && (
              <img
                src={workshopThumbPreview}
                alt="Course thumbnail preview"
                className="h-32 w-full rounded-md border border-[#1F1F23] object-cover"
              />
            )}

            {isEditing && (
              <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
                Status
                <select
                  value={workshopForm.status}
                  onChange={(event) => setWorkshopForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </label>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:opacity-70"
            >
              {isEditing ? 'Save changes' : 'Create course in courses table'}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-sky-600/20 bg-zinc-900 p-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">Live Preview</h3>

          <div className="mt-3 rounded-md border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-sm font-semibold text-white">{workshopForm.title || 'Course title preview'}</div>
            <div className="mt-1 text-xs text-slate-400">/{workshopForm.slug || 'auto-generated-slug'}</div>
            <p className="mt-2 line-clamp-3 text-xs text-slate-400">
              {workshopForm.description || 'Your course summary will appear here.'}
            </p>

            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full bg-sky-500/15 px-2 py-0.5 text-sky-200">
                {workshopForm.category || 'Course'}
              </span>
              <span className="rounded-full bg-slate-700/20 px-2 py-0.5 text-slate-200">
                {workshopForm.level || 'Beginner'}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200">
                {workshopForm.language || 'English'}
              </span>
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">
                {workshopForm.isPaid
                  ? `${workshopForm.currency || 'INR'} ${workshopForm.price || 0}`
                  : 'Free'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
    )
  }

  const renderModules = () => (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_2fr]">
      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900 p-4 shadow-lg shadow-sky-500/5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Module Builder</h2>

          <select
            value={moduleWorkshopId}
            onChange={(event) => setModuleWorkshopId(event.target.value)}
            className="rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
          >
            {snapshot.workshops.map((workshop) => (
              <option key={workshop.id} value={workshop.id}>
                {workshop.title}
              </option>
            ))}
          </select>
        </div>

        <form className="flex flex-wrap gap-2" onSubmit={handleAddModule}>
          <input
            type="text"
            value={newModuleTitle}
            onChange={(event) => setNewModuleTitle(event.target.value)}
            placeholder="New module title"
            className="min-w-0 flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
          />

          <button
            type="submit"
            className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-3 py-2 text-sm text-slate-100 transition hover:bg-zinc-800"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        <div className="space-y-2">
          {selectedModuleWorkshop?.modules
            ?.slice()
            .sort((a, b) => a.order - b.order)
            .map((module, index) => (
              <div
                key={module.id}
                draggable
                onDragStart={() => setDragModuleIndex(index)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleModuleDrop(index)}
                onDragEnd={() => setDragModuleIndex(null)}
                className={`rounded-md border px-3 py-2 transition ${selectedModuleId === module.id
                    ? 'border-cyan-700 bg-cyan-700/10'
                    : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                  }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedModuleId(module.id)}
                  className="w-full text-left"
                >
                  <div className="truncate text-sm font-medium text-white">{module.title}</div>
                  <div className="text-xs text-slate-400">{module.videos.length} videos</div>
                </button>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRenameModule(module)}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-xs text-slate-200 transition hover:bg-zinc-800"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Rename
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteModule(module.id)}
                    className="inline-flex items-center gap-1 rounded-md border border-rose-700/60 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}

          {!selectedModuleWorkshop?.modules.length && (
            <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-6 text-center text-sm text-slate-400">
              No modules yet for this course.
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">
            {selectedModule ? `${selectedModule.title} - Videos` : 'Videos'}
          </h2>

          <div className="flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-300">
            <Search className="h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={videoSearch}
              onChange={(event) => setVideoSearch(event.target.value)}
              placeholder="Search videos"
              className="w-40 bg-transparent outline-none"
            />
          </div>
        </div>

        {selectedModule ? (
          <>
            <div className="space-y-2">
              {filteredModuleVideos.map((video, index) => (
                <div
                  key={video.id}
                  draggable
                  onDragStart={() => setDragVideoIndex(index)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleVideoDrop(index)}
                  onDragEnd={() => setDragVideoIndex(null)}
                  className="rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium text-white">{video.title}</div>
                      <div className="text-xs text-slate-400">
                        Duration: {video.duration} • {formatFileSize(video.fileSize)} • Order {video.order}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-rose-700/60 px-2 py-1 text-xs text-rose-200 transition hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>

                  {video.videoBlobUrl && (
                    <div className="mt-3 overflow-hidden rounded-md border border-[#1F1F23]">
                      <video controls className="h-40 w-full bg-black" src={video.videoBlobUrl} />
                    </div>
                  )}
                </div>
              ))}

              {!filteredModuleVideos.length && (
                <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-8 text-center text-sm text-slate-400">
                  No videos found in this module.
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setUploadForm((prev) => ({ ...prev, workshopId: moduleWorkshopId, moduleId: selectedModuleId }))
                setActiveSection(SECTION_IDS.UPLOAD)
              }}
              className="inline-flex items-center gap-2 rounded-md border border-cyan-700 px-3 py-2 text-sm text-cyan-200 transition hover:bg-cyan-500/10"
            >
              <UploadCloud className="h-4 w-4" />
              Upload new videos to this module
            </button>
          </>
        ) : (
          <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-10 text-center text-sm text-slate-400">
            Select a module to manage videos.
          </div>
        )}
      </div>
    </section>
  )

  const renderAccessControl = () => (
    <section className="space-y-4">
      <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Enrollment-Based Access Control</h2>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={accessWorkshopId}
              onChange={(event) => setAccessWorkshopId(event.target.value)}
              className="rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
            >
              {snapshot.workshops.map((workshop) => (
                <option key={workshop.id} value={workshop.id}>
                  {workshop.title}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleSyncAccess}
              disabled={busy || !accessWorkshop?.originalWorkshopId}
              className="inline-flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F] disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Sync from source course
            </button>
          </div>
        </div>

        <div className="mb-4 rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2 text-xs text-slate-400">
          Source mapping: {sourceWorkshopLabel}
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-[0.14em] text-slate-400">Current Access List</h3>

            {accessRows.map((entry) => (
              <div key={entry.id} className="rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-sm font-medium text-white">{entry.fullName || 'Unknown User'}</div>
                    <div className="text-xs text-slate-400">{entry.email}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${entry.status === 'granted'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : 'bg-rose-500/15 text-rose-300'
                        }`}
                    >
                      {entry.status}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleAccess(entry)}
                      className="rounded-md border border-[#2B2B30] px-2 py-1 text-xs text-slate-100 transition hover:bg-[#1A1A1F]"
                    >
                      {entry.status === 'granted' ? 'Revoke' : 'Grant'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {!accessRows.length && (
              <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-8 text-center text-sm text-slate-400">
                No access records yet for this course.
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3">
              <h3 className="mb-2 text-xs uppercase tracking-[0.14em] text-slate-400">Manual Grant</h3>
              <form className="space-y-2" onSubmit={handleManualGrant}>
                <input
                  type="text"
                  value={manualAccessForm.fullName}
                  onChange={(event) => setManualAccessForm((prev) => ({ ...prev, fullName: event.target.value }))}
                  placeholder="Student full name"
                  className="w-full rounded-md border border-[#2B2B30] bg-[#111115] px-3 py-2 text-sm text-white outline-none"
                  required
                />

                <input
                  type="email"
                  value={manualAccessForm.email}
                  onChange={(event) => setManualAccessForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="student@email.com"
                  className="w-full rounded-md border border-[#2B2B30] bg-[#111115] px-3 py-2 text-sm text-white outline-none"
                  required
                />

                <input
                  type="text"
                  value={manualAccessForm.userId}
                  onChange={(event) => setManualAccessForm((prev) => ({ ...prev, userId: event.target.value }))}
                  placeholder="Optional userId"
                  className="w-full rounded-md border border-[#2B2B30] bg-[#111115] px-3 py-2 text-sm text-white outline-none"
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500"
                >
                  <Plus className="h-4 w-4" /> Grant Access
                </button>
              </form>
            </div>

            <div className="rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-xs uppercase tracking-[0.14em] text-slate-400">Source Participants</h3>
                <button
                  type="button"
                  onClick={() => refreshSourceParticipants()}
                  className="text-xs text-cyan-300 transition hover:text-cyan-200"
                >
                  Refresh
                </button>
              </div>

              <div className="max-h-72 space-y-2 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {participantsLoading && <div className="text-xs text-slate-400">Loading participants...</div>}

                {!participantsLoading &&
                  sourceParticipants.slice(0, 12).map((participant) => (
                    <div key={participant.id} className="rounded-md border border-[#1F1F23] px-2 py-1.5 text-xs">
                      <div className="text-slate-200">{participant.fullName}</div>
                      <div className="text-slate-500">{participant.email}</div>
                    </div>
                  ))}

                {!participantsLoading && !sourceParticipants.length && (
                  <div className="text-xs text-slate-500">No source participants found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const renderUploadCenter = () => (
    <section className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1.2fr_2fr]">
        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Upload Video Files</h2>

          <form className="space-y-3" onSubmit={handleUploadSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Course
                <select
                  value={uploadForm.workshopId}
                  onChange={(event) => {
                    const workshopId = event.target.value
                    const workshop = snapshot.workshops.find((item) => item.id === workshopId)
                    setUploadForm((prev) => ({
                      ...prev,
                      workshopId,
                      moduleId: workshop?.modules?.[0]?.id || '',
                    }))
                  }}
                  className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
                >
                  {snapshot.workshops.map((workshop) => (
                    <option key={workshop.id} value={workshop.id}>
                      {workshop.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Module
                <select
                  value={uploadForm.moduleId}
                  onChange={(event) => setUploadForm((prev) => ({ ...prev, moduleId: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
                >
                  {(snapshot.workshops.find((workshop) => workshop.id === uploadForm.workshopId)?.modules || []).map(
                    (module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Video Title
              <input
                type="text"
                value={uploadForm.title}
                onChange={(event) => setUploadForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="Lecture title"
                className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
              />
            </label>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Description
              <textarea
                value={uploadForm.description}
                onChange={(event) => setUploadForm((prev) => ({ ...prev, description: event.target.value }))}
                rows={3}
                placeholder="Video summary"
                className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Duration
                <input
                  type="text"
                  value={uploadForm.duration}
                  onChange={(event) => setUploadForm((prev) => ({ ...prev, duration: event.target.value }))}
                  placeholder="e.g. 18:40"
                  className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
                />
              </label>

              <label className="text-xs uppercase tracking-[0.14em] text-slate-400">
                Sequence Order
                <input
                  type="number"
                  min="1"
                  value={uploadForm.order}
                  onChange={(event) => setUploadForm((prev) => ({ ...prev, order: event.target.value }))}
                  placeholder="Auto"
                  className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
                />
              </label>
            </div>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Video File (bulk upload supported)
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(event) => setUploadForm((prev) => ({ ...prev, videoFiles: Array.from(event.target.files || []) }))}
                className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-slate-200"
              />
            </label>

            <label className="block text-xs uppercase tracking-[0.14em] text-slate-400">
              Thumbnail File
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setUploadForm((prev) => ({ ...prev, thumbnailFile: event.target.files?.[0] || null }))}
                className="mt-1 w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-slate-200"
              />
            </label>

            {uploadPreviewUrl && (
              <div className="space-y-2 rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3">
                <div className="text-xs text-slate-400">Preview before publish</div>
                <video src={uploadPreviewUrl} controls className="h-40 w-full rounded-md bg-black" />
              </div>
            )}

            {uploadThumbPreviewUrl && (
              <img src={uploadThumbPreviewUrl} alt="Thumbnail preview" className="h-24 w-full rounded-md border border-[#1F1F23] object-cover" />
            )}

            {uploadForm.videoFiles.length > 1 && (
              <div className="rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2 text-xs text-slate-300">
                {uploadForm.videoFiles.length} files selected. They will be uploaded sequentially.
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:opacity-70"
            >
              <UploadCloud className="h-4 w-4" /> Start Upload
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Upload Jobs</h2>

          <div className="space-y-2">
            {orderedUploadJobs.map((job) => {
              const linkedVideo = snapshot.workshops
                .flatMap((workshop) => workshop.modules)
                .flatMap((module) => module.videos)
                .find((video) => video.id === job.videoId)

              const previewSource = job.previewBlobUrl || linkedVideo?.videoBlobUrl || null

              return (
                <div key={job.id} className="rounded-md border border-[#1F1F23] bg-[#0F0F12] p-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{job.fileName}</div>
                      <div className="text-xs text-slate-400">
                        {formatFileSize(job.fileSize)} • {formatDateTime(job.startedAt)}
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${job.status === 'completed'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : job.status === 'failed'
                            ? 'bg-rose-500/15 text-rose-300'
                            : 'bg-amber-500/15 text-amber-300'
                        }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#1F1F23]">
                    <div
                      className={`h-full transition-all ${job.status === 'completed'
                          ? 'bg-emerald-500'
                          : job.status === 'failed'
                            ? 'bg-rose-500'
                            : 'bg-cyan-500'
                        }`}
                      style={{ width: `${Math.min(100, Math.max(0, Number(job.progress || 0)))}%` }}
                    />
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400">Progress: {Math.min(100, Math.max(0, Number(job.progress || 0)))}%</div>

                    <div className="flex gap-2">
                      {previewSource && (
                        <button
                          type="button"
                          onClick={() => setPreviewJobId((prev) => (prev === job.id ? '' : job.id))}
                          className="rounded-md border border-[#2B2B30] px-2 py-1 text-slate-100 transition hover:bg-[#1A1A1F]"
                        >
                          {previewJobId === job.id ? 'Hide preview' : 'Preview'}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveUploadJob(job.id)}
                        className="rounded-md border border-rose-700/60 px-2 py-1 text-rose-200 transition hover:bg-rose-500/10"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  {previewJobId === job.id && previewSource && (
                    <div className="mt-2 overflow-hidden rounded-md border border-[#1F1F23]">
                      <video src={previewSource} controls className="h-40 w-full bg-black" />
                    </div>
                  )}
                </div>
              )
            })}

            {!orderedUploadJobs.length && (
              <div className="rounded-md border border-dashed border-[#2B2B30] px-3 py-8 text-center text-sm text-slate-400">
                Upload queue is empty.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )

  const renderAnalytics = () => {
    const workshopViews = snapshot.analytics.workshopViews || []
    const maxViews = Math.max(1, ...workshopViews.map((entry) => entry.views))

    return (
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <SuperAdminMetricCard
            label="Total Views"
            value={snapshot.analytics.engagement.totalViews}
            helper="From top videos"
          />
          <SuperAdminMetricCard
            label="Completions"
            value={snapshot.analytics.engagement.totalCompletions}
            helper="Finished watch counts"
          />
          <SuperAdminMetricCard
            label="Completion Ratio"
            value={`${snapshot.analytics.engagement.completionRatio}%`}
            helper="Student engagement"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Views per Course</h2>

            <div className="space-y-3">
              {workshopViews.map((entry) => (
                <div key={entry.workshopId}>
                  <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
                    <span className="truncate pr-3">{entry.title}</span>
                    <span>{entry.views}</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-[#1F1F23]">
                    <div
                      className="h-full rounded-full bg-cyan-500"
                      style={{ width: `${Math.max(6, (entry.views / maxViews) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}

              {!workshopViews.length && <div className="text-sm text-slate-400">No analytics data yet.</div>}
            </div>
          </div>

          <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Most Watched Videos</h2>

            <div className="space-y-2">
              {(snapshot.analytics.topVideos || []).map((video, index) => (
                <div key={video.id} className="rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div className="truncate pr-3 text-sm text-white">
                      {index + 1}. {video.title}
                    </div>
                    <div className="text-xs text-slate-400">{video.views} views</div>
                  </div>
                  <div className="text-xs text-slate-500">{video.workshopTitle}</div>
                </div>
              ))}

              {!snapshot.analytics.topVideos?.length && <div className="text-sm text-slate-400">No video insights available.</div>}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const renderCommunication = () => (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Announcements</h2>
          <p className="text-sm text-slate-400">Create and publish announcements for students, course attendees, and staff.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]">
            <Megaphone className="h-4 w-4" /> Create announcement
          </button>
        </div>

        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Notifications</h2>
          <p className="text-sm text-slate-400">Manage notification channels and future alert preferences.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]">
            <Bell className="h-4 w-4" /> Review notifications
          </button>
        </div>
      </div>
    </section>
  )

  const renderSupport = () => (
    <section className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Help Desk</h2>
          <p className="text-sm text-slate-400">Review incoming help requests and prioritize student support tickets.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]">
            <Headset className="h-4 w-4" /> Open help desk
          </button>
        </div>

        <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">FAQ Management</h2>
          <p className="text-sm text-slate-400">Maintain student-facing FAQs for the LMS and course platform.</p>
          <button className="mt-4 inline-flex items-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]">
            <HelpCircle className="h-4 w-4" /> Edit FAQs
          </button>
        </div>
      </div>
    </section>
  )


  const renderSettings = () => (
    <section className="space-y-6">
      {/* <div className="rounded-3xl border border-[#111827] bg-[#0b1123] p-6"> */}
        {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"> */}
          {/* <div> */}
            {/* <h2 className="text-2xl font-semibold text-slate-100">{isInstructorAdmin ? 'Instructor Profile' : 'Admin Profile'}</h2> */}
            {/* <p className="mt-2 max-w-2xl text-sm text-slate-400">Update your instructor profile with a professional bio, clear description, and the correct notification email. This section now spans the full width of the admin page.</p> */}
          {/* </div> */}
          {/* <div className="rounded-2xl bg-[#111827] px-4 py-2 text-sm text-slate-300">Profile section</div> */}
        {/* </div> */}
      {/* </div> */}

      <div className="rounded-3xl border border-[#1F1F23] bg-[#09090c] p-6 shadow-[0_20px_60px_-40px_rgba(14,165,233,0.35)]">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] items-start">
          <div className="rounded-3xl border border-slate-800 bg-[#0f172a] p-5 text-center">
            <ProfileAvatar name={settingsDraft.profile.displayName} size={82} />
            <div className="mt-4">
              <div className="text-sm font-semibold text-slate-200">{settingsDraft.profile.displayName || 'Instructor name'}</div>
              <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                {settingsDraft.profile.designation || 'Designation'}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-400">
              Add a short bio and a longer description to make your instructor profile feel complete and professional.
            </p>
            <div className="mt-5 space-y-2 rounded-2xl border border-slate-800 bg-[#111827] p-4 text-left text-xs text-slate-400">
              <div className="font-semibold text-slate-200">Profile tips</div>
              <div>• Keep the bio concise and learner focused.</div>
              <div>• Use description to share your teaching strengths and course style.</div>
              <div>• Update emails if you want notifications delivered to a different address.</div>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">{isInstructorAdmin ? 'Instructor Profile' : 'Admin Profile'}</h2>
              <p className="mt-1 text-sm text-slate-400">Use these fields to personalize the instructor experience and keep your account details accurate.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-200">
                Full Name <span className="text-rose-400">*</span>
                <input
                  type="text"
                  required
                  value={settingsDraft.profile.displayName}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, displayName: event.target.value },
                    }))
                  }
                  placeholder="Display name"
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Primary Email <span className="text-rose-400">*</span>
                <input
                  type="email"
                  required
                  value={settingsDraft.profile.email}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, email: event.target.value },
                    }))
                  }
                  placeholder="Primary email"
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm text-slate-200">
                Designation <span className="text-rose-400">*</span>
                <input
                  type="text"
                  required
                  value={settingsDraft.profile.designation}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, designation: event.target.value },
                    }))
                  }
                  placeholder="Title or role"
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>

              <label className="block text-sm text-slate-200">
                Alternative Email <span className="text-rose-400">*</span>
                <input
                  type="email"
                  required
                  value={settingsDraft.profile.notificationsEmail}
                  onChange={(event) =>
                    setSettingsDraft((prev) => ({
                      ...prev,
                      profile: { ...prev.profile, notificationsEmail: event.target.value },
                    }))
                  }
                  placeholder="Alternative email"
                  className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
                />
              </label>
            </div>

            <label className="block text-sm text-slate-200">
              Short Bio
              <textarea
                rows={3}
                value={settingsDraft.profile.bio}
                onChange={(event) =>
                  setSettingsDraft((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, bio: event.target.value },
                  }))
                }
                placeholder="Write a short bio that explains your teaching style..."
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <label className="block text-sm text-slate-200">
              Profile Description
              <textarea
                rows={5}
                value={settingsDraft.profile.description}
                onChange={(event) =>
                  setSettingsDraft((prev) => ({
                    ...prev,
                    profile: { ...prev.profile, description: event.target.value },
                  }))
                }
                placeholder="Describe your course strengths, expertise, and what learners can expect."
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-[#0f172a] px-4 py-3 text-sm text-white outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              />
            </label>

            <button
              type="button"
              onClick={() => handleSaveSettings('profile')}
              disabled={busy}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 shadow-lg shadow-sky-500/20"
            >
              <CheckCircle2 className="h-5 w-5" /> Save Profile
            </button>
          </div>
        </div>
      </div>

      {activeSection !== SECTION_IDS.ADMIN_PROFILE && !isInstructorAdmin && (
      <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Media Storage</h2>

        <div className="space-y-2">
          <input
            type="text"
            value={settingsDraft.storage.provider}
            readOnly
            className="w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-slate-300 outline-none"
          />

          <input
            type="number"
            min="100"
            value={settingsDraft.storage.maxUploadMb}
            onChange={(event) =>
              setSettingsDraft((prev) => ({
                ...prev,
                storage: { ...prev.storage, maxUploadMb: Number(event.target.value) || 0 },
              }))
            }
            placeholder="Max upload MB"
            className="w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
          />

          <input
            type="text"
            value={settingsDraft.storage.allowedFormats}
            onChange={(event) =>
              setSettingsDraft((prev) => ({
                ...prev,
                storage: { ...prev.storage, allowedFormats: event.target.value },
              }))
            }
            placeholder="Allowed formats"
            className="w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
          />

          <input
            type="number"
            min="1"
            value={settingsDraft.storage.retentionDays}
            onChange={(event) =>
              setSettingsDraft((prev) => ({
                ...prev,
                storage: { ...prev.storage, retentionDays: Number(event.target.value) || 1 },
              }))
            }
            placeholder="Retention days"
            className="w-full rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings('storage')}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]"
        >
          <CheckCircle2 className="h-4 w-4" /> Save storage
        </button>
      </div>
      )}

      {activeSection !== SECTION_IDS.ADMIN_PROFILE && !isInstructorAdmin && (
      <div className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Permissions</h2>

        <div className="space-y-2 text-sm text-slate-200">
          <label className="flex items-center gap-2 rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2">
            <input
              type="checkbox"
              checked={settingsDraft.permissions.allowManualAccessGrant}
              onChange={(event) =>
                setSettingsDraft((prev) => ({
                  ...prev,
                  permissions: { ...prev.permissions, allowManualAccessGrant: event.target.checked },
                }))
              }
            />
            Allow manual access grant
          </label>

          <label className="flex items-center gap-2 rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2">
            <input
              type="checkbox"
              checked={settingsDraft.permissions.enableMultiAdminPreview}
              onChange={(event) =>
                setSettingsDraft((prev) => ({
                  ...prev,
                  permissions: { ...prev.permissions, enableMultiAdminPreview: event.target.checked },
                }))
              }
            />
            Enable multi-admin preview mode
          </label>

          <label className="flex items-center gap-2 rounded-md border border-[#1F1F23] bg-[#0F0F12] px-3 py-2">
            <input
              type="checkbox"
              checked={settingsDraft.permissions.writeAuditLog}
              onChange={(event) =>
                setSettingsDraft((prev) => ({
                  ...prev,
                  permissions: { ...prev.permissions, writeAuditLog: event.target.checked },
                }))
              }
            />
            Keep audit logs enabled
          </label>
        </div>

        <button
          type="button"
          onClick={() => handleSaveSettings('permissions')}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#2B2B30] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F]"
        >
          <CheckCircle2 className="h-4 w-4" /> Save permissions
        </button>
      </div>
      )}
    </section>
  )

  const renderSection = () => {
    if (visibleSection === SECTION_IDS.CREATE_WORKSHOP) return renderCreateWorkshop();
    if (visibleSection === SECTION_IDS.EDIT_WORKSHOP) return renderCreateWorkshop();
    if (visibleSection === SECTION_IDS.WORKSHOPS) return renderAllWorkshops();
    if (visibleSection === SECTION_IDS.MODULES) return renderModules();
    if (visibleSection === SECTION_IDS.UPLOAD) return renderUploadCenter();
    if (visibleSection === SECTION_IDS.ACCESS) return renderAccessControl();
    if (visibleSection === SECTION_IDS.ANALYTICS) return renderAnalytics();
    if (visibleSection === SECTION_IDS.SETTINGS) return renderSettings();
    if (visibleSection === 'communication') return renderCommunication();
    if (visibleSection === 'support') return renderSupport();
    return renderOverview();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-slate-200">
        {isInstructorAdmin ? 'Loading instructor dashboard...' : 'Loading super admin dashboard...'}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="flex min-h-screen">
        <SuperAdminSidebar
          sections={sidebarSections}
          activeSection={activeSection}
          onChange={setActiveSection}
          onLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          panelTitle={panelTitle}
        />

        <div className="flex min-h-screen flex-1 flex-col lg:pl-72">
          <SuperAdminTopbar
            title={activeSectionMeta?.label || `${isInstructorAdmin ? 'Instructor' : 'Super Admin'} Dashboard`}
            subtitle="Recorded courses LMS control panel"
            onMenuClick={() => setIsSidebarOpen(true)}
            notifications={snapshot.uploadJobs.filter((job) => job.status === 'uploading' || job.status === 'queued').length}
            userName={user?.name || user?.email || (isInstructorAdmin ? 'Instructor' : 'Super Admin')}
            onLogout={handleLogout}
          />

          <main className="flex-1 space-y-4 p-4 sm:p-6">
            {error && (
              <div className="rounded-md border border-rose-700/70 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}

            {notice && (
              <div className="rounded-md border border-emerald-700/70 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                {notice}
              </div>
            )}

            {/* <div className="rounded-xl border border-[#1F1F23] bg-[#111115] px-4 py-3 text-xs text-slate-400">
              Controls include course CRUD, module/video structure, enrollment-based access, upload queue, analytics,
              and storage/permission settings.
            </div> */}

            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminDashboard

