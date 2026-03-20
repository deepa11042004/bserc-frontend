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

      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">{title}</h1>
      <p className="text-base text-slate-700 sm:text-lg">{subtitle}</p>

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700">
        <div className="flex items-center gap-2 font-semibold text-amber-600">
          <span>{rating}</span>
          <div className="text-xs text-slate-500">{ratingsCount}</div>
        </div>
        <span className="text-slate-500">{learners}</span>
        <span className="text-slate-500">Last updated {lastUpdated}</span>
        <span className="text-slate-500">{language}</span>
        {captions && captions.length > 0 && (
          <span className="text-slate-500">Captions: {captions.join(', ')}</span>
        )}
        <span className="text-slate-600 font-semibold">Created by {instructor}</span>
      </div>
    </section>
  )
}

export default CourseHeader
