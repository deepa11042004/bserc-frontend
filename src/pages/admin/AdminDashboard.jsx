import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiActivity,
  FiBookOpen,
  FiEdit2,
  FiFlag,
  FiGift,
  FiGlobe,
  FiLayers,
  FiSearch,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTag,
  FiTrendingUp,
  FiTrash2,
  FiUserCheck,
  FiUsers,
} from 'react-icons/fi'
import AdminSidebar from '../../components/admin/AdminSidebar'
import StatCard from '../../components/admin/StatCard'
import AdminModal from '../../components/admin/AdminModal'
import { courseService } from '../../services/courseService'
import { userService } from '../../services/userService'
import { instructorService } from '../../services/instructorService'
import { orderService } from '../../services/orderService'
import { cartService } from '../../services/cartService'
import { searchService } from '../../services/searchService'
import { statsService } from '../../services/statsService'
import { reviewService } from '../../services/reviewService'
import { siteContentService } from '../../services/siteContentService'
import { couponService } from '../../services/couponService'
import { useAuthState } from '../../hooks/useAuth'
import { logoutAdmin } from '../../utils/auth'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthState()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [instructors, setInstructors] = useState([])
  const [orders, setOrders] = useState([])
  const [carts, setCarts] = useState([])
  const [searchConfig, setSearchConfig] = useState({ suggestions: [], recommendedTags: [], categories: [], trendingTopics: [] })
  const [reviews, setReviews] = useState([])
  const [siteContent, setSiteContent] = useState({ homepage: {}, footer: {}, navbar: {}, specials: [] })
  const [coupons, setCoupons] = useState([])
  const [navbarDraft, setNavbarDraft] = useState({ label: '', href: '' })
  const [specialDraft, setSpecialDraft] = useState({ title: '', description: '', cta: '', href: '' })
  const [couponDraft, setCouponDraft] = useState({ code: '', percentOff: 0, description: '', active: true })
  const [userQuery, setUserQuery] = useState('')
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [previewCourse, setPreviewCourse] = useState(null)

  useEffect(() => {
    const bootstrap = async () => {
      const [statRes, courseRes, userRes, instructorRes, orderRes, cartRes, searchRes, reviewRes, contentRes, couponRes] =
        await Promise.all([
          statsService.getStats(),
          courseService.getCourses(),
          userService.getUsers(),
          instructorService.getInstructors(),
          orderService.getOrders(),
          cartService.getCarts(),
          searchService.getSearchConfig(),
          reviewService.getReviews(),
          siteContentService.getSiteContent(),
          couponService.getCoupons(),
        ])
      setStats(statRes)
      setCourses(courseRes)
      setUsers(userRes)
      setInstructors(instructorRes)
      setOrders(orderRes)
      setCarts(cartRes)
      setSearchConfig(searchRes)
      setReviews(reviewRes)
      setSiteContent(contentRes)
      setCoupons(couponRes)
      setLoading(false)
    }

    bootstrap()
  }, [])

  const instructorMap = useMemo(() => Object.fromEntries(instructors.map((i) => [i.id, i])), [instructors])
  const courseMap = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])
  const userMap = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users])

  const filteredUsers = useMemo(() => {
    if (!userQuery.trim()) return users
    const q = userQuery.toLowerCase()
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }, [users, userQuery])

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: <FiActivity />, badge: null },
    { id: 'courses', label: 'Courses', icon: <FiBookOpen />, badge: courses.length },
    { id: 'users', label: 'Users', icon: <FiUsers />, badge: users.length },
    { id: 'instructors', label: 'Instructors', icon: <FiUserCheck /> },
    { id: 'orders', label: 'Orders', icon: <FiShoppingCart />, badge: orders.length },
    { id: 'carts', label: 'Carts', icon: <FiShoppingCart /> },
    { id: 'reviews', label: 'Reviews', icon: <FiStar /> },
    { id: 'search', label: 'Search & Tags', icon: <FiTag /> },
    { id: 'discovery', label: 'Discovery', icon: <FiTrendingUp /> },
    { id: 'content', label: 'Site Content', icon: <FiGlobe /> },
    { id: 'coupons', label: 'Coupons', icon: <FiGift /> },
  ]

  const openNewCourse = () => {
    setEditingCourse(null)
    setShowCourseModal(true)
  }

  const openEditCourse = (course) => {
    setEditingCourse(course)
    setShowCourseModal(true)
  }

  const handleDeleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
  }

  const handleCourseSubmit = async (payload) => {
    try {
      if (editingCourse) {
        const updated = await courseService.updateCourse(editingCourse.id, payload)
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? { ...c, ...updated } : c)))
      } else {
        const created = await courseService.addCourse(payload)
        setCourses((prev) => [...prev, created])
        console.log('Add Course submission successful', created)
      }
      setShowCourseModal(false)
    } catch (error) {
      console.error('Add Course submission failed', error)
    }
  }

  const handleSearchConfigUpdate = async (payload) => {
    const res = await searchService.updateSearchConfig(payload)
    setSearchConfig(res)
  }

  const handleUserStatus = (id, nextStatus) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, status: nextStatus } : u)))
  }

  const handleDeleteReview = async (id) => {
    await reviewService.deleteReview(id)
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  const handleHomepageUpdate = async (payload) => {
    const res = await siteContentService.updateHomepage(payload)
    setSiteContent((prev) => ({ ...prev, homepage: res }))
  }

  const handleFooterUpdate = async (payload) => {
    const res = await siteContentService.updateFooter(payload)
    setSiteContent((prev) => ({ ...prev, footer: res }))
  }

  const handleNavbarUpdate = async (payload) => {
    const res = await siteContentService.updateNavbar(payload)
    setSiteContent((prev) => ({ ...prev, navbar: res }))
  }

  const handleSpecialsUpdate = async (payload) => {
    const res = await siteContentService.updateSpecials(payload)
    setSiteContent((prev) => ({ ...prev, specials: res }))
  }

  const handleCouponAdd = async (payload) => {
    const created = await couponService.addCoupon(payload)
    setCoupons((prev) => [...prev, created])
  }

  const handleCouponUpdate = async (code, payload) => {
    const updated = await couponService.updateCoupon(code, payload)
    setCoupons((prev) => prev.map((c) => (c.code === code ? updated : c)))
  }

  const handleCouponDelete = async (code) => {
    await couponService.deleteCoupon(code)
    setCoupons((prev) => prev.filter((c) => c.code !== code))
  }

  const formatINR = (amount) => `₹${amount?.toLocaleString('en-IN') || '0'}`

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-white">Loading admin data...</div>

  const handleLogout = () => logoutAdmin(navigate)

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <AdminSidebar role={user?.role} tabs={tabs} activeTab={activeTab} onChange={setActiveTab} onLogout={handleLogout} />

        <div className="flex-1 space-y-6">
          <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0f172a] px-5 py-4 shadow-2xl shadow-black/40">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-400">Admin Panel</div>
              <h1 className="text-2xl font-semibold">Manage platform at a glance</h1>
            </div>
            <button
              onClick={openNewCourse}
              className="rounded-full bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
            >
              Add course
            </button>
          </header>

          {activeTab === 'overview' && (
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Users" value={stats.totalUsers?.toLocaleString('en-IN')} helper="All roles" />
                <StatCard label="Total Courses" value={stats.totalCourses} helper="Published + drafts" />
                <StatCard label="Total Sales" value={formatINR(stats.totalSales)} helper="Lifetime gross" />
                <StatCard label="Active Learners" value={stats.activeLearners?.toLocaleString('en-IN')} helper="Last 30 days" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
                    Top performing courses
                  </div>
                  <div className="space-y-3 text-sm">
                    {[...courses]
                      .slice(0, 4)
                      .map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                        >
                          <div>
                            <div className="font-semibold text-white">{course.title}</div>
                            <div className="text-xs text-slate-400">{course.categories?.join(', ')} · {course.language}</div>
                          </div>
                          <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-indigo-200">{course.status}</div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                  <div className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-200">
                    Recent orders
                  </div>
                  <div className="space-y-3 text-sm">
                    {[...orders]
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .slice(0, 5)
                      .map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2"
                        >
                          <div>
                            <div className="font-semibold text-white">{courseMap[order.courseId]?.title || order.courseId}</div>
                            <div className="text-xs text-slate-400">{userMap[order.userId]?.name || order.userId} · {order.date}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-indigo-200">{formatINR(order.amount)}</div>
                            <div className="text-xs text-slate-400">{order.status}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'courses' && (
            <section className="space-y-4">
              <div className="flex items-center justify-between text-sm text-slate-300">
                <div>{courses.length} courses</div>
                <button
                  onClick={openNewCourse}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs transition hover:border-indigo-500 hover:text-indigo-200"
                >
                  + Add course
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a]">
                <div className="grid grid-cols-12 bg-slate-900/60 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-400">
                  <div className="col-span-4">Course</div>
                  <div className="col-span-2">Instructor</div>
                  <div className="col-span-2">Pricing</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {courses.map((course) => (
                    <div key={course.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                      <div className="col-span-4">
                        <div className="font-semibold text-white">{course.title}</div>
                        <div className="text-xs text-slate-400">{course.slug} · {course.language}</div>
                      </div>
                      <div className="col-span-2 text-slate-300">{instructorMap[course.instructorId]?.name || '—'}</div>
                      <div className="col-span-2 text-slate-300">
                        {formatINR(course.price?.amount || 0)}
                        <div className="text-xs text-slate-400">{course.price?.currency}</div>
                      </div>
                      <div className="col-span-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-indigo-200">{course.status}</span>
                        <div className="text-xs text-slate-400">{course.categories?.join(', ')}</div>
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewCourse(course)}
                          className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-indigo-500 hover:text-white"
                        >
                          <FiSearch size={14} />
                        </button>
                        <button
                          onClick={() => openEditCourse(course)}
                          className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-indigo-500 hover:text-white"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-red-500 hover:text-white"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    value={userQuery}
                    onChange={(e) => setUserQuery(e.target.value)}
                    placeholder="Search users by name or email"
                    className="w-full rounded-full border border-slate-800 bg-[#0f172a] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-indigo-600"
                  />
                </div>
                <div className="text-sm text-slate-400">{filteredUsers.length} users</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a]">
                <div className="grid grid-cols-12 bg-slate-900/60 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-400">
                  <div className="col-span-3">User</div>
                  <div className="col-span-3">Email</div>
                  <div className="col-span-2">Role</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Courses</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                      <div className="col-span-3 font-semibold text-white">{user.name}</div>
                      <div className="col-span-3 text-slate-300">{user.email}</div>
                      <div className="col-span-2 text-slate-300">{user.role}</div>
                      <div className="col-span-2 text-slate-300">{user.status}</div>
                      <div className="col-span-1 text-right text-slate-300">{user.enrolledCourses.length}</div>
                      <div className="col-span-1 flex justify-end gap-2">
                        <button
                          onClick={() => handleUserStatus(user.id, 'Blocked')}
                          className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-red-500 hover:text-white"
                        >
                          Block
                        </button>
                        <button
                          onClick={() => handleUserStatus(user.id, 'Suspended')}
                          className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-amber-500 hover:text-white"
                        >
                          Suspend
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'instructors' && (
            <section className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {instructors.map((inst) => (
                  <div key={inst.id} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4 shadow-lg shadow-black/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{inst.name}</div>
                        <div className="text-sm text-slate-400">{inst.expertise}</div>
                      </div>
                      <div className="rounded-full bg-slate-800 px-3 py-1 text-xs text-indigo-200">{inst.rating}★</div>
                    </div>
                    <div className="mt-3 text-sm text-slate-300">
                      {inst.students.toLocaleString()} learners overall
                    </div>
                    <div className="mt-3 text-xs text-slate-400">Courses</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-indigo-200">
                      {inst.courseIds.map((cid) => (
                        <span key={cid} className="rounded-full bg-indigo-900/40 px-3 py-1 text-indigo-100">
                          {courseMap[cid]?.title || cid}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'orders' && (
            <section className="space-y-4">
              <div className="text-sm text-slate-300">{orders.length} orders</div>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a]">
                <div className="grid grid-cols-12 bg-slate-900/60 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-400">
                  <div className="col-span-3">Course</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-2">Payment</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3 text-right">Date</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {orders.map((order) => (
                    <div key={order.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                      <div className="col-span-3 font-semibold text-white">{courseMap[order.courseId]?.title || order.courseId}</div>
                      <div className="col-span-2 text-slate-300">{userMap[order.userId]?.name || order.userId}</div>
                      <div className="col-span-2 text-slate-300">{formatINR(order.amount)} · {order.paymentMethod}</div>
                      <div className="col-span-2">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-indigo-200">{order.status}</span>
                      </div>
                      <div className="col-span-3 text-right text-slate-400">{order.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'carts' && (
            <section className="space-y-4">
              <div className="text-sm text-slate-300">{carts.length} carts</div>
              <div className="grid gap-4 md:grid-cols-2">
                {carts.map((cart) => (
                  <div key={cart.userId} className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-lg font-semibold text-white">{userMap[cart.userId]?.name || cart.userId}</div>
                        <div className="text-sm text-slate-400">{cart.items.length} item(s)</div>
                      </div>
                      <div className="text-xs text-slate-400">Updated {cart.lastUpdated}</div>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-slate-300">
                      {cart.items.map((item) => (
                        <div key={item.courseId} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2">
                          <div>
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-xs text-slate-400">{courseMap[item.courseId]?.categories?.[0] || 'Course'}</div>
                          </div>
                          <div className="text-indigo-200">{formatINR(item.price)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="space-y-4">
              <div className="text-sm text-slate-300">{reviews.length} reviews</div>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a]">
                <div className="grid grid-cols-12 bg-slate-900/60 px-4 py-3 text-left text-xs uppercase tracking-wide text-slate-400">
                  <div className="col-span-3">Course</div>
                  <div className="col-span-2">User</div>
                  <div className="col-span-1">Rating</div>
                  <div className="col-span-4">Comment</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm">
                      <div className="col-span-3 font-semibold text-white">{courseMap[rev.courseId]?.title || rev.courseId}</div>
                      <div className="col-span-2 text-slate-300">{userMap[rev.userId]?.name || rev.userId}</div>
                      <div className="col-span-1 text-amber-300">{rev.rating}★</div>
                      <div className="col-span-4 text-slate-300">{rev.comment}</div>
                      <div className="col-span-1 text-xs text-slate-400">{rev.date}</div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="rounded-full border border-slate-700 p-2 text-slate-200 transition hover:border-red-500 hover:text-white"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 'search' && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Search suggestions</div>
                    <div className="text-xs text-slate-400">Manage live query hints</div>
                  </div>
                </div>
                <TagManager
                  tags={searchConfig.suggestions}
                  onChange={(next) => handleSearchConfigUpdate({ ...searchConfig, suggestions: next })}
                  placeholder="Add suggestion"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Recommended tags</div>
                    <div className="text-xs text-slate-400">Surface on search and homepage</div>
                  </div>
                </div>
                <TagManager
                  tags={searchConfig.recommendedTags}
                  onChange={(next) => handleSearchConfigUpdate({ ...searchConfig, recommendedTags: next })}
                  placeholder="Add recommended tag"
                />
              </div>
            </section>
          )}

          {activeTab === 'discovery' && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Categories</div>
                    <div className="text-xs text-slate-400">Shown on search and homepage</div>
                  </div>
                </div>
                <TagManager
                  tags={searchConfig.categories || []}
                  onChange={(next) => handleSearchConfigUpdate({ ...searchConfig, categories: next })}
                  placeholder="Add category"
                />
              </div>
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">Trending topics</div>
                    <div className="text-xs text-slate-400">Drives discovery rails</div>
                  </div>
                </div>
                <TagManager
                  tags={searchConfig.trendingTopics || []}
                  onChange={(next) => handleSearchConfigUpdate({ ...searchConfig, trendingTopics: next })}
                  placeholder="Add trending topic"
                />
              </div>
            </section>
          )}

          {activeTab === 'content' && (
            <section className="space-y-5">
              <Section title="Homepage">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Hero title" value={siteContent.homepage?.heroTitle || ''} onChange={(v) => handleHomepageUpdate({ heroTitle: v })} />
                  <Field label="Hero subtitle" value={siteContent.homepage?.heroSubtitle || ''} onChange={(v) => handleHomepageUpdate({ heroSubtitle: v })} />
                </div>
                <ChipInput
                  label="Featured course IDs"
                  values={siteContent.homepage?.featuredCourseIds || []}
                  onChange={(vals) => handleHomepageUpdate({ featuredCourseIds: vals })}
                  placeholder="Add course id"
                />
              </Section>

              <Section title="Navbar links">
                <div className="flex flex-wrap gap-2">
                  {(siteContent.navbar?.links || []).map((link, idx) => (
                    <span key={`${link.href}-${idx}`} className="flex items-center gap-2 rounded-full bg-indigo-900/40 px-3 py-1 text-xs text-indigo-100">
                      {link.label} ({link.href})
                      <button
                        type="button"
                        onClick={() => handleNavbarUpdate({ links: (siteContent.navbar?.links || []).filter((_, i) => i !== idx) })}
                        className="text-slate-300 hover:text-white"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <Field label="Label" value={navbarDraft.label} onChange={(v) => setNavbarDraft((prev) => ({ ...prev, label: v }))} />
                  <Field label="Href" value={navbarDraft.href} onChange={(v) => setNavbarDraft((prev) => ({ ...prev, href: v }))} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!navbarDraft.label || !navbarDraft.href) return
                    const next = [...(siteContent.navbar?.links || []), { ...navbarDraft }]
                    handleNavbarUpdate({ links: next })
                    setNavbarDraft({ label: '', href: '' })
                  }}
                  className="mt-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-white transition hover:border-indigo-500"
                >
                  Add link
                </button>
              </Section>

              <Section title="Special sections">
                <div className="space-y-2">
                  {(siteContent.specials || []).map((special, idx) => (
                    <div key={`${special.title}-${idx}`} className="rounded border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-white">{special.title}</div>
                        <button
                          type="button"
                          onClick={() => handleSpecialsUpdate((siteContent.specials || []).filter((_, i) => i !== idx))}
                          className="text-red-400 hover:text-red-200"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="text-slate-300">{special.description}</div>
                      <div className="text-xs text-indigo-200">{special.cta} → {special.href}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <Field label="Title" value={specialDraft.title} onChange={(v) => setSpecialDraft((p) => ({ ...p, title: v }))} />
                  <Field label="CTA" value={specialDraft.cta} onChange={(v) => setSpecialDraft((p) => ({ ...p, cta: v }))} />
                  <Field label="Description" value={specialDraft.description} onChange={(v) => setSpecialDraft((p) => ({ ...p, description: v }))} />
                  <Field label="Href" value={specialDraft.href} onChange={(v) => setSpecialDraft((p) => ({ ...p, href: v }))} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!specialDraft.title) return
                    const next = [...(siteContent.specials || []), specialDraft]
                    handleSpecialsUpdate(next)
                    setSpecialDraft({ title: '', description: '', cta: '', href: '' })
                  }}
                  className="mt-2 rounded-lg border border-slate-700 px-3 py-2 text-xs text-white transition hover:border-indigo-500"
                >
                  Add special section
                </button>
              </Section>

              <Section title="Footer">
                <div className="grid gap-3 md:grid-cols-2">
                  {(siteContent.footer?.columns || []).map((col, idx) => (
                    <div key={`${col.title}-${idx}`} className="space-y-2">
                      <Field label="Column title" value={col.title} onChange={(v) => handleFooterUpdate({ columns: (siteContent.footer?.columns || []).map((c, i) => (i === idx ? { ...c, title: v } : c)) })} />
                      <Textarea
                        label="Links (comma separated)"
                        value={(col.links || []).join(', ')}
                        onChange={(v) => handleFooterUpdate({ columns: (siteContent.footer?.columns || []).map((c, i) => (i === idx ? { ...c, links: v.split(',').map((s) => s.trim()).filter(Boolean) } : c)) })}
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </section>
          )}

          {activeTab === 'coupons' && (
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Coupons</div>
                  <div className="text-xs text-slate-400">Configure offers without touching carts</div>
                </div>
                <div className="divide-y divide-slate-800">
                  {coupons.map((coupon) => (
                    <div key={coupon.code} className="grid grid-cols-12 items-center px-1 py-2 text-sm text-slate-200">
                      <div className="col-span-3 font-semibold text-white">{coupon.code}</div>
                      <div className="col-span-2">{coupon.percentOff}% off</div>
                      <div className="col-span-4 text-slate-300">{coupon.description}</div>
                      <div className="col-span-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${coupon.active ? 'bg-emerald-900/40 text-emerald-200' : 'bg-slate-800 text-slate-300'}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end gap-2">
                        <button
                          onClick={() => handleCouponUpdate(coupon.code, { ...coupon, active: !coupon.active })}
                          className="rounded-full border border-slate-700 px-2 py-1 text-xs text-slate-200 transition hover:border-indigo-500"
                        >
                          Toggle
                        </button>
                        <button
                          onClick={() => handleCouponDelete(coupon.code)}
                          className="rounded-full border border-slate-700 px-2 py-1 text-xs text-red-300 transition hover:border-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && <div className="py-3 text-sm text-slate-400">No coupons configured.</div>}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] p-4">
                <div className="mb-3 text-sm font-semibold text-white">Add coupon</div>
                <div className="grid gap-3 md:grid-cols-4">
                  <Field label="Code" value={couponDraft.code} onChange={(v) => setCouponDraft((p) => ({ ...p, code: v }))} />
                  <Field label="Percent off" type="number" value={couponDraft.percentOff} onChange={(v) => setCouponDraft((p) => ({ ...p, percentOff: v }))} />
                  <Field label="Description" value={couponDraft.description} onChange={(v) => setCouponDraft((p) => ({ ...p, description: v }))} />
                  <label className="flex items-center gap-2 text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={couponDraft.active}
                      onChange={(e) => setCouponDraft((p) => ({ ...p, active: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    Active
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!couponDraft.code) return
                    handleCouponAdd(couponDraft)
                    setCouponDraft({ code: '', percentOff: 0, description: '', active: true })
                  }}
                  className="mt-3 rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
                >
                  Save coupon
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {showCourseModal && (
        <CourseModal
          instructors={instructors}
          currentUser={user}
          onClose={() => setShowCourseModal(false)}
          onSubmit={handleCourseSubmit}
          initialData={editingCourse}
        />
      )}
      {previewCourse && <CoursePreviewModal course={previewCourse} onClose={() => setPreviewCourse(null)} />}
    </div>
  )
}

const TagManager = ({ tags, onChange, placeholder }) => {
  const [input, setInput] = useState('')

  const addTag = () => {
    if (!input.trim()) return
    const value = input.trim()
    if (tags.includes(value)) return
    onChange([...tags, value])
    setInput('')
  }

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag))

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-2 rounded-full bg-indigo-900/40 px-3 py-1 text-xs text-indigo-100">
            {tag}
            <button onClick={() => removeTag(tag)} className="text-slate-300 hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-600"
        />
        <button
          onClick={addTag}
          className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
        >
          Add
        </button>
      </div>
    </div>
  )
}
const defaultCourseShape = (instructors, currentUser) => ({
  id: '',
  title: '',
  subtitle: '',
  slug: '',
  descriptionShort: '',
  descriptionLong: '',
  category: '',
  level: 'Beginner',
  language: 'English',
  price: 0,
  discountPrice: 0,
  isPaid: true,
  thumbnailSmall: '',
  thumbnailMedium: '',
  thumbnailLarge: '',
  previewVideoUrl: '',
  instructorId: currentUser?.id ? String(currentUser.id) : instructors[0]?.id ? String(instructors[0].id) : '',
  status: 'published',
  visibility: 'public',
  lifetimeAccess: true,
  certificateAvailable: true,
})

const normalizeNumberInput = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const CourseModal = ({ initialData, onClose, onSubmit, instructors, currentUser }) => {
  const isInstructorRole = currentUser?.role === 'instructor'

  const [form, setForm] = useState(() => {
    const base = defaultCourseShape(instructors, currentUser)
    const initialPrice = Number(initialData?.price?.amount ?? initialData?.price ?? base.price)
    const directDiscountPrice = Number(initialData?.discountPrice ?? initialData?.discount_price)
    const legacyDiscountPercent = Number(initialData?.price?.discount?.percent || 0)
    const derivedDiscountPrice = Number.isFinite(directDiscountPrice)
      ? directDiscountPrice
      : legacyDiscountPercent > 0 && Number.isFinite(initialPrice)
        ? Number((initialPrice - (initialPrice * legacyDiscountPercent) / 100).toFixed(2))
        : base.discountPrice

    return {
      ...base,
      ...initialData,
      category: initialData?.category || initialData?.categories?.[0] || base.category,
      price: Number.isFinite(initialPrice) ? initialPrice : base.price,
      discountPrice: Number.isFinite(derivedDiscountPrice) ? derivedDiscountPrice : base.discountPrice,
      isPaid: initialData?.isPaid ?? initialData?.is_paid ?? (Number.isFinite(initialPrice) ? initialPrice > 0 : base.isPaid),
      thumbnailSmall: initialData?.thumbnailSmall || initialData?.thumbnail_small || initialData?.thumbnail || base.thumbnailSmall,
      thumbnailMedium: initialData?.thumbnailMedium || initialData?.thumbnail_medium || initialData?.thumbnail || base.thumbnailMedium,
      thumbnailLarge: initialData?.thumbnailLarge || initialData?.thumbnail_large || initialData?.thumbnail || base.thumbnailLarge,
      previewVideoUrl: initialData?.previewVideoUrl || initialData?.preview_video_url || initialData?.previewVideo || base.previewVideoUrl,
      instructorId: String(initialData?.instructorId || initialData?.instructor_id || base.instructorId || ''),
      status: String(initialData?.status || base.status).toLowerCase(),
      visibility: String(initialData?.visibility || base.visibility).toLowerCase(),
      lifetimeAccess: initialData?.lifetimeAccess ?? initialData?.lifetime_access ?? base.lifetimeAccess,
      certificateAvailable: initialData?.certificateAvailable ?? initialData?.certificate_available ?? base.certificateAvailable,
    }
  })

  useEffect(() => {
    if (!isInstructorRole || !currentUser?.id) return
    setForm((prev) => ({ ...prev, instructorId: String(currentUser.id) }))
  }, [isInstructorRole, currentUser?.id])

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()

    const normalized = {
      title: (form.title || '').trim(),
      subtitle: (form.subtitle || '').trim(),
      slug: (form.slug || '').trim(),
      descriptionShort: (form.descriptionShort || '').trim(),
      descriptionLong: (form.descriptionLong || '').trim(),
      category: (form.category || '').trim(),
      level: form.level || 'Beginner',
      language: (form.language || 'English').trim(),
      price: form.isPaid ? normalizeNumberInput(form.price, 0) : 0,
      discountPrice: form.isPaid ? normalizeNumberInput(form.discountPrice, 0) : null,
      isPaid: Boolean(form.isPaid),
      thumbnailSmall: (form.thumbnailSmall || '').trim(),
      thumbnailMedium: (form.thumbnailMedium || '').trim(),
      thumbnailLarge: (form.thumbnailLarge || '').trim(),
      previewVideoUrl: (form.previewVideoUrl || '').trim(),
      instructorId: form.instructorId ? Number.parseInt(form.instructorId, 10) : '',
      status: (form.status || 'published').toLowerCase(),
      visibility: (form.visibility || 'public').toLowerCase(),
      lifetimeAccess: Boolean(form.lifetimeAccess),
      certificateAvailable: Boolean(form.certificateAvailable),
      currency: 'INR',
    }

    onSubmit(normalized)
  }

  return (
    <AdminModal title={initialData ? 'Edit course' : 'Add course'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <Section title="Basic information">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title" value={form.title} onChange={(v) => updateField('title', v)} required />
            <Field label="Slug" value={form.slug} onChange={(v) => updateField('slug', v)} helper="Leave blank to auto-generate" />
            <Field label="Subtitle" value={form.subtitle} onChange={(v) => updateField('subtitle', v)} />
            <Field label="Category" value={form.category} onChange={(v) => updateField('category', v)} helper="Example: Aerospace" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-slate-300">
              <span>Level</span>
              <select
                value={form.level}
                onChange={(e) => updateField('level', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
              >
                {['Beginner', 'Intermediate', 'Advanced'].map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <Field label="Language" value={form.language} onChange={(v) => updateField('language', v)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Textarea label="Short description" value={form.descriptionShort} onChange={(v) => updateField('descriptionShort', v)} />
            <Textarea label="Long description" value={form.descriptionLong} onChange={(v) => updateField('descriptionLong', v)} />
          </div>
        </Section>

        <Section title="Pricing and access">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={!!form.isPaid}
                onChange={(e) => updateField('isPaid', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>Paid course</span>
            </label>
            <Field label="Price" type="number" value={form.price} onChange={(v) => updateField('price', v)} />
            <Field label="Discount price" type="number" value={form.discountPrice} onChange={(v) => updateField('discountPrice', v)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={!!form.lifetimeAccess}
                onChange={(e) => updateField('lifetimeAccess', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>Lifetime access</span>
            </label>

            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={!!form.certificateAvailable}
                onChange={(e) => updateField('certificateAvailable', e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>Certificate available</span>
            </label>
          </div>
        </Section>

        <Section title="Media">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Thumbnail (small)" value={form.thumbnailSmall} onChange={(v) => updateField('thumbnailSmall', v)} />
            <Field label="Thumbnail (medium)" value={form.thumbnailMedium} onChange={(v) => updateField('thumbnailMedium', v)} />
            <Field label="Thumbnail (large)" value={form.thumbnailLarge} onChange={(v) => updateField('thumbnailLarge', v)} />
            <Field label="Preview video URL" value={form.previewVideoUrl} onChange={(v) => updateField('previewVideoUrl', v)} />
          </div>
        </Section>

        <Section title="Ownership and publish settings">
          <div className="grid gap-3 md:grid-cols-3">
            {isInstructorRole ? (
              <label className="space-y-1 text-slate-300 md:col-span-1">
                <span>Instructor ID</span>
                <input
                  readOnly
                  value={form.instructorId}
                  className="w-full rounded-lg border border-slate-800 bg-slate-800/80 px-3 py-2 text-white outline-none"
                />
                <div className="text-xs text-slate-500">Auto-assigned from your account.</div>
              </label>
            ) : (
              <label className="space-y-1 text-slate-300 md:col-span-1">
                <span>Instructor</span>
                <select
                  value={form.instructorId}
                  onChange={(e) => updateField('instructorId', e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
                >
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-slate-900">
                      {inst.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="space-y-1 text-slate-300">
              <span>Status</span>
              <select
                value={form.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
              >
                {['published', 'draft', 'pending'].map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1 text-slate-300">
              <span>Visibility</span>
              <select
                value={form.visibility}
                onChange={(e) => updateField('visibility', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
              >
                {['public', 'private', 'unlisted'].map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563EB]"
          >
            Save course
          </button>
        </div>
      </form>
    </AdminModal>
  )
}

const CoursePreviewModal = ({ course, onClose }) => (
  <AdminModal title="Preview course" onClose={onClose}>
    <div className="space-y-4 text-sm text-slate-200">
      <div>
        <div className="text-xl font-semibold text-white">{course.title}</div>
        <div className="text-slate-400">{course.subtitle}</div>
        <div className="text-xs text-slate-500">Slug: {course.slug}</div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div>
          <div className="font-semibold text-white">Basic info</div>
          <div className="text-slate-300">{course.descriptionShort}</div>
          <div className="text-xs text-slate-500">{course.descriptionLong}</div>
          <div className="text-xs text-slate-400">Language: {course.language}</div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-white">Pricing</div>
          <div>{course.price?.currency} {course.price?.amount}</div>
          {course.price?.discount?.percent ? <div className="text-xs text-amber-300">Discount: {course.price.discount.percent}% ({course.price.discount.code || 'no code'})</div> : null}
          <div className="text-xs text-slate-400">Lifetime access: {course.settings?.lifetimeAccess ? 'Yes' : 'No'}</div>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3 text-xs text-indigo-100">
        <div className="space-y-1">
          <div className="font-semibold text-white">Captions</div>
          <div className="flex flex-wrap gap-2">{course.captions?.map((c) => <span key={c} className="rounded-full bg-indigo-900/40 px-3 py-1">{c}</span>)}</div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-white">Categories</div>
          <div className="flex flex-wrap gap-2">{course.categories?.map((c) => <span key={c} className="rounded-full bg-indigo-900/40 px-3 py-1">{c}</span>)}</div>
        </div>
        <div className="space-y-1">
          <div className="font-semibold text-white">Tags</div>
          <div className="flex flex-wrap gap-2">{course.tags?.map((c) => <span key={c} className="rounded-full bg-indigo-900/40 px-3 py-1">{c}</span>)}</div>
        </div>
      </div>
      <div>
        <div className="font-semibold text-white">What you will learn</div>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
          {course.whatYouWillLearn?.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div>
        <div className="font-semibold text-white">Modules</div>
        <div className="mt-2 space-y-2">
          {course.content?.map((m) => (
            <div key={m.id} className="rounded border border-slate-800 bg-slate-900/60 p-3">
              <div className="font-semibold text-white">{m.title}</div>
              <div className="mt-1 text-xs text-slate-400">{m.lectures?.length} lesson(s)</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-300">
                {m.lectures?.map((l) => (
                  <li key={l.id}>{l.title} · {l.duration} {l.isPreview ? '(Preview)' : ''}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminModal>
)

const Section = ({ title, children }) => (
  <div className="rounded-xl border border-slate-800 bg-[#0f172a] p-4 space-y-3">
    <div className="text-sm font-semibold text-white">{title}</div>
    {children}
  </div>
)

const Field = ({ label, value, onChange, type = 'text', helper, required, small }) => (
  <label className={`space-y-1 text-slate-300 ${small ? 'text-xs' : ''}`}>
    <span>{label}</span>
    <input
      required={required}
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      className={`w-full rounded-lg border border-slate-800 bg-slate-900 px-3 ${small ? 'py-1.5 text-xs' : 'py-2'} text-white outline-none focus:border-indigo-600`}
    />
    {helper ? <div className="text-xs text-slate-500">{helper}</div> : null}
  </label>
)

const Textarea = ({ label, value, onChange }) => (
  <label className="space-y-1 text-slate-300">
    <span>{label}</span>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
      rows={3}
    />
  </label>
)

const ChipInput = ({ label, values, onChange, placeholder }) => {
  const [draft, setDraft] = useState('')

  const add = () => {
    if (!draft.trim()) return
    const val = draft.trim()
    if (values.includes(val)) return
    onChange([...values, val])
    setDraft('')
  }

  const remove = (val) => onChange(values.filter((v) => v !== val))

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-white">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <span key={v} className="flex items-center gap-2 rounded-full bg-indigo-900/40 px-3 py-1 text-xs text-indigo-100">
            {v}
            <button type="button" onClick={() => remove(v)} className="text-slate-300 hover:text-white">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-600"
        />
        <button type="button" onClick={add} className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-white transition hover:border-indigo-500">
          Add
        </button>
      </div>
    </div>
  )
}

export default AdminDashboard
