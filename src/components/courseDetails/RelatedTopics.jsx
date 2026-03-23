const RelatedTopics = ({ topics = [] }) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h3 className="mb-3 text-lg font-semibold text-slate-50">Explore related topics</h3>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="rounded-full border border-slate-700 bg-slate-800 px-4 py-2 text-sm text-slate-200 transition hover:border-indigo-400 hover:text-indigo-100"
          >
            {topic}
          </span>
        ))}
      </div>
    </section>
  )
}

export default RelatedTopics
