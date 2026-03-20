const CourseIncludes = ({ items = [] }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">This course includes:</h3>
      <ul className="space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-purple-600">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default CourseIncludes
