import { getDb, ObjectId } from './db.js'

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
  const db = getDb()
  const gamificationCollection = db.collection('user_gamification')

  const existing = await gamificationCollection.findOne({ user_id: userId })
  if (existing) {
    return {
      userId: existing.user_id,
      currentXP: existing.current_xp,
      totalXPEarned: existing.total_xp_earned,
      level: existing.level,
      badges: parseJson(existing.badges, []),
      currentStreak: existing.current_streak,
      longestStreak: existing.longest_streak,
      lastGenerationDate: existing.last_generation_date,
      streakCalendar: parseJson(existing.streak_calendar, []),
      stats: parseJson(existing.stats, defaultProfile(userId).stats),
      theme: existing.theme,
      leaderboardRank: parseJson(existing.leaderboard_rank, defaultProfile(userId).leaderboardRank),
    }
  }

  const profile = defaultProfile(userId)
  await saveGamificationProfile(profile)
  return profile
}

export async function saveGamificationProfile(profile) {
  const db = getDb()
  const gamificationCollection = db.collection('user_gamification')

  await gamificationCollection.updateOne(
    { user_id: profile.userId },
    {
      $set: {
        user_id: profile.userId,
        current_xp: profile.currentXP,
        total_xp_earned: profile.totalXPEarned,
        level: profile.level,
        badges: profile.badges,
        current_streak: profile.currentStreak,
        longest_streak: profile.longestStreak,
        last_generation_date: profile.lastGenerationDate,
        streak_calendar: profile.streakCalendar,
        stats: profile.stats,
        theme: profile.theme,
        leaderboard_rank: profile.leaderboardRank,
        updated_at: new Date(),
      },
    },
    { upsert: true }
  )
}

export async function getUserChallenges(userId) {
  const db = getDb()
  const challengesCollection = db.collection('user_challenges')

  const challenges = await challengesCollection
    .find({ user_id: userId })
    .sort({ type: 1, challenge_id: 1 })
    .toArray()

  return challenges.map((row) => ({
    id: row._id.toString(),
    userId: row.user_id,
    challengeId: row.challenge_id,
    type: row.type,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    action: row.action,
    targetValue: row.target_value,
    thresholdValue: row.threshold_value,
    xpReward: row.xp_reward,
    badgeReward: row.badge_reward,
    progressValue: row.progress_value,
    completed: row.completed,
    claimed: row.claimed,
    completedAt: row.completed_at,
    claimedAt: row.claimed_at,
    resetsAt: row.resets_at,
  }))
}

export async function saveChallengeRecords(records) {
  const db = getDb()
  const challengesCollection = db.collection('user_challenges')

  for (const record of records) {
    await challengesCollection.updateOne(
      { user_id: record.userId, challenge_id: record.challengeId },
      {
        $set: {
          user_id: record.userId,
          challenge_id: record.challengeId,
          type: record.type,
          title: record.title,
          description: record.description,
          difficulty: record.difficulty,
          action: record.action,
          target_value: record.targetValue,
          threshold_value: record.thresholdValue,
          xp_reward: record.xpReward,
          badge_reward: record.badgeReward,
          progress_value: record.progressValue,
          completed: record.completed,
          claimed: record.claimed,
          completed_at: record.completedAt,
          claimed_at: record.claimedAt,
          resets_at: record.resetsAt,
          updated_at: new Date(),
        },
      },
      { upsert: true }
    )
  }
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
  const db = getDb()

  if (type === 'contributors') {
    const result = await db.collection('contributions')
      .aggregate([
        {
          $group: {
            _id: '$contributor_id',
            username: { $first: '$contributor_username' },
            total_contributions: { $sum: 1 },
            total_downloads: {
              $sum: { $toInt: { $ifNull: ['$stats.downloads', 0] } }
            },
            avg_rating: { $avg: { $toDouble: { $ifNull: ['$stats.rating', 0] } } }
          }
        },
        {
          $sort: { total_downloads: -1, avg_rating: -1 }
        },
        {
          $limit: limit
        }
      ])
      .toArray()

    return result.map((row, index) => ({
      rank: index + 1,
      userId: row._id,
      username: row.username,
      totalSnippets: row.total_contributions,
      totalDownloads: row.total_downloads,
      avgRating: row.avg_rating || 0,
      xpEarned: 0,
    }))
  }

  const result = await db.collection('user_gamification')
    .aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $sort: { total_xp_earned: -1, level: -1 }
      },
      {
        $limit: limit
      }
    ])
    .toArray()

  return result.map((row, index) => ({
    rank: index + 1,
    userId: row.user_id,
    username: row.user.username,
    level: row.level,
    xp: row.total_xp_earned,
    badges: parseJson(row.badges, []).map((badge) => badge.id || badge),
  }))
}

export async function createContribution(payload) {
  const db = getDb()
  const contributionsCollection = db.collection('contributions')

  const result = await contributionsCollection.insertOne({
    contributor_id: new ObjectId(payload.contributorId),
    contributor_username: payload.contributorName || `User ${payload.contributorId}`,
    parent_id: payload.parentId ? new ObjectId(payload.parentId) : null,
    type: payload.type,
    title: payload.title,
    description: payload.description,
    content: payload.content,
    language: payload.language,
    framework: payload.framework,
    difficulty: payload.difficulty,
    tags: payload.tags || [],
    category: payload.category || null,
    stats: payload.stats || { downloads: 0, forks: 0, views: 0, rating: 0, ratingCount: 0, uses: 0 },
    xp_awarded: payload.xpAwarded,
    badges: payload.badges || [],
    trending: Boolean(payload.trending),
    created_at: new Date(),
    updated_at: new Date(),
  })

  return { id: result.insertedId.toString() }
}

function mapContributionRow(row) {
  return {
    id: row._id.toString(),
    contributorId: row.contributor_id.toString(),
    contributorName: row.contributor_username,
    parentId: row.parent_id ? row.parent_id.toString() : null,
    type: row.type,
    title: row.title,
    description: row.description,
    content: row.content,
    language: row.language,
    framework: row.framework,
    difficulty: row.difficulty,
    tags: parseJson(row.tags, []),
    category: row.category,
    stats: parseJson(row.stats, { downloads: 0, forks: 0, views: 0, rating: 0, ratingCount: 0, uses: 0 }),
    xpAwarded: parseJson(row.xp_awarded, { baseXP: 0, qualityBonusXP: 0, downloadBonusXP: 0, totalXP: 0 }),
    badges: parseJson(row.badges, []),
    trending: row.trending,
    createdAt: row.created_at,
  }
}

export async function getContributions() {
  const db = getDb()
  const contributionsCollection = db.collection('contributions')

  const contributions = await contributionsCollection
    .find()
    .sort({ created_at: -1 })
    .limit(100)
    .toArray()

  return contributions.map(mapContributionRow)
}

export async function getContributionById(contributionId) {
  const db = getDb()
  const contributionsCollection = db.collection('contributions')

  const contribution = await contributionsCollection.findOne({
    _id: new ObjectId(contributionId)
  })

  if (!contribution) return null
  return mapContributionRow(contribution)
}

export async function createContributionRating(payload) {
  const db = getDb()
  const ratingsCollection = db.collection('contribution_ratings')

  await ratingsCollection.updateOne(
    {
      contribution_id: new ObjectId(payload.contributionId),
      user_id: new ObjectId(payload.userId),
    },
    {
      $set: {
        contribution_id: new ObjectId(payload.contributionId),
        user_id: new ObjectId(payload.userId),
        rating: payload.rating,
        comment: payload.comment || null,
        helpful: payload.helpful ?? null,
        created_at: new Date(),
      },
    },
    { upsert: true }
  )
}

export async function listContributionRatings(contributionId) {
  const db = getDb()
  const ratingsCollection = db.collection('contribution_ratings')

  const ratings = await ratingsCollection
    .find({ contribution_id: new ObjectId(contributionId) })
    .sort({ created_at: -1 })
    .toArray()

  return ratings
}

export async function updateContributionAggregateRating(contributionId) {
  const ratingRows = await listContributionRatings(contributionId)
  const average = ratingRows.length > 0 
    ? Number((ratingRows.reduce((sum, entry) => sum + entry.rating, 0) / ratingRows.length).toFixed(1))
    : 0

  const db = getDb()
  const contributionsCollection = db.collection('contributions')

  await contributionsCollection.updateOne(
    { _id: new ObjectId(contributionId) },
    {
      $set: {
        'stats.rating': average,
        'stats.ratingCount': ratingRows.length,
      },
    }
  )

  return { rating: average, ratingCount: ratingRows.length }
}

export async function incrementContributionStat(contributionId, key) {
  const db = getDb()
  const contributionsCollection = db.collection('contributions')

  const result = await contributionsCollection.findOneAndUpdate(
    { _id: new ObjectId(contributionId) },
    {
      $inc: { [`stats.${key}`]: 1 },
    },
    { returnDocument: 'after' }
  )

  if (!result.value) return null
  return mapContributionRow(result.value)
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
