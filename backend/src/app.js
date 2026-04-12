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

// ✅ FIXED CORS (FINAL WORKING)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://test-gen-ai-gamma.vercel.app'
]

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.options('*', cors()) // ✅ important for preflight

// ================= MIDDLEWARE =================
app.use(securityHeaders)
app.use(express.json({ limit: '2mb' }))

// ================= ROOT =================
app.get('/', (req, res) => {
  res.send('API is running 🚀')
})

// ================= HEALTH =================
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    mongodb: isMongoConnected() ? 'connected' : 'disconnected',
    cache: isRedisAvailable() ? 'connected' : 'disabled',
  })
})

// ================= AUTH =================

app.post('/api/auth/signup/', rateLimit({ windowMs: 60_000, max: 10 }), async (req, res) => {
  const { username, email, password } = req.body || {}

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email, and password are required.' })
  }

  const existing = await findUserByUsernameOrEmail(username, email)
  if (existing) {
    return res.status(409).json({ error: 'User already exists.' })
  }

  const user = await createUser({ username, email, password })
  const token = signToken(user)

  return res.status(201).json({ token, ...user })
})

app.post('/api/auth/login/', rateLimit({ windowMs: 60_000, max: 15 }), async (req, res) => {
  const { username, password } = req.body || {}

  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required.' })
  }

  const user = await validateUser(username, password)
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  const token = signToken(user)
  return res.json({ token, ...user })
})

// ================= MAIN APIs =================

app.post('/api/generate/', requireAuth, async (req, res) => {
  const { input } = req.body
  if (!input) return res.status(400).json({ error: 'input required' })

  const prompt = buildPrompt(input)
  const response = await callLlm(prompt)

  const tests = parseOutput(response)
  const scores = scoreTests(tests)

  res.json({ tests, scores })
})

app.post('/api/heal/', requireAuth, async (req, res) => {
  const { failing_test, error_msg } = req.body
  const fixed = await healTest(failing_test, error_msg)
  res.json({ fixed_test: fixed })
})

app.post('/api/ci-export/', requireAuth, async (req, res) => {
  const { framework } = req.body
  res.json({ workflow_yaml: generateGithubWorkflow(framework) })
})

// ================= ERROR HANDLER =================

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ error: 'Internal server error.' })
})

export default app
