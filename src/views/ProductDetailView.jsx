import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import products from '../data/products.json'

function ProductDetailView({ addToCart }) {
  const { id } = useParams()
  const product = products.find((item) => item.id === Number(id))

  const [size, setSize] = useState('')
  const [color, setColor] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [message, setMessage] = useState('')

  if (!product) {
    return (
      <div className="container py-5">
        <h1>Product not found</h1>
        <Link to="/shop">Back to shop</Link>
      </div>
    )
  }

  function handleQuantityChange(event) {
    const value = Number(event.target.value)
    if (!Number.isInteger(value) || value < 1) {
      setQuantity(1)
      return
    }
    setQuantity(value)
  }

  function handleAddToCart(event) {
    event.preventDefault()

    if (!size || !color) {
      setMessage('Please choose a size and color before adding to cart.')
      return
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      setMessage('Quantity must be a whole number of at least 1.')
      return
    }

    addToCart({
      id: product.id,
      name: product.name,
      image: product.image,
      size,
      color,
      quantity,
      price: product.price,
    })

    setMessage(`Added ${quantity} ${product.name} to cart.`)
    setQuantity(1)
  }

  return (
    <div className="container py-5">
      <Link to="/shop" className="d-inline-block mb-3">← Back to shop</Link>
      <div className="row g-4">
        <div className="col-md-6">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded shadow-sm"
          />
        </div>
        <div className="col-md-6">
          <p className="text-muted mb-1">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="fs-3">${product.price.toFixed(2)}</p>
          <p>{product.description}</p>

          {message && <div className="alert alert-info">{message}</div>}

          <form onSubmit={handleAddToCart}>
            <div className="mb-3">
              <label className="form-label" htmlFor="size">Size</label>
              <select
                id="size"
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
              <label className="form-label" htmlFor="color">Color</label>
              <select
                id="color"
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
              <label className="form-label" htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                className="form-control"
                min="1"
                step="1"
                value={quantity}
                onChange={handleQuantityChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-dark" disabled={!size || !color}>
              Add to cart
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailView