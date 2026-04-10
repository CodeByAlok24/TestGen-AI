/* eslint-disable no-unused-vars */
import { motion } from 'framer-motion'

const BADGE_DEFS = [
  { id: 'xp-50', icon: '⚡', name: 'Launch Spark', description: 'Reached 50 XP.', accent: '#78ddff' },
  { id: 'xp-100', icon: '🚀', name: 'Orbital 100', description: 'Reached 100 XP.', accent: '#ff7a2f' },
  { id: 'xp-250', icon: '🌌', name: 'Deep Space 250', description: 'Reached 250 XP.', accent: '#a855f7' },
  { id: 'xp-500', icon: '🏆', name: 'Galaxy 500', description: 'Reached 500 XP.', accent: '#f59e0b' },
  { id: 'first-test', icon: '✨', name: 'First Test', description: 'Generated your first test suite.', accent: '#00d9ff' },
  { id: 'test-fifty', icon: '🧪', name: 'Test Fifty', description: 'Generated 50 test suites.', accent: '#a855f7' },
  { id: 'test-century', icon: '🪐', name: 'Test Century', description: 'Generated 100 test suites.', accent: '#f59e0b' },
  { id: 'quality-champion', icon: '💎', name: 'Quality Champion', description: 'Hit 95+ quality on a generation.', accent: '#00d9ff' },
  { id: 'quality-architect', icon: '🛡️', name: 'Quality Architect', description: 'Maintained a 90+ average quality score.', accent: '#a855f7' },
  { id: 'framework-master', icon: '🧬', name: 'Framework Master', description: 'Used all supported frameworks repeatedly.', accent: '#00d9ff' },
  { id: 'consistency-warrior', icon: '🔥', name: 'Consistency Warrior', description: 'Reached a 30-day generation streak.', accent: '#f59e0b' },
  { id: 'seven-day-streak', icon: '📅', name: '7 Day Streak', description: 'Generated tests 7 days in a row.', accent: '#00d9ff' },
  { id: 'healing-hand', icon: '🩹', name: 'Healing Hand', description: 'Used self-heal 10 times.', accent: '#a855f7' },
  { id: 'ci-captain', icon: '🚀', name: 'CI Captain', description: 'Exported CI workflows 10 times.', accent: '#f59e0b' },
  { id: 'code-librarian', icon: '📚', name: 'Code Librarian', description: 'Uploaded your first contribution.', accent: '#00d9ff' },
  { id: 'community-leader', icon: '👥', name: 'Community Leader', description: 'Maintained top-rated contributions.', accent: '#a855f7' },
  { id: 'top-contributor', icon: '📈', name: 'Top Contributor', description: 'Reached 50 contribution downloads.', accent: '#f59e0b' },
  { id: 'snippet-smith', icon: '💻', name: 'Snippet Smith', description: 'Uploaded 5 code snippets.', accent: '#00d9ff' },
  { id: 'prompt-smith', icon: '🗨️', name: 'Prompt Smith', description: 'Uploaded 5 prompts.', accent: '#a855f7' },
  { id: 'template-forger', icon: '📄', name: 'Template Forger', description: 'Uploaded 5 templates.', accent: '#f59e0b' },
  { id: 'pattern-seer', icon: '🧠', name: 'Pattern Seer', description: 'Uploaded 5 patterns.', accent: '#00d9ff' },
  { id: 'ci-whisperer', icon: '🌐', name: 'CI Whisperer', description: 'Uploaded 5 CI configs.', accent: '#a855f7' },
  { id: 'download-magnet', icon: '⬇️', name: 'Download Magnet', description: 'Received 100 downloads across contributions.', accent: '#f59e0b' },
  { id: 'review-star', icon: '⭐', name: 'Review Star', description: 'Received a 5-star contribution rating.', accent: '#00d9ff' },
  { id: 'integration-ace', icon: '🔌', name: 'Integration Ace', description: 'Generated 25 integration suites.', accent: '#a855f7' },
  { id: 'system-savant', icon: '⚙️', name: 'System Savant', description: 'Generated 10 system suites.', accent: '#f59e0b' },
  { id: 'acceptance-navigator', icon: '🗺️', name: 'Acceptance Navigator', description: 'Generated 15 acceptance suites.', accent: '#00d9ff' },
  { id: 'unit-specialist', icon: '🧱', name: 'Unit Specialist', description: 'Generated 25 unit suites.', accent: '#a855f7' },
  { id: 'weekly-winner', icon: '🏆', name: 'Weekly Winner', description: 'Finished #1 on a weekly leaderboard.', accent: '#f59e0b' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } },
}

