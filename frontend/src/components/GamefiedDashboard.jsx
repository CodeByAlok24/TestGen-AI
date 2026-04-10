import { useCallback, useEffect, useRef, useState } from "react"
import {
  claimChallengeReward,
  exportCiWorkflow,
  generateTests,
  getDailyChallenges,
  getGamificationProfile,
  getTestCaseHistory,
  getWeeklyChallenges,
  healFailingTest,
} from "../lib/api"
import InputPanel from "./InputWorkspace"
import OutputPanel from "./OutputPanel"
import QualityScore from "./QualityScore"
import HealPanel from "./HealPanel"
import CIExport from "./CIExport"
import TrophyRoom from "./TrophyRoom"
import NatureBackground from "./NatureBackground"

const NAV = [
  { id: "generate", label: "Generator", hint: "Create suites from code, APIs, and stories." },
  { id: "quality", label: "Quality", hint: "Review scoring and coverage guidance." },
  { id: "heal", label: "Repair", hint: "Fix failing tests with AI help." },
  { id: "ci", label: "CI/CD", hint: "Export pipeline-ready workflow output." },
  { id: "history", label: "History", hint: "Restore previous generated sessions." },
  { id: "trophies", label: "Milestones", hint: "Track rewards and progress." },
]

const TOPBAR_NAV = [
  { id: "generate", label: "Mission" },
  { id: "quality", label: "Telemetry" },
  { id: "ci", label: "Pipelines" },
  { id: "history", label: "History" },
]

const summaryCard = {
  borderRadius: 24,
  border: "1px solid rgba(170,175,255,0.16)",
  background: "linear-gradient(180deg, rgba(18,16,40,0.84), rgba(10,9,24,0.9))",
  padding: 18,
}

const XP_MILESTONE_DEFS = {
  "xp-50": { xp: 50, title: "50 XP Achievement", icon: "⚡", copy: "Momentum unlocked. Your testing run is officially taking off." },
  "xp-100": { xp: 100, title: "100 XP Achievement", icon: "🚀", copy: "Orbital status reached. You are building real pace now." },
  "xp-250": { xp: 250, title: "250 XP Achievement", icon: "🌌", copy: "Deep-space milestone unlocked. Your workflow is looking elite." },
  "xp-500": { xp: 500, title: "500 XP Achievement", icon: "🏆", copy: "Galaxy tier reached. This is a standout operator moment." },
}

function playAchievementSound() {
  if (typeof window === "undefined") return
  const AudioContextClass = window.AudioContext || window.webkitAudioContext
  if (!AudioContextClass) return

  const audioContext = new AudioContextClass()
  const now = audioContext.currentTime
  const notes = [523.25, 659.25, 783.99]

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator()
    const gain = audioContext.createGain()
    oscillator.type = "triangle"
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.12)
    gain.gain.setValueAtTime(0.0001, now + index * 0.12)
    gain.gain.exponentialRampToValueAtTime(0.09, now + index * 0.12 + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 0.24)
    oscillator.connect(gain)
    gain.connect(audioContext.destination)
    oscillator.start(now + index * 0.12)
    oscillator.stop(now + index * 0.12 + 0.25)
  })

  window.setTimeout(() => {
    audioContext.close().catch(() => {})
  }, 900)
}

