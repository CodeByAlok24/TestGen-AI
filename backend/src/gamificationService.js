import { DAILY_CHALLENGE_TEMPLATES, LEVEL_THRESHOLDS, WEEKLY_CHALLENGE_TEMPLATES } from './gamificationData.js'
import {
  claimChallengeReward,
  createContribution,
  createContributionRating,
  createOrGetGamificationProfile,
  getContributionById,
  getContributions,
  getLeaderboard,
  getUserChallenges,
  getUserContributionStats,
  getUserStats,
  incrementContributionStat,
  listContributionRatings,
  listUserContributions,
  saveChallengeRecords,
  saveGamificationProfile,
  updateContributionAggregateRating,
} from './gamificationStore.js'

const XP_MAP = {
  'generate-unit-test': 10,
  'generate-integration-test': 15,
  'generate-acceptance-test': 20,
  'generate-system-test': 25,
  'self-heal-test': 15,
  'export-to-cicd': 40,
  'contribution-upload': 25,
}

export function calculateLevel(totalXP) {
  let level = 1
  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (totalXP >= LEVEL_THRESHOLDS[index]) level = index + 1
    else break
  }
  return level
}

function getLevelWindow(level) {
  const currentFloor = LEVEL_THRESHOLDS[Math.max(0, level - 1)] ?? 0
  const nextCap = LEVEL_THRESHOLDS[level] ?? currentFloor + 15000
  return { currentFloor, nextCap }
}

function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

function startOfWeek(date = new Date()) {
  const instance = new Date(date)
  const day = instance.getUTCDay() || 7
  instance.setUTCDate(instance.getUTCDate() - day + 1)
  instance.setUTCHours(0, 0, 0, 0)
  return instance
}

function challengeResetAt(type) {
  const now = new Date()
  if (type === 'daily') {
    const reset = new Date(now)
    reset.setUTCDate(reset.getUTCDate() + 1)
    reset.setUTCHours(0, 0, 0, 0)
    return reset
  }
  const reset = startOfWeek(now)
  reset.setUTCDate(reset.getUTCDate() + 7)
  return reset
}

function normalizeChallenge(row) {
  return {
    id: row.challengeId || row.id,
    dbId: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    action: row.action,
    requirementValue: row.targetValue,
    thresholdValue: row.thresholdValue,
    xpReward: row.xpReward,
    badgeReward: row.badgeReward,
    progressCurrent: row.progressValue,
    completed: row.completed,
    claimed: row.claimed,
    completedAt: row.completedAt,
    claimedAt: row.claimedAt,
    resetsAt: row.resetsAt,
  }
}

async function ensureChallengeRows(userId) {
  const existing = await getUserChallenges(userId)
  if (existing.length > 0) return existing
  const records = [
    ...DAILY_CHALLENGE_TEMPLATES.map((challenge) => ({ userId, challengeId: challenge.id, type: 'daily', title: challenge.title, description: challenge.description, difficulty: challenge.difficulty, action: challenge.action, targetValue: challenge.target, thresholdValue: challenge.threshold ?? null, xpReward: challenge.xpReward, badgeReward: challenge.badgeReward ?? null, progressValue: 0, completed: false, claimed: false, resetsAt: challengeResetAt('daily') })),
    ...WEEKLY_CHALLENGE_TEMPLATES.map((challenge) => ({ userId, challengeId: challenge.id, type: 'weekly', title: challenge.title, description: challenge.description, difficulty: challenge.difficulty, action: challenge.action, targetValue: challenge.target, thresholdValue: challenge.threshold ?? null, xpReward: challenge.xpReward, badgeReward: challenge.badgeReward ?? null, progressValue: 0, completed: false, claimed: false, resetsAt: challengeResetAt('weekly') })),
  ]
  await saveChallengeRecords(records)
  return getUserChallenges(userId)
}

function updateStreak(profile) {
  const today = todayKey()
  const lastDate = profile.lastGenerationDate ? todayKey(new Date(profile.lastGenerationDate)) : null
  if (lastDate === today) return profile
  const yesterday = new Date()
  yesterday.setUTCDate(yesterday.getUTCDate() - 1)
  const yesterdayKey = todayKey(yesterday)
  profile.currentStreak = lastDate === yesterdayKey ? profile.currentStreak + 1 : 1
  profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak)
  profile.lastGenerationDate = new Date().toISOString()
  const calendar = Array.isArray(profile.streakCalendar) ? profile.streakCalendar : []
  const filtered = calendar.filter((entry) => entry.date !== today).slice(-29)
  filtered.push({ date: today, generated: true })
  profile.streakCalendar = filtered
  return profile
}

