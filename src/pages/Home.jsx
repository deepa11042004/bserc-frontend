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
import SupportingSection from '../components/SupportingSection'
import SkeletonCard from '../components/SkeletonCard'
import TestimonialCard from '../components/TestimonialCard'
import { useAuthState } from '../hooks/useAuth'
import { publicCourseService } from '../services/publicCourseService'
import {
  careerPaths,
  categories,
  certifications,
  footerColumns,
  navLinks,
  testimonials,
} from '../data/homeData'

const getCourseKey = (course = {}) =>
  String(course.slug || course.apiCourseId || course.id || course.courseId || '')

const getCourseSortTime = (course = {}) => {
  const raw = course.updatedAt || course.createdAt
  if (!raw) return 0

  const time = new Date(raw).getTime()
  return Number.isFinite(time) ? time : 0
}

function Home() {
  const { user } = useAuthState()
  const categorySliderRef = useRef(null)
  const updatedSliderRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [courseError, setCourseError] = useState('')
  const [courses, setCourses] = useState([])
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [updatedIndex, setUpdatedIndex] = useState(0)

  useEffect(() => {
    let active = true

    const loadCourses = async () => {
      setIsLoading(true)

      try {
        const publishedCourses = await publicCourseService.getPublishedCourses()
        if (!active) return

        setCourses(publishedCourses)
        setCourseError('')
      } catch (error) {
        if (!active) return
        setCourses([])
        setCourseError(error?.message || 'Could not load courses right now.')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadCourses()

    return () => {
      active = false
    }
  }, [])

  const visibleCourses = useMemo(() => (isLoading ? [] : courses), [courses, isLoading])
  const popularCourses = useMemo(() => visibleCourses.slice(0, 4), [visibleCourses])
  const updatedCourses = useMemo(() => {
    if (!visibleCourses.length) return []

    const sortedByRecency = [...visibleCourses].sort(
      (courseA, courseB) => getCourseSortTime(courseB) - getCourseSortTime(courseA),
    )

    const popularCourseKeys = new Set(popularCourses.map((course) => getCourseKey(course)).filter(Boolean))
    const nonPopularCourses = sortedByRecency.filter(
      (course) => !popularCourseKeys.has(getCourseKey(course)),
    )

    const source = nonPopularCourses.length ? nonPopularCourses : sortedByRecency
    return source.slice(0, 8)
  }, [popularCourses, visibleCourses])
  const isLearner = Boolean(user && user.role === 'user')
  const continueLearning = visibleCourses.slice(0, 2)
  const recommendedCourses = visibleCourses.slice(2, 6)

  useEffect(() => {
    if (!updatedCourses.length) return
    if (updatedIndex < updatedCourses.length) return
    setUpdatedIndex(0)
  }, [updatedCourses.length, updatedIndex])

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
    <div className="min-h-screen bg-black text-white">
      <Navbar links={navLinks} />

      <main className="mx-auto max-w-7xl space-y-16 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <HeroSection />

        <section id="learning-paths" className="py-2">
          <SectionHeader
            title="Choose Your Learning Path"
            subtitle="Structured tracks to move from fundamentals to role-ready aerospace and robotics outcomes."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {careerPaths.map((path) => (
              <Motion.article
                key={path.title}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#111827] shadow-[0_10px_30px_rgba(0,0,0,0.4)]"
              >
                <div className="h-40 overflow-hidden">
                  <img
                    src={path.image}
                    alt={path.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-semibold text-white">{path.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{path.description}</p>
                  <button
                    type="button"
                    className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20 hover:text-white"
                  >
                    Start Path
                  </button>
                </div>
              </Motion.article>
            ))}
          </div>
        </section>

        <section id="popular-courses" className="py-2">
          <SectionHeader
            title="Popular Courses"
            subtitle="Top-rated programs learners are choosing for aerospace, robotics, and AI career growth."
            action="View all"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularCourses.map((course) => (
              <CourseCard key={course.slug || course.id || course.title} {...course} />
            ))}
          </div>
          {!isLoading && !popularCourses.length && (
            <p className="mt-3 text-sm text-slate-400">No published courses are available yet.</p>
          )}
        </section>

        <section className="py-2">
          <SectionHeader
            title="Specializations"
            subtitle="Explore focused domains and choose where you want to specialize next."
          />

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
              {categories.map((category, index) => (
                <div
                  key={`${category.title}-${index}`}
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

          <div className="mt-4 flex items-center justify-center gap-4">
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
              className="rounded-full bg-[#0f172a] p-2 shadow-lg shadow-[#3B82F6]/30 transition hover:bg-[#111827] active:scale-95 disabled:opacity-40"
            >
              <FiArrowLeft className="text-[#3B82F6]" />
            </button>

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
              className="rounded-full bg-[#0f172a] p-2 shadow-lg shadow-[#3B82F6]/30 transition hover:bg-[#111827] active:scale-95 disabled:opacity-40"
            >
              <FiArrowRight className="text-[#3B82F6]" />
            </button>
          </div>
        </section>

        <section className="py-2">
          <SectionHeader
            title="New & Updated Courses"
            subtitle="Freshly updated modules with current tools, mission workflows, and practical labs."
          />

          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() =>
                scrollSlider(
                  updatedSliderRef,
                  'left',
                  updatedIndex,
                  setUpdatedIndex,
                  updatedCourses.length
                )
              }
              className="rounded-full bg-[#0f172a] p-2 shadow-lg shadow-[#3B82F6]/30 text-[#3B82F6] transition hover:bg-[#111827] hover:text-white"
              aria-label="Scroll left"
            >
              <FiArrowLeft />
            </button>
            <button
              onClick={() =>
                scrollSlider(
                  updatedSliderRef,
                  'right',
                  updatedIndex,
                  setUpdatedIndex,
                  updatedCourses.length
                )
              }
              className="rounded-full bg-[#0f172a] p-2 shadow-lg shadow-[#3B82F6]/30 text-[#3B82F6] transition hover:bg-[#111827] hover:text-white"
              aria-label="Scroll right"
            >
              <FiArrowRight />
            </button>
          </div>

          <div
            ref={updatedSliderRef}
            className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-2xl bg-teal-950 p-5"
          >
            {updatedCourses.map((course, index) => (
              <div key={`${course.slug || course.id}-${index}`} className="min-w-[260px] snap-start">
                <CourseCard {...course} />
              </div>
            ))}
          </div>
          {!isLoading && !updatedCourses.length && (
            <p className="mt-3 text-sm text-slate-400">Newly updated courses will appear here when available.</p>
          )}
        </section>

        {isLearner && (
          <section className="space-y-8 py-2">
            <div>
              <SectionHeader
                title="Continue Learning"
                subtitle="Pick up right where you left off and keep your momentum toward career outcomes."
              />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2">
                {continueLearning.map((course) => (
                  <CourseCard key={`continue-${course.slug || course.id || course.title}`} {...course} />
                ))}
              </div>
            </div>

            <div>
              <SectionHeader
                title="Recommended for You"
                subtitle="Based on your current interests in aerospace systems, robotics, and AI applications."
              />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedCourses.map((course) => (
                  <CourseCard key={`recommended-${course.slug || course.id || course.title}`} {...course} />
                ))}
              </div>
            </div>
          </section>
        )}

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
              : visibleCourses.map((course) => <CourseCard key={course.slug || course.id || course.title} {...course} />)}
          </div>
          {!isLoading && !visibleCourses.length && (
            <p className="mt-3 text-sm text-slate-400">{courseError || 'No published courses found.'}</p>
          )}
        </section>

        <SupportingSection />

        <section className="py-2">
          <SectionHeader
            title="Real Learners. Real Career Growth."
            subtitle="Stories from learners who transitioned into space-tech, automation, and high-impact engineering roles."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
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

        <Motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-[#0b1220] via-[#0f172a] to-[#111827] px-6 py-10 text-white shadow-[0_18px_45px_rgba(0,0,0,0.4)]"
        >
          <div className="absolute -right-12 -top-10 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-semibold md:text-4xl">Start Your Journey into Space-Tech Today 🚀</h2>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 md:text-base">
                Build mission-ready skills in aerospace, robotics, drones, and AI with guided projects and expert instruction.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('popular-courses')
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="rounded-lg bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
              >
                Explore Courses
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = document.getElementById('learning-paths')
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className="rounded-lg border border-white/30 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-white/10 hover:text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        </Motion.section>
      </main>

      <Footer columns={footerColumns} />
    </div>
  )
}

export default Home
