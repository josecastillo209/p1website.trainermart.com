import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomeView from './views/HomeView'
import ShopView from './views/ShopView'
import ProductDetailView from './views/ProductDetailView'
import CartView from './views/CartView'
import AccountView from './views/AccountView'
import CreateAccountView from './views/CreateAccountView'
import Footer from './components/Footer'
import CheckoutView from './views/CheckoutView'
import OrderConfirmationView from './views/OrderConfirmationView'
import OrderHistoryView from './views/OrderHistoryView'
import OrderDetailView from './views/OrderDetailView'


function App() {
  const [cartItems, setCartItems] = useState([])

    useEffect(() => {
    async function loadCart() {
      try {
        const response = await fetch('/api/cart', { credentials: 'include' })
        const data = await response.json()
        if (response.ok && Array.isArray(data.cart)) {
          setCartItems(data.cart)
        }
      } catch (error) {
        console.error('Could not load cart')
      }
    }
    loadCart()
  }, [])

  async function addToCart(newItem) {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        productId: newItem.id,
        id: newItem.id,
        name: newItem.name,
        image: newItem.image,
        size: newItem.size,
        color: newItem.color,
        quantity: newItem.quantity,
        price: newItem.price,
      }),
    })
    const data = await response.json()
    if (response.ok) setCartItems(data.cart)
  }

  async function updateQuantity(id, size, color, nextQuantity) {
    const quantity = Number(nextQuantity)
    if (!Number.isInteger(quantity) || quantity < 1) return

    const item = cartItems.find(
      (entry) =>
        String(entry.id ?? entry.productId) === String(id) &&
        entry.size === size &&
        entry.color === color
    )
    if (!item?.itemId) return

    const response = await fetch(`/api/cart/${encodeURIComponent(item.itemId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    })
    const data = await response.json()
    if (response.ok) setCartItems(data.cart)
  }

  async function removeFromCart(id, size, color) {
    const item = cartItems.find(
      (entry) =>
        String(entry.id ?? entry.productId) === String(id) &&
        entry.size === size &&
        entry.color === color
    )
    if (!item?.itemId) return

    const response = await fetch(`/api/cart/${encodeURIComponent(item.itemId)}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    const data = await response.json()
    if (response.ok) setCartItems(data.cart)
  }

  function clearCart() {
    setCartItems([])
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <HashRouter>
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/shop" element={<ShopView />} />
        <Route
          path="/product/:id"
          element={<ProductDetailView addToCart={addToCart} />}
        />
        <Route
          path="/cart"
          element={
            <CartView
              cartItems={cartItems}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />
        <Route
          path="/account"
          element={<AccountView />}
        />
        <Route
          path="/create-account"
          element={<CreateAccountView />}
        />
        <Route
          path="/checkout"
          element={<CheckoutView cartItems={cartItems} clearCart={clearCart} />}
        />
        <Route 
          path="/order-confirmation" element={<OrderConfirmationView />} 
        />
        <Route 
          path="/orders" element={<OrderHistoryView />} 
        />
        <Route 
          path="/orders/:id" element={<OrderDetailView />} 
        />
      </Routes>
      <Footer />
    </HashRouter>
  )
}

export default App