function unlockBadge(profile, badgeId, output) {
  if (!profile.badges.some((badge) => badge.id === badgeId)) {
    profile.badges.push({ id: badgeId, unlockedAt: new Date().toISOString(), sharedToSocial: false })
    output.push(badgeId)
  }
}

function checkBadgeUnlocks(profile, action, metadata) {
  const unlocked = []
  const totalGenerated = profile.stats.totalTestsGenerated
  if (totalGenerated >= 1) unlockBadge(profile, 'first-test', unlocked)
  if (totalGenerated >= 50) unlockBadge(profile, 'test-fifty', unlocked)
  if (totalGenerated >= 100) unlockBadge(profile, 'test-century', unlocked)
  if ((metadata.qualityScore ?? 0) >= 95) unlockBadge(profile, 'quality-champion', unlocked)
  if ((profile.stats.avgQualityScore ?? 0) >= 90 && totalGenerated >= 10) unlockBadge(profile, 'quality-architect', unlocked)
  if (profile.currentStreak >= 7) unlockBadge(profile, 'seven-day-streak', unlocked)
  if (profile.currentStreak >= 30) unlockBadge(profile, 'consistency-warrior', unlocked)
  if ((profile.stats.totalCIExports ?? 0) >= 10) unlockBadge(profile, 'ci-captain', unlocked)
  if ((profile.stats.totalHeals ?? 0) >= 10) unlockBadge(profile, 'healing-hand', unlocked)
  if ((profile.stats.testLevelUsage?.unit ?? 0) >= 25) unlockBadge(profile, 'unit-specialist', unlocked)
  if ((profile.stats.testLevelUsage?.integration ?? 0) >= 25) unlockBadge(profile, 'integration-ace', unlocked)
  if ((profile.stats.testLevelUsage?.acceptance ?? 0) >= 15) unlockBadge(profile, 'acceptance-navigator', unlocked)
  if ((profile.stats.testLevelUsage?.system ?? 0) >= 10) unlockBadge(profile, 'system-savant', unlocked)
  if (['pytest', 'junit', 'jest'].every((framework) => (profile.stats.frameworkUsage?.[framework] ?? 0) >= 5)) unlockBadge(profile, 'framework-master', unlocked)
  if (action === 'contribution-upload') unlockBadge(profile, 'code-librarian', unlocked)
  return unlocked
}

async function refreshChallengeProgress(userId, action, metadata) {
  const rows = await ensureChallengeRows(userId)
  const now = new Date()
  const updated = rows.map((row) => {
    const resetsAt = new Date(row.resetsAt)
    if (resetsAt <= now) {
      row.progressValue = 0
      row.completed = false
      row.claimed = false
      row.completedAt = null
      row.claimedAt = null
      row.resetsAt = challengeResetAt(row.type)
    }
    if (row.completed) return row
    if (row.action === 'generate-tests' && action.startsWith('generate-')) row.progressValue += 1
    if (row.action === 'quality-threshold' && (metadata.qualityScore ?? 0) >= (row.thresholdValue ?? 0)) row.progressValue = Math.max(row.progressValue, 1)
    if (row.action === 'framework-variety' && metadata.frameworksUsedToday) row.progressValue = metadata.frameworksUsedToday
    if (row.action === 'heal-tests' && action === 'self-heal-test') row.progressValue += 1
    if (row.action === 'ci-export' && action === 'export-to-cicd') row.progressValue += 1
    if (row.progressValue >= row.targetValue) {
      row.completed = true
      row.completedAt = new Date().toISOString()
    }
    return row
  })
  await saveChallengeRecords(updated)
  return updated.filter((row) => row.completed && !row.claimed)
}

