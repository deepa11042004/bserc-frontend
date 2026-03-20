const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`animate-pulse rounded-2xl border border-slate-200 bg-white p-4 ${className}`}>
      <div className="h-28 rounded-xl bg-slate-200" />
      <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
      <div className="mt-4 h-4 w-1/4 rounded bg-slate-200" />
    </div>
  )
}

export default SkeletonCard
