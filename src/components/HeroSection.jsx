import { motion as Motion } from 'framer-motion'

const HeroSection = ({ className = '' }) => {
  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-100 via-cyan-100 to-sky-100 px-6 py-10 md:px-12 md:py-14 ${className}`}>
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-teal-300/40 blur-2xl" />
      <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-sky-300/40 blur-2xl" />

      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          <p className="mb-3 inline-flex rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            Limited Offer
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900 md:text-5xl">
            Save 20% on a year of learning
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-700 md:text-base">
            Personal plan for your career growth. Build real-world skills with guided projects and
            expert-led lessons.
          </p>
          <button className="mt-6 rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:-translate-y-0.5 hover:bg-teal-800">
            Save now
          </button>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80"
            alt="Learning platform hero"
            className="h-64 w-full rounded-2xl object-cover shadow-2xl md:h-80"
          />
          <div className="absolute -left-4 -top-4 rounded-xl bg-white p-3 shadow-lg">
            <p className="text-xs font-semibold text-slate-700">1,000+ new lessons this month</p>
          </div>
        </Motion.div>
      </div>
    </section>
  )
}

export default HeroSection
