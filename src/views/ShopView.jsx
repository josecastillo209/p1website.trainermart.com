import { useMemo, useState } from 'react'
import products from '../data/products.json'
import ProductList from '../components/ProductList'

function ShopView() {
  const categories = useMemo(() => {
    return ['All', ...new Set(products.map((item) => item.category))]
  }, [])

  const [active, setActive] = useState('All')

  const visible = active === 'All'
    ? products
    : products.filter((item) => item.category === active)

  return (
    <div className="container py-5">
      <h1 className="mb-2">Shop</h1>
      <p className="text-muted mb-4">
        {visible.length} item{visible.length === 1 ? '' : 's'}
        {active === 'All' ? '' : ` in ${active}`}
      </p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`btn btn-sm ${
              active === category ? 'btn-dark' : 'btn-outline-dark'
            }`}
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