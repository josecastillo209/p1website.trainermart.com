import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import products from '../data/products.json'

function ProductDetailView() {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))

  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  if (!product) {
    return (
      <div className="container py-5">
        <h1>Product not found</h1>
        <Link to="/shop">Back to shop</Link>
      </div>
    )
  }

  function handleAddToCart(event) {
    event.preventDefault()
    alert(`Added ${quantity} ${product.name} (${color || 'no color'}, size ${size || 'none'})`)
  }

  return (
    <div className="container py-5">
      <Link to="/shop" className="d-inline-block mb-3">← Back to shop</Link>
      <div className="row g-4">
        <div className="col-md-6">
          <img src={product.image} alt={product.name} className="img-fluid rounded shadow-sm" />
        </div>
        <div className="col-md-6">
          <p className="text-muted mb-1">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="fs-3">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>

          <form onSubmit={handleAddToCart}>
            <div className="mb-3">
              <label className="form-label">Size</label>
              <select
                className="form-select"
                value={size}
                onChange={(event) => setSize(event.target.value)}
                required
              >
                <option value="">Choose a size</option>
                {product.sizes.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Color</label>
              <select
                className="form-select"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                required
              >
                <option value="">Choose a color</option>
                {product.colors.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                className="form-control"
                min="1"
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </div>

            <button type="submit" className="btn btn-dark">Add to cart</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailView