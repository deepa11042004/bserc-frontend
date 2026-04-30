import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiSearch } from 'react-icons/fi'
import { publicCourseService } from '../services/publicCourseService'

const SearchBar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const containerRef = useRef(null)

  useEffect(() => {
    let active = true

    const loadCourses = async () => {
      try {
        const list = await publicCourseService.getPublishedCourses()
        if (!active) return

        setCourses(
          list.map((course) => ({
            id: course.id || course.courseId,
            slug: course.slug || course.courseId,
            title: course.title,
            instructor: course.instructor,
            image: course.image || course.thumbnail,
            tags: course.tags || [],
            category: course.category,
            level: course.level,
          })),
        )
      } catch {
        if (active) {
          setCourses([])
        }
      }
    }

    void loadCourses()

    return () => {
      active = false
    }
  }, [])

  const recommendedTopics = useMemo(() => {
    const topicSet = new Set()

    courses.forEach((course) => {
      if (course.category) topicSet.add(course.category)
      if (course.level) topicSet.add(course.level)
      ;(course.tags || []).forEach((tag) => {
        if (tag) topicSet.add(tag)
      })
    })

    return [...topicSet].slice(0, 8)
  }, [courses])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const q = params.get('q') || ''
    setQuery(q)
  }, [location.search])

  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSubmit = (val) => {
    if (!val.trim()) return
    navigate(`/search?q=${encodeURIComponent(val.trim())}`)
    setOpen(false)
  }

  const suggestions = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    const keywordMatches = recommendedTopics.filter((t) => t.toLowerCase().includes(q)).slice(0, 4)
    const courseMatches = courses
      .filter((c) => c.title?.toLowerCase().includes(q) || c.instructor?.toLowerCase().includes(q))
      .slice(0, 5)
    return [...keywordMatches.map((k) => ({ type: 'keyword', value: k })), ...courseMatches.map((c) => ({ type: 'course', value: c }))]
  }, [courses, query])

  return (
    <div className="relative flex min-w-0 flex-1" ref={containerRef}>
      <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit(query)
        }}
        placeholder="Search for anything"
        className="w-full rounded-full border border-indigo-500/30 bg-[#111827] py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/50"
      />

      {open && (suggestions.length > 0 || query) && (
        <div className="absolute top-full z-40 mt-2 w-full overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl shadow-black/40">
          <div className="max-h-72 overflow-auto">
            {suggestions.length === 0 && (
              <div className="px-4 py-3 text-sm text-slate-400">Type to search courses and topics</div>
            )}
            {suggestions.map((item) => {
              if (item.type === 'keyword') {
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleSubmit(item.value)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                  >
                    <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-indigo-200">Topic</span>
                    {item.value}
                  </button>
                )
              }
              const c = item.value
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    navigate(`/course/${encodeURIComponent(c.slug || c.id)}`)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-100 transition hover:bg-slate-800"
                >
                  {c.image ? <img src={c.image} alt={c.title} className="h-10 w-14 rounded object-cover" /> : <div className="h-10 w-14 rounded bg-slate-700" />}
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{c.title}</div>
                    <div className="truncate text-xs text-slate-400">{c.instructor}</div>
                  </div>
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-800 bg-slate-900/80 px-4 py-3">
            {recommendedTopics.length > 0 ? (
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                {recommendedTopics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleSubmit(topic)}
                    className="rounded-full bg-slate-800 px-3 py-1 transition hover:bg-indigo-900/60 hover:text-indigo-200"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Topic suggestions will appear as courses are published.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