export async function awardXP(userId, action, metadata = {}) {
  const profile = await createOrGetGamificationProfile(userId)
  const previousLevel = profile.level
  const baseXP = XP_MAP[action] || 0
  const streakBonus = Math.round(baseXP * Math.min(profile.currentStreak, 10) * 0.1)
  const qualityBonus = (metadata.qualityScore ?? 0) >= 95 ? 25 : (metadata.qualityScore ?? 0) >= 90 ? 10 : 0
  const totalXP = baseXP + streakBonus + qualityBonus
  profile.currentXP += totalXP
  profile.totalXPEarned += totalXP
  profile.level = calculateLevel(profile.totalXPEarned)
  if (action.startsWith('generate-')) {
    profile.stats.totalTestsGenerated += 1
    profile.stats.totalTestCasesGenerated += metadata.testCount ?? 3
    profile.stats.totalGenerationTimeMs += metadata.generationTimeMs ?? 0
    profile.stats.avgGenerationTimeMs = profile.stats.totalTestsGenerated > 0 ? Math.round(profile.stats.totalGenerationTimeMs / profile.stats.totalTestsGenerated) : 0
    if (metadata.qualityScore) {
      profile.stats.avgQualityScore = ((profile.stats.avgQualityScore * (profile.stats.totalTestsGenerated - 1)) + metadata.qualityScore) / profile.stats.totalTestsGenerated
    }
    metadata.frameworks?.forEach((framework) => {
      profile.stats.frameworkUsage[framework] = (profile.stats.frameworkUsage[framework] ?? 0) + 1
    })
    profile.stats.testLevelUsage[metadata.testLevel] = (profile.stats.testLevelUsage[metadata.testLevel] ?? 0) + 1
    updateStreak(profile)
  }
  if (action === 'self-heal-test') profile.stats.totalHeals += 1
  if (action === 'export-to-cicd') profile.stats.totalCIExports += 1
  const frameworksUsedToday = Object.values(profile.stats.frameworkUsage || {}).filter(Boolean).length
  const unlockedBadges = checkBadgeUnlocks(profile, action, { ...metadata, frameworksUsedToday })
  await saveGamificationProfile(profile)
  const completedChallenges = await refreshChallengeProgress(userId, action, { ...metadata, frameworksUsedToday })
  return { xpGained: totalXP, newLevel: profile.level, leveledUp: profile.level > previousLevel, unlockedBadges, completedChallenges: completedChallenges.map((row) => row.title), profile }
}

export async function getGamificationSummary(userId) {
  const profile = await createOrGetGamificationProfile(userId)
  const { currentFloor, nextCap } = getLevelWindow(profile.level)
  const challenges = await ensureChallengeRows(userId)
  return {
    level: profile.level,
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    lastGenerationDate: profile.lastGenerationDate,
    streakCalendar: profile.streakCalendar,
    currentXP: profile.totalXPEarned - currentFloor,
    totalXPEarned: profile.totalXPEarned,
    nextLevelXP: nextCap - currentFloor,
    xpWindow: {
      current: profile.totalXPEarned - currentFloor,
      max: nextCap - currentFloor,
      progressPercent:
        nextCap - currentFloor > 0
          ? Math.round(((profile.totalXPEarned - currentFloor) / (nextCap - currentFloor)) * 100)
          : 0,
    },
    badges: profile.badges,
    streak: { current: profile.currentStreak, longest: profile.longestStreak, calendar: profile.streakCalendar },
    stats: profile.stats,
    theme: profile.theme,
    leaderboardRank: profile.leaderboardRank,
    challenges: {
      daily: challenges.filter((row) => row.type === 'daily').map(normalizeChallenge),
      weekly: challenges.filter((row) => row.type === 'weekly').map(normalizeChallenge),
    },
  }
}

export async function getChallengeSet(userId, type) {
  const rows = await ensureChallengeRows(userId)
  return rows.filter((row) => row.type === type).map(normalizeChallenge)
}

export async function claimChallenge(userId, challengeId) {
  const result = await claimChallengeReward(userId, challengeId)
  if (!result) throw new Error('Challenge reward is not available.')
  const profile = await createOrGetGamificationProfile(userId)
  profile.currentXP += result.xpReward
  profile.totalXPEarned += result.xpReward
  profile.level = calculateLevel(profile.totalXPEarned)
  const unlockedBadges = []
  if (result.badgeReward) unlockBadge(profile, result.badgeReward, unlockedBadges)
  await saveGamificationProfile(profile)
  return { xpAwarded: result.xpReward, badge: result.badgeReward, challengesCompleted: 1, unlockedBadges }
}

export async function getLeaderboardView(type, limit = 20) { return getLeaderboard(type, limit) }

