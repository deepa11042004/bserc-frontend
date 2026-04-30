import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExploreDropdown from './ExploreDropdown'
import { exploreMenuData } from '../data/homeData'

const ExploreMenu = () => {
  const [isExploreOpen, setIsExploreOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState(0)
  const navigate = useNavigate()

  const handleOpen = () => {
    setActiveCategory(0)
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

      {isExploreOpen && (
        <ExploreDropdown
          menuData={exploreMenuData}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          onChildClick={handleChildClick}
        />
      )}
    </div>
  )
}

export default ExploreMenu
