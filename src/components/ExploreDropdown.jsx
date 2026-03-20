import React from 'react'

const ExploreDropdown = ({ menuData, activeCategory, setActiveCategory }) => {
  if (!menuData || menuData.length === 0) return null

  const leftClass = 'w-1/2'

  return (
    <div
      className="absolute left-0 top-full mt-2 w-[780px] rounded-xl border border-slate-200 bg-white shadow-2xl transition-all duration-150 ease-out"
      data-testid="explore-dropdown"
    >
      <div className="flex min-h-[280px] items-start divide-x divide-slate-200">
        <div className={`${leftClass} space-y-2 p-4`}>
          {menuData.map((item, index) => {
            const isActive = index === activeCategory
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
            {menuData[activeCategory].label}
          </h3>
          <ul className="space-y-1">
            {menuData[activeCategory].children.map((sub) => (
              <li
                key={sub}
                className="rounded-md px-3 py-2 text-sm text-slate-600 transition hover:bg-teal-50 hover:text-teal-700"
              >
                {sub}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ExploreDropdown
