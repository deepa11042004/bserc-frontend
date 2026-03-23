const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded-2xl border border-indigo-500/20 bg-[#111827] p-4 ${className}`}>
      <div className="h-28 rounded-xl bg-slate-700" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-700" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-700" />
      <div className="mt-4 h-4 w-1/4 rounded bg-slate-700" />
    </div>
  )
}

export default SkeletonCard
