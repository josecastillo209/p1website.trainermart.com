import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function OrderHistoryView() {
  const [orders, setOrders] = useState([])
  const [message, setMessage] = useState('Loading orders…')

  useEffect(() => {
    async function loadOrders() {
      try {
        const response = await fetch('/api/orders', {
          credentials: 'include',
        })
        const data = await response.json()

        if (response.status === 401) {
          setMessage('Please log in to view your orders.')
          setOrders([])
          return
        }

        if (!response.ok) {
          setMessage(data.message || 'Could not load orders.')
          setOrders([])
          return
        }

        setOrders(data.orders || [])
        setMessage('')
      } catch (error) {
        setMessage('Network error. Is the server running?')
        setOrders([])
      }
    }

    loadOrders()
  }, [])

  if (message && orders.length === 0) {
    return (
      <div className="container py-5">
        <h1 className="mb-3">Order history</h1>
        <p className="text-muted">{message}</p>
        {message.includes('log in') ? (
          <Link to="/account" className="btn btn-dark">Log in</Link>
        ) : (
          <Link to="/shop" className="btn btn-dark">Shop</Link>
        )}
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="container py-5">
        <h1 className="mb-3">Order history</h1>
        <p className="text-muted">You have no orders yet.</p>
        <Link to="/shop" className="btn btn-dark">Shop</Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <h1 className="mb-4">Order history</h1>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th className="text-end">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const id = order._id
              const date = order.createdAt
                ? new Date(order.createdAt).toLocaleString()
                : ''
              return (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{date}</td>
                  <td className="text-end">
                    ${Number(order.totals?.total || 0).toFixed(2)}
                  </td>
                  <td className="text-end">
                    <Link
                      to={`/orders/${id}`}
                      className="btn btn-sm btn-outline-dark"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderHistoryView