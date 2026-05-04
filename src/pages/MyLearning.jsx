import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiStar, FiTrash2 } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { footerColumns } from '../data/homeData'
import { getPurchasedCourses, removePurchasedCourse } from '../utils/purchases'
import { publicCourseService } from '../services/publicCourseService'

const tabs = ['All Courses', 'Certificates']

const ProgressBar = ({ progress = 3.5 }) => (
  <div className="mt-2 space-y-2">
    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400">
      <span>Course completed</span>
      <span>{Math.max(3, progress).toFixed(0)}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80">
      <div
        className="h-full rounded-full bg-indigo-500 transition-all duration-300"
        style={{ width: `${Math.max(3, progress)}%` }}
      />
    </div>
  </div>
)

const MyLearning = () => {
  const [activeTab, setActiveTab] = useState('All Courses')
  const [purchased, setPurchased] = useState(() => getPurchasedCourses())
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const sync = () => setPurchased(getPurchasedCourses())
    window.addEventListener('storage', sync)
    window.addEventListener('purchased-courses-changed', sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener('purchased-courses-changed', sync)
    }
  }, [])

  const navigate = useNavigate()
  const purchasedCourses = useMemo(() => purchased || [], [purchased])

  const hydrateCourses = useCallback(async (entries) => {
    if (!entries.length) {
      setCourses([])
      setLoadError('')
      return
    }

    setLoadingCourses(true)

    try {
      const hydrated = await publicCourseService.hydratePurchasedCourses(entries)
      setCourses(hydrated)
      setLoadError('')
    } catch (error) {
      setCourses(entries)
      setLoadError(error?.message || 'Could not refresh course details right now.')
    } finally {
      setLoadingCourses(false)
    }
  }, [])

  useEffect(() => {
    void hydrateCourses(purchasedCourses)
  }, [hydrateCourses, purchasedCourses])

  const handleRemove = (courseId) => {
    const updated = removePurchasedCourse(courseId)
    setPurchased(updated)
  }

  const handleViewCourse = (course) => {
    const identifier = course.slug || course.apiCourseId || course.courseId
    navigate(`/learn/${encodeURIComponent(identifier)}`, { state: { course } })
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">My learning</h1>
            <p className="text-sm text-slate-400">Keep going—you&apos;re building momentum.</p>
          </div>
          <div className="flex gap-2 rounded-full bg-[#111827] p-1 text-sm font-semibold text-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-4 py-2 transition ${
                  activeTab === tab ? 'bg-indigo-500 text-white' : 'hover:bg-[#1f2937]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {loadingCourses ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <MyLearningCardSkeleton key={`my-learning-skeleton-${index}`} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-indigo-500/40 bg-[#0f172a] p-8 text-center text-slate-300">
            You haven&apos;t enrolled in any courses yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {courses.map((course) => (
              <button
                key={course.slug || course.apiCourseId || course.courseId}
                type="button"
                onClick={() => handleViewCourse(course)}
                className="group w-full text-left"
              >
                <div className="flex flex-col overflow-hidden rounded-xl border border-indigo-500/10 bg-[#0f172a] shadow-[0_8px_22px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_12px_30px_rgba(0,0,0,0.34)]">
                  {course.image ? (
                    <img src={course.image} alt={course.title} className="h-28 w-full object-cover" />
                  ) : (
                    <div className="h-28 w-full bg-slate-800" />
                  )}
                  <div className="flex flex-1 flex-col gap-1.5 px-3.5 py-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold text-white line-clamp-2">{course.title}</h3>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemove(course.slug || course.courseId || course.apiCourseId)
                        }}
                        className="text-xs text-slate-400 transition hover:text-red-300"
                        aria-label="Remove course"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className="text-xs text-slate-400">{course.instructor || 'Instructor'}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <FiStar
                          key={idx}
                          className="text-slate-500 transition group-hover:text-amber-300"
                          aria-hidden
                        />
                      ))}
                    </div>
                    <ProgressBar progress={3.5} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loadingCourses && loadError && (
          <p className="mt-4 text-sm text-amber-300">{loadError}</p>
        )}
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}

const MyLearningCardSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border border-indigo-500/10 bg-[#0f172a] shadow-[0_8px_22px_rgba(0,0,0,0.28)]">
    <div className="h-28 w-full bg-slate-800" />
    <div className="space-y-2 px-3.5 py-3">
      <div className="h-4 w-4/5 rounded bg-slate-700" />
      <div className="h-3 w-1/2 rounded bg-slate-700" />
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={`rating-skeleton-${index}`} className="h-3 w-3 rounded-full bg-slate-700" />
        ))}
      </div>
      <div className="h-2 w-full rounded-full bg-slate-800" />
      <div className="h-2 w-3/5 rounded-full bg-slate-700" />
    </div>
  </div>
)

export default MyLearning
