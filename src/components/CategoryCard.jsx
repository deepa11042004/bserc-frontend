import { FiArrowRight } from 'react-icons/fi'
import { motion as Motion } from 'framer-motion'

const CategoryCard = ({ title, image }) => {
  return (
    <Motion.article
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 280, damping: 18 }}
      className="group overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#111827] shadow-[0_10px_25px_rgba(0,0,0,0.4)]"
    >
      <img
        src={image}
        alt={title}
        className="h-44 w-full object-cover flex-shrink-0"
      />
      
      <div className="flex items-center justify-between p-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className="rounded-full bg-[#0f172a] p-2 text-slate-200 transition group-hover:bg-[#1f2937] group-hover:text-[#22D3EE]">
          <FiArrowRight />
        </span>
      </div>
    </Motion.article>
  )
}

export default CategoryCard
