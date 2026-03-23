const CourseIncludes = ({ items = [] }) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-50">This course includes:</h3>
      <ul className="space-y-2 text-sm text-slate-200">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-indigo-300">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CourseIncludes
