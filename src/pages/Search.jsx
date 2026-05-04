import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiFilter, FiSearch, FiStar } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { publicCourseService } from '../services/publicCourseService'

const pageSize = 6

const filters = {
  level: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
  rating: ['4.5 & up', '4.0 & up', '3.5 & up'],
}

const Search = () => {
  const { addToCart } = useCart()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const query = params.get('q') || ''
  const category = params.get('category') || ''
  const level = params.get('level') || 'All Levels'
  const rating = params.get('rating') || '4.0 & up'
  const language = params.get('language') || 'All Languages'

  useEffect(() => {
    setCurrentPage(Number(params.get('page') || 1))
  }, [params])

  useEffect(() => {
    let active = true

    const loadCourses = async () => {
      setLoading(true)

      try {
        const courses = await publicCourseService.getPublishedCourses()
        if (!active) return

        setAllCourses(courses)
        setLoadError('')
      } catch (error) {
        if (!active) return

        setAllCourses([])
        setLoadError(error?.message || 'Could not load courses right now.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCourses()

    return () => {
      active = false
    }
  }, [])

  const languageOptions = useMemo(() => {
    const options = new Set(['All Languages'])
    allCourses.forEach((course) => {
      if (course.language) options.add(course.language)
    })
    return [...options]
  }, [allCourses])

  const relatedSearches = useMemo(() => {
    const topics = new Set()

    allCourses.forEach((course) => {
      if (course.category) topics.add(course.category)
      ;(course.tags || []).forEach((tag) => {
        if (tag) topics.add(tag)
      })
    })

    return [...topics].slice(0, 8)
  }, [allCourses])

  const handleParamChange = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setParams(next)
  }

  const matchesQuery = (course) => {
    if (!query.trim()) return true
    const q = query.toLowerCase()
    return (
      course.title?.toLowerCase().includes(q) ||
      course.instructor?.toLowerCase().includes(q) ||
      course.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }

  const matchesFilters = (course) => {
    const ratingNum = parseFloat(course.rating)
    const ratingThreshold = rating.startsWith('4.5') ? 4.5 : rating.startsWith('4.0') ? 4.0 : 3.5
    return (
      (!category || course.category === category) &&
      (level === 'All Levels' || course.level === level) &&
      ratingNum >= ratingThreshold &&
      (language === 'All Languages' || course.language === language)
    )
  }

  const filteredCourses = allCourses.filter((c) => matchesQuery(c) && matchesFilters(c))
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const pageCourses = filteredCourses.slice((safePage - 1) * pageSize, safePage * pageSize)

  const applySearch = (term) => {
    const next = new URLSearchParams(params)
    next.set('q', term)
    next.delete('page')
    setParams(next)
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-10">
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a] px-6 py-5 shadow-2xl shadow-black/40">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[240px]">
                <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => applySearch(e.target.value)}
                  placeholder="Search for courses, topics, instructors"
                  className="w-full rounded-full border border-indigo-500/30 bg-slate-900 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/40"
                />
              </div>
              <div className="flex flex-wrap gap-2 text-sm text-slate-200">
                <FilterSelect label="Level" options={filters.level} value={level} onChange={(v) => handleParamChange('level', v)} />
                <FilterSelect label="Rating" options={filters.rating} value={rating} onChange={(v) => handleParamChange('rating', v)} />
                <FilterSelect label="Language" options={languageOptions} value={language} onChange={(v) => handleParamChange('language', v)} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
              {relatedSearches.length > 0 ? (
                <>
                  <span className="text-slate-400">Recommended in {query || 'learning'}</span>
                  {relatedSearches.map((tag) => (
                    <button
                      key={tag}
                      className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1 transition hover:border-indigo-600 hover:text-indigo-200"
                      onClick={() => applySearch(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </>
              ) : (
                <span className="text-slate-400">Search suggestions will appear as courses are published.</span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <div>
              {loading ? 'Loading courses...' : `${filteredCourses.length} results for `}
              {!loading && <span className="font-semibold text-white">{query || 'all courses'}</span>}
            </div>
            <button
              className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-600 hover:text-indigo-200"
              onClick={() => navigate('/dashboard')}
            >
              <FiFilter /> Explore dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {!loading && pageCourses.map((course) => (
              <CourseResult
                key={course.slug || course.id}
                course={course}
                onCart={() =>
                  addToCart({
                    courseId: course.slug || String(course.apiCourseId || course.id),
                    slug: course.slug,
                    apiCourseId: course.apiCourseId,
                    title: course.title,
                    instructor: course.instructor,
                    price: course.price,
                    image: course.image || course.thumbnail,
                    thumbnail: course.thumbnail,
                  })
                }
                onPreview={() => navigate(`/course/${encodeURIComponent(course.slug || course.courseId || course.id)}`)}
              />
            ))}
            {loading && Array.from({ length: pageSize }).map((_, index) => (
              <CourseResultSkeleton key={`search-skeleton-${index}`} />
            ))}
            {!loading && pageCourses.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-300">
                {loadError || 'No courses found. Try a different query or relax filters.'}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1
                const active = page === safePage
                return (
                  <button
                    key={page}
                    className={`h-9 w-9 rounded-full border ${active ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-800 text-slate-300'} transition hover:border-indigo-600 hover:text-white`}
                    onClick={() => handleParamChange('page', String(page))}
                  >
                    {page}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

const FilterSelect = ({ label, options, value, onChange }) => (
  <label className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs">
    <span className="text-slate-400">{label}</span>
    <select
      className="bg-transparent text-white outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-slate-900">
          {opt}
        </option>
      ))}
    </select>
  </label>
)

const CourseResultSkeleton = () => (
  <div className="animate-pulse rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-xl shadow-black/40">
    <div className="flex gap-4">
      <div className="h-28 w-44 rounded-lg bg-slate-800" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="h-5 w-3/4 rounded bg-slate-700" />
        <div className="h-4 w-1/2 rounded bg-slate-700" />
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-5/6 rounded bg-slate-800" />
        <div className="h-9 w-28 rounded-full bg-slate-700" />
      </div>
    </div>
  </div>
)

const CourseResult = ({ course, onCart, onPreview }) => (
  <div className="flex gap-4 rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-xl shadow-black/40">
    {course.image ? (
      <img src={course.image} alt={course.title} className="h-28 w-44 rounded-lg object-cover" />
    ) : (
      <div className="h-28 w-44 rounded-lg bg-slate-800" />
    )}
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold">{course.title}</div>
          <div className="text-sm text-slate-400">{course.instructor}</div>
        </div>
        <div className="text-right text-indigo-200">{course.price}</div>
      </div>
      <p className="line-clamp-2 text-sm text-slate-300">{course.description}</p>
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
        <span className="flex items-center gap-1 text-amber-300"><FiStar /> {course.rating}</span>
        <span>{course.students} students</span>
        <span>{course.level}</span>
        <span>{course.language}</span>
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-indigo-200">
        {(course.tags || []).slice(0, 5).map((tag) => (
          <span key={tag} className="rounded-full bg-indigo-900/40 px-3 py-1 text-indigo-100">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          className="rounded-full bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
          onClick={onCart}
        >
          Add to cart
        </button>
        <button
          className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-100 transition hover:border-indigo-500 hover:text-indigo-200"
          onClick={onPreview}
        >
          Preview
        </button>
      </div>
    </div>
  </div>
)

export default Search
