import { useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Footer from '../components/Footer';
import { User } from 'lucide-react';
import { Play } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import CourseCard from '../components/CourseCard';

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
} from '../data/homeData';

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
        <div className="min-h-screen flex flex-col">
            <Navbar links={navLinks} />
            <main className="mx-auto max-w-7xl space-y-14 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2 bg-white px-6 py-4 shadow-md rounded-lg">
                    {/* Profile Icon */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100">
                        <User className="text-gray-700" />
                    </div>

                    {/* Welcome Text */}
                    <h1 className="text-xl font-semibold text-gray-800">
                        Welcome back, <span className="text-green-600">BSERC User</span>
                    </h1>

                </div>
                <HeroSection />
                <div className=" bg-gray-100 p-8">

                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-semibold text-gray-800">
                            Let&apos;s start learning
                        </h1>
                        <a
                            href="https://www.youtube.com/playlist?list=PLu0W_9lII9agq5TrH9XLIKQvv0iaF2X3w" target='_blank'
                            className="text-purple-600 font-medium hover:underline"
                        >
                            My learning
                        </a>
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-md flex items-center overflow-hidden max-w-2xl">
                        {/* Thumbnail */}
                        <div className="relative w-40 h-28 bg-gray-300 flex-shrink-0">
                            <img
                                src="https://via.placeholder.com/300x200"
                                alt="Course"
                                className="w-full h-full object-cover"
                            />

                            {/* Play Button */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-white/80 backdrop-blur rounded-full p-3 shadow">
                                    <Play className="w-6 h-6 text-gray-800" />
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <p className="text-sm text-gray-500 mb-1 truncate max-w-md">
                                The Complete Full-Stack Web Development Course
                            </p>

                            <h2 className="text-lg font-semibold text-gray-800 mb-3">
                                374. Bonus
                            </h2>

                            <p className="text-sm text-gray-500">
                                Lecture • 10m
                            </p>
                        </div>
                    </div>
                </div>
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
    );
}

export default Dashboard;


