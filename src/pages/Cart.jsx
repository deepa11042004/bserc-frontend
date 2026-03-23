import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useCart } from '../context/CartContext'
import { footerColumns } from '../data/homeData'
import { addPurchasedCourses } from '../utils/purchases'
import { useAuthState } from '../hooks/useAuth'

const Cart = () => {
  const navigate = useNavigate()
  const { items, removeFromCart, getTotalPrice, clearCart } = useCart()
  const { user } = useAuthState()
  const total = getTotalPrice()
  const formattedTotal = total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    if (!items.length) {
      window.alert('Cart is empty')
      return
    }

    addPurchasedCourses(items)
    clearCart()
    window.alert('Purchase successful! You can now access your courses in My Learning.')
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white">
      <Navbar />

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold tracking-wide">Shopping Cart</h1>

          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-indigo-500/40 bg-[#0f172a] p-6 text-center text-slate-300">
              Your cart is empty.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.courseId}
                className="flex flex-col gap-4 rounded-xl border border-indigo-500/20 bg-[#1F2937] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.35)] sm:flex-row sm:items-center"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-24 w-36 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-24 w-36 rounded-lg bg-slate-700" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="text-lg font-semibold text-white">{item.title}</div>
                  {item.instructor && <div className="text-sm text-slate-300">{item.instructor}</div>}
                  <div className="text-sm font-bold text-white">{item.price}</div>
                  <div className="flex gap-4 text-sm text-[#22D3EE]">
                    <button type="button" className="hover:underline">Save for later</button>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.courseId)}
                      className="text-red-400 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="sticky top-24 rounded-xl border border-indigo-500/30 bg-[#111827] p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
          <h2 className="text-lg font-semibold text-white">Summary</h2>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
            <span>Subtotal</span>
            <span className="font-semibold">₹{formattedTotal}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            className="mt-4 w-full rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_15px_35px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
          >
            Proceed to Checkout
          </button>
          <button className="mt-2 w-full rounded-lg border border-indigo-500/40 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-[#0f172a]">
            Apply Coupon
          </button>
        </div>
      </div>

      <Footer columns={footerColumns} />
    </div>
  )
}

export default Cart
