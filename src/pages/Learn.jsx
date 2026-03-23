import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiPlay, FiPause, FiStar, FiDownload } from 'react-icons/fi'
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

  const purchasedCourses = useMemo(() => getPurchasedCourses(), [])
  const course = useMemo(() => {
    const found = purchasedCourses.find((c) => c.courseId === courseId)
    return { ...courseDetailsData, ...found }
  }, [courseId, purchasedCourses])

  const modules = useMemo(() => buildModules(course), [course])

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
            {['Course Content', 'Overview', 'Q&A', 'Discussion', 'Reviews'].map((tab) => (
              <TabButton key={tab} label={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} />
            ))}
          </div>

          {activeTab === 'Course Content' && (
            <div className="space-y-3">
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
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <p>{course.description}</p>
              <div className="flex flex-wrap gap-2 text-xs">
                {(course.relatedTopics || []).map((topic) => (
                  <span key={topic} className="rounded-full bg-slate-800 px-3 py-1">{topic}</span>
                ))}
              </div>
              <div className="text-xs text-slate-400">Instructor: {course.instructor}</div>
            </div>
          )}

          {activeTab === 'Q&A' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <input
                placeholder="Ask a question"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800/70 p-3">How do I plan delta-v budgets?</div>
                <div className="rounded-lg bg-slate-800/70 p-3">Any tips on ground pass scheduling?</div>
              </div>
            </div>
          )}

          {activeTab === 'Discussion' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <input
                placeholder="Start a discussion"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
              />
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800/70 p-3">Share your mission ops checklist templates.</div>
                <div className="rounded-lg bg-slate-800/70 p-3">Post your telemetry dashboard screenshots.</div>
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-200">
              <div className="flex items-center gap-2 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} />
                ))}
                <span className="text-sm text-white">4.8 • 18,000 reviews</span>
              </div>
              <div className="space-y-2">
                <div className="rounded-lg bg-slate-800/70 p-3">“Detailed FDIR examples made it click.”</div>
                <div className="rounded-lg bg-slate-800/70 p-3">“Great pacing and mission-ready artifacts.”</div>
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
