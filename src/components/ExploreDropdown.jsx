import React from 'react'

const ExploreDropdown = ({ menuData, activeCategory, setActiveCategory, onChildClick }) => {
  if (!menuData || menuData.length === 0) return null

  const safeActiveCategory = Math.max(0, Math.min(activeCategory, menuData.length - 1))
  const activeItem = menuData[safeActiveCategory]
  const activeChildren = Array.isArray(activeItem?.children) ? activeItem.children : []

  const leftClass = 'w-1/2'

  return (
    <div
      className="absolute left-0 top-full mt-2 w-[780px] rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-150 ease-out"
      data-testid="explore-dropdown"
    >
      <div className="flex min-h-[280px] items-start divide-x divide-slate-200">
        <div className={`${leftClass} space-y-2 p-4`}>
          {menuData.map((item, index) => {
            const isActive = index === safeActiveCategory
            const hasChildren = Array.isArray(item.children) && item.children.length > 0

            return (
              <button
                key={item.label}
                type="button"
                onMouseEnter={() => setActiveCategory(index)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                  isActive
                    ? 'bg-teal-100 text-teal-700 font-semibold shadow-sm'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  {hasChildren && (
                    <span
                      className={`text-sm transition ${
                        isActive ? 'text-teal-600' : 'text-slate-400'
                      }`}
                    >
                      ›
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        <div className="w-1/2 p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">
            {activeItem?.label}
          </h3>
          <ul className="space-y-1">
            {activeChildren.map((sub) => (
              <li key={sub}>
                <button
                  type="button"
                  onClick={() => onChildClick?.(activeItem?.label, sub)}
                  className="flex w-full items-center rounded-md px-3 py-2 text-left text-sm text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
                >
                  {sub}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExploreDropdown
