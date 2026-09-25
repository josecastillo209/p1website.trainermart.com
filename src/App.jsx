import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomeView from './views/HomeView'
import ShopView from './views/ShopView'
import ProductDetailView from './views/ProductDetailView'
import CartView from './views/CartView'
import AccountView from './views/AccountView'
import CreateAccountView from './views/CreateAccountView'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/shop" element={<ShopView />} />
        <Route path="/product/:id" element={<ProductDetailView />} />
        <Route path="/cart" element={<CartView />} />
        <Route path="/account" element={<AccountView />} />
        <Route path="/create-account" element={<CreateAccountView />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App