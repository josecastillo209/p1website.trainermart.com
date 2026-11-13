import { Link } from 'react-router-dom'
import Cart from '../components/Cart'

function CartView({ cartItems, updateQuantity, removeFromCart }) {
  return (
    <div className="container py-5">
      <h1 className="mb-4">Cart</h1>
      <Cart
        cartItems={cartItems}
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
      />
      {cartItems.length > 0 && (
        <div className="mt-4">
          <Link to="/checkout" className="btn btn-dark">
            Proceed to checkout
          </Link>
        </div>
      )}
    </div>
  )
}

export default CartView