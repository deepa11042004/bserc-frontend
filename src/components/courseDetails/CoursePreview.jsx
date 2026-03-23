const CoursePreview = ({ price, guarantee, lifetimeAccess, couponApplied, videoPreview, onAddToCart, onBuyNow }) => {
  return (
    <aside className="sticky top-24 rounded-xl border border-slate-800 bg-slate-900/80">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
        <img src={videoPreview} alt="Course preview" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
      </div>

      <div className="space-y-4 p-4 text-slate-100">
        <div>
          <div className="text-2xl font-bold text-white">{price}</div>
          <div className="text-xs text-slate-400">{guarantee}</div>
          {lifetimeAccess && <div className="text-xs text-slate-400">Full lifetime access</div>}
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={onAddToCart}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white font-semibold transition hover:bg-purple-700"
          >
            Add to cart
          </button>
          <button
            type="button"
            onClick={onBuyNow}
            className="w-full rounded-lg border border-purple-400 px-4 py-2 text-purple-200 font-semibold transition hover:bg-purple-500/10"
          >
            Buy now
          </button>
        </div>

        {couponApplied && (
          <div className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-200">
            <span>Coupon applied</span>
            <span className="font-semibold text-purple-200">{couponApplied}</span>
          </div>
        )}
      </div>
    </aside>
  )
}

export default CoursePreview
