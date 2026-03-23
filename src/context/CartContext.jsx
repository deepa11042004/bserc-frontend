import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext()
const STORAGE_KEY = 'cartItems'

const slugify = (text = '') =>
  encodeURIComponent(text.toLowerCase().trim().replace(/\s+/g, '-'))

const normalizeCourse = (course) => {
  if (!course) return null
  const id = course.courseId || course.id || slugify(course.title || '')
  return {
    courseId: id,
    title: course.title || 'Untitled course',
    price: course.price || '₹0',
    image: course.image,
    instructor: course.instructor,
    ...course,
    courseId: id,
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : []
    } catch (err) {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addToCart = (course) => {
    const normalized = normalizeCourse(course)
    if (!normalized) return
    setItems((prev) => {
      if (prev.some((c) => c.courseId === normalized.courseId)) return prev
      return [...prev, normalized]
    })
  }

  const removeFromCart = (courseId) => {
    setItems((prev) => prev.filter((c) => c.courseId !== courseId))
  }

  const clearCart = () => setItems([])

  const getTotalPrice = () => {
    return items.reduce((acc, item) => {
      const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''))
      return acc + (Number.isFinite(num) ? num : 0)
    }, 0)
  }

  const getCartCount = () => items.length

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, clearCart, getTotalPrice, getCartCount }),
    [items],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
