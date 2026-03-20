import { FiArrowRight } from 'react-icons/fi'
import { motion as Motion } from 'framer-motion'

const CategoryCard = ({ title, image }) => {
  return (
    <Motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <img
        src={image}
        alt={title}
        className="h-44 w-full object-cover flex-shrink-0"
      />
      
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 p-2 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-700">
          <FiArrowRight />
        </span>
      </div>
    </Motion.article>
  )
}

export default CategoryCard
