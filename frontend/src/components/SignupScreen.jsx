import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../lib/api'

export default function SignupScreen({ onAuth }) {
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!form.username || !form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      setMessage('Creating your workspace and preparing your starter profile...')
      const user = await signup(form)
      onAuth(user)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Signup failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <div className="auth-copy">
          <div className="auth-kicker">TestGen AI</div>
          <h1 className="auth-hero-title font-heading">
            Start with a cleaner way to generate, review, and improve tests.
          </h1>
          <p className="auth-hero-text">
            Create your account to unlock the workspace, progress tracking, and an easier
            path from raw code to ready-to-run test cases.
          </p>

          <div className="auth-feature-grid">
            <div className="auth-feature-card">
              <div className="auth-feature-icon">01</div>
              <div>
                <div className="auth-feature-title">Create an account</div>
                <div className="auth-feature-text">A lightweight setup that gets you into the product quickly.</div>
              </div>
            </div>
            <div className="auth-feature-card">
              <div className="auth-feature-icon">02</div>
              <div>
                <div className="auth-feature-title">Paste a snippet</div>
                <div className="auth-feature-text">Choose framework, testing level, and generation mode in one place.</div>
              </div>
            </div>
            <div className="auth-feature-card">
              <div className="auth-feature-icon">03</div>
              <div>
                <div className="auth-feature-title">Grow with usage</div>
                <div className="auth-feature-text">Collect badges, finish challenges, and keep your momentum visible.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-badge">New workspace</div>
            <h2 className="auth-title">Create account</h2>
            <p className="auth-subtitle">A few details now, then you can jump straight into generation.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <div className="auth-error">{error}</div> : null}
            {message ? <div className="auth-success">{message}</div> : null}

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-username">
                Username
              </label>
              <input
                id="signup-username"
                className="auth-input"
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => update('username', e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-email">
                Email
              </label>
              <input
                id="signup-email"
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="signup-password">
                Password
              </label>
              <input
                id="signup-password"
                className="auth-input"
                type="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                autoComplete="new-password"
              />
              <div className="auth-footnote">Use at least 6 characters so your account is ready for secure login.</div>
            </div>

            <button className="auth-btn" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
