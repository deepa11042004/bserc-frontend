import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import HeroSection from '../components/HeroSection'
import Footer from '../components/Footer'
import { User } from 'lucide-react'
import SectionHeader from '../components/SectionHeader'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import CourseCard from '../components/CourseCard'

import { aiCourses, footerColumns, navLinks, trendingCourses } from '../data/homeData'

function Dashboard() {
    const aiSliderRef = useRef(null)
    const [aiIndex, setAiIndex] = useState(0)

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
                            <CourseCard key={course.title} {...course} />
                        ))}
                    </div>
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
                                scrollSlider(aiSliderRef, 'left', aiIndex, setAiIndex, aiCourses.length)
                            }
                            className="rounded-full border border-indigo-500/40 bg-[#111827] p-2 text-slate-100 transition hover:border-[#3B82F6] hover:text-white"
                            aria-label="Scroll left"
                        >
                            <FiArrowLeft />
                        </button>
                        <button
                            onClick={() =>
                                scrollSlider(aiSliderRef, 'right', aiIndex, setAiIndex, aiCourses.length)
                            }
                            className="rounded-full border border-indigo-500/40 bg-[#111827] p-2 text-slate-100 transition hover:border-[#3B82F6] hover:text-white"
                            aria-label="Scroll right"
                        >
                            <FiArrowRight />
                        </button>
                    </div>

                    <div
                        ref={aiSliderRef}
                        className="no-scrollbar relative flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-2xl bg-[#0b1224] p-5"
                    >
                        {aiCourses.map((course, index) => (
                            <div key={`${course.title}-${index}`} className="min-w-[260px] snap-start">
                                <CourseCard
                                    title={course.title}
                                    instructor={course.duration}
                                    rating={course.rating || '4.7'}
                                    price={course.price || '₹2,499'}
                                    image={course.image}
                                    description={course.description}
                                    learningPoints={course.learningPoints}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
          
                </section>
            </main>
            <Footer columns={footerColumns} />
        </div>
    )
}

export default Dashboard


