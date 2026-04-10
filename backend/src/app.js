import cors from 'cors'
import express from 'express'
import { config } from './config.js'
import { isMongoConnected } from './db.js'
import { buildCacheKey, generateOtpCode, normalizeEmail, normalizeUsername, signToken } from './utils.js'
import { rateLimit, requireAuth, securityHeaders } from './middleware.js'
import { buildPrompt } from './promptBuilder.js'
import { callLlm, LLMClientError } from './llmClient.js'
import { parseOutput } from './formatter.js'
import { scoreTests } from './qualityScorer.js'
import { healTest } from './healer.js'
import { generateGithubWorkflow } from './ciExporter.js'
import { isRedisAvailable, getRedisJson, setRedisJson } from './redis.js'
import {
  deleteOtpRecord,
  getOtpRecord,
  getAuthSession,
  saveAuthSession,
  saveOtpRecord,
} from './authRuntimeStore.js'
import {
  createSession,
  createUser,
  findUserByUsername,
  findUserByUsernameOrEmail,
  listSessionsByUser,
  validateUser,
} from './store.js'
import {
  awardXP,
  claimChallenge,
  forkContribution,
  getChallengeSet,
  getContributionDetail,
  getContributionFeed,
  getGamificationStats,
  getGamificationSummary,
  getLeaderboardView,
  getMyContributions,
  rateContribution,
  registerContributionDownload,
  uploadContribution,
} from './gamificationService.js'

const app = express()

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true)
      }

      const allowedOrigins = new Set([config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'])
      if (allowedOrigins.has(origin)) {
        return callback(null, true)
      }

      return callback(new Error('CORS origin not allowed'))
    },
    credentials: true,
  }),
)
app.use(securityHeaders)
app.use(express.json({ limit: '2mb' }))

app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected() ? 'connected' : 'disconnected',
    cache: isRedisAvailable() ? 'connected' : 'disabled',
  })
})

app.post('/api/auth/signup/', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const { username, email, password } = req.body || {}
  const cleanUsername = String(username || '').trim()
  const cleanEmail = String(email || '').trim()
  const normalizedUsername = normalizeUsername(cleanUsername)
  const normalizedEmail = normalizeEmail(cleanEmail)

  if (!cleanUsername || !cleanEmail || !password) {
    return res.status(400).json({ error: 'username, email, and password are required.' })
  }

  if (!/^[a-z0-9_.-]{3,30}$/i.test(cleanUsername)) {
    return res.status(400).json({
      error: 'Username must be 3-30 characters and use only letters, numbers, dots, underscores, or hyphens.',
    })
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' })
  }

  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' })
  }

  const existing = await findUserByUsernameOrEmail(normalizedUsername, normalizedEmail)

  if (existing) {
    return res.status(409).json({ error: 'Username or email already exists.' })
  }

  let user
  try {
    user = await createUser({ username: cleanUsername, email: cleanEmail, password })
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists.' })
    }

    throw error
  }

  const token = signToken(user)
  const decoded = requireAuthTokenPayload(token)
  await persistAuthSession(decoded, token)
  return res.status(201).json({ token, ...user })
})

app.post('/api/auth/login/', rateLimit({ windowMs: 60_000, max: 15 }), async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' })
  }

  const user = await validateUser(username, password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const token = signToken(user)
  const decoded = requireAuthTokenPayload(token)
  await persistAuthSession(decoded, token)
  return res.json({ token, id: user.id, username: user.username, email: user.email })
})

app.post('/api/auth/request-otp/', rateLimit({ windowMs: 60_000, max: 5 }), async (req, res) => {
  const { username, email } = req.body || {}

  if (!username && !email) {
    return res.status(400).json({ error: 'username or email is required.' })
  }

  const user =
    username
      ? await findUserByUsername(username)
      : await findUserByUsernameOrEmail('__missing__', email)

  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  const otp = generateOtpCode()
  const otpKey = `auth:otp:${user.id}`
  const otpPayload = {
    userId: user.id,
    username: user.username,
    email: user.email,
    otp,
    createdAt: new Date().toISOString(),
  }

  await saveOtpRecord(otpKey, otpPayload)

  res.json({
    message: 'OTP generated and stored with expiry.',
    otp,
    expires_in: config.otpTtlSeconds,
  })
})

