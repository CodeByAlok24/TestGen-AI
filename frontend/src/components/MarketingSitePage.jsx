import { Link } from "react-router-dom"
import NatureBackground from "./NatureBackground"
import PublicTopbar from "./PublicTopbar"

const PAGE_CONTENT = {
  home: {
    kicker: " Test AI-powered TestCases automation platform",
    title: "Landing mission for modern QA teams",
    accent: "TestGen AI",
    copy:
      "Generate framework-ready tests from code, APIs, and user stories, repair failing suites, and export CI-ready workflows from one cinematic interface.",
    bullets: [
      "Generate Pytest, JUnit, and Jest outputs in one workflow.",
      "Track user-linked history, quality telemetry, and progress in MongoDB-backed sessions.",
      "Demonstrate AI, security, and GitHub Actions together in a single project.",
    ],
    cards: [
      { label: "Built for demos", copy: "Clear visual storytelling for login, signup, dashboard, and DevSecOps pipeline walkthroughs." },
      { label: "Secure by design", copy: "Password hashing, JWT auth, secure headers, rate limiting, and protected APIs are already integrated." },
      { label: "CI visible", copy: "GitHub Actions and CodeQL make the project feel like a real engineering delivery system." },
    ],
  },
  about: {
    kicker: "Project overview",
    title: "Why this project exists",
    accent: "About TestGen AI",
    copy:
      "TestGen AI was built as a practical and useful platform to show how AI-assisted testing, full-stack engineering, and DevSecOps can work together in one product.",
    bullets: [
      "Useful for academic demos and team showcases because the features are easy to explain live.",
      "Connects frontend UX, backend auth, MongoDB history, and gamified dashboard feedback.",
      "Designed to feel like a real product instead of a plain prototype screen.",
    ],
    cards: [
      { label: "Problem", copy: "Manual test creation and CI preparation take time, especially for code, API, and story-based workflows." },
      { label: "Approach", copy: "Use AI-assisted generation, repair, scoring, and export features in one dashboard." },
      { label: "Outcome", copy: "A single platform that demonstrates both product UX and engineering workflow maturity." },
    ],
  },
  platform: {
    kicker: "Platform details",
    title: "How the app works",
    accent: "Platform flow",
    copy:
      "The platform lets a user sign up, sign in, choose an input source, generate tests, review quality, repair failures, and export CI workflows while storing user-linked history in MongoDB.",
    bullets: [
      "Created as a polished testing control platform for live demos and practical QA workflows.",
      "Designed and built by Alok Kumar Das.",
      "Supports code, API, and story inputs with framework outputs like Pytest, JUnit, and Jest.",
    ],
    cards: [
      { label: "Step 1", copy: "Authenticate through login or OTP and create a secure user workspace." },
      { label: "Step 2", copy: "Generate tests, inspect scores, and keep a recoverable history of sessions." },
      { label: "Step 3", copy: "Export CI-ready workflow definitions and complete the testing flow from the same dashboard." },
    ],
  },
  docs: {
    kicker: "Project guide",
    title: "What you can show in the demo",
    accent: "Quick docs",
    copy:
      "Use this page as a speaking guide to explain the app flow, security controls, and CI/CD checks when presenting the project.",
    bullets: [
      "Show signup/login, dashboard generation, history, milestones, and CI export.",
      "Explain bcrypt hashing, JWT auth, rate limiting, CORS control, security headers, and protected APIs.",
      "Open GitHub Actions to show frontend CI, backend CI, and CodeQL security analysis passing.",
    ],
    cards: [
      { label: "Experience", copy: "A cinematic full-page interface built to make testing workflows feel clear, premium, and demo-ready." },
      { label: "Storage", copy: "MongoDB keeps user data, auth-linked session history, and generated output details." },
      { label: "Best pitch", copy: "This is an AI-powered testing platform with built-in security controls and CI automation." },
    ],
  },
}

export default function MarketingSitePage({ page = "home" }) {
  const content = PAGE_CONTENT[page] || PAGE_CONTENT.home

  return (
    <div className="marketing-auth-shell marketing-site-shell">
      <NatureBackground variant="auth" />
      <PublicTopbar actionLabel="Sign In" actionTo="/login" />

      <div className="marketing-site-wrap">
        <section className="marketing-site-hero battle-card">
          <div className="marketing-site-copy">
            <div className="marketing-auth-kicker">{content.kicker}</div>
            <h1 className="marketing-site-title">
              {content.title}
              <span>{content.accent}</span>
            </h1>
            <p className="marketing-site-text">{content.copy}</p>
            <div className="marketing-site-bullets">
              {content.bullets.map((bullet) => (
                <div key={bullet} className="marketing-auth-bullet">
                  <span className="marketing-auth-bulletDot" />
                  {bullet}
                </div>
              ))}
            </div>
            <div className="dashboard-cta-row marketing-site-actions">
              <Link to="/signup" className="auth-btn marketing-site-cta">
                Create Account
              </Link>
              <Link to="/login" className="cyber-btn-outline marketing-site-secondary">
                Open Login
              </Link>
            </div>
          </div>

          <div className="marketing-site-panels">
            {content.cards.map((card) => (
              <div key={card.label} className="marketing-site-panel">
                <div className="section-eyebrow section-eyebrow-compact">{card.label}</div>
                <div className="marketing-site-panelCopy">{card.copy}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
