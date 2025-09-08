// frontend/src/pages/Cart.jsx
import React, { useEffect, useState } from 'react'
import API from '../api'
import { useNavigate } from 'react-router-dom'

export default function Cart({ user }) {
  const [cart, setCart] = useState([]) // [{ item: {...}, qty }]
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const fetchCart = async () => {
    try {
      setLoading(true)
      if (localStorage.getItem('token')) {
        // server-side cart
        const res = await API.get('/cart')
        setCart(res.data)
      } else {
        // guest cart from localStorage + resolve items
        const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        if (!guest.length) {
          setCart([])
          setLoading(false)
          return
        }
        const detailed = await Promise.all(
          guest.map(async g => {
            const res = await API.get(`/items/${g.itemId}`)
            return { item: res.data, qty: g.qty }
          })
        )
        setCart(detailed)
      }
    } catch (err) {
      console.error(err)
      alert('Failed to fetch cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
    // eslint-disable-next-line
  }, [])

  const updateLocalGuestCart = (newCart) => {
    // newCart: array of { itemId, qty }
    localStorage.setItem('guest_cart', JSON.stringify(newCart))
  }

  const removeOne = async (itemId) => {
    try {
      if (localStorage.getItem('token')) {
        await API.post('/cart/remove', { itemId, removeAll: false })
        await fetchCart()
      } else {
        const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        const idx = guest.findIndex(g => g.itemId === itemId)
        if (idx === -1) return
        guest[idx].qty -= 1
        if (guest[idx].qty <= 0) guest.splice(idx, 1)
        updateLocalGuestCart(guest)
        await fetchCart()
      }
    } catch (err) {
      console.error(err)
      alert('Error removing item')
    }
  }

  const removeAll = async (itemId) => {
    try {
      if (localStorage.getItem('token')) {
        await API.post('/cart/remove', { itemId, removeAll: true })
        await fetchCart()
      } else {
        const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        const newCart = guest.filter(g => g.itemId !== itemId)
        updateLocalGuestCart(newCart)
        await fetchCart()
      }
    } catch (err) {
      console.error(err)
      alert('Error removing item')
    }
  }

  const increaseQty = async (itemId) => {
    try {
      if (localStorage.getItem('token')) {
        await API.post('/cart/add', { itemId, qty: 1 })
        await fetchCart()
      } else {
        const guest = JSON.parse(localStorage.getItem('guest_cart') || '[]')
        const idx = guest.findIndex(g => g.itemId === itemId)
        if (idx === -1) guest.push({ itemId, qty: 1 })
        else guest[idx].qty += 1
        updateLocalGuestCart(guest)
        await fetchCart()
      }
    } catch (err) {
      console.error(err)
      alert('Error updating quantity')
    }
  }

  const totalAmount = cart.reduce((sum, e) => sum + (e.item?.price || 0) * e.qty, 0)

  const handleCheckout = () => {
    if (!localStorage.getItem('token')) {
      if (!window.confirm('You are not logged in. Login to persist your order?')) return
      nav('/login')
      return
    }
    // For demo: just clear cart and show message
    // In a real app redirect to payment/checkout flow
    alert(`Checkout simulated — total ₹${totalAmount}`)
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>
      {!cart.length ? (
        <div className="text-center py-12 text-gray-500">Your cart is empty.</div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map(({ item, qty }) => (
              <div key={item._id} className="flex items-center gap-4 border p-3 rounded">
                <img src={item.image || 'https://via.placeholder.com/100'} alt="" className="w-24 h-24 object-cover rounded" />
                <div className="flex-1">
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-sm text-gray-500">{item.category}</div>
                  <div className="mt-2">Price: ₹{item.price}</div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <button onClick={() => removeOne(item._id)} className="px-2 py-1 border rounded">-</button>
                    <div className="px-3 py-1 border rounded">{qty}</div>
                    <button onClick={() => increaseQty(item._id)} className="px-2 py-1 border rounded">+</button>
                  </div>
                  <div className="text-sm">Subtotal: ₹{item.price * qty}</div>
                  <button onClick={() => removeAll(item._id)} className="text-red-600 text-sm">Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div>
              <div className="text-gray-600">Total items: {cart.reduce((s, c) => s + c.qty, 0)}</div>
              <div className="text-2xl font-bold">₹{totalAmount}</div>
            </div>

            <div className="flex gap-3">
              <button onClick={handleCheckout} className="px-5 py-2 bg-indigo-600 text-white rounded">Checkout</button>
              <button onClick={fetchCart} className="px-5 py-2 border rounded">Refresh</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
