import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FiFilter, FiSearch, FiStar } from 'react-icons/fi'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import {
  aiCourses,
  courseDetailsData,
  skillsCourses,
  trendingCourses,
} from '../data/homeData'
import { useCart } from '../context/CartContext'

const pageSize = 6

const normalizeCourses = () => {
  const courses = [
    ...trendingCourses,
    ...skillsCourses,
    ...aiCourses,
    { ...courseDetailsData },
  ]

  return courses.map((c, idx) => ({
    id: c.courseId || c.id || `c-${idx}`,
    title: c.title,
    instructor: c.instructor || c.duration || 'Instructor',
    rating: c.rating || 4.5,
    students: c.students || '10,000',
    image: c.image || c.videoPreview,
    price: c.price || '₹799',
    level: c.level || 'All Levels',
    language: c.language || 'English',
    tags: c.tags || c.relatedTopics || [],
    description: c.description || c.subtitle || 'Upskill with hands-on content.',
  }))
}

const filters = {
  level: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
  rating: ['4.5 & up', '4.0 & up', '3.5 & up'],
  language: ['English', 'Hindi', 'Spanish'],
}

const relatedSearches = ['Generative AI', 'Python', 'AWS', 'Data Science', 'React', 'Prompt Engineering']

const Search = () => {
  const { addToCart } = useCart()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)

  const allCourses = useMemo(normalizeCourses, [])

  const query = params.get('q') || ''
  const level = params.get('level') || 'All Levels'
  const rating = params.get('rating') || '4.0 & up'
  const language = params.get('language') || 'English'

  useEffect(() => {
    setCurrentPage(Number(params.get('page') || 1))
  }, [params])

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
      (level === 'All Levels' || course.level === level) &&
      ratingNum >= ratingThreshold &&
      (language ? course.language === language : true)
    )
  }

  const filteredCourses = allCourses.filter((c) => matchesQuery(c) && matchesFilters(c))
  const totalPages = Math.max(1, Math.ceil(filteredCourses.length / pageSize))
  const pageCourses = filteredCourses.slice((currentPage - 1) * pageSize, currentPage * pageSize)

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
                <FilterSelect label="Language" options={filters.language} value={language} onChange={(v) => handleParamChange('language', v)} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-300">
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
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-300">
            <div>
              {filteredCourses.length} results for <span className="font-semibold text-white">{query || 'all courses'}</span>
            </div>
            <button
              className="flex items-center gap-2 rounded-full border border-slate-800 px-3 py-1 text-xs text-slate-300 transition hover:border-indigo-600 hover:text-indigo-200"
              onClick={() => navigate('/dashboard')}
            >
              <FiFilter /> Explore dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pageCourses.map((course) => (
              <CourseResult key={course.id} course={course} onCart={() => addToCart({ ...course, id: course.id })} />
            ))}
            {pageCourses.length === 0 && (
              <div className="col-span-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-300">
                No courses found. Try a different query or relax filters.
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1
                const active = page === currentPage
                return (
                  <button
                    key={page}
                    className={`h-9 w-9 rounded-full border ${active ? 'border-indigo-500 bg-indigo-600 text-white' : 'border-slate-800 text-slate-300'} transition hover:border-indigo-600 hover:text-white`}
                    onClick={() => handleParamChange('page', page)}
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

const CourseResult = ({ course, onCart }) => (
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
          onClick={() => alert('Preview coming soon')}
        >
          Preview
        </button>
      </div>
    </div>
  </div>
)

export default Search
