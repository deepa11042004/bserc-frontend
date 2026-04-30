import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { User } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import CourseCard from '../components/CourseCard'
import { publicCourseService } from '../services/publicCourseService'

import { footerColumns, navLinks } from '../data/homeData'

const getCourseKey = (course = {}) =>
    String(course.slug || course.apiCourseId || course.id || course.courseId || '')

const getCourseSortTime = (course = {}) => {
    const raw = course.updatedAt || course.createdAt
    if (!raw) return 0

    const time = new Date(raw).getTime()
    return Number.isFinite(time) ? time : 0
}

function Dashboard() {
    const updatedSliderRef = useRef(null)
    const [updatedIndex, setUpdatedIndex] = useState(0)
    const [courses, setCourses] = useState([])

    useEffect(() => {
        let active = true

        const loadCourses = async () => {
            try {
                const publishedCourses = await publicCourseService.getPublishedCourses()
                if (!active) return
                setCourses(publishedCourses)
            } catch {
                if (active) {
                    setCourses([])
                }
            }
        }

        void loadCourses()

        return () => {
            active = false
        }
    }, [])

    const trendingCourses = useMemo(() => courses.slice(0, 4), [courses])
    const updatedCourses = useMemo(() => {
        if (!courses.length) return []

        const sortedByRecency = [...courses].sort(
            (courseA, courseB) => getCourseSortTime(courseB) - getCourseSortTime(courseA),
        )

        const trendingCourseKeys = new Set(trendingCourses.map((course) => getCourseKey(course)).filter(Boolean))
        const nonTrendingCourses = sortedByRecency.filter(
            (course) => !trendingCourseKeys.has(getCourseKey(course)),
        )

        const source = nonTrendingCourses.length ? nonTrendingCourses : sortedByRecency
        return source.slice(0, 8)
    }, [courses, trendingCourses])

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
        <div className="min-h-screen flex flex-col bg-black text-white">
            <Navbar links={navLinks} />
            <main className="mx-auto max-w-7xl space-y-14 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 rounded-lg bg-[#0f172a] px-6 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111827]">
                        <User className="text-slate-200" />
                    </div>
                    <h1 className="text-xl font-semibold text-white">
                        Welcome back, <span className="text-[#22D3EE]">BSERC User</span>
                    </h1>
                </div>

                <HeroSection />

                <section>
                    <SectionHeader
                        title="Trending courses"
                        subtitle="Hot picks from learners this month."
                        action="View all"
                    />
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {trendingCourses.map((course) => (
                            <CourseCard key={course.slug || course.id || course.title} {...course} />
                        ))}
                    </div>
                    {!trendingCourses.length && (
                        <p className="mt-3 text-sm text-slate-400">No published courses available right now.</p>
                    )}
                </section>

                <div className="bg-[#0f172a] p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-3xl font-semibold text-white">Let&apos;s start learning</h1>
                            <p className="text-sm text-slate-400">Jump back into your enrolled courses.</p>
                        </div>
                        <Link
                            to="/my-learning"
                            className="inline-flex items-center justify-center rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-[#2563eb]"
                        >
                            My Learning
                        </Link>
                    </div>
                    <div className="mt-6 rounded-2xl border border-indigo-500/20 bg-[#111827] p-5 text-sm text-slate-300">
                        Access all your purchased courses in one place. Track progress, rate courses, and pick up where you left off.
                    </div>
                </div>

                <section>
                    <SectionHeader
                        title="Learn Robotics with BSERC"
                        subtitle="Short programs designed to help you use AI in your day-to-day work."
                    />

                    <div className="mb-4 flex justify-end gap-2">
                        <button
                            onClick={() =>
                                scrollSlider(updatedSliderRef, 'left', updatedIndex, setUpdatedIndex, updatedCourses.length)
                            }
                            className="rounded-full border border-indigo-500/40 bg-[#111827] p-2 text-slate-100 transition hover:border-[#3B82F6] hover:text-white"
                            aria-label="Scroll left"
                        >
                            <FiArrowLeft />
                        </button>
                        <button
                            onClick={() =>
                                scrollSlider(updatedSliderRef, 'right', updatedIndex, setUpdatedIndex, updatedCourses.length)
                            }
                            className="rounded-full border border-indigo-500/40 bg-[#111827] p-2 text-slate-100 transition hover:border-[#3B82F6] hover:text-white"
                            aria-label="Scroll right"
                        >
                            <FiArrowRight />
                        </button>
                    </div>

                    <div
                        ref={updatedSliderRef}
                        className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-2xl bg-[#0b1224] p-5"
                    >
                        {updatedCourses.map((course, index) => (
                            <div key={`${course.slug || course.id}-${index}`} className="min-w-[260px] snap-start">
                                <CourseCard {...course} />
                            </div>
                        ))}
                    </div>
                    {!updatedCourses.length && (
                        <p className="mt-3 text-sm text-slate-400">Newly updated courses will appear here once published.</p>
                    )}
                </section>

                <section>
          
                </section>
            </main>
            <Footer columns={footerColumns} />
        </div>
    )
}

export default Dashboard


