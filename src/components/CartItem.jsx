function CartItem({ item, updateQuantity, removeFromCart }) {
  const lineTotal = item.price * item.quantity

  function handleDecrease() {
    updateQuantity(item.id, item.size, item.color, item.quantity - 1)
  }

  function handleIncrease() {
    updateQuantity(item.id, item.size, item.color, item.quantity + 1)
  }

  function handleRemove() {
    removeFromCart(item.id, item.size, item.color)
  }

  return (
    <div className="card mb-3">
      <div className="row g-0 align-items-center">
        <div className="col-md-3">
          <img
            src={item.image}
            alt={item.name}
            className="img-fluid rounded-start"
            style={{ height: '140px', width: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="col-md-9">
          <div className="card-body">
            <h5 className="card-title mb-1">{item.name}</h5>
            <p className="text-muted mb-2">
              Size {item.size} · {item.color}
            </p>
            <p className="mb-2">Unit price: ${item.price.toFixed(2)}</p>
            <p className="mb-3">Line total: ${lineTotal.toFixed(2)}</p>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
              >
                −
              </button>
              <span>{item.quantity}</span>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={handleIncrease}
              >
                +
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm ms-3"
                onClick={handleRemove}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartItem