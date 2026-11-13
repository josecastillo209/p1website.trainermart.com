import CartItem from './CartItem'

function Cart({ cartItems, updateQuantity, removeFromCart }) {
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  )

  if (cartItems.length === 0) {
    return <p className="text-muted">Your cart is empty.</p>
  }

  return (
    <div>
      <p className="mb-4">
        {cartCount} item{cartCount === 1 ? '' : 's'} in your cart
      </p>

      {cartItems.map((item) => (
        <CartItem
          key={`${item.id}-${item.size}-${item.color}`}
          item={item}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      ))}

      <div className="border-top pt-3 d-flex justify-content-between">
        <h4 className="mb-0">Subtotal</h4>
        <h4 className="mb-0">${subtotal.toFixed(2)}</h4>
      </div>
    </div>
  )
}

export default Cart