export default function GamefiedDashboard({ user, onLogout }) {
  const [loading, setLoading] = useState(false)
  const [tests, setTests] = useState({ pytest: "", junit: "", jest: "" })
  const [scores, setScores] = useState(null)
  const [lastSessionId, setLastSessionId] = useState(null)
  const [healResult, setHealResult] = useState("")
  const [workflowYaml, setWorkflowYaml] = useState("")
  const [activeView, setActiveView] = useState("generate")
  const [provider, setProvider] = useState("api")
  const [gamification, setGamification] = useState(null)
  const [dailyChallenges, setDailyChallenges] = useState([])
  const [weeklyChallenges, setWeeklyChallenges] = useState([])
  const [history, setHistory] = useState([])
  const [claimingChallengeId, setClaimingChallengeId] = useState(null)
  const [challengeFeedback, setChallengeFeedback] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [achievementPopup, setAchievementPopup] = useState(null)
  const seenBadgeIdsRef = useRef(new Set())

  const refresh = useCallback(async () => {
    try {
      const [profile, daily, weekly, historyRows] = await Promise.all([
        getGamificationProfile(user.id),
        getDailyChallenges(),
        getWeeklyChallenges(),
        getTestCaseHistory(),
      ])

      const earnedIds = new Set((profile?.badges || []).map((badge) => badge.id || badge.badgeId || badge.badge_id).filter(Boolean))
      const seenIds = seenBadgeIdsRef.current
      const newMilestones = [...earnedIds]
        .filter((id) => XP_MILESTONE_DEFS[id] && !seenIds.has(id))
        .map((id) => ({ id, ...XP_MILESTONE_DEFS[id] }))
        .sort((left, right) => left.xp - right.xp)

      setGamification(profile)
      setDailyChallenges(daily)
      setWeeklyChallenges(weekly)
      setHistory(Array.isArray(historyRows) ? historyRows : [])
      seenBadgeIdsRef.current = earnedIds

      if (newMilestones.length > 0) {
        const latestMilestone = newMilestones[newMilestones.length - 1]
        setAchievementPopup(latestMilestone)
        playAchievementSound()
      }
    } catch (err) {
      console.debug("Failed to refresh dashboard:", err)
    }
  }, [user.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  async function onGenerate(input, type, mode, testLevel) {
    setLoading(true)
    try {
      const data = await generateTests({ input, type, mode, test_level: testLevel, provider })
      setTests(data.tests)
      setScores(data.scores)
      setLastSessionId(data.id)
      await refresh()
    } finally {
      setLoading(false)
    }
  }

  async function onHeal(failingTest, errorMsg) {
    const data = await healFailingTest({ failing_test: failingTest, error_msg: errorMsg, provider })
    setHealResult(data.fixed_test || "")
    await refresh()
    setActiveView("heal")
  }

  async function onExport(framework) {
    const data = await exportCiWorkflow({ framework, tests })
    setWorkflowYaml(data.workflow_yaml || "")
    await refresh()
    setActiveView("ci")
  }

  async function onClaimChallenge(challengeId) {
    setChallengeFeedback(null)
    setClaimingChallengeId(challengeId)
    try {
      const result = await claimChallengeReward(challengeId)
      setChallengeFeedback({ tone: "success", text: `Reward claimed${result?.xpAwarded ? `: +${result.xpAwarded} XP` : "."}` })
      await refresh()
    } catch (err) {
      setChallengeFeedback({ tone: "error", text: err?.response?.data?.error || "Not available yet." })
    } finally {
      setClaimingChallengeId(null)
    }
  }

  function restoreFromHistory(session) {
    setTests({
      pytest: session.generated_pytest || "",
      junit: session.generated_junit || "",
      jest: session.generated_jest || "",
    })
    setScores(session.scores || null)
    setLastSessionId(session.id || null)
    setChallengeFeedback({ tone: "success", text: `Session #${session.id} restored.` })
  }

  const level = gamification?.level || 1
  const xp = gamification?.totalXPEarned || 0
  const streak = gamification?.currentStreak || 0
  const xpPct = gamification?.xpWindow?.progressPercent || 0
  const nextTitle = gamification?.xpWindow?.nextTitle || "Next tier"
  const xpToNext = gamification?.xpWindow?.max ? gamification.xpWindow.max - gamification.xpWindow.current : 100

  return (
    <div className="marketing-app-shell">
      <NatureBackground showDeckAccents={mobileMenuOpen} />

      <div className="marketing-auth-topbar">
        <div className="marketing-auth-brand">
          <div className="marketing-auth-brand-mark">
            <span className="accent">TESTGEN</span> AI
          </div>
        </div>

        <div className="marketing-auth-nav">
          {TOPBAR_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeView === item.id ? "topbar-nav-btn active" : "topbar-nav-btn"}
              onClick={() => {
                setActiveView(item.id)
                setMobileMenuOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="marketing-auth-menu">
          <button type="button" className="marketing-auth-menuBtn" onClick={() => setMobileMenuOpen((value) => !value)}>
            {mobileMenuOpen ? "Close Deck" : "Control Deck"}
          </button>
        </div>
      </div>

      <div className="marketing-app-frameWrap">
        <div className="marketing-app-frame">
          {achievementPopup && (
            <div className="achievement-overlay" role="dialog" aria-live="assertive" aria-label={`${achievementPopup.title} unlocked`}>
              <div className="achievement-modal">
                <div className="achievement-glow" />
                <div className="achievement-icon">{achievementPopup.icon}</div>
                <div className="achievement-kicker">Achievement Unlocked</div>
                <h2 className="achievement-title">{achievementPopup.title}</h2>
                <p className="achievement-copy">{achievementPopup.copy}</p>
                <div className="achievement-xp-pill">{achievementPopup.xp} XP</div>
                <button type="button" className="auth-btn achievement-btn" onClick={() => setAchievementPopup(null)}>
                  Keep Going
                </button>
              </div>
            </div>
          )}

          <aside className={`marketing-app-left${mobileMenuOpen ? " mobile-open" : ""}`}>
            <nav className="marketing-app-leftNav">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  className={`nav-item${activeView === item.id ? " active" : ""}`}
                  onClick={() => {
                    setActiveView(item.id)
                    setMobileMenuOpen(false)
                  }}
                >
                  <div className="nav-label">{item.label}</div>
                  <div className="nav-hint">{item.hint}</div>
                </button>
              ))}
            </nav>

            <div className="sidebar-section sidebar-section-operator">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <div>
                  <div className="section-eyebrow">Operator</div>
                  <div style={{ color: "#f3f1ff", fontWeight: 800, fontSize: "1.25rem", marginTop: 6 }}>{user.username}</div>
                </div>
                <div className="level-badge">Level {level}</div>
              </div>
              <div style={{ marginTop: 14 }} className="xp-bar-track">
                <div className="xp-bar-fill" style={{ width: `${xpPct}%` }} />
              </div>
              <div style={{ marginTop: 10, color: "rgba(231,228,255,0.72)", fontSize: "0.82rem", lineHeight: 1.6 }}>
                {xp} XP collected, {xpToNext} XP to reach {nextTitle}.
              </div>
              <div style={{ marginTop: 16, display: "grid", gap: 10 }}>
                <Metric label="Current streak" value={`${streak} days`} />
                <Metric label="Generated sessions" value={gamification?.stats?.totalTestsGenerated || 0} />
                <Metric label="Unlocked badges" value={gamification?.badges?.length || 0} />
              </div>
              <button type="button" className="cyber-btn-outline" style={{ width: "100%", marginTop: 16 }} onClick={onLogout}>
                Log Out
              </button>
            </div>

            <div className="sidebar-section sidebar-section-model">
              <div className="section-eyebrow" style={{ marginBottom: 12 }}>Model Source</div>
              <div className="cyber-toggle">
                {["api", "local"].map((item) => (
                  <button key={item} type="button" className={`cyber-toggle-btn${provider === item ? " active" : ""}`} onClick={() => setProvider(item)}>
                    {item === "api" ? "API" : "Custom"}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="marketing-app-right" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div className="battle-card dashboard-hero">
              <div className="dashboard-ring" />
              <div className="dashboard-ring-alt" />
              <div className="dashboard-orbit-main" />
              <div className="dashboard-orbit-side" />

              <div className="dashboard-floating-card top">
                <div className="orbit-label">Latest Session</div>
                <div className="orbit-copy">Session #{lastSessionId || "new"} is the current orbit anchor for generation and export.</div>
              </div>

              <div className="dashboard-floating-card bottom">
                <div className="orbit-label">CI Output</div>
                <div className="orbit-copy">{workflowYaml ? "Workflow export is ready for review." : "Generate and export to prepare a pipeline artifact."}</div>
              </div>

              <div className="dashboard-hero-content">
                <div className="dashboard-kicker">Orbital testing control plane</div>
                <h1 className="dashboard-title">
                  Build <span>tests</span>
                  <br />
                  like a product
                </h1>
                <p className="dashboard-copy">
                  A cinematic operations dashboard for generating tests, reviewing telemetry, repairing failures, and exporting CI/CD workflows from a single real-looking interface.
                </p>
                <div className="dashboard-cta-row">
                  <button type="button" className="auth-btn" style={{ width: "auto", minWidth: 190 }} onClick={() => setActiveView("generate")}>
                    Open Generator
                  </button>
                  <button type="button" className="cyber-btn-outline" onClick={() => setActiveView("history")}>
                    View History
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
              <div style={summaryCard}><SummaryTitle title="Frameworks" value="3" copy="Pytest, JUnit, Jest" /></div>
              <div style={summaryCard}><SummaryTitle title="Quality" value={scores?.overall ?? "--"} copy="Latest overall score" /></div>
              <div style={summaryCard}><SummaryTitle title="Automation" value={workflowYaml ? "Ready" : "Pending"} copy="Workflow export status" /></div>
              <div style={summaryCard}><SummaryTitle title="Milestones" value={gamification?.badges?.length || 0} copy="Unlocked rewards" /></div>
            </div>

            {challengeFeedback && (
              <div className="battle-card" style={{ borderColor: challengeFeedback.tone === "error" ? "rgba(255,143,143,0.26)" : "rgba(110,255,193,0.24)" }}>
                <div style={{ color: challengeFeedback.tone === "error" ? "#ffd8d8" : "#cfffe8", fontSize: "0.9rem" }}>{challengeFeedback.text}</div>
              </div>
            )}

            {activeView === "generate" && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 16 }}>
                  <InputPanel onGenerate={onGenerate} loading={loading} />
                  <OutputPanel tests={tests} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <ChallengePanel title="Daily Targets" accent="#78ddff" challenges={dailyChallenges} onClaim={onClaimChallenge} claimingId={claimingChallengeId} />
                  <ChallengePanel title="Weekly Targets" accent="#ffb36d" challenges={weeklyChallenges} onClaim={onClaimChallenge} claimingId={claimingChallengeId} />
                </div>
              </>
            )}

            {activeView === "quality" && <QualityScore scores={scores} />}
            {activeView === "heal" && <HealPanel onHeal={onHeal} result={healResult} />}
            {activeView === "ci" && <CIExport onExport={onExport} yaml={workflowYaml} />}
            {activeView === "history" && <HistoryPanel sessions={history} onRestore={restoreFromHistory} />}
            {activeView === "trophies" && (
              <TrophyRoom
                gamification={gamification}
                dailyChallenges={dailyChallenges}
                weeklyChallenges={weeklyChallenges}
                onClaimChallenge={onClaimChallenge}
                claimingChallengeId={claimingChallengeId}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, color: "rgba(231,228,255,0.72)", fontSize: "0.8rem" }}>
      <span>{label}</span>
      <strong style={{ color: "#f3f1ff" }}>{value}</strong>
    </div>
  )
}

function SummaryTitle({ title, value, copy }) {
  return (
    <>
      <div className="section-eyebrow section-eyebrow-compact">{title}</div>
      <div style={{ color: "#f3f1ff", fontSize: "1.9rem", fontWeight: 800, marginTop: 10 }}>{value}</div>
      <div style={{ color: "rgba(231,228,255,0.72)", marginTop: 6, fontSize: "0.84rem" }}>{copy}</div>
    </>
  )
}

function HistoryPanel({ sessions, onRestore }) {
  const rows = Array.isArray(sessions) ? sessions.slice(0, 8) : []

  return (
    <div className="battle-card">
      <div className="section-eyebrow" style={{ marginBottom: 10 }}>Recent Sessions</div>
      <h2 style={{ margin: 0, color: "#f3f1ff", fontSize: "1.5rem" }}>Generation History</h2>
      <p style={{ color: "rgba(231,228,255,0.72)", lineHeight: 1.7 }}>Restore a previous output set and continue from an earlier run.</p>

      {rows.length === 0 ? (
        <div style={{ marginTop: 12, ...summaryCard }}>
          <div style={{ color: "rgba(231,228,255,0.72)" }}>No saved sessions yet. Generate tests to populate this list.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {rows.map((session) => (
            <div key={session.id} style={summaryCard}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ color: "#f3f1ff", fontWeight: 700 }}>Session #{session.id}</div>
                  <div style={{ color: "rgba(231,228,255,0.72)", fontSize: "0.82rem", marginTop: 6 }}>
                    {(session.input_type || "").toUpperCase()} · {session.test_mode} · Score {session.quality_score ?? "-"}
                  </div>
                  <div style={{ color: "rgba(231,228,255,0.72)", fontSize: "0.8rem", marginTop: 6 }}>
                    Generated by {session.generated_by?.username || "unknown"}
                    {session.generated_by?.email ? ` (${session.generated_by.email})` : ""}
                  </div>
                  <div style={{ color: "rgba(196,193,228,0.54)", fontSize: "0.76rem", marginTop: 4 }}>
                    {new Date(session.created_at).toLocaleString()}
                  </div>
                </div>
                <button type="button" className="cyber-btn-outline" onClick={() => onRestore(session)}>
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChallengePanel({ title, accent, challenges, onClaim, claimingId }) {
  return (
    <div className="battle-card">
      <div style={{ color: accent, fontSize: "0.74rem", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      <div style={{ display: "grid", gap: 10 }}>
        {(challenges || []).length === 0 && <div style={{ color: "rgba(231,228,255,0.72)" }}>No goals available yet.</div>}
        {(challenges || []).map((challenge) => {
          const pct = challenge.requirementValue ? Math.min(100, Math.round((challenge.progressCurrent / challenge.requirementValue) * 100)) : 0
          const canClaim = challenge.completed && !challenge.claimed

          return (
            <div key={challenge.id} style={{ ...summaryCard, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <div style={{ color: "#f3f1ff", fontWeight: 700 }}>{challenge.title}</div>
                  <div style={{ color: "rgba(231,228,255,0.72)", fontSize: "0.8rem", marginTop: 5 }}>{challenge.description}</div>
                </div>
                <div style={{ color: accent, fontSize: "0.75rem", fontWeight: 800 }}>+{challenge.xpReward} XP</div>
              </div>
              <div className="progress-track" style={{ marginTop: 12 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${accent}, #7e8fff)` }} />
              </div>
              <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", color: "rgba(231,228,255,0.72)", fontSize: "0.78rem" }}>
                <span>{challenge.progressCurrent ?? 0}/{challenge.requirementValue ?? 1}</span>
                {challenge.claimed ? (
                  <span style={{ color: "#6effc1", fontWeight: 700 }}>Claimed</span>
                ) : canClaim ? (
                  <button type="button" className="cyber-btn-outline" onClick={() => onClaim(challenge.id)} disabled={claimingId === challenge.id}>
                    {claimingId === challenge.id ? "Claiming..." : "Claim"}
                  </button>
                ) : (
                  <span>{pct}%</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
