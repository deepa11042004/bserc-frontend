const WhatYouWillLearn = ({ items = [] }) => {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-6">
      <h2 className="mb-4 text-xl font-semibold text-slate-50">What you'll learn</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-slate-200">
            <span className="mt-1 text-indigo-300">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhatYouWillLearn
