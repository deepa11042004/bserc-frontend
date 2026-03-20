const WhatYouWillLearn = ({ items = [] }) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">What you'll learn</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-sm text-slate-700">
            <span className="mt-1 text-emerald-600">•</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export default WhatYouWillLearn
