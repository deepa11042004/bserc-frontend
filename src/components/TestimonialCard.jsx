import { FaQuoteLeft, FaUserCircle } from 'react-icons/fa'

const TestimonialCard = ({ feedback, name }) => {
  return (
    <article className="rounded-2xl border border-indigo-500/20 bg-[#111827] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
      <FaQuoteLeft className="mb-4 text-[#3B82F6]" />
      <p className="mb-5 text-sm leading-7 text-slate-300">{feedback}</p>
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <FaUserCircle className="text-slate-400" size={18} />
        <span>{name}</span>
      </div>
    </article>
  )
}

export default TestimonialCard
