import { useNavigate } from 'react-router-dom'

function ProductCard({ product }) {
  const navigate = useNavigate()

  function handleClick() {
    navigate(`/product/${product.id}`)
  }

  return (
    <article className="card h-100 shadow-sm" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img
        src={product.image}
        alt={product.name}
        className="card-img-top"
        style={{ height: '220px', objectFit: 'cover' }}
      />
      <div className="card-body d-flex flex-column">
        <p className="text-muted small mb-1">{product.category}</p>
        <h5 className="card-title">{product.name}</h5>
        <p className="card-text flex-grow-1">{product.description}</p>
        <div className="d-flex justify-content-between align-items-center mt-2">
          <strong>${product.price.toFixed(2)}</strong>
          <span className="btn btn-sm btn-outline-dark">View</span>
        </div>
      </div>
    </article>
  )
}

export default ProductCard