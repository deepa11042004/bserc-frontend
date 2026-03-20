import { FaQuoteLeft, FaUserCircle } from 'react-icons/fa'

const TestimonialCard = ({ feedback, name }) => {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <FaQuoteLeft className="mb-3 text-teal-600" />
      <p className="mb-4 text-sm leading-relaxed text-slate-700">{feedback}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <FaUserCircle className="text-slate-500" size={18} />
        <span>{name}</span>
      </div>
    </article>
  )
}

export default TestimonialCard
