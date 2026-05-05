import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiPlay, FiPause, FiStar, FiDownload, FiCheck, FiClock, FiGlobe, FiLayers, FiUser, FiAward } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { footerColumns } from '../data/homeData'
import { publicCourseService } from '../services/publicCourseService'

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(String(value || ''))
  } catch {
    return String(value || '')
  }
}

const buildModules = (course) => {
  if (!course) return []

  const fallbackThumb = course.videoPreview
  const modules = course.courseContent || []
  return modules.map((module, moduleIndex) => {
    const lessons = (module.lectures || []).map((lecture, lessonIndex) => ({
      id: `${moduleIndex + 1}-${lessonIndex + 1}`,
      title: lecture.title,
      duration: lecture.duration || '3 min',
      thumbnail: lecture.thumbnail || fallbackThumb || '',
      youtubeUrl: lecture.youtubeUrl || '',
      resources: [
        { type: 'pdf', title: 'Notes', link: '#' },
        { type: 'link', title: 'Reference', link: '#' },
      ],
    }))
    return {
      id: `module-${moduleIndex + 1}`,
      title: module.title,
      lessons,
    }
  })
}

const loadCompleted = (courseId) => {
  try {
    const raw = localStorage.getItem(`completedLessons_${courseId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const saveCompleted = (courseId, completed) => {
  localStorage.setItem(`completedLessons_${courseId}`, JSON.stringify(completed))
}

const TabButton = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative px-3 pb-3 pt-2 text-sm font-semibold transition ${
      active ? 'text-white' : 'text-slate-300 hover:text-white'
    }`}
  >
    {label}
    <span
      className={`pointer-events-none absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-indigo-500 transition-opacity duration-200 ${
        active ? 'opacity-100' : 'opacity-0'
      }`}
    />
  </button>
)

const getEmbedUrl = (url) => {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)
  if (match && match[1]) {
    // Adding multiple params to restrict the player:
    // rel=0 (no related videos from other channels)
    // modestbranding=1 (removes YouTube logo)
    // iv_load_policy=3 (removes annotations)
    // fs=1 (allows full screen)
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&fs=1`
  }
  return url
}

const Learn = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const decodedCourseId = safeDecodeURIComponent(courseId)

  const [course, setCourse] = useState(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [courseError, setCourseError] = useState('')

  const progressKey = useMemo(
    () => String(course?.slug || course?.apiCourseId || decodedCourseId || ''),
    [course?.apiCourseId, course?.slug, decodedCourseId],
  )

  const [selectedLesson, setSelectedLesson] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedLessons, setCompletedLessons] = useState(() => loadCompleted(progressKey || decodedCourseId))
  const [openModules, setOpenModules] = useState([])
  const [activeTab, setActiveTab] = useState('Overview')
  const [openResourceLessonId, setOpenResourceLessonId] = useState(null)
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  useEffect(() => {
    let active = true

    const loadCourse = async () => {
      setLoadingCourse(true)

      try {
        const fullCourse = await publicCourseService.getCourseFullByIdentifier(decodedCourseId)
        if (!active) return

        setCourse({
          ...fullCourse,
          courseId: fullCourse.slug || fullCourse.courseId,
        })
        setCourseError('')
      } catch (error) {
        if (!active) return

        setCourse(null)
        setCourseError(error?.message || 'Could not load this course right now.')
      } finally {
        if (active) {
          setLoadingCourse(false)
        }
      }
    }

    void loadCourse()

    return () => {
      active = false
    }
  }, [decodedCourseId])

  useEffect(() => {
    setCompletedLessons(loadCompleted(progressKey || decodedCourseId))
  }, [progressKey, decodedCourseId])

  const modules = useMemo(() => buildModules(course), [course])

  const totalMinutes = useMemo(() => {
    const content = course?.courseContent || []
    return content.reduce(
      (sum, section) =>
        sum + (section.lectures || []).reduce((acc, lecture) => acc + (lecture.durationMinutes || 0), 0),
      0
    )
  }, [course])

  const formatDuration = (minutes) => {
    if (!minutes || Number.isNaN(minutes)) return '—'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (!hours) return `${mins}m`
    return `${hours}h ${mins.toString().padStart(2, '0')}m`
  }

  const formattedDuration = formatDuration(totalMinutes)
  const level = course?.level || 'All levels'
  const categories = course?.categories || course?.relatedTopics || []

  useEffect(() => {
    if (modules.length) {
      setSelectedLesson(modules[0].lessons[0])
      setOpenModules([modules[0].id])
      setIsPlaying(false)
    }
  }, [modules])

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson)
    setOpenResourceLessonId(null)
    setIsPlaying(true)
  }

  const toggleComplete = (lessonId) => {
    setCompletedLessons((prev) => {
      const exists = prev.includes(lessonId)
      const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      saveCompleted(progressKey || decodedCourseId, next)
      return next
    })
  }

  const toggleModule = (moduleId) => {
    setOpenResourceLessonId(null)
    setOpenModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <LearnPageSkeleton />
        <Footer columns={footerColumns} />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto mt-6 max-w-6xl px-4 py-8 text-slate-300">
          <p>{courseError || 'Course not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/my-learning')}
            className="mt-4 rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-indigo-500"
          >
            Back to My Learning
          </button>
        </main>
        <Footer columns={footerColumns} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto mt-6 max-w-[90rem] px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg group">
            {selectedLesson ? (
              selectedLesson.youtubeUrl && isPlaying ? (
                <div className="relative w-full bg-black" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    key={selectedLesson.id}
                    src={getEmbedUrl(selectedLesson.youtubeUrl)}
                    title={selectedLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute left-0 top-0 h-full w-full border-none"
                  />
                  {/* Invisible shield to block the top bar (Title, Share, Watch Later) from being clicked */}
                  <div className="absolute left-0 right-0 top-0 z-10 h-16" onContextMenu={(e) => e.preventDefault()} />
                  {/* Invisible shield to block the bottom right YouTube logo click */}
                  <div className="absolute bottom-0 right-0 z-10 h-12 w-24" onContextMenu={(e) => e.preventDefault()} />
                </div>
              ) : selectedLesson.thumbnail ? (
                <div 
                  className="relative cursor-pointer" 
                  onClick={() => selectedLesson.youtubeUrl && setIsPlaying(true)}
                >
                  <img
                    key={selectedLesson.id}
                    src={selectedLesson.thumbnail}
                    alt={selectedLesson.title}
                    className="w-full object-cover transition duration-300 group-hover:brightness-75"
                    style={{ aspectRatio: '16 / 9' }}
                  />
                  {selectedLesson.youtubeUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-80 transition group-hover:opacity-100 group-hover:scale-110">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl backdrop-blur-sm">
                        <FiPlay className="ml-1 h-8 w-8" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex w-full items-center justify-center bg-slate-800" style={{ aspectRatio: '16 / 9' }}>
                  {selectedLesson.youtubeUrl && (
                    <button 
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600/90 text-white shadow-xl transition hover:scale-110"
                    >
                      <FiPlay className="ml-1 h-8 w-8" />
                    </button>
                  )}
                </div>
              )
            ) : (
              <div className="w-full bg-slate-800" style={{ aspectRatio: '16 / 9' }} />
            )}
            
            {(!selectedLesson || !selectedLesson.youtubeUrl || !isPlaying) && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-4 py-3 text-sm">
                <div className="flex items-center gap-3">
                  <button 
                    type="button" 
                    onClick={() => selectedLesson?.youtubeUrl && setIsPlaying(true)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition hover:bg-indigo-600 hover:text-white"
                  >
                    <FiPlay />
                  </button>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedLesson?.title || 'Select a lesson'}</p>
                    <p className="text-xs text-slate-300">{selectedLesson?.duration || ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/20">
                    <div className="h-full w-1/3 bg-indigo-400" />
                  </div>
                  <FiPause />
                </div>
              </div>
            )}
            </div>

            <div className="relative flex flex-wrap gap-4 pb-2">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-800" />
              {['Overview', 'FAQ', 'Discussion', 'Reviews'].map((tab) => (
                <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
              ))}
            </div>

          {activeTab === 'Overview' && (
            <div className="space-y-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-200">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-white">{course.title}</h2>
                {course.subtitle && <p className="text-sm text-slate-300">{course.subtitle}</p>}
              </div>

              <div className="space-y-2 text-sm leading-relaxed text-slate-200">
                <p>
                  {isDescExpanded || (course.description || '').length <= 420
                    ? course.description
                    : `${(course.description || '').slice(0, 420)}...`}
                </p>
                {(course.description || '').length > 420 && (
                  <button
                    type="button"
                    className="text-xs font-semibold text-indigo-300 hover:text-indigo-200"
                    onClick={() => setIsDescExpanded((v) => !v)}
                  >
                    {isDescExpanded ? 'See Less' : 'See More'}
                  </button>
                )}
              </div>

              <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">What you will learn</h3>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {(course.whatYouWillLearn || []).map((item) => (
                      <li key={item} className="flex gap-2">
                        <FiCheck className="mt-0.5 text-emerald-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">Course details</h3>
                  <div className="space-y-2 text-sm text-slate-200">
                    <div className="flex items-center gap-2"><FiClock className="text-indigo-300" /> Duration: {formattedDuration}</div>
                    <div className="flex items-center gap-2"><FiLayers className="text-indigo-300" /> Level: {level}</div>
                    <div className="flex items-center gap-2"><FiGlobe className="text-indigo-300" /> Language: {course.language || 'English'}</div>
                    <div className="flex items-center gap-2"><FiAward className="text-indigo-300" /> Last updated: {course.lastUpdated || '—'}</div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 rounded-lg border border-slate-800 bg-slate-950/60 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">Instructor</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <FiUser className="text-indigo-300" />
                    <span>{course.instructorProfile?.name || course.instructor}</span>
                  </div>
                  {course.instructorProfile?.bioShort && (
                    <p className="text-xs text-slate-400">{course.instructorProfile.bioShort}</p>
                  )}
                  <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                    {course.instructorProfile?.rating && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1"><FiStar className="text-amber-300" /> {course.instructorProfile.rating}</span>
                    )}
                    {course.instructorProfile?.students && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2 py-1">{course.instructorProfile.students} students</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-white">Course includes</h3>
                  <ul className="space-y-2 text-sm text-slate-200">
                    {(course.includes || []).map((item) => (
                      <li key={item} className="flex gap-2">
                        <FiCheck className="mt-0.5 text-indigo-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {(course.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-indigo-900/40 px-3 py-1 text-indigo-200">{tag}</span>
                ))}
                {categories.map((cat) => (
                  <span key={cat} className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">{cat}</span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'FAQ' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <div className="space-y-2">
                {[{
                  q: 'How long do I keep access?',
                  a: 'You get lifetime access, including future updates.'
                }, {
                  q: 'Do I need prior experience?',
                  a: 'No, the course is built for all levels with fundamentals included.'
                }, {
                  q: 'Are resources downloadable?',
                  a: 'Yes, notes and reference links are provided per lesson where available.'
                }, {
                  q: 'Can I learn on mobile?',
                  a: 'Yes, the player and materials are mobile-friendly.'
                }].map((item, idx) => (
                  <details key={item.q} className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3" open={idx === 0}>
                    <summary className="flex cursor-pointer items-center justify-between text-sm font-semibold text-white">
                      {item.q}
                      <FiChevronDown className="text-xs text-slate-400" />
                    </summary>
                    <p className="mt-2 text-xs text-slate-300">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Discussion' && (
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <div>
                <input
                  placeholder="Start a discussion"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
                <p className="mt-1 text-xs text-slate-400">Enrolled learners can chat, share notes, and reply.</p>
              </div>

              <div className="space-y-3">
                {[{
                  user: 'Aanya',
                  time: '2h ago',
                  message: 'Share your mission ops checklist templates.'
                }, {
                  user: 'Noah',
                  time: '5h ago',
                  message: 'Post your telemetry dashboard screenshots.'
                }, {
                  user: 'Ritesh',
                  time: '1d ago',
                  message: 'Any tips for TLE-driven ground pass planning?'
                }].map((thread) => (
                  <div key={thread.message} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-700 text-[11px] font-semibold text-white">
                        {thread.user.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="text-slate-200 font-semibold">{thread.user}</span>
                      <span>•</span>
                      <span>{thread.time}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-100">{thread.message}</p>
                    <div className="mt-3 flex gap-2 text-xs text-indigo-300">
                      <button type="button" className="rounded-full bg-indigo-900/40 px-3 py-1 transition hover:bg-indigo-800/40">Reply</button>
                      <button type="button" className="rounded-full bg-slate-800 px-3 py-1 transition hover:bg-slate-700">Follow</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} />
                  ))}
                </div>
                <span className="text-sm text-white">4.8 • 18,000 reviews</span>
                <div className="flex gap-2 text-xs">
                  {['All', '5★', '4★', 'Recent'].map((filter) => (
                    <button key={filter} type="button" className="rounded-full border border-slate-700 px-3 py-1 text-slate-200 transition hover:border-indigo-400">
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {[{
                  user: 'Mira K.',
                  rating: 5,
                  text: 'Detailed FDIR examples made it click.',
                  time: '2 days ago'
                }, {
                  user: 'Elena S.',
                  rating: 5,
                  text: 'Great pacing and mission-ready artifacts.',
                  time: '1 week ago'
                }, {
                  user: 'Carlos M.',
                  rating: 4,
                  text: 'Would love more deep dives on ground pass scheduling.',
                  time: '2 weeks ago'
                }].map((review) => (
                  <div key={review.user + review.text} className="rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-white">
                          {review.user.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-slate-200 font-semibold">{review.user}</span>
                      </div>
                      <span>{review.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-amber-300">
                      {[...Array(review.rating)].map((_, i) => (
                        <FiStar key={i} />
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-slate-100">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col rounded-xl border border-slate-800 bg-slate-900/50 p-4 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Course Content</h2>
                <span className="text-xs font-medium text-slate-400">{modules.length} Modules</span>
              </div>
              
              <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto pr-2">
                {modules.map((module) => (
                  <div key={module.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 transition-colors hover:border-slate-700">
                    <button
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className="flex w-full items-center justify-between bg-slate-800/30 px-4 py-3 text-left text-sm font-semibold text-white transition hover:bg-slate-800/50"
                    >
                      <span className="pr-4">{module.title}</span>
                      <FiChevronDown
                        className={`shrink-0 text-slate-400 transition-transform duration-300 ${openModules.includes(module.id) ? 'rotate-180 text-white' : ''}`}
                      />
                    </button>
                    {openModules.includes(module.id) && (
                      <div className="divide-y divide-slate-800/60 bg-slate-900/40">
                        {module.lessons.map((lesson) => {
                          const isActive = selectedLesson?.id === lesson.id
                          const completed = completedLessons.includes(lesson.id)
                          return (
                            <div
                              key={lesson.id}
                              className={`group relative flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-800/60 ${
                                isActive ? 'bg-indigo-900/20' : ''
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                <label className="relative flex cursor-pointer items-center justify-center rounded-full">
                                  <input
                                    type="checkbox"
                                    checked={completed}
                                    onChange={() => toggleComplete(lesson.id)}
                                    className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-slate-600 bg-slate-800/50 transition-all checked:border-indigo-500 checked:bg-indigo-500 hover:border-indigo-400"
                                  />
                                  <FiCheck className="pointer-events-none absolute h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                </label>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => handleLessonClick(lesson)}
                                className="flex-1 text-left"
                              >
                                <div className={`font-medium transition-colors ${isActive ? 'text-indigo-300' : 'text-slate-200 group-hover:text-white'}`}>
                                  {lesson.title}
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                                  <FiPlay className={isActive ? 'text-indigo-400' : ''} />
                                  <span>{lesson.duration}</span>
                                </div>
                              </button>

                              {lesson.resources?.length > 0 && (
                                <div className="relative shrink-0" onMouseLeave={() => setOpenResourceLessonId(null)}>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setOpenResourceLessonId((prev) => (prev === lesson.id ? null : lesson.id))
                                    }}
                                    className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-800 hover:text-white"
                                    title="Resources"
                                  >
                                    <FiDownload />
                                  </button>
                                  {openResourceLessonId === lesson.id && (
                                    <div className="absolute right-0 top-9 z-20 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-xl">
                                      <div className="bg-slate-900/50 px-3 py-2 text-xs font-semibold text-slate-300">
                                        Resources
                                      </div>
                                      <div className="p-1">
                                        {lesson.resources.map((res) => (
                                          <a
                                            key={res.title}
                                            href={res.link}
                                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
                                          >
                                            <FiDownload className="text-indigo-400" />
                                            <span>{res.title}</span>
                                          </a>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </main>
      <Footer columns={footerColumns} />
    </div>
  )
}

const LearnPageSkeleton = () => (
  <main className="mx-auto mt-6 max-w-[90rem] animate-pulse px-4 py-8">
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
          <div className="w-full bg-slate-800" style={{ aspectRatio: '16 / 7' }} />
          <div className="flex items-center justify-between bg-slate-900/90 px-4 py-3">
            <div className="space-y-2">
              <div className="h-4 w-52 rounded bg-slate-700" />
              <div className="h-3 w-24 rounded bg-slate-700" />
            </div>
            <div className="h-3 w-28 rounded bg-slate-700" />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 border-b border-slate-800 pb-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`learn-tab-skeleton-${index}`} className="h-6 w-24 rounded bg-slate-800" />
          ))}
        </div>

        <div className="space-y-4">
          <div className="h-32 rounded-xl border border-slate-800 bg-slate-900" />
          <div className="h-48 rounded-xl border border-slate-800 bg-slate-900" />
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-slate-700" />
            <div className="h-4 w-16 rounded bg-slate-800" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`module-skeleton-${index}`} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div className="h-4 w-3/5 rounded bg-slate-700" />
                <div className="mt-3 space-y-2">
                  <div className="h-10 rounded-lg bg-slate-800" />
                  <div className="h-10 rounded-lg bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </main>
)

export default Learn
