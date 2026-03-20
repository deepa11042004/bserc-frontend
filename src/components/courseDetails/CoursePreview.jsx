const CoursePreview = ({ price, guarantee, lifetimeAccess, couponApplied, videoPreview }) => {
  return (
    <aside className="sticky top-24 rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="aspect-video w-full overflow-hidden rounded-t-xl">
        <img src={videoPreview} alt="Course preview" className="h-full w-full object-cover" />
      </div>

      <div className="space-y-4 p-4">
        <div>
          <div className="text-2xl font-bold text-slate-900">{price}</div>
          <div className="text-xs text-slate-500">{guarantee}</div>
          {lifetimeAccess && <div className="text-xs text-slate-500">Full lifetime access</div>}
        </div>

        <div className="space-y-2">
          <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white font-semibold transition hover:bg-purple-700">
            Add to cart
          </button>
          <button className="w-full rounded-lg border border-purple-600 px-4 py-2 text-purple-700 font-semibold transition hover:bg-purple-50">
            Buy now
          </button>
        </div>

        {couponApplied && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <span>Coupon applied</span>
            <span className="font-semibold text-purple-700">{couponApplied}</span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default CoursePreview
