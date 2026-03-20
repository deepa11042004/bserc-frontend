import { useLocation, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CourseHeader from '../components/courseDetails/CourseHeader'
import CoursePreview from '../components/courseDetails/CoursePreview'
import WhatYouWillLearn from '../components/courseDetails/WhatYouWillLearn'
import CourseIncludes from '../components/courseDetails/CourseIncludes'
import RelatedTopics from '../components/courseDetails/RelatedTopics'
import { courseDetailsData, footerColumns } from '../data/homeData'

const CourseDetails = () => {
  const location = useLocation()
  useParams() // slug not needed for now but kept for future data lookup

  const courseState = location.state?.course || {}
  const data = {
    ...courseDetailsData,
    ...courseState,
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 lg:flex-row lg:gap-10">
        <div className="flex-1 space-y-6">
          <CourseHeader
            title={data.title}
            subtitle={data.subtitle}
            tags={data.tags}
            rating={data.rating}
            ratingsCount={data.ratingsCount}
            learners={data.learners}
            lastUpdated={data.lastUpdated}
            language={data.language}
            captions={data.captions}
            instructor={data.instructor}
          />

          <WhatYouWillLearn items={data.whatYouWillLearn} />

          <CourseIncludes items={data.includes} />

          <RelatedTopics topics={data.relatedTopics} />
        </div>

        <div className="w-full lg:w-96">
          <CoursePreview
            price={data.price}
            guarantee={data.guarantee}
            lifetimeAccess={data.lifetimeAccess}
            couponApplied={data.couponApplied}
            videoPreview={data.videoPreview}
          />
        </div>
      </div>

      <Footer columns={footerColumns} />
    </div>
  )
}

export default CourseDetails
