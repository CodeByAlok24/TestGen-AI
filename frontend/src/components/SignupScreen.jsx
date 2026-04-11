import { useState } from "react"
import { Link } from "react-router-dom"
import { signup } from "../lib/api"
import NatureBackground from "./NatureBackground"
import PublicTopbar from "./PublicTopbar"

const AUTH_NAV_ITEMS = [
  { to: "/about", label: "About" },
  { to: "/platform", label: "Platform" },
]

export default function SignupScreen({ onAuth }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields.")
      return
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }

    setLoading(true)
    try {
      setMessage("Creating your workspace...")
      const user = await signup(form)
      onAuth(user)
    } catch (err) {
      setMessage("")
      if (!err?.response) {
        setError("Backend server is not reachable. Please start the backend on port 8000 and try again.")
        return
      }
      setError(err?.response?.data?.error || err?.response?.data?.detail || "Signup failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="marketing-auth-shell">
      <NatureBackground variant="auth" />

      <PublicTopbar actionLabel="Sign In" actionTo="/login" items={AUTH_NAV_ITEMS} />

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
              <div className="orbit-label">Workspace Seed</div>
              <div className="orbit-copy">Create a secure account and unlock generation history, quality insights, and workflow export.</div>
              <div className="orbit-pill">Start build</div>
            </div>

            <div className="orbit-card right">
              <div className="orbit-label">Delivery Ready</div>
              <div className="orbit-copy">Bring code, story, and API-driven testing into a single real product experience.</div>
            </div>

            <div className="hero-content">
              <div className="marketing-auth-kicker">Cinematic onboarding shell</div>
              <h1 className="marketing-auth-title">
                Build <span>Station</span>
              </h1>
              <p className="marketing-auth-copy">
                Create an account inside a premium control interface designed for real QA workflows, not a generic AI demo screen.
              </p>
              <div className="marketing-auth-bullets">
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Centralize test generation, repair, metrics, and CI exports.
                </div>
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Keep a visible user-linked history of generated test sessions.
                </div>
                <div className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  Start with a UI that feels like a product landing environment.
                </div>
              </div>
            </div>
          </div>

          <div className="marketing-auth-card">
            <div className="marketing-auth-cardHeader">
              <h2 className="marketing-auth-cardTitle">Create Account</h2>
              <p className="marketing-auth-cardSub">Open a new workspace and enter the testing control station.</p>
            </div>

            {error && <div className="auth-error" role="alert">{error}</div>}
            {message && <div className="auth-message" role="status">{message}</div>}

            <form onSubmit={handleSubmit} className="marketing-auth-form">
              <Field label="Username" id="signup-username" type="text" placeholder="Choose a username" value={form.username} onChange={(event) => update("username", event.target.value)} auto="username" />
              <Field label="Email" id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={(event) => update("email", event.target.value)} auto="email" />
              <Field label="Password" id="signup-password" type="password" placeholder="Minimum 6 characters" value={form.password} onChange={(event) => update("password", event.target.value)} auto="new-password" />
              <button type="submit" disabled={loading} className="auth-btn">
                {loading ? "Creating account..." : "Create Station"}
              </button>
            </form>

            <p className="marketing-auth-footer">
              Already have access? <Link to="/login" className="auth-link purple">Sign in</Link>
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


