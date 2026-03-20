import { useState } from 'react'
import { FiMenu, FiSearch } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import ExploreDropdown from './ExploreDropdown'
import { exploreMenuData } from '../data/homeData'

const Navbar = ({ links = [] }) => {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)

  const navItems = links.length > 0 ? links : ['Explore', 'Subscribe', 'Business', 'Teach on BSERC']

  const handleOpenExplore = () => {
    setActiveCategory(0)
    setIsExploreOpen(true)
  }

  const handleCloseExplore = () => {
    setIsExploreOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <span className="rounded-lg bg-teal-600 px-2 py-1 text-white">B</span>
          <span>Bserc-LMS</span>
        </div>

        <button className="inline-flex rounded-lg border border-slate-300 p-2 text-slate-700 md:hidden">
          <FiMenu size={18} />
        </button>

        <div className="relative hidden flex-1 md:block">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search for anything"
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500 focus:bg-white"
          />
        </div>

        <nav className="hidden items-center gap-5 text-sm text-slate-700 lg:flex">
          {navItems.map((item, index) => {
            if (item === 'Explore') {
              return (
                <div
                  key={`${item}-${index}`}
                  className="relative"
                  onMouseEnter={handleOpenExplore}
                  onMouseLeave={handleCloseExplore}
                >
                  <button className="text-sm font-medium transition hover:text-teal-700">{item}</button>

                  {isExploreOpen && (
                    <ExploreDropdown
                      menuData={exploreMenuData}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                    />
                  )}
                </div>
              )
            }

            return (
              <a
                key={`${item}-${index}`}
                href="#"
                className="transition hover:text-teal-700"
              >
                {item}
              </a>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
          >
            Login
          </Link>
          <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow transition hover:bg-slate-700">
            Signup
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden sm:px-6">
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search for courses"
            className="w-full rounded-full border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-teal-500"
          />
        </div>
      </div>
    </header>
  )
}

export default Navbar
