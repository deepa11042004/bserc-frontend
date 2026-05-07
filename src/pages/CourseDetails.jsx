import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiChevronDown, FiClock, FiPlayCircle, FiStar, FiUser, FiX } from 'react-icons/fi'
import { useCart } from '../context/CartContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CourseHeader from '../components/courseDetails/CourseHeader'
import CoursePreview from '../components/courseDetails/CoursePreview'
import WhatYouWillLearn from '../components/courseDetails/WhatYouWillLearn'
import CourseIncludes from '../components/courseDetails/CourseIncludes'
import RelatedTopics from '../components/courseDetails/RelatedTopics'
import { footerColumns } from '../data/homeData'
import { useAuthState } from '../hooks/useAuth'
import { publicCourseService } from '../services/publicCourseService'
import { startRazorpayCheckout } from '../services/checkoutService'

const extractYouTubeId = (url = '') => {
  const value = String(url || '').trim()
  if (!value) return ''

  try {
    const normalizedInput = /^https?:\/\//i.test(value) ? value : `https://${value.replace(/^\/\//, '')}`
    const parsed = new URL(normalizedInput)
    const host = parsed.hostname.replace(/^www\./i, '').toLowerCase()

    if (host === 'youtu.be') {
      return parsed.pathname.replace('/', '').trim()
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      const idFromQuery = parsed.searchParams.get('v')
      if (idFromQuery) return idFromQuery.trim()

      const pathParts = parsed.pathname.split('/').filter(Boolean)
      const embedIndex = pathParts.findIndex((part) => part === 'embed')
      if (embedIndex >= 0 && pathParts[embedIndex + 1]) {
        return pathParts[embedIndex + 1].trim()
      }
    }
  } catch {
    return ''
  }

  return ''
}

const toYouTubeEmbedUrl = (url = '') => {
  const id = extractYouTubeId(url)
  if (!id) return ''
  return `https://www.youtube.com/embed/${encodeURIComponent(id)}?autoplay=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&cc_load_policy=0`
}

