import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiPlay, FiPause, FiStar, FiDownload, FiCheck, FiClock, FiGlobe, FiLayers, FiUser, FiAward } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { courseDetailsData, footerColumns } from '../data/homeData'
import { getPurchasedCourses } from '../utils/purchases'

const buildModules = (course) => {
  const fallbackThumb = course.videoPreview
  const modules = course.courseContent || []
  return modules.map((module, moduleIndex) => {
    const lessons = (module.lectures || []).map((lecture, lessonIndex) => ({
      id: `${moduleIndex + 1}-${lessonIndex + 1}`,
      title: lecture.title,
      duration: lecture.duration || '3 min',
      thumbnail:
        lecture.thumbnail || fallbackThumb || 'https://images.unsplash.com/photo-1451188502541-13943edb6acb?auto=format&fit=crop&w=900&q=80',
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
  } catch (e) {
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

const Learn = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [completedLessons, setCompletedLessons] = useState(() => loadCompleted(courseId))
  const [openModules, setOpenModules] = useState([])
  const [activeTab, setActiveTab] = useState('Course Content')
  const [openResourceLessonId, setOpenResourceLessonId] = useState(null)
  const [isDescExpanded, setIsDescExpanded] = useState(false)

  const purchasedCourses = useMemo(() => getPurchasedCourses(), [])
  const course = useMemo(() => {
    const found = purchasedCourses.find((c) => c.courseId === courseId)
    return { ...courseDetailsData, ...found }
  }, [courseId, purchasedCourses])

  const modules = useMemo(() => buildModules(course), [course])

  const totalMinutes = useMemo(() => {
    const content = course.courseContent || []
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
  const level = course.level || 'All levels'
  const categories = course.categories || course.relatedTopics || []

  useEffect(() => {
    if (!course || !course.courseId) {
      navigate('/')
    }
  }, [course, navigate])

  useEffect(() => {
    if (modules.length) {
      setSelectedLesson(modules[0].lessons[0])
      setOpenModules([modules[0].id])
    }
  }, [modules])

  const handleLessonClick = (lesson) => {
    setSelectedLesson(lesson)
    setOpenResourceLessonId(null)
  }

  const toggleComplete = (lessonId) => {
    setCompletedLessons((prev) => {
      const exists = prev.includes(lessonId)
      const next = exists ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      saveCompleted(courseId, next)
      return next
    })
  }

  const toggleModule = (moduleId) => {
    setOpenResourceLessonId(null)
    setOpenModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <main className="mx-auto mt-6 max-w-6xl px-4 py-8">
        <section className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg">
            {selectedLesson ? (
              <img
                key={selectedLesson.id}
                src={selectedLesson.thumbnail}
                alt={selectedLesson.title}
                className="w-full object-cover transition duration-300"
                style={{ aspectRatio: '16 / 7' }}
              />
            ) : (
              <div className="w-full bg-slate-800" style={{ aspectRatio: '16 / 7' }} />
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/60 px-4 py-3 text-sm">
              <div className="flex items-center gap-3">
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
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
          </div>

          <div className="relative flex flex-wrap gap-4 pb-2">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-800" />
            {['Course Content', 'Overview', 'FAQ', 'Discussion', 'Reviews'].map((tab) => (
              <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
          </div>

          {activeTab === 'Course Content' && (
            <div className="space-y-3 max-w-4xl">
              {modules.map((module) => (
                <div key={module.id} className="rounded-xl border border-slate-800 bg-slate-900">
                  <button
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-white"
                  >
                    <span>{module.title}</span>
                    <FiChevronDown
                      className={`transition-transform ${openModules.includes(module.id) ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openModules.includes(module.id) && (
                    <div className="divide-y divide-slate-800">
                      {module.lessons.map((lesson) => {
                        const isActive = selectedLesson?.id === lesson.id
                        const completed = completedLessons.includes(lesson.id)
                        return (
                          <div
                            key={lesson.id}
                            className={`flex items-center gap-3 px-4 py-3 text-sm transition hover:bg-slate-800/70 ${
                              isActive ? 'bg-slate-800/60' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={completed}
                              onChange={() => toggleComplete(lesson.id)}
                              className="h-4 w-4 accent-indigo-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleLessonClick(lesson)}
                              className="flex-1 text-left text-slate-200"
                            >
                              <div className="font-semibold">{lesson.title}</div>
                              <div className="text-xs text-slate-400">{lesson.duration}</div>
                            </button>
                            <div className="relative" onMouseLeave={() => setOpenResourceLessonId(null)}>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenResourceLessonId((prev) => (prev === lesson.id ? null : lesson.id))
                                }
                                className="rounded-lg border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:border-indigo-400"
                              >
                                Resources
                              </button>
                              {openResourceLessonId === lesson.id && (
                                <div className="absolute right-0 top-9 z-10 w-48 rounded-lg border border-slate-800 bg-slate-900 p-3 text-xs text-slate-200 shadow-lg">
                                  {lesson.resources.map((res) => (
                                    <a key={res.title} href={res.link} className="flex items-center gap-2 py-1 hover:text-indigo-300">
                                      <FiDownload className="text-indigo-300" />
                                      <span>{res.title}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

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
        </section>

      </main>
      <Footer columns={footerColumns} />
    </div>
  )
}

export default Learn
