import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function OrderDetailView() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [message, setMessage] = useState('Loading order…')

  useEffect(() => {
    async function loadOrder() {
      try {
        const response = await fetch(`/api/orders/${id}`, {
          credentials: 'include',
        })
        const data = await response.json()

        if (response.status === 401) {
          setMessage('Please log in to view this order.')
          return
        }

        if (!response.ok) {
          setMessage(data.message || 'Order not found.')
          return
        }

        setOrder(data.order)
        setMessage('')
      } catch (error) {
        setMessage('Network error. Is the server running?')
      }
    }

    loadOrder()
  }, [id])

  if (!order) {
    return (
      <div className="container py-5">
        <h1 className="mb-3">Order</h1>
        <p className="text-muted">{message}</p>
        <Link to="/orders" className="btn btn-dark">Back to orders</Link>
      </div>
    )
  }

  const {
    _id,
    createdAt,
    customer,
    shipping,
    billing,
    payment,
    items,
    totals,
  } = order

  const orderDate = createdAt ? new Date(createdAt).toLocaleString() : ''

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0">Order {_id}</h1>
        <Link to="/orders" className="btn btn-outline-secondary btn-sm">
          All orders
        </Link>
      </div>
      <p className="text-muted mb-4">{orderDate}</p>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <h2 className="h6">Customer</h2>
          <p className="mb-0">
            {customer?.firstName} {customer?.lastName}
            <br />
            {customer?.email}
          </p>
        </div>
        <div className="col-md-4">
          <h2 className="h6">Ship to</h2>
          <p className="mb-0">
            {shipping?.street}
            <br />
            {shipping?.city}, {shipping?.state} {shipping?.zip}
          </p>
        </div>
        <div className="col-md-4">
          <h2 className="h6">Billing / payment</h2>
          <p className="mb-0">
            {billing?.street}
            <br />
            {billing?.city}, {billing?.state} {billing?.zip}
            <br />
            {payment?.cardType} ending in {payment?.last4}
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
            {(items || []).map((item, index) => {
              const unit = Number(item.unitPrice ?? item.price ?? 0)
              const line = Number(item.lineTotal ?? unit * item.quantity)
              return (
                <tr key={`${item.productId}-${item.size}-${item.color}-${index}`}>
                  <td>{item.name}</td>
                  <td>
                    Size {item.size} · {item.color}
                  </td>
                  <td className="text-end">{item.quantity}</td>
                  <td className="text-end">${unit.toFixed(2)}</td>
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
          <span>${Number(totals?.subtotal || 0).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-1">
          <span>Tax ({Math.round((totals?.taxRate || 0) * 100)}%)</span>
          <span>${Number(totals?.tax || 0).toFixed(2)}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>Shipping</span>
          <span>
            {Number(totals?.shipping) === 0
              ? 'Free'
              : `$${Number(totals?.shipping || 0).toFixed(2)}`}
          </span>
        </div>
        <div className="d-flex justify-content-between border-top pt-2 fw-bold">
          <span>Total</span>
          <span>${Number(totals?.total || 0).toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailView