import { useMemo, useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { generateTests, healFailingTest, exportCiWorkflow } from './lib/api'
import InputPanel from './components/InputPanel'
import OutputPanel from './components/OutputPanel'
import QualityScore from './components/QualityScore'
import HealPanel from './components/HealPanel'
import CIExport from './components/CIExport'
import LoginPage from './components/LoginPage'
import SignupPage from './components/SignupPage'

const menuItems = [
  { id: 'generate', label: 'Generate', hint: 'Create tests from code or stories.' },
  { id: 'quality', label: 'Quality', hint: 'Review score and recommendations.' },
  { id: 'heal', label: 'Self-Heal', hint: 'Repair a failing test quickly.' },
  { id: 'ci', label: 'CI Export', hint: 'Build a workflow for generated tests.' },
]

function Dashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState({ pytest: '', junit: '', jest: '' })
  const [scores, setScores] = useState(null)
  const [lastSessionId, setLastSessionId] = useState(null)
  const [healResult, setHealResult] = useState('')
  const [workflowYaml, setWorkflowYaml] = useState('')
  const [activeView, setActiveView] = useState('generate')
  const [provider, setProvider] = useState('api')

  const subtitle = useMemo(
    () => 'Minimal workspace for test generation, review, repair, and export.',
    [],
  )

  async function onGenerate(input, type, mode, testLevel) {
    setLoading(true)
    try {
      const data = await generateTests({
        input,
        type,
        mode,
        test_level: testLevel,
        provider,
      })
      setTests(data.tests)
      setScores(data.scores)
      setLastSessionId(data.id)
      setActiveView('generate')
    } finally {
      setLoading(false)
    }
  }

  async function onHeal(failing_test, error_msg) {
    const data = await healFailingTest({ failing_test, error_msg, provider })
    setHealResult(data.fixed_test || '')
    setActiveView('heal')
  }

  async function onExport(framework) {
    const data = await exportCiWorkflow({ framework, tests })
    setWorkflowYaml(data.workflow_yaml || '')
    setActiveView('ci')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--sidebar)] px-5 py-6 lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                TestGen AI
              </div>
              <h1 className="font-heading text-4xl leading-none text-[var(--text-strong)]">
                Workspace
              </h1>
              <p className="text-sm leading-6 text-[var(--muted)]">{subtitle}</p>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Signed in
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--text-strong)]">
                {user.username}
              </div>
              {lastSessionId ? (
                <div className="mt-1 text-xs text-[var(--muted)]">Latest session #{lastSessionId}</div>
              ) : (
                <div className="mt-1 text-xs text-[var(--muted)]">No generation session yet</div>
              )}
              <button
                onClick={onLogout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel)]"
              >
                Logout
              </button>
            </div>

            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Model source
              </div>
              <div className="mt-3 inline-flex w-full rounded-2xl border border-[var(--border)] bg-[var(--panel-muted)] p-1">
                <button
                  type="button"
                  onClick={() => setProvider('api')}
                  className={`menu-chip flex-1 ${provider === 'api' ? 'menu-chip--active' : ''}`}
                >
                  API
                </button>
                <button
                  type="button"
                  onClick={() => setProvider('local')}
                  className={`menu-chip flex-1 ${provider === 'local' ? 'menu-chip--active' : ''}`}
                >
                  Custom Trained Model
                </button>
              </div>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`menu-item ${activeView === item.id ? 'menu-item--active' : ''}`}
                >
                  <span className="menu-item__label">{item.label}</span>
                  <span className="menu-item__hint">{item.hint}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <div className="mb-6 flex flex-col gap-3 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                User menu
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
                {menuItems.find((item) => item.id === activeView)?.label || 'Generate'}
              </h2>
            </div>
            <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--muted)] shadow-sm">
              Provider: <span className="font-semibold text-[var(--text-strong)]">{provider === 'api' ? 'API' : 'Custom Trained Model'}</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeView === 'generate' ? (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <InputPanel onGenerate={onGenerate} loading={loading} />
                <OutputPanel tests={tests} />
              </div>
            ) : null}

            {activeView === 'quality' ? <QualityScore scores={scores} /> : null}
            {activeView === 'heal' ? <HealPanel onHeal={onHeal} result={healResult} /> : null}
            {activeView === 'ci' ? <CIExport onExport={onExport} yaml={workflowYaml} /> : null}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('testgen_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const handleAuth = useCallback((userData) => {
    setUser(userData)
    localStorage.setItem('testgen_user', JSON.stringify(userData))
  }, [])

  const handleLogout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('testgen_user')
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <LoginPage onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <SignupPage onAuth={handleAuth} />
            )
          }
        />
        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
