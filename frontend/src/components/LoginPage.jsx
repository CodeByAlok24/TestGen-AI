import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login } from '../lib/api'

export default function LoginPage({ onAuth }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.username || !form.password) {
      setError('Please fill in all fields.')
      return
    }
    setLoading(true)
    try {
      const user = await login(form)
      onAuth(user)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <div className="auth-copy">
          <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            TestGen AI
          </div>
          <h1 className="mt-4 font-heading text-6xl leading-none text-[var(--text-strong)]">
            Minimal testing, clearly organized.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
            Sign in to a lightweight workspace designed around a simple user menu, fast test generation, and a clean white interface.
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">Access your testing workspace.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <div className="auth-error">{error}</div> : null}

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-username">
                Username
              </label>
              <input
                id="login-username"
                className="auth-input"
                type="text"
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                className="auth-input"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-link">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
