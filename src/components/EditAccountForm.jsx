import { useState } from 'react'

function EditAccountForm({ account, onSave, onCancel }) {
  const [form, setForm] = useState({
    username: account.username ?? '',
    firstName: account.firstName ?? '',
    lastName: account.lastName ?? '',
    email: account.email ?? '',
    phone: account.phone ?? '',
    street: account.shippingAddress?.street ?? '',
    city: account.shippingAddress?.city ?? '',
    state: account.shippingAddress?.state ?? '',
    zip: account.shippingAddress?.zip ?? '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setErrors({})

    const nextErrors = {}

    if (form.password && form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (form.password && !form.currentPassword) {
      nextErrors.currentPassword = 'Enter your current password.'
    }

    const addressFields = ['street', 'city', 'state', 'zip']
    const addressChanged = addressFields.some(
      (field) =>
        form[field].trim() !==
        (account.shippingAddress?.[field] ?? '')
    )

    // An address may stay empty, but an edited address must be complete.
    if (addressChanged) {
      for (const field of addressFields) {
        if (!form[field].trim()) {
          nextErrors[`shippingAddress.${field}`] =
            'This address field is required.'
        }
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const updates = {
      username: form.username,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
    }

    if (addressChanged) {
      updates.shippingAddress = {
        street: form.street,
        city: form.city,
        state: form.state,
        zip: form.zip,
      }
    }

    if (form.password) {
      updates.currentPassword = form.currentPassword
      updates.password = form.password
    }

    setBusy(true)

    try {
      const response = await fetch('/api/account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(data.errors ?? {})
        setMessage(data.message ?? 'Unable to save changes.')
        return
      }

      onSave(data.account)
    } catch {
      setMessage('Unable to reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  function renderField(name, label, type = 'text', errorKey = name) {
    return (
      <div className="mb-3" key={name}>
        <label className="form-label" htmlFor={`edit-${name}`}>
          {label}
        </label>
        <input
          id={`edit-${name}`}
          name={name}
          type={type}
          className={`form-control ${
            errors[errorKey] ? 'is-invalid' : ''
          }`}
          value={form[name]}
          onChange={handleChange}
          disabled={busy}
          autoComplete={
            type === 'password'
              ? name === 'currentPassword'
                ? 'current-password'
                : 'new-password'
              : undefined
          }
          aria-invalid={Boolean(errors[errorKey])}
          aria-describedby={
            errors[errorKey] ? `edit-${name}-error` : undefined
          }
        />
        {errors[errorKey] && (
          <div
            className="invalid-feedback"
            id={`edit-${name}-error`}
          >
            {errors[errorKey]}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2 className="h4 mb-3">Edit account</h2>

      {message && (
        <div className="alert alert-danger" role="alert">
          {message}
        </div>
      )}

      {renderField('username', 'Username')}
      {renderField('firstName', 'First name')}
      {renderField('lastName', 'Last name')}
      {renderField('email', 'Email', 'email')}
      {renderField('phone', 'Phone', 'tel')}

      <h3 className="h5 mt-4">Shipping address</h3>

      {renderField('street', 'Street', 'text', 'shippingAddress.street')}
      {renderField('city', 'City', 'text', 'shippingAddress.city')}
      {renderField('state', 'State', 'text', 'shippingAddress.state')}
      {renderField('zip', 'ZIP code', 'text', 'shippingAddress.zip')}

      <h3 className="h5 mt-4">Change password</h3>
      <p className="text-muted">
        Leave these fields blank to keep your current password.
      </p>

      {renderField('currentPassword', 'Current password', 'password')}
      {renderField('password', 'New password', 'password')}
      {renderField('confirmPassword', 'Confirm new password', 'password')}

      <div className="d-flex gap-2">
        <button className="btn btn-dark" type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </button>
        <button
          className="btn btn-outline-secondary"
          type="button"
          onClick={onCancel}
          disabled={busy}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default EditAccountForm