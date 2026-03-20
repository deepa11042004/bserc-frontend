import { FaStar } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const CourseCard = ({ title, instructor, rating, price, image }) => {
  const slug = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'))

  const state = {
    course: {
      title,
      instructor,
      rating,
      price,
      image,
    },
  }

  return (
    <Motion.article whileHover={{ y: -5 }}>
      <Link
        to={`/course/${slug}`}
        state={state}
        className="block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
      >
        <img src={image} alt={title} className="h-40 w-full object-cover" />
        <div className="space-y-2 p-4">
          <h3 className="line-clamp-2 font-semibold text-slate-900">{title}</h3>
          <p className="text-sm text-slate-600">{instructor}</p>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-amber-600">{rating}</span>
            <FaStar className="text-amber-400" />
            <span className="text-slate-500">(2,000+ ratings)</span>
          </div>
          <p className="pt-1 font-bold text-slate-900">{price}</p>
        </div>
      </Link>
    </Motion.article>
  )
}

export default CourseCard