const CourseDetails = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { slug } = useParams()
  const { user } = useAuthState()

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const { addToCart } = useCart()

  useEffect(() => {
    let active = true

    const loadCourse = async () => {
      setIsLoading(true)

      try {
        const fullCourse = await publicCourseService.getCourseFullBySlug(slug)
        if (!active) return

        setData(fullCourse)
        setLoadError('')
      } catch (error) {
        if (!active) return

        setData(null)
        setLoadError(error?.message || 'Could not load this course right now.')
      } finally {
        if (active) {
          setIsLoading(false)
        }
      }
    }

    void loadCourse()

    return () => {
      active = false
    }
  }, [slug])

  const courseContent = useMemo(() => data?.courseContent || [], [data?.courseContent])
  const [openSections, setOpenSections] = useState(courseContent.length ? [0] : [])
  const [isExpandedDescription, setIsExpandedDescription] = useState(false)
  const [isExpandedInstructor, setIsExpandedInstructor] = useState(false)
  const [activePreviewLesson, setActivePreviewLesson] = useState(null)

  useEffect(() => {
    setOpenSections(courseContent.length ? [0] : [])
  }, [courseContent.length])

  const contentStats = useMemo(() => {
    const totalLectures = courseContent.reduce((sum, section) => sum + (section.lectures?.length || 0), 0)
    const totalMinutes = courseContent.reduce(
      (sum, section) =>
        sum + (section.lectures || []).reduce((acc, lecture) => acc + (lecture.durationMinutes || 0), 0),
      0
    )
    return { totalSections: courseContent.length, totalLectures, totalMinutes }
  }, [courseContent])

  const allSectionIndices = useMemo(() => courseContent.map((_, index) => index), [courseContent])
  const allSectionsOpen = openSections.length === allSectionIndices.length && openSections.length > 0

  const formatDuration = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    if (!hours) return `${minutes}m`
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  }

  const toggleSection = (index) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index]
    )
  }

  const toggleAllSections = () => {
    setOpenSections((prev) => (prev.length === courseContent.length ? [] : allSectionIndices))
  }

  const handlePreviewClick = (lecture) => {
    if (!lecture?.preview) return

    const rawUrl = lecture.youtubeUrl || ''
    const embedUrl = toYouTubeEmbedUrl(rawUrl)
    const normalizedRawUrl = /^https?:\/\//i.test(rawUrl)
      ? rawUrl
      : `https://${String(rawUrl || '').replace(/^\/\//, '').trim()}`

    if (!embedUrl) {
      window.alert('This preview video is not available right now.')
      return
    }

    setActivePreviewLesson({
      title: lecture.title,
      rawUrl: normalizedRawUrl,
      embedUrl,
    })
  }

  const descriptionText = data?.description || 'Course description coming soon.'
  const descriptionPreview = useMemo(() => {
    if (descriptionText.length <= 340) return descriptionText
    return `${descriptionText.slice(0, 340)}...`
  }, [descriptionText])

  const instructorProfile = data?.instructorProfile || {}
  const instructorBioShort = instructorProfile.bioShort || 'Instructor bio will be updated soon.'
  const instructorBioFull = instructorProfile.bioLong || instructorBioShort

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } })
      return
    }

    const priceToPay =
      data.rawDiscountPrice !== null && data.rawDiscountPrice !== undefined ? data.rawDiscountPrice : data.rawPrice

    if (!priceToPay || priceToPay <= 0) {
      window.alert('Enrolled successfully for free! You can now access the course through My Learning.')
      navigate('/my-learning')
      return
    }

    try {
      await startRazorpayCheckout({
        courseId: data?.apiCourseId,
        amount: priceToPay,
        description: `Purchase: ${data.title}`,
        user,
      })

      window.alert('Purchase successful! You can now access the course through My Learning.')
      navigate('/my-learning')
    } catch (error) {
      if (error?.message === 'Payment was cancelled.') {
        return
      }

      console.error('Payment Error:', error)
      window.alert(error?.message || 'Could not initiate payment.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <Navbar />
        <CourseDetailsSkeleton />
        <Footer columns={footerColumns} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-6xl px-4 py-16 text-slate-300">{loadError || 'Course not found.'}</div>
        <Footer columns={footerColumns} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <Navbar />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:gap-10">
        <div className="flex-1 space-y-6">
          <CourseHeader
            title={data.title}
            subtitle={data.subtitle}
            tags={data.tags || []}
            rating={data.rating}
            ratingsCount={data.ratingsCount}
            learners={data.learners}
            lastUpdated={data.lastUpdated}
            language={data.language}
            captions={data.captions || []}
            instructor={data.instructor}
          />

          <WhatYouWillLearn items={data.whatYouWillLearn || []} />

          <CourseIncludes items={data.includes || []} />

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Course content</p>
                <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-300 sm:grid-cols-3">
                  <span className="rounded-lg bg-slate-800/70 px-3 py-2">{contentStats.totalSections} sections</span>
                  <span className="rounded-lg bg-slate-800/70 px-3 py-2">{contentStats.totalLectures} lectures</span>
                  <span className="rounded-lg bg-slate-800/70 px-3 py-2">{formatDuration(contentStats.totalMinutes)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAllSections}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-600 bg-slate-800/70 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-700"
              >
                <FiChevronDown className={`transition-transform ${allSectionsOpen ? 'rotate-180' : ''}`} />
                {allSectionsOpen ? 'Collapse all sections' : 'Expand all sections'}
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {courseContent.map((section, index) => {
                const isOpen = openSections.includes(index)
                const sectionMinutes = (section.lectures || []).reduce(
                  (acc, lecture) => acc + (lecture.durationMinutes || 0),
                  0
                )

                return (
                  <div key={section.title} className="py-3">
                    <button
                      type="button"
                      onClick={() => toggleSection(index)}
                      className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-800/60"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-indigo-200">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-50">{section.title}</p>
                          <p className="text-xs text-slate-400">
                            {(section.lectures || []).length} lectures • {formatDuration(sectionMinutes)}
                          </p>
                        </div>
                      </div>
                      <FiChevronDown
                        className={`text-lg text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <div
                      className={`grid gap-2 overflow-hidden pl-12 pr-2 transition-[max-height,opacity] duration-300 ease-out ${
                        isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      {(section.lectures || []).map((lecture, lectureIndex) => (
                        <div
                          key={`${section.title}-${lecture.title}-${lectureIndex}`}
                          className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3 text-sm text-slate-200 transition hover:bg-slate-800"
                        >
                          <div className="flex items-center gap-3">
                            <FiPlayCircle className={`text-base ${lecture.preview ? 'text-emerald-300' : 'text-slate-500'}`} />
                            <span>{lecture.title}</span>
                            {lecture.preview && (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
                                Preview
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            {lecture.preview ? (
                              <button
                                type="button"
                                onClick={() => handlePreviewClick(lecture)}
                                className="rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200 transition hover:bg-emerald-500/25"
                              >
                                Watch preview
                              </button>
                            ) : (
                              <span className="rounded-full bg-slate-700/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-300">
                                Locked
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <FiClock />
                              {lecture.duration}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-50">Description</h3>
              <span className="text-xs text-slate-500">Updated {data.lastUpdated}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {isExpandedDescription ? descriptionText : descriptionPreview}
            </p>
            <button
              type="button"
              onClick={() => setIsExpandedDescription((prev) => !prev)}
              className="mt-3 text-sm font-semibold text-indigo-200 transition hover:text-indigo-100"
            >
              {isExpandedDescription ? 'Show less' : 'Show more'}
            </button>
          </section>

          <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-indigo-300">Instructor</p>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-50">
                  <FiUser className="text-indigo-300" />
                  <a href={instructorProfile.profileUrl || '#'} className="transition hover:text-indigo-200">
                    {instructorProfile.name || data.instructor}
                  </a>
                </div>
                <p className="text-sm text-slate-400">{instructorProfile.title}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1">
                  <FiStar className="text-amber-400" />
                  {instructorProfile.rating ?? data.rating}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1">
                  <FiStar className="text-indigo-300" />
                  {instructorProfile.reviews || 'Reviews coming soon'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1">
                  <FiUser className="text-indigo-300" />
                  {instructorProfile.students || 'Students updated soon'}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/70 px-3 py-1">
                  <FiUser className="text-indigo-300" />
                  {instructorProfile.courses || '—'} courses
                </span>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-200">
              {isExpandedInstructor ? instructorBioFull : instructorBioShort}
            </p>
            <button
              type="button"
              onClick={() => setIsExpandedInstructor((prev) => !prev)}
              className="mt-3 text-sm font-semibold text-indigo-200 transition hover:text-indigo-100"
            >
              {isExpandedInstructor ? 'Show less' : 'Show more'}
            </button>
          </section>

          <RelatedTopics topics={data.relatedTopics} />
        </div>

        <div className="w-full lg:w-96">
          <CoursePreview
            price={data.price || 'Free'}
            guarantee={data.guarantee || 'Course access included'}
            lifetimeAccess={data.lifetimeAccess ?? true}
            couponApplied={data.couponApplied}
            videoPreview={data.videoPreview}
            onAddToCart={() => addToCart(data)}
            onBuyNow={handleBuyNow}
          />
        </div>
      </div>

      {activePreviewLesson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 px-4"
          onClick={() => setActivePreviewLesson(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-300">Free Preview</p>
                <h3 className="text-sm font-semibold text-slate-100">{activePreviewLesson.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewLesson(null)}
                className="rounded-full border border-slate-600 p-2 text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                aria-label="Close preview"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="aspect-video w-full bg-black">
              <div className="relative h-full w-full">
                <iframe
                  src={activePreviewLesson.embedUrl}
                  title={activePreviewLesson.title}
                  className="h-full w-full"
                  allow="autoplay; encrypted-media"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
                <div className="absolute left-0 right-0 top-0 z-10 h-16" />
                <div className="absolute bottom-0 right-0 z-10 h-12 w-24" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-4 py-3">
              <a
                href={activePreviewLesson.rawUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-500 hover:bg-slate-800"
              >
                Open in YouTube
              </a>
              <button
                type="button"
                onClick={() => setActivePreviewLesson(null)}
                className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer columns={footerColumns} />
    </div>
  )
}

const CourseDetailsSkeleton = () => (
  <div className="mx-auto flex max-w-6xl animate-pulse flex-col gap-8 px-4 py-10 lg:flex-row lg:gap-10">
    <div className="flex-1 space-y-6">
      <section className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="flex gap-2">
          <div className="h-6 w-20 rounded-full bg-slate-800" />
          <div className="h-6 w-24 rounded-full bg-slate-800" />
        </div>
        <div className="h-8 w-5/6 rounded bg-slate-700" />
        <div className="h-5 w-2/3 rounded bg-slate-800" />
        <div className="flex gap-3">
          <div className="h-4 w-20 rounded bg-slate-800" />
          <div className="h-4 w-24 rounded bg-slate-800" />
          <div className="h-4 w-28 rounded bg-slate-800" />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="h-6 w-48 rounded bg-slate-700" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`learn-item-skeleton-${index}`} className="h-10 rounded-lg bg-slate-800" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="h-5 w-36 rounded bg-slate-700" />
        <div className="mt-3 h-4 w-2/3 rounded bg-slate-800" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`content-skeleton-${index}`} className="h-14 rounded-xl bg-slate-800/90" />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-6">
        <div className="h-6 w-32 rounded bg-slate-700" />
        <div className="mt-3 h-4 w-full rounded bg-slate-800" />
        <div className="mt-2 h-4 w-11/12 rounded bg-slate-800" />
        <div className="mt-2 h-4 w-3/4 rounded bg-slate-800" />
      </section>
    </div>

    <div className="w-full lg:w-96">
      <section className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
        <div className="h-44 w-full rounded-lg bg-slate-800" />
        <div className="mt-4 h-8 w-32 rounded bg-slate-700" />
        <div className="mt-2 h-4 w-40 rounded bg-slate-800" />
        <div className="mt-4 h-10 w-full rounded-lg bg-slate-700" />
        <div className="mt-3 h-10 w-full rounded-lg bg-slate-800" />
      </section>
    </div>
  </div>
)

export default CourseDetails
