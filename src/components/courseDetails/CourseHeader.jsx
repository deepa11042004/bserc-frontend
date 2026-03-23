const CourseHeader = ({ title, subtitle, tags = [], rating, ratingsCount, learners, lastUpdated, language, captions, instructor }) => {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-emerald-600 px-3 py-1 uppercase tracking-wide">
            {tag}
          </span>
        ))}
      </div>

      <h1 className="text-2xl font-bold text-slate-50 sm:text-3xl lg:text-4xl">{title}</h1>
      <p className="text-base text-slate-300 sm:text-lg">{subtitle}</p>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
        <div className="flex items-center gap-2 font-semibold text-amber-400">
          <span>{rating}</span>
          <div className="text-xs text-slate-400">{ratingsCount}</div>
        </div>
        <span className="text-slate-400">{learners}</span>
        <span className="text-slate-400">Last updated {lastUpdated}</span>
        <span className="text-slate-400">{language}</span>
        {captions && captions.length > 0 && (
          <span className="text-slate-400">Captions: {captions.join(', ')}</span>
        )}
        <span className="font-semibold text-slate-200">Created by {instructor}</span>
      </div>
    </section>
  )
}

export default CourseHeader
