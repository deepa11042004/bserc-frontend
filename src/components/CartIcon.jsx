import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiShoppingCart } from 'react-icons/fi'
import { useCart } from '../context/CartContext'

const CartIcon = () => {
  const { items, getTotalPrice } = useCart()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const count = items.length
  const total = getTotalPrice().toFixed(2)

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onClick={() => navigate('/cart')}
        className="relative flex items-center justify-center rounded-full p-2 text-slate-200 transition hover:bg-[#111827]"
        aria-label="Cart"
      >
        <FiShoppingCart size={20} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-[#3B82F6] px-1.5 text-[10px] font-bold text-white shadow-[0_0_12px_rgba(34,211,238,0.7)]">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[999] mt-2 w-72 rounded-xl border border-indigo-500/30 bg-[#0f172a]/95 shadow-2xl shadow-black/50 backdrop-blur">
          <div className="flex items-center justify-between border-b border-indigo-500/20 px-3 py-2 text-sm font-semibold text-white">
            <span>Cart</span>
            <span className="text-slate-400">{count} item{count === 1 ? '' : 's'}</span>
          </div>

          {count === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-400">Your cart is empty.</div>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto px-3 py-3">
              {items.map((item) => (
                <button
                  key={item.courseId}
                  type="button"
                  onClick={() => navigate(`/course/${item.courseId}`, { state: { course: item } })}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-[#111827]"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-12 w-16 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-12 w-16 rounded-md bg-slate-700" />
                  )}
                  <div className="flex-1">
                    <div className="line-clamp-2 text-sm font-semibold text-white">{item.title}</div>
                    <div className="text-xs text-slate-400">{item.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-indigo-500/20 px-3 py-3 text-sm text-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-bold">${total}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="mt-3 w-full rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(59,130,246,0.35)] transition hover:scale-[1.02]"
            >
              Go to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartIcon
