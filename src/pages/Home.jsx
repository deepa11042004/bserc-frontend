import { useEffect, useMemo, useRef, useState } from 'react'
import { motion as Motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import CategoryCard from '../components/CategoryCard'
import CourseCard from '../components/CourseCard'
import Footer from '../components/Footer'
import HeroSection from '../components/HeroSection'
import Navbar from '../components/Navbar'
import SectionHeader from '../components/SectionHeader'
import SkeletonCard from '../components/SkeletonCard'
import TestimonialCard from "../components/TestimonialCard"
import {
  aiCourses,
  careerPaths,
  categories,
  certifications,
  companyLogos,
  footerColumns,
  navLinks,
  skillsCourses,
  testimonials,
  trendingCourses,
} from '../data/homeData'

function Home() {
  const categorySliderRef = useRef(null)
  const aiSliderRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [aiIndex, setAiIndex] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false)
    }, 900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  const visibleCourses = useMemo(() => (isLoading ? [] : skillsCourses), [isLoading])

  const scrollSlider = (ref, direction, index, setIndex, length) => {
    if (!ref.current) return

    const container = ref.current

    const newIndex =
      direction === 'right'
        ? Math.min(index + 1, length - 1)
        : Math.max(index - 1, 0)

    const targetCard = container.children[newIndex]
    if (!targetCard) return

    targetCard.scrollIntoView({
      behavior: 'smooth',
      inline: 'start',
      block: 'nearest',

    })

    setIndex(newIndex)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar links={navLinks} />

      <main className="mx-auto max-w-7xl space-y-14 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <HeroSection />
      
        <section>
          <SectionHeader
            title="Learn essential career and life skills"
            subtitle="Choose from focused tracks to start building in-demand knowledge today."
          />

          {/* Carousel */}
          <div className="relative">
            <div
              ref={categorySliderRef}
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft
                const cardWidth = 300
                const index = Math.round(scrollLeft / cardWidth)
                setCategoryIndex(index)
              }}
              className="flex items-stretch gap-5 overflow-x-auto scroll-smooth px-8 snap-x snap-mandatory no-scrollbar"
            >
              {categories.map((category) => (
                <div
                  key={category.title}
                  className="w-[280px] flex-shrink-0 snap-start"
                >
                  <CategoryCard
                    title={category.title}
                    image={category.image}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation (Arrows + Dots) */}
          <div className="mt-4 flex items-center justify-center gap-4">
            {/* Left Arrow */}
            <button
              type="button"
              onClick={() =>
                scrollSlider(
                  categorySliderRef,
                  'left',
                  categoryIndex,
                  setCategoryIndex,
                  categories.length
                )
              }
              disabled={categoryIndex === 0}
              className="rounded-full bg-white p-2 shadow hover:bg-slate-100 active:scale-95 transition disabled:opacity-40"
            >
              <FiArrowLeft />
            </button>


            {/* Dots */}
            <div className="flex items-center gap-2">
              {categories.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all ${index === categoryIndex
                    ? 'w-4 bg-purple-500'
                    : 'w-2 bg-gray-300'
                    }`}
                />
              ))}
            </div>

            {/* Right Arrow */}
            <button
              type="button"
              onClick={() =>
                scrollSlider(
                  categorySliderRef,
                  'right',
                  categoryIndex,
                  setCategoryIndex,
                  categories.length
                )
              }
              disabled={categoryIndex === categories.length - 1}
              className="rounded-full bg-white p-2 shadow hover:bg-slate-100 active:scale-95 transition disabled:opacity-40"
            >
              <FiArrowRight />
            </button>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Learn AI with Google"
            subtitle="Short programs designed to help you use AI in your day-to-day work."
          />

          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() =>
                scrollSlider(
                  aiSliderRef,
                  'left',
                  aiIndex,
                  setAiIndex,
                  aiCourses.length
                )
              }
              className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
              aria-label="Scroll left"
            >
              <FiArrowLeft />
            </button>
            <button
              onClick={() =>
                scrollSlider(
                  aiSliderRef,
                  'right',
                  aiIndex,
                  setAiIndex,
                  aiCourses.length
                )
              }
              className="rounded-full border border-slate-300 bg-white p-2 text-slate-700 transition hover:border-teal-500 hover:text-teal-700"
              aria-label="Scroll right"
            >
              <FiArrowRight />
            </button>
          </div>

          <div
            ref={aiSliderRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-2xl bg-teal-950 p-5"
          >
            {aiCourses.map((course) => (
              <article
                key={course.title}
                className="min-w-[260px] snap-start rounded-xl border border-white/10 bg-white p-4 shadow-sm"
              >
                <img src={course.image} alt={course.title} className="h-32 w-full rounded-lg object-cover" />
                <h3 className="mt-3 line-clamp-2 font-semibold text-slate-900">{course.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{course.duration}</p>
                <button className="mt-4 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-700">
                  Learn more
                </button>
              </article>
            ))}
          </div>
        </section>

        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-8 overflow-hidden rounded-3xl bg-slate-900 p-8 text-white md:grid-cols-2"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-teal-300">
              Next Career Move
            </p>
            <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
              Reimagine your career in the AI era
            </h2>
            <p className="mt-4 max-w-xl text-sm text-slate-300 md:text-base">
              Future-proof your skills with practical tracks and live mentor support.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-200">
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-300" /> Learn AI and automation
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-300" /> Prep for certifications
              </li>
              <li className="flex items-center gap-2">
                <FaCheckCircle className="text-teal-300" /> Build interview-ready portfolio
              </li>
            </ul>
            <button className="mt-7 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-teal-100">
              Learn more
            </button>
          </div>

          <div className="relative">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-teal-500/20 blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=1200&q=80"
              alt="Career growth"
              className="relative h-72 w-full rounded-2xl object-cover"
            />
          </div>
        </Motion.section>

        <section>
          <SectionHeader
            title="Skills to transform your career and life"
            subtitle="From practical projects to technical topics, upgrade your professional toolkit."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
              : visibleCourses.map((course) => <CourseCard key={course.title} {...course} />)}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <p className="mb-6 text-center text-sm font-medium text-slate-500">
            Trusted by leading teams around the world
          </p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5">
            {companyLogos.map((company) => {
              const Icon = company.icon
              return (
                <div
                  key={company.name}
                  className="group flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-4 text-slate-400 transition hover:border-teal-200 hover:bg-white hover:text-teal-700"
                >
                  <Icon size={20} />
                  <span className="text-sm font-semibold">{company.name}</span>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader
            title="See what others are achieving through learning"
            subtitle="Real stories from learners who changed careers and accelerated growth."
          />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                name={testimonial.name}
                feedback={testimonial.feedback}
              />
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-slate-900 p-7 text-white">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold md:text-3xl">Get certified and advance your career</h2>
              <p className="mt-2 text-sm text-slate-300">
                Prep for certifications with structured paths and mock exams.
              </p>
            </div>
            <button className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-100">
              Explore certifications
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {certifications.map((item) => {
              const Icon = item.icon
              return (
                <article
                  key={item.title}
                  className="rounded-xl border border-white/15 bg-white/5 p-5 transition hover:bg-white/10"
                >
                  <Icon size={24} className="text-teal-300" />
                  <h3 className="mt-3 font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-300">{item.subtitle}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Ready to reimagine your career?"
            subtitle="Choose a guided path and get curated lessons that map to your goals."
          />
          <div className="grid gap-5 md:grid-cols-3">
            {careerPaths.map((path) => {
              const Icon = path.icon
              return (
                <article
                  key={path.title}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <img src={path.image} alt={path.title} className="h-44 w-full object-cover" />
                  <div className="space-y-2 p-4">
                    <h3 className="font-semibold text-slate-900">{path.title}</h3>
                    <p className="text-sm text-slate-600">{path.description}</p>
                    <Icon className="text-teal-700" />
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Trending courses"
            subtitle="Hot picks from learners this month."
            action="View all"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trendingCourses.map((course) => (
              <CourseCard key={course.title} {...course} />
            ))}
          </div>
        </section>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}

export default Home