export async function uploadContribution(userId, contributionData) {
  const baseMap = { 'code-snippet': 25, prompt: 20, template: 35, pattern: 40, 'ci-config': 45 }
  const contribution = await createContribution({ contributorId: userId, ...contributionData, xpAwarded: { baseXP: baseMap[contributionData.type] ?? 20, qualityBonusXP: 0, downloadBonusXP: 0, totalXP: baseMap[contributionData.type] ?? 20 } })
  const reward = await awardXP(userId, 'contribution-upload', {})
  const countByType = await getUserContributionStats(userId)
  if ((countByType['code-snippet'] ?? 0) >= 5) unlockBadge(reward.profile, 'snippet-smith', reward.unlockedBadges)
  if ((countByType.prompt ?? 0) >= 5) unlockBadge(reward.profile, 'prompt-smith', reward.unlockedBadges)
  if ((countByType.template ?? 0) >= 5) unlockBadge(reward.profile, 'template-forger', reward.unlockedBadges)
  if ((countByType.pattern ?? 0) >= 5) unlockBadge(reward.profile, 'pattern-seer', reward.unlockedBadges)
  if ((countByType['ci-config'] ?? 0) >= 5) unlockBadge(reward.profile, 'ci-whisperer', reward.unlockedBadges)
  await saveGamificationProfile(reward.profile)
  return { contributionId: contribution.id, xpAwarded: contribution.xpAwarded?.baseXP ?? baseMap[contributionData.type] ?? 20, badge: reward.unlockedBadges[0] || 'code-librarian', baseXP: baseMap[contributionData.type] ?? 20, potential: 'Earn bonus XP from ratings and downloads.' }
}

export async function getContributionFeed() { return getContributions() }

export async function getContributionDetail(contributionId, userId = null) {
  const contribution = await getContributionById(contributionId)
  const ratings = await listContributionRatings(contributionId)
  const myRating = ratings.find((entry) => String(entry.userId) === String(userId)) || null
  return { ...contribution, ratings, contributorStats: await getUserContributionStats(contribution.contributorId), yourRating: myRating }
}

export async function rateContribution(contributionId, userId, rating, comment) {
  await createContributionRating({ contributionId, userId, rating, comment })
  const aggregate = await updateContributionAggregateRating(contributionId)
  const contribution = await getContributionById(contributionId)
  let xpAwarded = 0
  let badgeUnlocked = null
  if (aggregate.rating >= 4.5 && aggregate.ratingCount >= 3) {
    const contributorProfile = await createOrGetGamificationProfile(contribution.contributorId)
    contributorProfile.currentXP += 50
    contributorProfile.totalXPEarned += 50
    contributorProfile.level = calculateLevel(contributorProfile.totalXPEarned)
    const unlocked = []
    unlockBadge(contributorProfile, 'community-leader', unlocked)
    unlockBadge(contributorProfile, 'review-star', unlocked)
    await saveGamificationProfile(contributorProfile)
    xpAwarded = 50
    badgeUnlocked = unlocked[0] || null
  }
  return { newRating: aggregate.rating, xpAwarded, badgeUnlocked }
}

export async function registerContributionDownload(contributionId) {
  const contribution = await incrementContributionStat(contributionId, 'downloads')
  let xpAwarded = 0
  let milestone = null
  if (contribution.stats.downloads % 10 === 0) {
    const contributorProfile = await createOrGetGamificationProfile(contribution.contributorId)
    contributorProfile.currentXP += 5
    contributorProfile.totalXPEarned += 5
    contributorProfile.level = calculateLevel(contributorProfile.totalXPEarned)
    const unlocked = []
    if (contribution.stats.downloads >= 50) unlockBadge(contributorProfile, 'top-contributor', unlocked)
    if (contribution.stats.downloads >= 100) unlockBadge(contributorProfile, 'download-magnet', unlocked)
    await saveGamificationProfile(contributorProfile)
    xpAwarded = 5
    milestone = `${contribution.stats.downloads} downloads`
  }
  return { xpAwarded, milestone }
}

export async function forkContribution(contributionId, userId, modifiedContent) {
  const source = await getContributionById(contributionId)
  const fork = await createContribution({ contributorId: userId, type: source.type, title: `${source.title} (Fork)`, description: source.description, content: modifiedContent || source.content, language: source.language, framework: source.framework, difficulty: source.difficulty, tags: source.tags, category: source.category, xpAwarded: { baseXP: 15, qualityBonusXP: 0, downloadBonusXP: 0, totalXP: 15 }, parentId: source.id })
  return { forkedContributionId: fork.id, forkNotificationSent: false }
}

export async function getMyContributions(userId) { return listUserContributions(userId) }
export async function getGamificationStats(userId) { return getUserStats(userId) }
