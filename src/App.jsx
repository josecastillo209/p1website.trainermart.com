import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomeView from './views/HomeView'
import ShopView from './views/ShopView'
import ProductDetailView from './views/ProductDetailView'
import CartView from './views/CartView'
import AccountView from './views/AccountView'
import CreateAccountView from './views/CreateAccountView'

function App() {
  const [cartItems, setCartItems] = useState([])

  function addToCart(newItem) {
    setCartItems((current) => {
      const match = current.find((item) =>
        item.id === newItem.id &&
        item.size === newItem.size &&
        item.color === newItem.color
      )

      if (match) {
        return current.map((item) =>
          item.id === newItem.id &&
          item.size === newItem.size &&
          item.color === newItem.color
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }

      return [...current, newItem]
    })
  }

  function updateQuantity(id, size, color, nextQuantity) {
    const quantity = Number(nextQuantity)
    if (!Number.isInteger(quantity) || quantity < 1) {
      return
    }

    setCartItems((current) =>
      current.map((item) =>
        item.id === id && item.size === size && item.color === color
          ? { ...item, quantity }
          : item
      )
    )
  }

  function removeFromCart(id, size, color) {
    setCartItems((current) =>
      current.filter((item) =>
        !(item.id === id && item.size === size && item.color === color)
      )
    )
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <BrowserRouter>
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
        <Route path="/account" element={<AccountView />} />
        <Route path="/create-account" element={<CreateAccountView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App