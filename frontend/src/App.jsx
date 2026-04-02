import { useMemo, useState, useCallback, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  claimChallengeReward,
  clearAuth,
  exportCiWorkflow,
  generateTests,
  getDailyChallenges,
  getGamificationProfile,
  getGlobalLeaderboard,
  getWeeklyChallenges,
  healFailingTest,
} from './lib/api'
import './App.css'
import InputPanel from './components/InputWorkspace'
import OutputPanel from './components/OutputPanel'
import QualityScore from './components/QualityScore'
import HealPanel from './components/HealPanel'
import CIExport from './components/CIExport'
import LoginPage from './components/LoginScreen'
import SignupPage from './components/SignupScreen'

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
  const [gamification, setGamification] = useState(null)
  const [dailyChallenges, setDailyChallenges] = useState([])
  const [weeklyChallenges, setWeeklyChallenges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [challengeFeedback, setChallengeFeedback] = useState(null)
  const [claimingChallengeId, setClaimingChallengeId] = useState(null)

  const subtitle = useMemo(
    () => 'Minimal workspace for test generation, review, repair, and CI export.',
    [],
  )

  const refreshGamification = useCallback(async () => {
    const [profile, daily, weekly, board] = await Promise.all([
      getGamificationProfile(user.id),
      getDailyChallenges(),
      getWeeklyChallenges(),
      getGlobalLeaderboard(6, 'global'),
    ])

    setGamification(profile)
    setDailyChallenges(daily)
    setWeeklyChallenges(weekly)
    setLeaderboard(board)
  }, [user.id])

  useEffect(() => {
    refreshGamification().catch(() => {})
  }, [refreshGamification])

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
      await refreshGamification()
      setActiveView('generate')
    } finally {
      setLoading(false)
    }
  }

  async function onHeal(failing_test, error_msg) {
    const data = await healFailingTest({ failing_test, error_msg, provider })
    setHealResult(data.fixed_test || '')
    await refreshGamification()
    setActiveView('heal')
  }

  async function onExport(framework) {
    const data = await exportCiWorkflow({ framework, tests })
    setWorkflowYaml(data.workflow_yaml || '')
    await refreshGamification()
    setActiveView('ci')
  }

  async function onClaimChallenge(challengeId) {
    setChallengeFeedback(null)
    setClaimingChallengeId(challengeId)
    try {
      const result = await claimChallengeReward(challengeId)
      setChallengeFeedback({
        tone: 'success',
        text: `Reward claimed${result?.xpAwarded ? `: +${result.xpAwarded} XP` : '.'}`,
      })
      await refreshGamification()
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.detail ||
        'This reward is not available yet.'
      setChallengeFeedback({ tone: 'error', text: message })
    } finally {
      setClaimingChallengeId(null)
    }
  }

  const xpWindow = gamification?.xpWindow || { current: 0, max: 100, progressPercent: 0 }
  const claimedCount = [...dailyChallenges, ...weeklyChallenges].filter((challenge) => challenge.claimed).length

  return (
    <div className="app-shell min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <div className="mx-auto flex min-h-screen max-w-[1540px] flex-col lg:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--sidebar)]/90 px-5 py-6 backdrop-blur-sm lg:min-h-screen lg:w-[286px] lg:border-b-0 lg:border-r">
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

            <div className="rounded-[28px] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Signed in
              </div>
              <div className="mt-2 text-sm font-medium text-[var(--text-strong)]">{user.username}</div>
              {lastSessionId ? (
                <div className="mt-1 text-xs text-[var(--muted)]">Latest session #{lastSessionId}</div>
              ) : (
                <div className="mt-1 text-xs text-[var(--muted)]">No generation session yet</div>
              )}
              <div className="mt-4 rounded-2xl border border-[var(--accent-border)] bg-[#eef4ff] px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                  Active momentum
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold text-[var(--text-strong)]">
                      Level {gamification?.level || 1}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      {gamification?.currentStreak || 0} day streak
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-sm font-bold text-white">
                    {gamification?.badges?.length || 0}
                  </div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-sm font-semibold text-[var(--text)] transition hover:bg-[var(--panel)]"
              >
                Logout
              </button>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
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

            <div className="rounded-[28px] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                Badge pulse
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(gamification?.badges || []).slice(0, 3).map((badge) => (
                  <div
                    key={badge.id || badge}
                    className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-2 py-3 text-center"
                  >
                    <div className="text-lg">{badge.icon || '??'}</div>
                    <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {badge.name || badge.id || badge}
                    </div>
                  </div>
                ))}
                {!(gamification?.badges || []).length ? (
                  <div className="col-span-3 rounded-2xl border border-dashed border-[var(--border)] px-3 py-4 text-center text-xs text-[var(--muted)]">
                    Generate tests to unlock your first badge.
                  </div>
                ) : null}
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
          <div className="mb-6 grid gap-4 border-b border-[var(--border)] pb-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(460px,0.9fr)] xl:items-end">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                User menu
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-strong)]">
                {menuItems.find((item) => item.id === activeView)?.label || 'Generate'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                Move through generation, quality review, healing, and export in a wider workspace built to keep momentum visible.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <TopMetric label="Today XP" value={`+${xpWindow.current}`} />
              <TopMetric label="Challenge wins" value={String(claimedCount)} />
              <TopMetric label="Quality avg" value={`${Math.round(gamification?.stats?.avgQualityScore || 0)}%`} />
            </div>
          </div>

          <div className="space-y-6">
            {challengeFeedback ? (
              <div
                className={`rounded-[22px] border px-4 py-3 text-sm shadow-[var(--shadow-soft)] ${
                  challengeFeedback.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
                }`}
              >
                {challengeFeedback.text}
              </div>
            ) : null}

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Progress
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] text-xl font-semibold text-white">
                        {gamification?.level || 1}
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-[var(--text-strong)]">
                          Level {gamification?.level || 1}
                        </div>
                        <div className="text-sm text-[var(--muted)]">
                          {gamification?.totalXPEarned || 0} total XP earned
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <div className="mb-2 flex items-center justify-between text-sm text-[var(--muted)]">
                      <span>Current XP</span>
                      <span>
                        {xpWindow.current} / {xpWindow.max}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-[var(--panel-muted)]">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all"
                        style={{ width: `${xpWindow.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                  <StatCard label="Current streak" value={`${gamification?.currentStreak || 0} days`} />
                  <StatCard label="Longest streak" value={`${gamification?.longestStreak || 0} days`} />
                  <StatCard label="Tests generated" value={String(gamification?.stats?.totalTestsGenerated || 0)} />
                  <StatCard label="Badges unlocked" value={String(gamification?.badges?.length || 0)} />
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      Leaderboard
                    </div>
                    <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">
                      Top builders this week
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {leaderboard.length ? (
                    leaderboard.map((entry) => (
                      <div
                        key={entry.userId}
                        className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3"
                      >
                        <div>
                          <div className="text-sm font-semibold text-[var(--text-strong)]">
                            #{entry.rank} {entry.username}
                          </div>
                          <div className="text-xs text-[var(--muted)]">
                            Level {entry.level} • {entry.badges?.length || 0} badges
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-[var(--accent)]">{entry.xp} XP</div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
                      Leaderboard will fill in as users generate tests.
                    </div>
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
              <ChallengePanel
                title="Daily challenges"
                challenges={dailyChallenges}
                onClaim={onClaimChallenge}
                claimingId={claimingChallengeId}
              />
              <ChallengePanel
                title="Weekly challenges"
                challenges={weeklyChallenges}
                onClaim={onClaimChallenge}
                claimingId={claimingChallengeId}
              />
            </section>

            {activeView === 'generate' ? (
              <div className="grid grid-cols-1 gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(440px,0.85fr)]">
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

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-4 py-3">
      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{value}</div>
    </div>
  )
}

function TopMetric({ label, value }) {
  return (
    <div className="rounded-[24px] border border-[var(--border)] bg-white px-4 py-4 shadow-[var(--shadow-soft)]">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-xl font-semibold text-[var(--text-strong)]">{value}</div>
    </div>
  )
}

function ChallengePanel({ title, challenges, onClaim, claimingId }) {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
        Missions
      </div>
      <div className="mt-2 text-lg font-semibold text-[var(--text-strong)]">{title}</div>
      <div className="mt-1 text-sm text-[var(--muted)]">
        Track progress, claim rewards, and keep your momentum moving.
      </div>

      <div className="mt-4 space-y-3">
        {challenges.length ? (
          challenges.map((challenge) => {
            const progress = challenge.requirementValue
              ? Math.min(100, Math.round((challenge.progressCurrent / challenge.requirementValue) * 100))
              : 0
            const canClaim = challenge.completed && !challenge.claimed
            const isClaiming = claimingId === challenge.id

            return (
              <div
                key={challenge.id}
                className="rounded-[24px] border border-[var(--border)] bg-[var(--panel)] px-4 py-4 transition hover:-translate-y-[1px] hover:shadow-[var(--shadow-soft)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-[var(--text-strong)]">
                        {challenge.title}
                      </div>
                      <span className="rounded-full border border-[var(--border)] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                        {challenge.difficulty}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-[var(--muted)]">{challenge.description}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="rounded-full bg-[var(--panel-muted)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                      +{challenge.xpReward} XP
                    </div>
                    <div
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                        challenge.claimed
                          ? 'bg-emerald-50 text-emerald-700'
                          : challenge.completed
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-white text-[var(--muted)]'
                      }`}
                    >
                      {challenge.claimed ? 'Claimed' : challenge.completed ? 'Ready to claim' : `${progress}% done`}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-[var(--muted)]">
                  <span>
                    {challenge.progressCurrent} / {challenge.requirementValue} completed
                  </span>
                  <span>Resets with the next {challenge.type} cycle</span>
                </div>

                <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--panel-muted)]">
                  <div
                    className={`h-full rounded-full ${
                      challenge.claimed ? 'bg-emerald-500' : canClaim ? 'bg-amber-400' : 'bg-[var(--accent)]'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-[var(--muted)]">
                    {canClaim
                      ? 'Reward unlocked. Claim it now.'
                      : challenge.claimed
                        ? 'Reward already added to your profile.'
                        : 'Complete the mission to unlock the reward.'}
                  </div>
                  {canClaim ? (
                    <button
                      type="button"
                      onClick={() => onClaim(challenge.id)}
                      disabled={isClaiming}
                      className="rounded-xl bg-[var(--accent)] px-3 py-2 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isClaiming ? 'Claiming...' : 'Claim reward'}
                    </button>
                  ) : challenge.claimed ? (
                    <span className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                      Reward claimed
                    </span>
                  ) : (
                    <span className="rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-xs font-semibold text-[var(--muted)]">
                      Keep going
                    </span>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
            Challenges will appear after your profile is initialized.
          </div>
        )}
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
    clearAuth()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage onAuth={handleAuth} />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/" replace /> : <SignupPage onAuth={handleAuth} />}
        />
        <Route
          path="/"
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