export default function TrophyRoom({ gamification, dailyChallenges, weeklyChallenges, onClaimChallenge, claimingChallengeId }) {
  const earnedBadges = gamification?.badges || []
  const earnedIds = new Set(earnedBadges.map((b) => b.id || b.badgeId || b.badge_id))
  const claimedCount = earnedBadges.length

  const badges = BADGE_DEFS.map((def) => ({
    ...def,
    earned: earnedIds.has(def.id),
    earnedData: earnedBadges.find((b) => (b.id || b.badgeId || b.badge_id) === def.id),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        style={{
          background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.9))',
          border: '1px solid rgba(0,217,255,0.25)',
          borderRadius: 16,
          padding: '24px 28px',
          backdropFilter: 'blur(12px)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 320, height: 320, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.2)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', width: 230, height: 230, borderRadius: '50%', border: '1px solid rgba(0,217,255,0.15)', pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, position: 'relative' }}>
          <motion.div animate={{ rotate: [0, 8, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} style={{ fontSize: '2.5rem' }}>
            🏆
          </motion.div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#555' }}>
                Milestone Deck
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.15em' }}>
              Trophy Room
            </h2>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#666', marginTop: 4 }}>
              Your unlocked backend achievements. {claimedCount} / {BADGE_DEFS.length} discovered.
            </p>
          </div>
        </div>

        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,217,255,0.15)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, position: 'relative' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff' }}>{claimedCount} achievements unlocked</div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: 4 }}>
              Note: many trophies are based on actions like total generated suites, heals, exports, or streaks, not just raw XP.
            </div>
          </div>
          <div style={{ flex: 1, maxWidth: 180 }}>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: `${Math.round((claimedCount / BADGE_DEFS.length) * 100)}%` }} />
            </div>
            <div style={{ fontSize: '0.68rem', color: '#444', marginTop: 4, textAlign: 'right' }}>
              {Math.round((claimedCount / BADGE_DEFS.length) * 100)}% complete
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14, position: 'relative' }}>
        {badges.map((badge, i) => (
          <motion.div
            key={badge.id}
            variants={itemVariants}
            whileHover={badge.earned ? { scale: 1.05 } : {}}
            className={`badge-card${badge.earned ? '' : ' locked'}`}
            style={{ animationDelay: `${i * 0.07}s`, borderColor: badge.earned ? `${badge.accent}40` : 'rgba(255,255,255,0.06)', position: 'relative', zIndex: 1 }}
          >
            {badge.earned && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 12, background: `radial-gradient(circle at 50% 0%, ${badge.accent}18, transparent 70%)`, pointerEvents: 'none' }} />
            )}
            <div style={{ fontSize: '2.2rem', marginBottom: 10 }}>{badge.icon}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: badge.earned ? '#fff' : '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
              {badge.name}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#555', lineHeight: 1.5, marginBottom: 10 }}>{badge.description}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: badge.earned ? 'rgba(0,255,150,0.12)' : 'rgba(255,255,255,0.04)', border: badge.earned ? '1px solid rgba(0,255,150,0.3)' : '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '3px 8px', fontSize: '0.68rem', fontWeight: 800, color: badge.earned ? '#00ff96' : '#444' }}>
              {badge.earned ? 'Unlocked' : 'Locked'}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChallengeSection title="Daily Challenges" icon="⚡" accent="#00d9ff" challenges={dailyChallenges || []} onClaim={onClaimChallenge} claimingId={claimingChallengeId} />
        <ChallengeSection title="Weekly Missions" icon="📅" accent="#a855f7" challenges={weeklyChallenges || []} onClaim={onClaimChallenge} claimingId={claimingChallengeId} />
      </div>
    </div>
  )
}

function ChallengeSection({ title, icon, accent, challenges, onClaim, claimingId }) {
  const claimed = (challenges || []).filter((c) => c.claimed).length

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ background: 'linear-gradient(135deg, rgba(10,14,39,0.8), rgba(0,0,0,0.85))', border: `1px solid ${accent}33`, borderRadius: 14, padding: '20px', backdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ fontSize: '1.3rem' }}>{icon}</span>
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>{title}</div>
          <div style={{ fontSize: '0.7rem', color: '#555' }}>{claimed} claimed</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {challenges.length === 0 && <div style={{ textAlign: 'center', color: '#444', fontSize: '0.8rem', padding: '16px 0' }}>No active challenges yet.</div>}
        {challenges.map((c) => {
          const pct = c.requirementValue ? Math.min(100, Math.round((c.progressCurrent / c.requirementValue) * 100)) : 0
          const canClaim = c.completed && !c.claimed
          return (
            <div key={c.id} style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${c.claimed ? 'rgba(0,255,150,0.2)' : accent + '22'}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: c.claimed ? '#555' : '#ddd', marginBottom: 2 }}>{c.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#444', lineHeight: 1.4 }}>{c.description}</div>
                </div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>+{c.xpReward} XP</div>
              </div>
              <div className="progress-track" style={{ marginBottom: 8 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: c.claimed ? 'linear-gradient(90deg, #00ff96, #00d9ff)' : `linear-gradient(90deg, ${accent}, ${accent}aa)` }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.67rem', color: '#444' }}>{c.progressCurrent ?? 0}/{c.requirementValue ?? 1}</span>
                {c.claimed ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(0,255,150,0.1)', border: '1px solid rgba(0,255,150,0.25)', borderRadius: 5, padding: '2px 7px', fontSize: '0.67rem', fontWeight: 800, color: '#00ff96' }}>Claimed</div>
                ) : canClaim ? (
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={() => onClaim(c.id)} disabled={claimingId === c.id} style={{ padding: '4px 12px', border: 'none', borderRadius: 6, background: `linear-gradient(90deg, ${accent}, ${accent}cc)`, color: '#000', fontWeight: 800, fontSize: '0.7rem', cursor: 'pointer', opacity: claimingId === c.id ? 0.6 : 1 }}>
                    {claimingId === c.id ? '...' : 'Claim'}
                  </motion.button>
                ) : (
                  <span style={{ fontSize: '0.67rem', color: '#444' }}>{pct}% done</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
