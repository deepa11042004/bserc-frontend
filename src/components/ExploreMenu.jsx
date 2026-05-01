import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExploreDropdown from './ExploreDropdown'
import { publicCourseService } from '../services/publicCourseService'

const normalizeText = (value = '') => String(value ?? '').trim()

const buildExploreMenuData = (courses = []) => {
  const groups = new Map()

  courses.forEach((course) => {
    const category = normalizeText(course.category)
    const slug = normalizeText(course.slug)

    if (!category || !slug) return

    const categoryKey = category.toLowerCase()
    if (!groups.has(categoryKey)) {
      groups.set(categoryKey, {
        label: category,
        children: new Set(),
      })
    }

    groups.get(categoryKey).children.add(slug)
  })

  return Array.from(groups.values())
    .map((group) => ({
      label: group.label,
      children: Array.from(group.children).sort((a, b) => a.localeCompare(b)),
    }))
    .filter((group) => group.children.length > 0)
    .sort((a, b) => a.label.localeCompare(b.label))
}

const ExploreMenu = () => {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const [menuData, setMenuData] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    let active = true

    const loadMenuData = async () => {
      try {
        const courses = await publicCourseService.getPublishedCourses()
        if (!active) return

        setMenuData(buildExploreMenuData(courses))
      } catch {
        if (!active) return
        setMenuData([])
      }
    }

    void loadMenuData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!menuData.length) {
      if (activeCategory !== 0) {
        setActiveCategory(0)
      }
      return
    }

    if (activeCategory >= menuData.length) {
      setActiveCategory(0)
    }
  }, [activeCategory, menuData.length])

  const handleOpen = () => {
    if (menuData.length) {
      setActiveCategory(0)
    }
    setIsExploreOpen(true)
  }

  const handleClose = () => {
    setIsExploreOpen(false)
  }

  const handleChildClick = (categoryLabel, childLabel) => {
    navigate(`/search?q=${encodeURIComponent(childLabel)}&category=${encodeURIComponent(categoryLabel)}`)
    setIsExploreOpen(false)
  }

  return (
    <div className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button className="text-sm font-medium transition hover:text-teal-700">Explore</button>

      {isExploreOpen && menuData.length > 0 && (
        <ExploreDropdown
          menuData={menuData}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onChildClick={handleChildClick}
        />
      )}
    </div>
  )
}

export default ExploreMenu
