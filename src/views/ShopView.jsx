import products from '../data/products.json'
import ProductList from '../components/ProductList'

function ShopView() {
  return (
    <div className="container py-5">
      <h1 className="mb-2">Shop</h1>
      <p className="text-muted mb-4">
        {products.length} items ready for the next route.
      </p>
      <ProductList products={products} />
    </div>
  )
}

export default ShopView