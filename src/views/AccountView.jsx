import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EditAccountForm from '../components/EditAccountForm'

function AccountView() {
  const [account, setAccount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  // Restore the account from the server session after a refresh.
  useEffect(() => {
    const controller = new AbortController()

    async function loadAccount() {
      try {
        const response = await fetch('/api/account', {
          signal: controller.signal,
        })

        if (response.status === 401) return

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message ?? 'Unable to load account.')
        }

        setAccount(data.account)
      } catch (error) {
        if (error.name !== 'AbortError') {
          setMessage('Unable to load your account. Please try again.')
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    loadAccount()
    return () => controller.abort()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')
    setBusy(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Login failed.')
        return
      }

      setAccount(data.account)
      setForm({ email: '', password: '' })
    } catch {
      setMessage('Unable to reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function handleLogout() {
    setMessage('')
    setBusy(true)

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        setMessage(data.message ?? 'Logout failed.')
        return
      }

      setAccount(null)
      setMessage('Logged out successfully.')
    } catch {
      setMessage('Unable to reach the server. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (account && editing) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <EditAccountForm
            account={account}
            onSave={(updatedAccount) => {
              setAccount(updatedAccount)
              setEditing(false)
              setMessage('Account updated successfully.')
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      </div>
    </div>
  )
}

  if (loading) {
    return <div className="container py-5">Loading account…</div>
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="mb-3">Account</h1>

          {message && (
            <div className="alert alert-info" role="alert">
              {message}
            </div>
          )}

          {account ? (
            <div>
              <h2 className="h4 mb-4">
                Welcome, {account.firstName}!
              </h2>

              <dl>
                <dt>Username</dt>
                <dd>{account.username}</dd>

                <dt>Name</dt>
                <dd>
                  {account.firstName} {account.lastName}
                </dd>

                <dt>Email</dt>
                <dd>{account.email}</dd>

                <dt>Phone</dt>
                <dd>{account.phone || 'Not provided'}</dd>

                <dt>Shipping address</dt>
                <dd>
                  {account.shippingAddress?.street ? (
                    <>
                      {account.shippingAddress.street}
                      <br />
                      {account.shippingAddress.city},{' '}
                      {account.shippingAddress.state}{' '}
                      {account.shippingAddress.zip}
                    </>
                  ) : (
                    'Not provided'
                  )}
                </dd>
              </dl>

              <button
                type="button"
                className="btn btn-outline-dark me-2"
                onClick={() => {
                  setMessage('')
                  setEditing(true)
                }}
                disabled={busy}
              >
                Edit Account
              </button>

              <button
                className="btn btn-dark"
                onClick={handleLogout}
                disabled={busy}
              >
                {busy ? 'Logging out…' : 'Logout'}
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <label className="form-label" htmlFor="loginEmail">
                    Email
                  </label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="email"
                    className="form-control"
                    autoComplete="username"
                    value={form.email}
                    onChange={handleChange}
                    disabled={busy}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="loginPassword">
                    Password
                  </label>
                  <input
                    id="loginPassword"
                    name="password"
                    type="password"
                    className="form-control"
                    autoComplete="current-password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={busy}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark"
                  disabled={busy}
                >
                  {busy ? 'Logging in…' : 'Login'}
                </button>
              </form>

              <p className="mt-3">
                Need an account?{' '}
                <Link to="/create-account">Create one</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AccountView