import { useState } from "react"
import { Link } from "react-router-dom"
import { login, requestOtp, verifyOtp } from "../lib/api"
import NatureBackground from "./NatureBackground"
import PublicTopbar from "./PublicTopbar"

const AUTH_NAV_ITEMS = [
  { to: "/about", label: "About" },
  { to: "/platform", label: "Platform" },
]

export default function LoginScreen({ onAuth }) {
  const [form, setForm] = useState({ username: "", password: "" })
  const [otpState, setOtpState] = useState({ username: "", otp: "", otpPreview: "", sent: false })
  const [mode, setMode] = useState("password")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))

    if (field === "username") {
      setOtpState((prev) => ({ ...prev, username: value }))
    }
  }

  function updateOtp(field, value) {
    setOtpState((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setMessage("")

    if (mode === "otp") {
      return handleVerifyOtp()
    }

    if (!form.username || !form.password) {
      setError("Please fill in all fields.")
      return
    }

    setLoading(true)
    try {
      const user = await login(form)
      onAuth(user)
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleRequestOtp() {
    setError("")
    setMessage("")
    const username = String(otpState.username || form.username || "").trim()

    if (!username) {
      setError("Enter your username to request an OTP.")
      return
    }

    setLoading(true)
    try {
      const data = await requestOtp({ username })
      setOtpState((prev) => ({
        ...prev,
        username,
        sent: true,
        otpPreview: data.otp || "",
      }))
      setMessage(data?.message || "One-time access code generated.")
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Could not generate OTP.",
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    const username = String(otpState.username || form.username || "").trim()

    if (!username || !otpState.otp) {
      setError("Enter your username and OTP.")
      return
    }

    setLoading(true)
    try {
      const user = await verifyOtp({ username, otp: otpState.otp })
      onAuth(user)
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.detail || "OTP verification failed.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="marketing-auth-shell">
      <NatureBackground variant="auth" />

      <PublicTopbar actionLabel="Create Account" actionTo="/signup" items={AUTH_NAV_ITEMS} />

      <div className="marketing-auth-frameWrap">
        <div className="marketing-auth-frame">
          <div className="marketing-auth-hero">
            <div className="orbit-ring" />
            <div className="orbit-ring alt" />
            <div className="orbit-ring inner" />
            <div className="orbit-sphere main" />
            <div className="orbit-sphere side" />
            <div className="orbit-sphere small" />

            <div className="orbit-card left">
              <div className="orbit-label">Signal Health</div>
              <div className="orbit-copy">Track generation quality, repair failing suites, and keep delivery telemetry visible.</div>
              <div className="orbit-pill">Live status</div>
            </div>

            <div className="orbit-card bottom">
              <div className="orbit-label">Mission Feed</div>
              <div className="orbit-copy">Secure login, OTP access, and history-aware test generation from one control surface.</div>
            </div>

            <div className="orbit-card right">
              <div className="orbit-label">CI Ready</div>
              <div className="orbit-copy">Move from raw code to generated tests and workflow export without leaving the dashboard.</div>
            </div>

            <div className="hero-content">
              <div className="marketing-auth-kicker">Planetary command layer</div>
              <h1 className="marketing-auth-title">
                Test <span>Orbit</span>
              </h1>
              <p className="marketing-auth-copy">
                Enter a cinematic QA control center for code-driven test generation, suite repair, and CI pipeline preparation.
              </p>
              <div className="marketing-auth-bullets">
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Generate framework-ready tests from code, APIs, and stories.
                </div>
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Review quality telemetry before moving changes downstream.
                </div>
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Export CI definitions from the same mission console.
                </div>
              </div>
            </div>
          </div>

          <div className="marketing-auth-card">
            <div className="marketing-auth-cardHeader">
              <h2 className="marketing-auth-cardTitle">Sign In</h2>
              <p className="marketing-auth-cardSub">Reconnect to your station and continue the latest test operation.</p>
            </div>

            <div className="auth-toggle">
              {["password", "otp"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setMode(item)
                    setOtpState((prev) => ({
                      ...prev,
                      username: prev.username || form.username,
                    }))
                    setError("")
                    setMessage("")
                  }}
                  className={`auth-toggle-btn${mode === item ? " active" : ""}`}
                >
                  {item === "password" ? "Password" : "One-Time Code"}
                </button>
              ))}
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}
            {message && <div className="auth-message" role="status">{message}</div>}

            <form onSubmit={handleSubmit} className="marketing-auth-form">
              {mode === "password" ? (
                <>
                  <Field label="Username" id="login-username" type="text" placeholder="Enter your username" value={form.username} onChange={(event) => update("username", event.target.value)} auto="username" />
                  <Field label="Password" id="login-password" type="password" placeholder="Enter your password" value={form.password} onChange={(event) => update("password", event.target.value)} auto="current-password" />
                  <ActionButton type="submit" loading={loading} text="Enter Orbit" loadingText="Signing in..." />
                </>
              ) : (
                <>
                  <Field label="Username" id="otp-username" type="text" placeholder="Enter your username" value={otpState.username} onChange={(event) => updateOtp("username", event.target.value)} auto="username" />
                  <ActionButton type="button" onClick={handleRequestOtp} loading={loading} text="Request Code" loadingText="Requesting..." />
                  {otpState.sent && (
                    <>
                      {otpState.otpPreview && (
                        <div style={{ fontSize: "0.78rem", color: "#ffb36d", textAlign: "center" }}>
                          Demo code: <strong>{otpState.otpPreview}</strong>
                        </div>
                      )}
                      <Field label="Verification Code" id="otp-code" type="text" placeholder="Enter 6-digit code" value={otpState.otp} onChange={(event) => updateOtp("otp", event.target.value)} auto="one-time-code" />
                      <ActionButton type="submit" loading={loading} text="Verify Access" loadingText="Verifying..." />
                    </>
                  )}
                </>
              )}
            </form>

            <p className="marketing-auth-footer">
              Need an account? <Link to="/signup" className="auth-link">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, id, type, placeholder, value, onChange, auto }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label htmlFor={id} className="auth-label">{label}</label>
      <input id={id} type={type} placeholder={placeholder} value={value} onChange={onChange} autoComplete={auto} className="auth-input" />
    </div>
  )
}

function ActionButton({ type, onClick, loading, text, loadingText }) {
  return (
    <button type={type} onClick={onClick} disabled={loading} className="auth-btn">
      {loading ? loadingText : text}
    </button>
  )
}


