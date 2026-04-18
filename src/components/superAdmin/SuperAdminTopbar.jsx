import { Bell, LogOut, Menu } from 'lucide-react'

const SuperAdminTopbar = ({
  title,
  subtitle,
  onMenuClick,
  notifications,
  userName,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between border-b border-[#1F1F23] bg-[#0F0F12] px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-md border border-[#2B2B30] p-2 text-slate-300 transition hover:bg-[#1A1A1F] lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div>
          <h1 className="text-base font-semibold text-white sm:text-lg">{title}</h1>
          {subtitle ? <p className="text-xs text-slate-400 sm:text-sm">{subtitle}</p> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className="relative rounded-md border border-[#2B2B30] p-2 text-slate-300 transition hover:bg-[#1A1A1F]"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <span className="absolute -right-1 -top-1 rounded-full bg-emerald-500 px-1.5 text-[10px] font-semibold text-black">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </button>

        <div className="hidden rounded-md border border-[#2B2B30] px-3 py-1.5 text-xs text-slate-300 sm:block">
          {userName || 'Super Admin'}
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-md border border-[#2B2B30] p-2 text-slate-300 transition hover:bg-[#1A1A1F]"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}

export default SuperAdminTopbar
