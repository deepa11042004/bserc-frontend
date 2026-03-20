const RelatedTopics = ({ topics = [] }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-3 text-lg font-semibold text-slate-900">Explore related topics</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
          >
            {topic}
          </span>
        ))}
      </div>
    </section>
  )
}

export default RelatedTopics
