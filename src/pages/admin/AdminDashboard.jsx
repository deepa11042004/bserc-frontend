import { useEffect, useMemo, useState } from 'react'
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

const AdminDashboard = () => {
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
    if (editingCourse) {
      const updated = await courseService.updateCourse(editingCourse.id, payload)
      setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? { ...c, ...updated } : c)))
    } else {
      const created = await courseService.addCourse(payload)
      setCourses((prev) => [...prev, created])
    }
    setShowCourseModal(false)
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

  return (
    <div className="min-h-screen bg-[#0b1220] text-white">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8">
        <AdminSidebar tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

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
const defaultCourseShape = (instructors) => ({
  id: '',
  slug: '',
  title: '',
  subtitle: '',
  descriptionShort: '',
  descriptionLong: '',
  instructorId: instructors[0]?.id || '',
  instructorTitle: '',
  thumbnail: '',
  previewVideo: '',
  language: 'English',
  captions: [],
  categories: [],
  tags: [],
  price: { amount: 0, currency: 'INR', discount: { code: '', percent: 0 } },
  settings: { lifetimeAccess: true, guaranteeText: '', duration: '' },
  whatYouWillLearn: [],
  courseIncludes: [],
  relatedTopics: [],
  content: [],
  instructorProfile: { bioShort: '', bioLong: '' },
  status: 'Draft',
})

const CourseModal = ({ initialData, onClose, onSubmit, instructors }) => {
  const [form, setForm] = useState(() => ({ ...defaultCourseShape(instructors), ...initialData }))
  const [resourceDrafts, setResourceDrafts] = useState({})

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const updateNested = (key, value) => setForm((prev) => ({ ...prev, [key]: { ...prev[key], ...value } }))

  const updateArray = (key, next) => setForm((prev) => ({ ...prev, [key]: next }))

  const addModule = () => {
    setForm((prev) => ({
      ...prev,
      content: [...prev.content, { id: `m-${Date.now()}`, title: 'New module', lectures: [] }],
    }))
  }

  const updateModule = (moduleId, updater) => {
    setForm((prev) => ({
      ...prev,
      content: prev.content.map((m) => (m.id === moduleId ? updater(m) : m)),
    }))
  }

  const removeModule = (moduleId) => setForm((prev) => ({ ...prev, content: prev.content.filter((m) => m.id !== moduleId) }))

  const addLecture = (moduleId) => {
    updateModule(moduleId, (m) => ({
      ...m,
      lectures: [
        ...m.lectures,
        { id: `l-${Date.now()}`, title: 'New lesson', duration: '', thumbnail: '', isPreview: false, resources: [] },
      ],
    }))
  }

  const updateLecture = (moduleId, lectureId, updater) => {
    updateModule(moduleId, (m) => ({
      ...m,
      lectures: m.lectures.map((l) => (l.id === lectureId ? updater(l) : l)),
    }))
  }

  const removeLecture = (moduleId, lectureId) => {
    updateModule(moduleId, (m) => ({ ...m, lectures: m.lectures.filter((l) => l.id !== lectureId) }))
  }

  const updateResourceDraft = (lectureId, patch) =>
    setResourceDrafts((prev) => ({ ...prev, [lectureId]: { ...prev[lectureId], ...patch } }))

  const addResource = (moduleId, lectureId) => {
    const draft = resourceDrafts[lectureId] || { type: 'pdf', label: '', url: '' }
    if (!draft.label || !draft.url) return
    updateLecture(moduleId, lectureId, (lec) => ({
      ...lec,
      resources: [...(lec.resources || []), { type: draft.type || 'pdf', label: draft.label, url: draft.url }],
    }))
    updateResourceDraft(lectureId, { label: '', url: '' })
  }

  const removeResource = (moduleId, lectureId, idx) => {
    updateLecture(moduleId, lectureId, (lec) => ({
      ...lec,
      resources: lec.resources.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalized = {
      ...form,
      price: {
        amount: Number(form.price?.amount || 0),
        currency: form.price?.currency || 'INR',
        discount: {
          code: form.price?.discount?.code || '',
          percent: Number(form.price?.discount?.percent || 0),
        },
      },
      settings: {
        lifetimeAccess: Boolean(form.settings?.lifetimeAccess),
        guaranteeText: form.settings?.guaranteeText || '',
        duration: form.settings?.duration || '',
      },
    }
    onSubmit(normalized)
  }

  return (
    <AdminModal title={initialData ? 'Edit course' : 'Add course'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-5 text-sm">
        <Section title="Basic information">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title" value={form.title} onChange={(v) => updateField('title', v)} required />
            <Field label="Slug" value={form.slug} onChange={(v) => updateField('slug', v)} helper="Auto if left blank" />
            <Field label="Subtitle" value={form.subtitle} onChange={(v) => updateField('subtitle', v)} />
            <Field label="Short description" value={form.descriptionShort} onChange={(v) => updateField('descriptionShort', v)} />
          </div>
          <Textarea label="Long description" value={form.descriptionLong} onChange={(v) => updateField('descriptionLong', v)} />
        </Section>

        <Section title="Instructor">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-slate-300">
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
            <Field label="Instructor title" value={form.instructorTitle} onChange={(v) => updateField('instructorTitle', v)} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Textarea label="Instructor bio (short)" value={form.instructorProfile?.bioShort || ''} onChange={(v) => updateNested('instructorProfile', { bioShort: v })} />
            <Textarea label="Instructor bio (long)" value={form.instructorProfile?.bioLong || ''} onChange={(v) => updateNested('instructorProfile', { bioLong: v })} />
          </div>
        </Section>

        <Section title="Media">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Thumbnail URL" value={form.thumbnail} onChange={(v) => updateField('thumbnail', v)} />
            <Field label="Preview video URL" value={form.previewVideo} onChange={(v) => updateField('previewVideo', v)} />
          </div>
        </Section>

        <Section title="Course settings">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-slate-300">
              <span>Language</span>
              <select
                value={form.language}
                onChange={(e) => updateField('language', e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-white outline-none focus:border-indigo-600"
              >
                {['English', 'Hindi', 'Spanish'].map((opt) => (
                  <option key={opt} value={opt} className="bg-slate-900">
                    {opt}
                  </option>
                ))}
              </select>
            </label>
            <Field label="Duration" value={form.settings?.duration || ''} onChange={(v) => updateNested('settings', { duration: v })} helper="e.g., 12h 30m" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ChipInput label="Captions" values={form.captions} onChange={(vals) => updateArray('captions', vals)} placeholder="Add caption language" />
            <ChipInput label="Categories" values={form.categories} onChange={(vals) => updateArray('categories', vals)} placeholder="Add category" />
            <ChipInput label="Tags" values={form.tags} onChange={(vals) => updateArray('tags', vals)} placeholder="Add tag" />
          </div>
          <div className="grid gap-3 md:grid-cols-3 items-center">
            <label className="flex items-center gap-2 text-slate-200">
              <input
                type="checkbox"
                checked={!!form.settings?.lifetimeAccess}
                onChange={(e) => updateNested('settings', { lifetimeAccess: e.target.checked })}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              <span>Lifetime access</span>
            </label>
            <Field label="Guarantee text" value={form.settings?.guaranteeText || ''} onChange={(v) => updateNested('settings', { guaranteeText: v })} />
            <div />
          </div>
        </Section>

        <Section title="Pricing">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Amount" type="number" value={form.price?.amount ?? 0} onChange={(v) => updateNested('price', { amount: v })} />
            <Field label="Currency" value={form.price?.currency || 'INR'} onChange={(v) => updateNested('price', { currency: v })} />
            <Field label="Coupon code" value={form.price?.discount?.code || ''} onChange={(v) => updateNested('price', { discount: { ...(form.price?.discount || {}), code: v } })} />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Percent off" type="number" value={form.price?.discount?.percent ?? 0} onChange={(v) => updateNested('price', { discount: { ...(form.price?.discount || {}), percent: v } })} />
          </div>
        </Section>

        <Section title="Outcomes and content">
          <div className="grid gap-3 md:grid-cols-3">
            <ChipInput label="What you will learn" values={form.whatYouWillLearn} onChange={(vals) => updateArray('whatYouWillLearn', vals)} placeholder="Add bullet" />
            <ChipInput label="Course includes" values={form.courseIncludes} onChange={(vals) => updateArray('courseIncludes', vals)} placeholder="Add include" />
            <ChipInput label="Related topics" values={form.relatedTopics} onChange={(vals) => updateArray('relatedTopics', vals)} placeholder="Add topic" />
          </div>
          <div className="mt-4 space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            <div className="flex items-center justify-between text-slate-200">
              <span className="font-semibold">Modules & lessons</span>
              <button type="button" onClick={addModule} className="rounded-lg border border-slate-700 px-3 py-1 text-xs transition hover:border-indigo-500 hover:text-indigo-200">
                + Add module
              </button>
            </div>
            {form.content.length === 0 && <div className="text-sm text-slate-400">No modules yet.</div>}
            {form.content.map((module) => (
              <div key={module.id} className="rounded-lg border border-slate-800 bg-[#0f172a] p-3 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    value={module.title}
                    onChange={(e) => updateModule(module.id, (m) => ({ ...m, title: e.target.value }))}
                    className="flex-1 rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                    placeholder="Module title"
                  />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => addLecture(module.id)} className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-indigo-500">+ Lesson</button>
                    <button type="button" onClick={() => removeModule(module.id)} className="rounded-full border border-slate-700 px-3 py-2 text-xs text-slate-200 hover:border-red-500">Delete</button>
                  </div>
                </div>
                <div className="space-y-3">
                  {module.lectures.map((lecture) => (
                    <div key={lecture.id} className="rounded border border-slate-800 bg-slate-900/60 p-3 space-y-2">
                      <div className="grid gap-2 md:grid-cols-3">
                        <Field label="Lesson title" value={lecture.title} onChange={(v) => updateLecture(module.id, lecture.id, (l) => ({ ...l, title: v }))} />
                        <Field label="Duration" value={lecture.duration} onChange={(v) => updateLecture(module.id, lecture.id, (l) => ({ ...l, duration: v }))} helper="e.g., 05:30" />
                        <Field label="Thumbnail" value={lecture.thumbnail} onChange={(v) => updateLecture(module.id, lecture.id, (l) => ({ ...l, thumbnail: v }))} />
                      </div>
                      <label className="flex items-center gap-2 text-xs text-slate-200">
                        <input
                          type="checkbox"
                          checked={!!lecture.isPreview}
                          onChange={(e) => updateLecture(module.id, lecture.id, (l) => ({ ...l, isPreview: e.target.checked }))}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                        />
                        Mark as free preview
                      </label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Resources</span>
                          <button type="button" onClick={() => removeLecture(module.id, lecture.id)} className="text-red-400 hover:text-red-300">Remove lesson</button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(lecture.resources || []).map((res, idx) => (
                            <span key={`${lecture.id}-${idx}`} className="flex items-center gap-2 rounded-full bg-indigo-900/30 px-3 py-1 text-xs text-indigo-100">
                              {res.type}: {res.label}
                              <button type="button" onClick={() => removeResource(module.id, lecture.id, idx)} className="text-slate-300 hover:text-white">×</button>
                            </span>
                          ))}
                        </div>
                        <div className="grid gap-2 md:grid-cols-3">
                          <label className="text-xs text-slate-300">
                            Type
                            <select
                              value={resourceDrafts[lecture.id]?.type || 'pdf'}
                              onChange={(e) => updateResourceDraft(lecture.id, { type: e.target.value })}
                              className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-white"
                            >
                              <option value="pdf" className="bg-slate-900">PDF</option>
                              <option value="link" className="bg-slate-900">Link</option>
                              <option value="file" className="bg-slate-900">File</option>
                            </select>
                          </label>
                          <Field label="Label" value={resourceDrafts[lecture.id]?.label || ''} onChange={(v) => updateResourceDraft(lecture.id, { label: v })} small />
                          <Field label="URL" value={resourceDrafts[lecture.id]?.url || ''} onChange={(v) => updateResourceDraft(lecture.id, { url: v })} small />
                        </div>
                        <button
                          type="button"
                          onClick={() => addResource(module.id, lecture.id)}
                          className="rounded border border-slate-700 px-3 py-1 text-xs text-slate-200 transition hover:border-indigo-500"
                        >
                          Add resource
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