app.post('/api/auth/verify-otp/', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const { username, otp } = req.body || {}

  if (!username || !otp) {
    return res.status(400).json({ error: 'username and otp are required.' })
  }

  const user = await findUserByUsername(username)
  if (!user) {
    return res.status(404).json({ error: 'User not found.' })
  }

  const otpKey = `auth:otp:${user.id}`
  const otpRecord = await getOtpRecord(otpKey)
  if (!otpRecord || otpRecord.otp !== String(otp)) {
    return res.status(401).json({ error: 'Invalid or expired OTP.' })
  }

  await deleteOtpRecord(otpKey)

  const token = signToken(user)
  const decoded = requireAuthTokenPayload(token)
  await persistAuthSession(decoded, token)

  res.json({
    token,
    id: user.id,
    username: user.username,
    email: user.email,
    message: 'OTP verified and login session stored.',
  })
})

app.get('/api/sessions/', requireAuth, async (req, res) => {
  const sessions = await listSessionsByUser(req.user.sub)
  res.json(sessions)
})

app.get('/api/testcases/history/', requireAuth, async (req, res) => {
  const sessions = await listSessionsByUser(req.user.sub)
  res.json(sessions)
})

app.get('/api/gamification/user/:userId', requireAuth, async (req, res) => {
  if (String(req.user.sub) !== String(req.params.userId)) {
    return res.status(403).json({ error: 'You can only view your own gamification profile.' })
  }

  const profile = await getGamificationSummary(req.user.sub)
  res.json(profile)
})

app.get('/api/gamification/streak/:userId', requireAuth, async (req, res) => {
  if (String(req.user.sub) !== String(req.params.userId)) {
    return res.status(403).json({ error: 'You can only view your own streak.' })
  }

  const profile = await getGamificationSummary(req.user.sub)
  res.json({
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    calendar: profile.streakCalendar,
    lastDate: profile.lastGenerationDate,
  })
})

app.get('/api/gamification/stats/:userId', requireAuth, async (req, res) => {
  if (String(req.user.sub) !== String(req.params.userId)) {
    return res.status(403).json({ error: 'You can only view your own stats.' })
  }

  const stats = await getGamificationStats(req.user.sub)
  res.json(stats)
})

app.get('/api/challenges/daily', requireAuth, async (req, res) => {
  const challenges = await getChallengeSet(req.user.sub, 'daily')
  res.json(challenges)
})

app.get('/api/challenges/weekly', requireAuth, async (req, res) => {
  const challenges = await getChallengeSet(req.user.sub, 'weekly')
  res.json(challenges)
})

app.post('/api/challenges/:id/claim-reward', requireAuth, async (req, res) => {
  try {
    const result = await claimChallenge(req.user.sub, req.params.id)
    res.json(result)
  } catch (error) {
    res.status(400).json({ error: error.message || 'Challenge reward is not available.' })
  }
})

app.get('/api/leaderboards/global', requireAuth, async (req, res) => {
  const period = req.query.period === 'weekly' ? 'weekly' : 'global'
  const limit = Number.parseInt(String(req.query.limit || '20'), 10)
  const rows = await getLeaderboardView(period, Number.isNaN(limit) ? 20 : limit)
  res.json(rows)
})

app.get('/api/leaderboards/contributors', requireAuth, async (req, res) => {
  const limit = Number.parseInt(String(req.query.limit || '20'), 10)
  const rows = await getLeaderboardView('contributors', Number.isNaN(limit) ? 20 : limit)
  res.json(rows)
})

app.post('/api/contributions/upload', requireAuth, async (req, res) => {
  const { type, title, description, content, language, framework, difficulty, tags, category } =
    req.body || {}

  if (!type || !title || !content) {
    return res.status(400).json({ error: 'type, title, and content are required.' })
  }

  const result = await uploadContribution(req.user.sub, {
    type,
    title,
    description,
    content,
    language,
    framework,
    difficulty,
    tags,
    category,
  })

  res.status(201).json(result)
})

app.get('/api/contributions', requireAuth, async (_req, res) => {
  const feed = await getContributionFeed()
  res.json(feed)
})

app.get('/api/contributions/my-contributions/:userId', requireAuth, async (req, res) => {
  if (String(req.user.sub) !== String(req.params.userId)) {
    return res.status(403).json({ error: 'You can only view your own contributions.' })
  }

  const rows = await getMyContributions(req.user.sub)
  res.json(rows)
})

