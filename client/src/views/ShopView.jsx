import { useEffect, useMemo, useState } from 'react'
import ProductList from '../components/ProductList'

function ShopView() {
  const [products, setProducts] = useState([])
  const [active, setActive] = useState('All')
  const [message, setMessage] = useState('Loading products…')

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch('/api/products')
        const data = await response.json()

        if (!response.ok) {
          setMessage(data.message || 'Could not load products.')
          return
        }

        setProducts(Array.isArray(data) ? data : [])
        setMessage('')
      } catch (error) {
        setMessage('Network error. Is the server running?')
      }
    }

    loadProducts()
  }, [])

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((item) => item.category))]
  }, [products])

  const visible = active === 'All'
    ? products
    : products.filter((item) => item.category === active)

  return (
    <div className="container py-5">
      <h1 className="mb-2">Shop</h1>
      <p className="text-muted mb-4">
        {message || `${visible.length} item${visible.length === 1 ? '' : 's'}${active === 'All' ? '' : ` in ${active}`}`}
      </p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`btn btn-sm ${active === category ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setActive(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <ProductList products={visible} />
    </div>
  )
}

export default ShopView