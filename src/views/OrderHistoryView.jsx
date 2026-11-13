import { Link } from 'react-router-dom'
import { sampleOrders } from '../data/sampleOrders'

function OrderHistoryView() {
  const orders = sampleOrders

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
      <p className="text-muted mb-4">
        Sample data for now. Later this will load from GET /api/orders.
      </p>

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
            {orders.map((order) => (
              <tr key={order.orderId}>
                <td>{order.orderId}</td>
                <td>{order.orderDate}</td>
                <td className="text-end">${order.totals.total.toFixed(2)}</td>
                <td className="text-end">
                  <Link
                    to={`/orders/${order.orderId}`}
                    className="btn btn-sm btn-outline-dark"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default OrderHistoryView