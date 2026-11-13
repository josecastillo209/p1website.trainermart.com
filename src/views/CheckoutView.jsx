import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateOrderTotals } from '../utils/orderTotals'

const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zip: '',
}

function CheckoutView({ cartItems = [], clearCart }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    shipping: { ...emptyAddress },
    billing: { ...emptyAddress },
    sameAsShipping: true,
    cardType: '',
    last4: '',
  })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value, type, checked } = event.target

    if (name.startsWith('shipping.')) {
      const field = name.split('.')[1]
      setForm((current) => ({
        ...current,
        shipping: { ...current.shipping, [field]: value },
      }))
      return
    }

    if (name.startsWith('billing.')) {
      const field = name.split('.')[1]
      setForm((current) => ({
        ...current,
        billing: { ...current.billing, [field]: value },
      }))
      return
    }

    if (type === 'checkbox') {
      setForm((current) => ({ ...current, [name]: checked }))
      return
    }

    setForm((current) => ({ ...current, [name]: value }))
  }

  function validateAddress(address, prefix) {
    const next = {}
    if (!address.street.trim()) next[`${prefix}.street`] = 'Street is required.'
    if (!address.city.trim()) next[`${prefix}.city`] = 'City is required.'
    if (!address.state.trim()) next[`${prefix}.state`] = 'State is required.'
    if (!address.zip.trim()) {
      next[`${prefix}.zip`] = 'ZIP is required.'
    } else if (!/^\d{5}(-\d{4})?$/.test(address.zip.trim())) {
      next[`${prefix}.zip`] = 'Enter a valid ZIP code.'
    }
    return next
  }

  function validate() {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.firstName.trim()) nextErrors.firstName = 'First name is required.'
    if (!form.lastName.trim()) nextErrors.lastName = 'Last name is required.'

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailPattern.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }

    Object.assign(nextErrors, validateAddress(form.shipping, 'shipping'))

    if (!form.sameAsShipping) {
      Object.assign(nextErrors, validateAddress(form.billing, 'billing'))
    }

    if (!form.cardType) nextErrors.cardType = 'Select a card type.'

    if (!form.last4.trim()) {
      nextErrors.last4 = 'Last four digits are required.'
    } else if (!/^\d{4}$/.test(form.last4.trim())) {
      nextErrors.last4 = 'Enter exactly 4 digits.'
    }

    if (!cartItems.length) {
      nextErrors.cart = 'Your cart is empty. Add items before checkout.'
    }

    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validate()
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setMessage('')
      return
    }

    const billing = form.sameAsShipping ? form.shipping : form.billing

    const payload = {
      customer: {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      },
      shipping: {
        street: form.shipping.street.trim(),
        city: form.shipping.city.trim(),
        state: form.shipping.state.trim(),
        zip: form.shipping.zip.trim(),
      },
      billing: {
        street: billing.street.trim(),
        city: billing.city.trim(),
        state: billing.state.trim(),
        zip: billing.zip.trim(),
      },
      payment: {
        cardType: form.cardType,
        last4: form.last4.trim(),
      },
    }

    // Temporary until POST /api/orders exists
    const totals = calculateOrderTotals(cartItems)
    const order = {
      orderId: `TMP-${Date.now()}`,
      orderDate: new Date().toLocaleString(),
      customer: payload.customer,
      shipping: payload.shipping,
      billing: payload.billing,
      payment: payload.payment,
      items: cartItems.map((item) => ({ ...item })),
      totals,
    }

    if (typeof clearCart === 'function') {
      clearCart()
    }

    navigate('/order-confirmation', { state: { order } })
  }

  function fieldClass(key) {
    return `form-control ${errors[key] ? 'is-invalid' : ''}`
  }

  if (!cartItems.length) {
    return (
      <div className="container py-5">
        <h1 className="mb-3">Checkout</h1>
        <div className="alert alert-warning">Your cart is empty.</div>
        <Link to="/shop" className="btn btn-dark">Continue shopping</Link>
      </div>
    )
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <h1 className="mb-3">Checkout</h1>
          <p className="text-muted">
            Enter customer, shipping, and billing details. Card numbers are not stored—only type and last four digits.
          </p>

          {message && <div className="alert alert-success">{message}</div>}
          {errors.cart && <div className="alert alert-danger">{errors.cart}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <h2 className="h5 mt-4">Customer</h2>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="firstName">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  className={fieldClass('firstName')}
                  value={form.firstName}
                  onChange={handleChange}
                />
                {errors.firstName && <div className="invalid-feedback">{errors.firstName}</div>}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="lastName">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  className={fieldClass('lastName')}
                  value={form.lastName}
                  onChange={handleChange}
                />
                {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                className={fieldClass('email')}
                value={form.email}
                onChange={handleChange}
              />
              {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>

            <h2 className="h5 mt-4">Shipping address</h2>
            <div className="mb-3">
              <label className="form-label" htmlFor="shipping.street">Street</label>
              <input
                id="shipping.street"
                name="shipping.street"
                className={fieldClass('shipping.street')}
                value={form.shipping.street}
                onChange={handleChange}
              />
              {errors['shipping.street'] && (
                <div className="invalid-feedback">{errors['shipping.street']}</div>
              )}
            </div>
            <div className="row">
              <div className="col-md-5 mb-3">
                <label className="form-label" htmlFor="shipping.city">City</label>
                <input
                  id="shipping.city"
                  name="shipping.city"
                  className={fieldClass('shipping.city')}
                  value={form.shipping.city}
                  onChange={handleChange}
                />
                {errors['shipping.city'] && (
                  <div className="invalid-feedback">{errors['shipping.city']}</div>
                )}
              </div>
              <div className="col-md-3 mb-3">
                <label className="form-label" htmlFor="shipping.state">State</label>
                <input
                  id="shipping.state"
                  name="shipping.state"
                  className={fieldClass('shipping.state')}
                  value={form.shipping.state}
                  onChange={handleChange}
                />
                {errors['shipping.state'] && (
                  <div className="invalid-feedback">{errors['shipping.state']}</div>
                )}
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label" htmlFor="shipping.zip">ZIP</label>
                <input
                  id="shipping.zip"
                  name="shipping.zip"
                  className={fieldClass('shipping.zip')}
                  value={form.shipping.zip}
                  onChange={handleChange}
                />
                {errors['shipping.zip'] && (
                  <div className="invalid-feedback">{errors['shipping.zip']}</div>
                )}
              </div>
            </div>

            <div className="form-check mb-3">
              <input
                id="sameAsShipping"
                name="sameAsShipping"
                type="checkbox"
                className="form-check-input"
                checked={form.sameAsShipping}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="sameAsShipping">
                Billing address same as shipping
              </label>
            </div>

            {!form.sameAsShipping && (
              <>
                <h2 className="h5 mt-2">Billing address</h2>
                <div className="mb-3">
                  <label className="form-label" htmlFor="billing.street">Street</label>
                  <input
                    id="billing.street"
                    name="billing.street"
                    className={fieldClass('billing.street')}
                    value={form.billing.street}
                    onChange={handleChange}
                  />
                  {errors['billing.street'] && (
                    <div className="invalid-feedback">{errors['billing.street']}</div>
                  )}
                </div>
                <div className="row">
                  <div className="col-md-5 mb-3">
                    <label className="form-label" htmlFor="billing.city">City</label>
                    <input
                      id="billing.city"
                      name="billing.city"
                      className={fieldClass('billing.city')}
                      value={form.billing.city}
                      onChange={handleChange}
                    />
                    {errors['billing.city'] && (
                      <div className="invalid-feedback">{errors['billing.city']}</div>
                    )}
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label" htmlFor="billing.state">State</label>
                    <input
                      id="billing.state"
                      name="billing.state"
                      className={fieldClass('billing.state')}
                      value={form.billing.state}
                      onChange={handleChange}
                    />
                    {errors['billing.state'] && (
                      <div className="invalid-feedback">{errors['billing.state']}</div>
                    )}
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label" htmlFor="billing.zip">ZIP</label>
                    <input
                      id="billing.zip"
                      name="billing.zip"
                      className={fieldClass('billing.zip')}
                      value={form.billing.zip}
                      onChange={handleChange}
                    />
                    {errors['billing.zip'] && (
                      <div className="invalid-feedback">{errors['billing.zip']}</div>
                    )}
                  </div>
                </div>
              </>
            )}

            <h2 className="h5 mt-4">Payment</h2>
            <p className="small text-muted">
              Demo only. Do not enter a real full card number—only type and last four digits are kept.
            </p>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label" htmlFor="cardType">Card type</label>
                <select
                  id="cardType"
                  name="cardType"
                  className={`form-select ${errors.cardType ? 'is-invalid' : ''}`}
                  value={form.cardType}
                  onChange={handleChange}
                >
                  <option value="">Select…</option>
                  <option value="Visa">Visa</option>
                  <option value="Mastercard">Mastercard</option>
                  <option value="Amex">American Express</option>
                  <option value="Discover">Discover</option>
                </select>
                {errors.cardType && <div className="invalid-feedback">{errors.cardType}</div>}
              </div>
              <div className="col-md-6 mb-4">
                <label className="form-label" htmlFor="last4">Last four digits</label>
                <input
                  id="last4"
                  name="last4"
                  className={fieldClass('last4')}
                  value={form.last4}
                  onChange={handleChange}
                  maxLength={4}
                  inputMode="numeric"
                  autoComplete="off"
                />
                {errors.last4 && <div className="invalid-feedback">{errors.last4}</div>}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-dark">
                Place order
              </button>
              <Link to="/cart" className="btn btn-outline-secondary">
                Back to cart
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckoutView