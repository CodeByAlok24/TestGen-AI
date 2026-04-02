import { useState } from 'react'
import { Link } from 'react-router-dom'
import { login, requestOtp, verifyOtp } from '../lib/api'

export default function LoginScreen({ onAuth }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [otpState, setOtpState] = useState({ username: '', otp: '', otpPreview: '', sent: false })
  const [mode, setMode] = useState('password')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function updateOtp(field, value) {
    setOtpState((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'otp') {
      return handleVerifyOtp()
    }

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

  async function handleRequestOtp() {
    setError('')
    setMessage('')

    if (!otpState.username) {
      setError('Enter your username to request an OTP.')
      return
    }

    setLoading(true)
    try {
      const data = await requestOtp({ username: otpState.username })
      setOtpState((prev) => ({
        ...prev,
        sent: true,
        otpPreview: data.otp || '',
      }))
      setMessage('OTP generated successfully.')
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Could not generate OTP.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (!otpState.username || !otpState.otp) {
      setError('Enter your username and OTP.')
      return
    }

    setLoading(true)
    try {
      const user = await verifyOtp({ username: otpState.username, otp: otpState.otp })
      onAuth(user)
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'OTP verification failed.'
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
            Build tests faster, with a workspace that feels friendly from the first click.
          </h1>
          <p className="auth-hero-text">
            Sign in to generate test cases, track your streaks, unlock badges, and keep your
            QA workflow moving without the usual clutter.
          </p>

          <div className="auth-feature-grid">
            <div className="auth-feature-card">
              <div className="auth-feature-icon">AI</div>
              <div>
                <div className="auth-feature-title">Code to tests</div>
                <div className="auth-feature-text">Turn snippets into clean unit and integration tests.</div>
              </div>
            </div>
            <div className="auth-feature-card">
              <div className="auth-feature-icon">XP</div>
              <div>
                <div className="auth-feature-title">Visible progress</div>
                <div className="auth-feature-text">Earn XP, keep streaks alive, and watch challenges complete.</div>
              </div>
            </div>
            <div className="auth-feature-card">
              <div className="auth-feature-icon">OTP</div>
              <div>
                <div className="auth-feature-title">Quick access</div>
                <div className="auth-feature-text">Jump in with password or OTP depending on what feels easiest.</div>
              </div>
            </div>
          </div>

          <div className="auth-trust-row">
            <span>Clean workspace</span>
            <span>Fast generation</span>
            <span>Friendly flows</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-header-badge">Welcome back</div>
            <h2 className="auth-title">Sign in</h2>
            <p className="auth-subtitle">Pick the easiest way to get back into your testing workspace.</p>
          </div>

          <div className="auth-toggle">
            <button
              type="button"
              onClick={() => {
                setMode('password')
                setError('')
                setMessage('')
              }}
              className={`menu-chip flex-1 ${mode === 'password' ? 'menu-chip--active' : ''}`}
            >
              Password login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('otp')
                setError('')
                setMessage('')
              }}
              className={`menu-chip flex-1 ${mode === 'otp' ? 'menu-chip--active' : ''}`}
            >
              OTP login
            </button>
          </div>

          <div className="auth-helper">
            {mode === 'password'
              ? 'Use your username and password for the fastest sign-in.'
              : 'Request a one-time code, then paste it here to continue.'}
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error ? <div className="auth-error">{error}</div> : null}
            {message ? (
              <div className="rounded-[18px] border border-[var(--accent-border)] bg-[#eef4ff] px-4 py-3 text-sm text-[var(--accent-strong)]">
                {message}
              </div>
            ) : null}

            {mode === 'password' ? (
              <>
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
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </>
            ) : (
              <>
                <div className="auth-field">
                  <label className="auth-label" htmlFor="otp-username">
                    Username
                  </label>
                  <input
                    id="otp-username"
                    className="auth-input"
                    type="text"
                    placeholder="Enter your username"
                    value={otpState.username}
                    onChange={(e) => updateOtp('username', e.target.value)}
                    autoComplete="username"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    className="auth-btn flex-1"
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                  >
                    {loading ? 'Requesting...' : 'Request OTP'}
                  </button>
                </div>

                {otpState.sent ? (
                  <>
                    <div className="auth-status-card">
                      <div className="auth-status-title">OTP ready</div>
                      <div className="auth-status-text">
                        We generated a one-time code for <strong>{otpState.username}</strong>.
                      </div>
                    </div>

                    <div className="auth-field">
                      <label className="auth-label" htmlFor="otp-code">
                        OTP
                      </label>
                      <input
                        id="otp-code"
                        className="auth-input"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otpState.otp}
                        onChange={(e) => updateOtp('otp', e.target.value)}
                        autoComplete="one-time-code"
                      />
                    </div>

                    {otpState.otpPreview ? (
                      <div className="auth-preview-card">
                        Demo OTP: <span className="font-semibold text-[var(--text-strong)]">{otpState.otpPreview}</span>
                      </div>
                    ) : null}

                    <button className="auth-btn" type="submit" disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                  </>
                ) : null}
              </>
            )}
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
