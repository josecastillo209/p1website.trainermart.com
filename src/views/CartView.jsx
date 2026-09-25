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
    </div>
  )
}

export default CartView