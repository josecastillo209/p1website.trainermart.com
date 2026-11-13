import ProductCard from './ProductCard'

function ProductList({ products }) {
  return (
    <div className="row g-4">
      {products.map((product) => (
        <div className="col-12 col-sm-6 col-lg-4" key={product.id}>
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  )
}

export default ProductList