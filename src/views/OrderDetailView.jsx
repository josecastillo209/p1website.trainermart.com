import { Link, useParams } from 'react-router-dom'
import { sampleOrders } from '../data/sampleOrders'

function OrderDetailView() {
  const { id } = useParams()
  const order = sampleOrders.find((item) => item.orderId === id)

  if (!order) {
    return (
      <div className="container py-5">
        <h1 className="mb-3">Order not found</h1>
        <Link to="/orders" className="btn btn-dark">Back to orders</Link>
      </div>
    )
  }

  const {
    orderId,
    orderDate,
    customer,
    shipping,
    billing,
    payment,
    items,
    totals,
  } = order

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Order {orderId}</h1>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          All orders
        </Link>
      </div>
      <p className="text-muted mb-4">{orderDate}</p>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <h2 className="h6">Customer</h2>
          <p className="mb-0">
            {customer.firstName} {customer.lastName}
            <br />
            {customer.email}
          </p>
        </div>
        <div className="col-md-4">
          <h2 className="h6">Ship to</h2>
          <p className="mb-0">
            {shipping.street}
            <br />
            {shipping.city}, {shipping.state} {shipping.zip}
          </p>
        </div>
        <div className="col-md-4">
          <h2 className="h6">Billing / payment</h2>
          <p className="mb-0">
            {billing.street}
            <br />
            {billing.city}, {billing.state} {billing.zip}
            <br />
            {payment.cardType} ending in {payment.last4}
          </p>
        </div>
      </div>

      <h2 className="h5 mb-3">Items</h2>
      <div className="table-responsive mb-4">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Product</th>
              <th>Options</th>
              <th className="text-end">Qty</th>
              <th className="text-end">Unit</th>
              <th className="text-end">Line</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const line = item.price * item.quantity
              return (
                <tr key={`${item.id}-${item.size}-${item.color}`}>
                  <td>{item.name}</td>
                  <td>
                    Size {item.size} · {item.color}
                  </td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">${item.price.toFixed(2)}</td>
                  <td className="text-end">${line.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="ms-auto" style={{ maxWidth: '280px' }}>
        <div className="d-flex justify-content-between mb-1">
          <span>Subtotal</span>
          <span>${totals.subtotal.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span>Tax ({Math.round(totals.taxRate * 100)}%)</span>
          <span>${totals.tax.toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Shipping</span>
          <span>
            {totals.shipping === 0 ? 'Free' : `$${totals.shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="d-flex justify-content-between border-top pt-2 fw-bold">
          <span>Total</span>
          <span>${totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailView