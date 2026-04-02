import { query } from './db.js'
import { isDatabaseEnabled } from './store.js'

let profiles = []
let challenges = []
let contributions = []
let ratings = []
let contributionIdCounter = 1
let ratingIdCounter = 1

function defaultProfile(userId) {
  return {
    userId,
    currentXP: 0,
    totalXPEarned: 0,
    level: 1,
    badges: [],
    currentStreak: 0,
    longestStreak: 0,
    lastGenerationDate: null,
    streakCalendar: [],
    stats: {
      totalTestsGenerated: 0,
      avgQualityScore: 0,
      frameworkUsage: { pytest: 0, junit: 0, jest: 0, custom: 0 },
      testLevelUsage: { unit: 0, integration: 0, acceptance: 0, system: 0 },
      avgGenerationTimeMs: 0,
      totalGenerationTimeMs: 0,
      totalCIExports: 0,
      totalHeals: 0,
      totalContributions: 0,
      totalContributionDownloads: 0,
      totalTestCasesGenerated: 0,
    },
    theme: 'default',
    leaderboardRank: { global: null, weekly: null, contributor: null, team: null },
  }
}

function parseJson(value, fallback) {
  if (!value) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export async function createOrGetGamificationProfile(userId) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT * FROM user_gamification WHERE user_id = $1 LIMIT 1', [userId])
    if (result.rowCount > 0) {
      const row = result.rows[0]
      return {
        userId: row.user_id,
        currentXP: row.current_xp,
        totalXPEarned: row.total_xp_earned,
        level: row.level,
        badges: parseJson(row.badges, []),
        currentStreak: row.current_streak,
        longestStreak: row.longest_streak,
        lastGenerationDate: row.last_generation_date,
        streakCalendar: parseJson(row.streak_calendar, []),
        stats: parseJson(row.stats, defaultProfile(userId).stats),
        theme: row.theme,
        leaderboardRank: parseJson(row.leaderboard_rank, defaultProfile(userId).leaderboardRank),
      }
    }

    const profile = defaultProfile(userId)
    await saveGamificationProfile(profile)
    return profile
  }

  let profile = profiles.find((entry) => String(entry.userId) === String(userId))
  if (!profile) {
    profile = defaultProfile(userId)
    profiles.push(profile)
  }
  return structuredClone(profile)
}

export async function saveGamificationProfile(profile) {
  if (isDatabaseEnabled()) {
    await query(
      `INSERT INTO user_gamification
       (user_id, current_xp, total_xp_earned, level, badges, current_streak, longest_streak, last_generation_date, streak_calendar, stats, theme, leaderboard_rank, updated_at)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9::jsonb,$10::jsonb,$11,$12::jsonb,NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         current_xp = EXCLUDED.current_xp,
         total_xp_earned = EXCLUDED.total_xp_earned,
         level = EXCLUDED.level,
         badges = EXCLUDED.badges,
         current_streak = EXCLUDED.current_streak,
         longest_streak = EXCLUDED.longest_streak,
         last_generation_date = EXCLUDED.last_generation_date,
         streak_calendar = EXCLUDED.streak_calendar,
         stats = EXCLUDED.stats,
         theme = EXCLUDED.theme,
         leaderboard_rank = EXCLUDED.leaderboard_rank,
         updated_at = NOW()`,
      [
        profile.userId, profile.currentXP, profile.totalXPEarned, profile.level, JSON.stringify(profile.badges),
        profile.currentStreak, profile.longestStreak, profile.lastGenerationDate, JSON.stringify(profile.streakCalendar),
        JSON.stringify(profile.stats), profile.theme, JSON.stringify(profile.leaderboardRank),
      ],
    )
    return
  }

  const index = profiles.findIndex((entry) => String(entry.userId) === String(profile.userId))
  if (index >= 0) profiles[index] = structuredClone(profile)
  else profiles.push(structuredClone(profile))
}

export async function getUserChallenges(userId) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT * FROM user_challenges WHERE user_id = $1 ORDER BY type, challenge_id', [userId])
    return result.rows.map((row) => ({
      id: row.id, userId: row.user_id, challengeId: row.challenge_id, type: row.type, title: row.title,
      description: row.description, difficulty: row.difficulty, action: row.action, targetValue: row.target_value,
      thresholdValue: row.threshold_value, xpReward: row.xp_reward, badgeReward: row.badge_reward,
      progressValue: row.progress_value, completed: row.completed, claimed: row.claimed,
      completedAt: row.completed_at, claimedAt: row.claimed_at, resetsAt: row.resets_at,
    }))
  }
  return challenges.filter((entry) => String(entry.userId) === String(userId)).map((entry) => structuredClone(entry))
}

export async function saveChallengeRecords(records) {
  if (isDatabaseEnabled()) {
    for (const record of records) {
      await query(
        `INSERT INTO user_challenges
         (user_id, challenge_id, type, title, description, difficulty, action, target_value, threshold_value, xp_reward, badge_reward, progress_value, completed, claimed, completed_at, claimed_at, resets_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
         ON CONFLICT (user_id, challenge_id)
         DO UPDATE SET type=EXCLUDED.type,title=EXCLUDED.title,description=EXCLUDED.description,difficulty=EXCLUDED.difficulty,action=EXCLUDED.action,target_value=EXCLUDED.target_value,threshold_value=EXCLUDED.threshold_value,xp_reward=EXCLUDED.xp_reward,badge_reward=EXCLUDED.badge_reward,progress_value=EXCLUDED.progress_value,completed=EXCLUDED.completed,claimed=EXCLUDED.claimed,completed_at=EXCLUDED.completed_at,claimed_at=EXCLUDED.claimed_at,resets_at=EXCLUDED.resets_at,updated_at=NOW()`,
        [record.userId, record.challengeId, record.type, record.title, record.description, record.difficulty, record.action, record.targetValue, record.thresholdValue, record.xpReward, record.badgeReward, record.progressValue, record.completed, record.claimed, record.completedAt, record.claimedAt, record.resetsAt],
      )
    }
    return
  }
  records.forEach((record) => {
    const index = challenges.findIndex((entry) => String(entry.userId) === String(record.userId) && String(entry.challengeId) === String(record.challengeId))
    if (index >= 0) challenges[index] = structuredClone(record)
    else challenges.push(structuredClone(record))
  })
}

export async function claimChallengeReward(userId, challengeId) {
  const rows = await getUserChallenges(userId)
  const challenge = rows.find(
    (row) => String(row.challengeId) === String(challengeId) || String(row.id) === String(challengeId),
  )
  if (!challenge || !challenge.completed || challenge.claimed) return null
  challenge.claimed = true
  challenge.claimedAt = new Date().toISOString()
  await saveChallengeRecords([challenge])
  return challenge
}

export async function getLeaderboard(type, limit) {
  if (isDatabaseEnabled()) {
    if (type === 'contributors') {
      const result = await query(
        `SELECT c.contributor_id AS user_id, u.username,
                COUNT(*) AS total_contributions,
                COALESCE(SUM((c.stats->>'downloads')::int), 0) AS total_downloads,
                COALESCE(AVG((c.stats->>'rating')::numeric), 0) AS avg_rating
         FROM contributions c
         JOIN users u ON u.id = c.contributor_id
         GROUP BY c.contributor_id, u.username
         ORDER BY total_downloads DESC, avg_rating DESC
         LIMIT $1`,
        [limit],
      )
      return result.rows.map((row, index) => ({
        rank: index + 1,
        userId: row.user_id,
        username: row.username,
        totalSnippets: Number(row.total_contributions),
        totalDownloads: Number(row.total_downloads),
        avgRating: Number(row.avg_rating),
        xpEarned: 0,
      }))
    }

    const result = await query(
      `SELECT ug.user_id, u.username, ug.level, ug.total_xp_earned, ug.badges
       FROM user_gamification ug
       JOIN users u ON u.id = ug.user_id
       ORDER BY ug.total_xp_earned DESC, ug.level DESC
       LIMIT $1`,
      [limit],
    )
    return result.rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      level: row.level,
      xp: row.total_xp_earned,
      badges: parseJson(row.badges, []).map((badge) => badge.id),
    }))
  }

  if (type === 'contributors') {
    return contributions
      .reduce((acc, contribution) => {
        const found = acc.find((entry) => String(entry.userId) === String(contribution.contributorId))
        if (found) {
          found.totalSnippets += 1
          found.totalDownloads += contribution.stats.downloads
          found.avgRating = ((found.avgRating * (found.totalSnippets - 1)) + contribution.stats.rating) / found.totalSnippets
        } else {
          acc.push({
            rank: 0,
            userId: contribution.contributorId,
            username: contribution.contributorName || `User ${contribution.contributorId}`,
            totalSnippets: 1,
            totalDownloads: contribution.stats.downloads,
            avgRating: contribution.stats.rating,
            xpEarned: contribution.xpAwarded.totalXP,
          })
        }
        return acc
      }, [])
      .sort((a, b) => b.totalDownloads - a.totalDownloads)
      .slice(0, limit)
      .map((entry, index) => ({ ...entry, rank: index + 1 }))
  }

  return profiles
    .slice()
    .sort((a, b) => b.totalXPEarned - a.totalXPEarned)
    .slice(0, limit)
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.userId,
      username: `User ${entry.userId}`,
      level: entry.level,
      xp: entry.totalXPEarned,
      badges: entry.badges.map((badge) => badge.id),
    }))
}

export async function createContribution(payload) {
  if (isDatabaseEnabled()) {
    const result = await query(
      `INSERT INTO contributions
       (contributor_id, parent_id, type, title, description, content, language, framework, difficulty, tags, category, stats, xp_awarded, badges, trending)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12::jsonb,$13::jsonb,$14::jsonb,$15)
       RETURNING id`,
      [
        payload.contributorId, payload.parentId ?? null, payload.type, payload.title, payload.description, payload.content,
        payload.language, payload.framework, payload.difficulty, JSON.stringify(payload.tags || []), payload.category || null,
        JSON.stringify(payload.stats || { downloads: 0, forks: 0, views: 0, rating: 0, ratingCount: 0, uses: 0 }),
        JSON.stringify(payload.xpAwarded), JSON.stringify(payload.badges || []), Boolean(payload.trending),
      ],
    )
    return { id: result.rows[0].id }
  }

  const contribution = {
    id: contributionIdCounter++, contributorId: payload.contributorId, parentId: payload.parentId ?? null,
    type: payload.type, title: payload.title, description: payload.description, content: payload.content,
    language: payload.language, framework: payload.framework, difficulty: payload.difficulty, tags: payload.tags || [],
    category: payload.category || null,
    stats: payload.stats || { downloads: 0, forks: 0, views: 0, rating: 0, ratingCount: 0, uses: 0 },
    xpAwarded: payload.xpAwarded, badges: payload.badges || [], trending: Boolean(payload.trending),
    contributorName: `User ${payload.contributorId}`, createdAt: new Date().toISOString(),
  }
  contributions.unshift(contribution)
  return { id: contribution.id }
}

function mapContributionRow(row) {
  return {
    id: row.id, contributorId: row.contributor_id, contributorName: row.username, parentId: row.parent_id, type: row.type,
    title: row.title, description: row.description, content: row.content, language: row.language, framework: row.framework,
    difficulty: row.difficulty, tags: parseJson(row.tags, []), category: row.category,
    stats: parseJson(row.stats, { downloads: 0, forks: 0, views: 0, rating: 0, ratingCount: 0, uses: 0 }),
    xpAwarded: parseJson(row.xp_awarded, { baseXP: 0, qualityBonusXP: 0, downloadBonusXP: 0, totalXP: 0 }),
    badges: parseJson(row.badges, []), trending: row.trending, createdAt: row.created_at,
  }
}

export async function getContributions() {
  if (isDatabaseEnabled()) {
    const result = await query(`SELECT c.*, u.username FROM contributions c JOIN users u ON u.id = c.contributor_id ORDER BY created_at DESC LIMIT 100`, [])
    return result.rows.map(mapContributionRow)
  }
  return contributions.map((entry) => structuredClone(entry))
}

export async function getContributionById(contributionId) {
  if (isDatabaseEnabled()) {
    const result = await query(`SELECT c.*, u.username FROM contributions c JOIN users u ON u.id = c.contributor_id WHERE c.id = $1 LIMIT 1`, [contributionId])
    return mapContributionRow(result.rows[0])
  }
  return structuredClone(contributions.find((entry) => String(entry.id) === String(contributionId)))
}

export async function createContributionRating(payload) {
  if (isDatabaseEnabled()) {
    await query(`INSERT INTO contribution_ratings (contribution_id, user_id, rating, comment, helpful) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (contribution_id, user_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment, helpful = EXCLUDED.helpful`, [payload.contributionId, payload.userId, payload.rating, payload.comment || null, payload.helpful ?? null])
    return
  }
  ratings.push({ id: ratingIdCounter++, contributionId: payload.contributionId, userId: payload.userId, rating: payload.rating, comment: payload.comment || '', helpful: payload.helpful ?? null, createdAt: new Date().toISOString() })
}

export async function listContributionRatings(contributionId) {
  if (isDatabaseEnabled()) {
    const result = await query('SELECT * FROM contribution_ratings WHERE contribution_id = $1 ORDER BY created_at DESC', [contributionId])
    return result.rows
  }
  return ratings.filter((entry) => String(entry.contributionId) === String(contributionId)).map((entry) => structuredClone(entry))
}

export async function updateContributionAggregateRating(contributionId) {
  const ratingRows = await listContributionRatings(contributionId)
  const average = ratingRows.length > 0 ? Number((ratingRows.reduce((sum, entry) => sum + entry.rating, 0) / ratingRows.length).toFixed(1)) : 0
  if (isDatabaseEnabled()) {
    await query(`UPDATE contributions SET stats = jsonb_set(jsonb_set(stats, '{rating}', to_jsonb($2::numeric), true), '{ratingCount}', to_jsonb($3::int), true) WHERE id = $1`, [contributionId, average, ratingRows.length])
  } else {
    const contribution = contributions.find((entry) => String(entry.id) === String(contributionId))
    if (contribution) {
      contribution.stats.rating = average
      contribution.stats.ratingCount = ratingRows.length
    }
  }
  return { rating: average, ratingCount: ratingRows.length }
}

export async function incrementContributionStat(contributionId, key) {
  if (isDatabaseEnabled()) {
    const result = await query(`UPDATE contributions SET stats = jsonb_set(stats, ARRAY[$2], to_jsonb(COALESCE((stats->>$2)::int, 0) + 1), true) WHERE id = $1 RETURNING *`, [contributionId, key])
    return mapContributionRow(result.rows[0])
  }
  const contribution = contributions.find((entry) => String(entry.id) === String(contributionId))
  contribution.stats[key] = (contribution.stats[key] ?? 0) + 1
  return structuredClone(contribution)
}

export async function listUserContributions(userId) {
  const all = await getContributions()
  return all.filter((entry) => String(entry.contributorId) === String(userId))
}

export async function getUserContributionStats(userId) {
  const all = await listUserContributions(userId)
  return all.reduce((acc, contribution) => {
    acc[contribution.type] = (acc[contribution.type] ?? 0) + 1
    return acc
  }, {})
}

export async function getUserStats(userId) {
  const profile = await createOrGetGamificationProfile(userId)
  const contributionList = await listUserContributions(userId)
  return {
    gamesPlayed: profile.stats.totalTestsGenerated,
    avgQuality: Number((profile.stats.avgQualityScore || 0).toFixed(1)),
    totalXp: profile.totalXPEarned,
    level: profile.level,
    badges: profile.badges.length,
    contributions: contributionList.length,
    downloadCount: contributionList.reduce((sum, contribution) => sum + (contribution.stats.downloads || 0), 0),
  }
}
