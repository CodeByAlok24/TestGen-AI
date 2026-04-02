import { comparePassword, hashPassword } from './utils.js'

let users = []
let sessions = []
let userIdCounter = 1
let sessionIdCounter = 1
let databaseEnabled = false
let queryImpl = null

export function configureStore({ databaseAvailable, query }) {
  databaseEnabled = databaseAvailable
  queryImpl = query
}

export function isDatabaseEnabled() {
  return databaseEnabled
}

export async function findUserByUsername(username) {
  if (databaseEnabled) {
    const result = await queryImpl(
      'SELECT id, username, email, password_hash FROM users WHERE username = $1 LIMIT 1',
      [username],
    )
    return result.rows[0] || null
  }

  return users.find((user) => user.username === username) || null
}

export async function findUserByUsernameOrEmail(username, email) {
  if (databaseEnabled) {
    const result = await queryImpl(
      'SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1',
      [username, email],
    )
    return result.rows[0] || null
  }

  return users.find((user) => user.username === username || user.email === email) || null
}

export async function createUser({ username, email, password }) {
  const passwordHash = await hashPassword(password)

  if (databaseEnabled) {
    const result = await queryImpl(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, passwordHash],
    )
    return result.rows[0]
  }

  const user = {
    id: userIdCounter++,
    username,
    email,
    password_hash: passwordHash,
  }
  users.push(user)
  return { id: user.id, username: user.username, email: user.email }
}

export async function validateUser(username, password) {
  const user = await findUserByUsername(username)
  if (!user) return null

  const matches = await comparePassword(password, user.password_hash)
  if (!matches) return null

  return { id: user.id, username: user.username, email: user.email }
}

export async function createSession(session) {
  if (databaseEnabled) {
    const result = await queryImpl(
      `INSERT INTO testgen_sessions
       (user_id, input_type, test_mode, raw_input, provider, generated_pytest, generated_junit, generated_jest, scores, quality_score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
       RETURNING id`,
      [
        session.userId,
        session.inputType,
        session.testMode,
        session.rawInput,
        session.provider,
        session.tests.pytest,
        session.tests.junit,
        session.tests.jest,
        JSON.stringify(session.scores),
        session.scores.overall,
      ],
    )
    return { id: result.rows[0].id }
  }

  const record = {
    id: sessionIdCounter++,
    user_id: session.userId,
    input_type: session.inputType,
    test_mode: session.testMode,
    raw_input: session.rawInput,
    provider: session.provider,
    generated_pytest: session.tests.pytest,
    generated_junit: session.tests.junit,
    generated_jest: session.tests.jest,
    scores: session.scores,
    quality_score: session.scores.overall,
    created_at: new Date().toISOString(),
  }
  sessions.unshift(record)
  return { id: record.id }
}

export async function listSessionsByUser(userId) {
  if (databaseEnabled) {
    const result = await queryImpl(
      `SELECT id, input_type, test_mode, provider, quality_score, scores, created_at
       FROM testgen_sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId],
    )
    return result.rows
  }

  return sessions
    .filter((session) => String(session.user_id) === String(userId))
    .slice(0, 20)
    .map(({ id, input_type, test_mode, provider, quality_score, scores, created_at }) => ({
      id,
      input_type,
      test_mode,
      provider,
      quality_score,
      scores,
      created_at,
    }))
}
