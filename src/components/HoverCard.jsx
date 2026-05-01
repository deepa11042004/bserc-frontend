import { createPortal } from 'react-dom'
import { FaStar } from 'react-icons/fa'

const HoverCard = ({
  title,
  instructor,
  description,
  price,
  rating,
  align = 'right',
  onAdd,
  onView,
  anchor,
  points = [],
  onMouseEnter,
  onMouseLeave,
}) => {
  const width = 320 // px, matches w-80
  const gap = 12
  const safeAnchor =
    anchor || {
      top: 0,
      left: 0,
      right: 0,
    }
  const left = align === 'left' ? safeAnchor.left - width - gap : safeAnchor.right + gap
  const top = safeAnchor.top

  const content = (
    <div
      className="fixed z-[9999] w-80 rounded-xl border border-indigo-500/30 bg-[#0f172a] p-4 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition duration-200 ease-out"
      style={{ left, top, transform: 'translateZ(0)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="mb-1 line-clamp-2 text-sm font-semibold text-white tracking-wide">{title}</div>
      {instructor && <div className="text-xs text-slate-300">{instructor}</div>}
      {description && <p className="mt-2 line-clamp-3 text-xs text-slate-300">{description}</p>}
      <div className="mt-2 text-sm font-bold text-white">{price}</div>
      <div className="mt-2 flex items-center gap-2 text-xs text-slate-300">
        {rating && (
          <>
            <span className="font-semibold text-cyan-200">{rating}</span>
            <FaStar className="text-amber-300" />
          </>
        )}
        <span className="text-slate-400">Top rated course</span>
      </div>
      {points?.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm text-slate-200">
          {points.slice(0, 3).map((point, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-[#3B82F6]">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onAdd?.()
          }}
          className="flex-1 rounded-lg bg-[#3B82F6] px-3 py-2 text-xs font-semibold text-white shadow-[0_10px_25px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
        >
          Enroll Now
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            onView?.()
          }}
          className="rounded-lg border border-indigo-500/40 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-[#111827]"
        >
          View Details
        </button>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default HoverCard