app.get('/api/contributions/:id', requireAuth, async (req, res) => {
  const detail = await getContributionDetail(req.params.id, req.user.sub)
  if (!detail) {
    return res.status(404).json({ error: 'Contribution not found.' })
  }

  res.json(detail)
})

app.post('/api/contributions/:id/rate', requireAuth, async (req, res) => {
  const { rating, comment } = req.body || {}
  if (!rating) {
    return res.status(400).json({ error: 'rating is required.' })
  }

  const result = await rateContribution(req.params.id, req.user.sub, Number(rating), comment)
  res.json(result)
})

app.post('/api/contributions/:id/download', requireAuth, async (req, res) => {
  const result = await registerContributionDownload(req.params.id)
  res.json(result)
})

app.post('/api/contributions/:id/fork', requireAuth, async (req, res) => {
  const { modifiedContent } = req.body || {}
  if (!modifiedContent) {
    return res.status(400).json({ error: 'modifiedContent is required.' })
  }

  const result = await forkContribution(req.params.id, req.user.sub, modifiedContent)
  res.status(201).json(result)
})

app.post('/api/generate/', requireAuth, async (req, res) => {
  const { input, type, mode, test_level: testLevel, provider = 'mock' } = req.body || {}

  if (!input || !type || !mode || !testLevel) {
    return res
      .status(400)
      .json({ error: 'input, type, mode, and test_level are required.' })
  }

  const cacheKey = `testgen:generate:${buildCacheKey({ input, type, mode, testLevel, provider })}`
  if (isRedisAvailable()) {
    const cached = await getRedisJson(cacheKey)
    if (cached) {
      return res.json(cached)
    }
  }

  try {
    const prompt = buildPrompt(String(input).trim(), type, mode, testLevel)
    const llmResponse = await callLlm(prompt, provider)
    const tests = parseOutput(llmResponse)
    const scores = scoreTests(tests, provider)

    const sessionResult = await createSession({
      userId: req.user.sub,
      username: req.user.username,
      email: req.user.email,
      inputType: type,
      testMode: mode,
      rawInput: String(input).trim(),
      provider,
      tests,
      scores,
    })

    const frameworks = Object.entries(tests)
      .filter(([, value]) => String(value || '').trim().length > 0)
      .map(([framework]) => framework)
    const testCount = Object.values(tests).reduce((total, content) => {
      return total + String(content || '').split('\n').filter((line) => line.trim()).length
    }, 0)

    const gamification = await awardXP(req.user.sub, `generate-${testLevel}-test`, {
      qualityScore: scores.overall,
      testLevel,
      frameworks,
      generationTimeMs: 800,
      testCount,
    })

    const payload = { id: sessionResult.id, tests, scores, gamification }
    if (isRedisAvailable()) {
      await setRedisJson(cacheKey, payload, 300)
    }
    res.json(payload)
  } catch (error) {
    if (error instanceof LLMClientError) {
      return res.status(502).json({ detail: error.message })
    }

    throw error
  }
})

app.post('/api/heal/', requireAuth, async (req, res) => {
  const { failing_test: failingTest, error_msg: errorMsg, provider = 'mock' } = req.body || {}

  if (!failingTest || !errorMsg) {
    return res.status(400).json({ error: 'failing_test and error_msg are required.' })
  }

  const fixed = await healTest(failingTest, errorMsg, provider)
  const gamification = await awardXP(req.user.sub, 'self-heal-test')
  res.json({ fixed_test: fixed, gamification })
})

app.post('/api/ci-export/', requireAuth, async (req, res) => {
  const { framework = 'pytest' } = req.body || {}
  const gamification = await awardXP(req.user.sub, 'export-to-cicd')
  res.json({ workflow_yaml: generateGithubWorkflow(framework), gamification })
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error.' })
})

export default app

function requireAuthTokenPayload(token) {
  const parts = token.split('.')
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'))
  return payload
}

async function persistAuthSession(decodedToken, token) {
  const sessionKey = `auth:session:${decodedToken.sid}`
  const existingSession = await getAuthSession(sessionKey)
  const payload = {
    ...(existingSession || {}),
    token,
    userId: decodedToken.sub,
    username: decodedToken.username,
    email: decodedToken.email,
    loginAt: new Date().toISOString(),
  }

  await saveAuthSession(sessionKey, payload)
}
