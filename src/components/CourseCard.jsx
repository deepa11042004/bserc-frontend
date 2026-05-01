import { motion as Motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useCart } from '../context/CartContext'
import HoverCard from './HoverCard'
import { FaStar } from 'react-icons/fa'

const HOVER_OPEN_DELAY = 140
const HOVER_CLOSE_DELAY = 320

const safeDecodeURIComponent = (value = '') => {
  try {
    return decodeURIComponent(String(value || ''))
  } catch {
    return String(value || '')
  }
}

const CourseCard = ({
  title,
  instructor,
  rating,
  price,
  image,
  thumbnail,
  thumbnailUrl,
  description,
  learningPoints,
  courseId,
  slug,
  apiCourseId,
}) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [hover, setHover] = useState(false)
  const [align, setAlign] = useState('right')
  const openTimerRef = useRef(null)
  const closeTimerRef = useRef(null)
  const cardRef = useRef(null)
  const [anchor, setAnchor] = useState(null)

  const safeTitle = title || 'Untitled course'
  const resolvedSlug =
    safeDecodeURIComponent(slug || courseId || '') || safeTitle.toLowerCase().replace(/\s+/g, '-')
  const encodedSlug = encodeURIComponent(resolvedSlug)
  const safePrice = price || '₹0'
  const safeRating = rating || '4.7'
  const safeImage = image || thumbnailUrl || thumbnail || ''
  const shortDescription = description || `Learn the essentials of ${safeTitle} with practical lessons and examples.`
  const points = learningPoints?.length
    ? learningPoints
    : [
        'Build practical skills with guided steps',
        'Apply concepts in a small project',
        'Get templates you can reuse right away',
      ]

  const courseData = {
    courseId: resolvedSlug,
    slug: resolvedSlug,
    apiCourseId,
    title: safeTitle,
    instructor,
    rating: safeRating,
    price: safePrice,
    image: safeImage,
    thumbnail: safeImage,
    description,
  }

  const handleAdd = (e) => {
    e.preventDefault()
    addToCart(courseData)
  }

  const handleStartLearning = (e) => {
    e.preventDefault()
    navigate(`/course/${encodedSlug}`, { state: { course: courseData } })
  }

  const updateAnchor = () => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const spaceRight = window.innerWidth - rect.right
    setAlign(spaceRight < 360 ? 'left' : 'right')
    setAnchor({
      top: rect.top,
      left: rect.left,
      right: rect.right,
      width: rect.width,
      height: rect.height,
    })
  }

  const handleMouseEnter = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current)
    openTimerRef.current = window.setTimeout(() => {
      updateAnchor()
      setHover(true)
    }, HOVER_OPEN_DELAY)
  }

  const handleMouseLeave = () => {
    if (openTimerRef.current) window.clearTimeout(openTimerRef.current)
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setHover(false)
    }, HOVER_CLOSE_DELAY)
  }

  const handleHoverCardEnter = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    updateAnchor()
    setHover(true)
  }

  const handleHoverCardLeave = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setHover(false)
    }, HOVER_CLOSE_DELAY)
  }

  useEffect(() => {
    return () => {
      if (openTimerRef.current) window.clearTimeout(openTimerRef.current)
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current)
    }
  }, [])

  return (
    <Motion.article
      whileHover={{ y: -5, scale: 1.03 }}
      className="relative"
      style={{ zIndex: hover ? 10000 : 1, overflow: 'visible' }}
      ref={cardRef}
      onMouseMove={updateAnchor}
    >
      <Link
        to={`/course/${encodedSlug}`}
        state={{ course: courseData }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative block overflow-visible rounded-2xl border border-indigo-500/20 bg-[#1F2937] shadow-[0_10px_30px_rgba(0,0,0,0.4)] transition hover:shadow-[0_0_25px_rgba(59,130,246,0.35)]"
      >
        <div className="overflow-hidden rounded-t-2xl">
          {safeImage ? (
            <img src={safeImage} alt={title} className="h-40 w-full object-cover" loading="lazy" />
          ) : (
            <div className="h-40 w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950" />
          )}
        </div>
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-semibold text-white tracking-wide">{safeTitle}</h3>
          <p className="text-sm text-slate-300">{instructor}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-cyan-200">{safeRating}</span>
            <FaStar className="text-amber-300" />
            <span className="text-slate-400">(2,000+ ratings)</span>
          </div>
          <p className="pt-1 font-bold text-white">{safePrice}</p>
          <div className="mt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartLearning}
              className="inline-flex rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
            >
              Start Learning
            </button>
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 hover:text-white"
            >
              Add to Cart
            </button>
          </div>
        </div>

        {hover && (
          <HoverCard
            title={safeTitle}
            instructor={instructor}
            description={shortDescription}
            price={safePrice}
            rating={safeRating}
            align={align}
            anchor={anchor}
            points={points}
            onAdd={() => addToCart(courseData)}
            onView={() => navigate(`/course/${encodedSlug}`, { state: { course: courseData } })}
            onMouseEnter={handleHoverCardEnter}
            onMouseLeave={handleHoverCardLeave}
          />
        )}
      </Link>
    </Motion.article>
  )
}

export default CourseCard
