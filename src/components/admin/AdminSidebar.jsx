import {
  BarChart3,
  Bell,
  BookOpen,
  ClipboardList,
  Compass,
  FolderOpen,
  Globe,
  HandCoins,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  Megaphone,
  MessageCircle,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Tags,
  Users,
  Wallet,
} from 'lucide-react'

const AdminSidebar = ({ tabs = [], activeTab, onChange, onLogout, role }) => {
  const roleLabelMap = {
    admin: 'Admin Navigation',
    super_admin: 'Super Admin Navigation',
    instructor: 'Instructor Navigation',
  }

  const navigationLabel = roleLabelMap[role] || roleLabelMap.admin

  const mainIconMap = {
    overview: LayoutDashboard,
    courses: BookOpen,
    users: Users,
    instructors: ShieldCheck,
    orders: ShoppingBag,
    carts: ShoppingCart,
    reviews: Star,
    search: Search,
    discovery: Compass,
    content: Globe,
    coupons: Tags,
  }

  const mainItems = tabs.map((tab) => ({
    ...tab,
    icon: mainIconMap[tab.id] || mainIconMap[tab.label?.toLowerCase()] || LayoutDashboard,
    path: tab.path,
    isMain: true,
  }))

  const mainById = Object.fromEntries(mainItems.map((item) => [item.id, item]))

  const buildItem = ({ id, label, icon, path = '#', badge = null }) => {
    if (mainById[id]) {
      return { ...mainById[id], label: label || mainById[id].label, icon: icon || mainById[id].icon, badge }
    }
    return { id, label, icon, path, badge, isMain: false }
  }

  const adminSections = [
    {
      label: 'MAIN',
      items: [
        buildItem({ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }),
        buildItem({ id: 'courses', label: 'Courses', icon: BookOpen }),
        buildItem({ id: 'users', label: 'Users', icon: Users }),
        buildItem({ id: 'instructors', label: 'Instructors', icon: ShieldCheck }),
      ],
    },
    {
      label: 'MANAGEMENT',
      items: [
        buildItem({ id: 'reviews', label: 'Reviews', icon: Star }),
        { id: 'categories', label: 'Categories / Tags', icon: Tags, path: '/admin/categories', isMain: false },
        { id: 'enrollments', label: 'Enrollments', icon: Users, path: '/admin/enrollments', isMain: false },
      ],
    },
    {
      label: 'FINANCE',
      items: [
        buildItem({ id: 'orders', label: 'Orders', icon: ShoppingBag }),
        { id: 'transactions', label: 'Transactions', icon: ReceiptText, path: '/admin/transactions', isMain: false },
        { id: 'refunds', label: 'Refund Requests', icon: Wallet, path: '/admin/refunds', isMain: false },
      ],
    },
    {
      label: 'CONTENT',
      items: [
        buildItem({ id: 'content', label: 'Site Content', icon: Globe }),
        { id: 'announcements', label: 'Announcements', icon: Megaphone, path: '/admin/announcements', isMain: false },
        { id: 'notifications', label: 'Notifications', icon: Bell, path: '/admin/notifications', isMain: false },
      ],
    },
    {
      label: 'SYSTEM',
      items: [
        { id: 'reports', label: 'Reports / Analytics', icon: BarChart3, path: '/admin/reports', isMain: false },
        { id: 'support', label: 'Support / Tickets', icon: LifeBuoy, path: '/admin/support', isMain: false },
        { id: 'settings', label: 'Settings (limited)', icon: Settings, path: '/admin/settings', isMain: false },
      ],
    },
  ]

  const instructorSections = [
    {
      label: 'MAIN',
      items: [
        buildItem({ id: 'overview', label: 'Dashboard', icon: LayoutDashboard }),
        buildItem({ id: 'courses', label: 'My Courses', icon: BookOpen }),
        { id: 'create-course', label: 'Create Course', icon: Layers, path: '/admin/create-course', isMain: false },
      ],
    },
    {
      label: 'COURSE MANAGEMENT',
      items: [
        { id: 'curriculum', label: 'Curriculum / Lectures', icon: Layers, path: '/admin/curriculum', isMain: false },
        { id: 'assignments', label: 'Assignments / Quizzes', icon: ClipboardList, path: '/admin/assignments', isMain: false },
        { id: 'resources', label: 'Course Resources', icon: FolderOpen, path: '/admin/resources', isMain: false },
      ],
    },
    {
      label: 'STUDENTS',
      items: [
        { id: 'enrolled', label: 'Enrolled Students', icon: Users, path: '/admin/enrolled-students', isMain: false },
        { id: 'discussions', label: 'Q&A / Discussions', icon: MessageCircle, path: '/admin/discussions', isMain: false },
        { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/admin/messages', isMain: false },
      ],
    },
    {
      label: 'EARNINGS',
      items: [
        { id: 'earnings', label: 'Earnings / Revenue', icon: Wallet, path: '/admin/earnings', isMain: false },
        { id: 'payouts', label: 'Payouts', icon: HandCoins, path: '/admin/payouts', isMain: false },
        { id: 'transactions', label: 'Transactions', icon: ReceiptText, path: '/admin/transactions', isMain: false },
      ],
    },
    {
      label: 'ENGAGEMENT',
      items: [
        { id: 'instructor-reviews', label: 'Reviews & Ratings', icon: Star, path: '/admin/instructor-reviews', isMain: false },
        { id: 'instructor-announcements', label: 'Announcements', icon: Megaphone, path: '/admin/instructor-announcements', isMain: false },
      ],
    },
    {
      label: 'SETTINGS',
      items: [
        { id: 'profile', label: 'Profile', icon: Users, path: '/admin/profile', isMain: false },
        { id: 'account', label: 'Account Settings', icon: Settings, path: '/admin/account-settings', isMain: false },
      ],
    },
  ]

  const sections = role === 'instructor' ? instructorSections : adminSections

  const mainIds = new Set(mainItems.map((item) => item.id))

  const baseItemClasses = 'group flex items-center justify-between rounded-xl px-4 py-3 text-sm transition'
  const activeClasses = 'bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white shadow-lg shadow-indigo-900/50'
  const inactiveClasses = 'text-gray-400 hover:bg-white/5 hover:text-white'

  const renderItem = (item) => {
    const Icon = item.icon
    const isActive = mainIds.has(item.id) && item.id === activeTab
    const Tag = item.path && !mainIds.has(item.id) ? 'a' : 'button'

    return (
      <Tag
        key={item.id || item.label}
        href={Tag === 'a' ? item.path : undefined}
        onClick={Tag === 'button' && mainIds.has(item.id) ? () => onChange(item.id) : undefined}
        className={`${baseItemClasses} ${isActive ? activeClasses : inactiveClasses}`}
        type={Tag === 'button' ? 'button' : undefined}
      >
        <span className="flex items-center gap-3">
          {Icon && <Icon className="h-4 w-4" />}
          <span className="font-medium">{item.label}</span>
        </span>
        {item.badge != null && (
          <span className="rounded-full bg-white/10 px-2 text-xs text-slate-100">{item.badge}</span>
        )}
      </Tag>
    )
  }

  return (
    <aside className="sticky top-0 flex h-screen w-64 flex-shrink-0 flex-col overflow-y-auto rounded-2xl border border-slate-800 bg-gradient-to-b from-[#0b1220] via-[#0d152b] to-[#0a1020] p-4 shadow-2xl shadow-black/40 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-6 px-2 text-base font-semibold text-slate-200">{navigationLabel}</div>

      <div className="flex flex-1 flex-col gap-5">
        {sections.map((section) => (
          <div key={section.label} className="space-y-2">
            <div className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{section.label}</div>
            <div className="flex flex-col gap-2">
              {section.items.map((item) => renderItem(item))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/10 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-white/10 hover:text-white hover:shadow-[0_0_12px_rgba(99,102,241,0.35)]"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
