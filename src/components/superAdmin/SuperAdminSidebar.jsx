import { X } from 'lucide-react'

const SuperAdminSidebar = ({
  sections,
  activeSection,
  onChange,
  onLogout,
  isOpen,
  onClose,
}) => {
  const panel = (
    <aside className="flex h-full w-72 flex-col border-r border-[#1F1F23] bg-[#0F0F12]">
      <div className="flex h-16 items-center justify-between border-b border-[#1F1F23] px-5">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">BSERC LMS</div>
          <div className="text-sm font-semibold text-white">Super Admin</div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-[#2B2B30] p-1 text-slate-300 transition hover:bg-[#1A1A1F] lg:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <div className="space-y-3">
          {sections.map((section) => {
            if (section.items) {
              return (
                <div key={section.title} className="rounded-2xl bg-transparent">
                  <div className="px-4 py-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {section.title}
                  </div>
                  <div className="space-y-1 px-1 py-3">
                    {section.items.map((item) => {
                      const Icon = item.icon
                      const isActive = activeSection === item.id

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onChange(item.id)
                            onClose()
                          }}
                          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                            isActive
                              ? 'bg-[#1F1F23] font-medium text-white'
                              : 'text-slate-300 hover:bg-[#1A1A1F] hover:text-white'
                          }`}
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </span>
                          {item.badge != null && (
                            <span className="rounded-full bg-[#2B2B30] px-2 py-0.5 text-xs text-slate-200">{item.badge}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const Icon = section.icon
            const isActive = activeSection === section.id

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => {
                  onChange(section.id)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-[#1F1F23] font-medium text-white'
                    : 'text-slate-300 hover:bg-[#1A1A1F] hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span>{section.label}</span>
                </span>
                {section.badge != null && (
                  <span className="rounded-full bg-[#2B2B30] px-2 py-0.5 text-xs text-slate-200">{section.badge}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-[#1F1F23] p-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-md border border-[#2B2B30] px-3 py-2 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10"
        >
          Logout
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <div className="hidden h-screen lg:block">{panel}</div>

      <div
        className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {panel}
      </div>

      {isOpen && <button type="button" className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} aria-label="Close sidebar overlay" />}
    </>
  )
}

export default SuperAdminSidebar
