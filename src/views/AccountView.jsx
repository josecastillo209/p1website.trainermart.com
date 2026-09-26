import { useState } from 'react'
import { Link } from 'react-router-dom'

function AccountView({ account }) {
  const [form, setForm] = useState({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [signedIn, setSignedIn] = useState(false)
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email.trim()) {
      nextErrors.email = 'Email is required.'
    } else if (!emailPattern.test(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }

    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setSignedIn(false)
      setMessage('')
      return
    }

    if (account && form.email.trim() !== account.email) {
      setSignedIn(false)
      setMessage('No account found for that email. Create an account first.')
      return
    }

    if (!account) {
      setSignedIn(false)
      setMessage('No account exists yet. Create one first.')
      return
    }

    setSignedIn(true)
    setMessage('Signed in. This is client-side only — no server login.')
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="mb-3">Account</h1>

          {account ? (
            <div className="alert alert-light border">
              Saved account: {account.firstName} {account.lastName} ({account.email})
            </div>
          ) : (
            <div className="alert alert-warning">
              No account yet. <Link to="/create-account">Create one</Link>.
            </div>
          )}

          {message && (
            <div className={`alert ${signedIn ? 'alert-success' : 'alert-info'}`}>
              {message}
            </div>
          )}

          {signedIn ? (
            <div>
              <h2 className="h4">Welcome back</h2>
              <p className="mb-0">
                {account.firstName}, your cart stays in this browser session only.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                />
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
              </div>

              <div className="mb-4">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
              </div>

              <button type="submit" className="btn btn-dark">Sign in</button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountView