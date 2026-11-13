import { useState } from 'react'
import { Link } from 'react-router-dom'

function CreateAccountView() {
  const [form, setForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setSuccess(false)

    const nextErrors = {}

    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(form.username.trim())) {
      nextErrors.username =
        'Use 3–30 letters, numbers, underscores, or hyphens.'
    }

    for (const field of ['firstName', 'lastName']) {
      if (!form[field].trim() || form[field].trim().length > 100) {
        nextErrors[field] = 'Required; maximum 100 characters.'
      }
    }

    if (
      form.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (
      form.password.length < 8 ||
      new TextEncoder().encode(form.password).length > 72
    ) {
      nextErrors.password =
        'Use at least 8 characters and at most 72 bytes.'
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors(data.errors ?? {})
        setMessage(data.message ?? 'Account creation failed.')
        return
      }

      setSuccess(true)
      setMessage(data.message)
      setForm({
        username: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch {
      setMessage('Unable to reach the server. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fields = [
    ['username', 'Username', 'text'],
    ['firstName', 'First name', 'text'],
    ['lastName', 'Last name', 'text'],
    ['email', 'Email', 'email'],
    ['password', 'Password', 'password'],
    ['confirmPassword', 'Confirm password', 'password'],
  ]

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="mb-3">Create account</h1>

          {message && (
            <div
              className={`alert ${
                success ? 'alert-success' : 'alert-danger'
              }`}
              role="alert"
            >
              {message}
              {success && (
                <>
                  {' '}
                  <Link to="/account">Go to login</Link>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {fields.map(([name, label, type]) => (
              <div className="mb-3" key={name}>
                <label className="form-label" htmlFor={name}>
                  {label}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  className={`form-control ${
                    errors[name] ? 'is-invalid' : ''
                  }`}
                  value={form[name]}
                  onChange={handleChange}
                  disabled={submitting}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={
                    errors[name] ? `${name}-error` : undefined
                  }
                />
                {errors[name] && (
                  <div
                    className="invalid-feedback"
                    id={`${name}-error`}
                  >
                    {errors[name]}
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-dark"
              disabled={submitting}
            >
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-3 mb-0">
            Already have an account?{' '}
            <Link to="/account">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreateAccountView