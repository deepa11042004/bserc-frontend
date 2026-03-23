import { motion as Motion } from 'framer-motion'

const HeroSection = ({ className = '' }) => {
  return (
    <section className={`relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B0F1A] via-[#0f172a] to-[#111827] px-6 py-10 md:px-12 md:py-14 shadow-[0_20px_60px_rgba(0,0,0,0.45)] ${className}`}>
      <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#3B82F6]/25 blur-3xl" />
      <div className="absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-[#22D3EE]/25 blur-3xl" />

      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <Motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-lg"
        >
          <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-200">
            Mission Update
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-white md:text-5xl">
            Launch your next skill orbit
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-slate-300 md:text-base">
            Build AI and engineering superpowers with guided missions, simulations, and hands-on labs.
          </p>
          <button className="mt-6 rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]">
            Start the mission
          </button>
        </Motion.div>

        <Motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <img
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80"
            alt="Learning platform hero"
            className="h-64 w-full rounded-2xl object-cover shadow-[0_30px_60px_rgba(0,0,0,0.55)] md:h-80"
          />
          <div className="absolute -left-4 -top-4 rounded-xl bg-[#0b1224] px-4 py-3 text-xs font-semibold text-cyan-200 shadow-lg shadow-black/40 ring-1 ring-indigo-500/40">
            1,000+ new lessons this month
          </div>
        </Motion.div>
      </div>
    </section>
  )
}

export default HeroSection
