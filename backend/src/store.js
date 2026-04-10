import { getDb, ObjectId } from './db.js'
import { comparePassword, hashPassword, normalizeEmail, normalizeUsername } from './utils.js'

let users = []
let sessions = []
let userIdCounter = 1
let sessionIdCounter = 1
let databaseEnabled = true

export function isDatabaseEnabled() {
  return databaseEnabled
}

export async function findUserByUsername(username) {
  const db = getDb()
  const usersCollection = db.collection('users')

  const normalizedUsername = normalizeUsername(username)
  const user = await usersCollection.findOne({
    $or: [{ username_normalized: normalizedUsername }, { username }],
  })
  if (user) {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      password_hash: user.password_hash,
    }
  }
  return null
}

export async function findUserByUsernameOrEmail(username, email) {
  const db = getDb()
  const usersCollection = db.collection('users')

  const normalizedUsername = normalizeUsername(username)
  const normalizedEmail = normalizeEmail(email)
  const user = await usersCollection.findOne({
    $or: [
      { username_normalized: normalizedUsername },
      { email_normalized: normalizedEmail },
      { username },
      { email },
    ],
  })
  if (user) {
    return {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
    }
  }
  return null
}

export async function createUser({ username, email, password }) {
  const passwordHash = await hashPassword(password)
  const db = getDb()
  const usersCollection = db.collection('users')
  const trimmedUsername = String(username).trim()
  const trimmedEmail = String(email).trim()

  const result = await usersCollection.insertOne({
    username: trimmedUsername,
    username_normalized: normalizeUsername(trimmedUsername),
    email: trimmedEmail,
    email_normalized: normalizeEmail(trimmedEmail),
    password_hash: passwordHash,
    created_at: new Date(),
  })

  return {
    id: result.insertedId.toString(),
    username: trimmedUsername,
    email: trimmedEmail,
  }
}

export async function validateUser(username, password) {
  const user = await findUserByUsername(username)
  if (!user) return null

  const matches = await comparePassword(password, user.password_hash)
  if (!matches) return null

  return { id: user.id, username: user.username, email: user.email }
}

export async function createSession(session) {
  const db = getDb()
  const sessionsCollection = db.collection('testgen_sessions')

  const result = await sessionsCollection.insertOne({
    user_id: session.userId,
    input_type: session.inputType,
    test_mode: session.testMode,
    raw_input: session.rawInput,
    provider: session.provider,
    generated_pytest: session.tests.pytest,
    generated_junit: session.tests.junit,
    generated_jest: session.tests.jest,
    generated_by_username: session.username,
    generated_by_email: session.email,
    scores: session.scores,
    quality_score: session.scores.overall,
    created_at: new Date(),
  })

  return { id: result.insertedId.toString() }
}

export async function listSessionsByUser(userId) {
  const db = getDb()
  const sessionsCollection = db.collection('testgen_sessions')

  const sessions = await sessionsCollection
    .find({ user_id: userId })
    .sort({ created_at: -1 })
    .limit(20)
    .toArray()

  return sessions.map((session) => ({
    id: session._id.toString(),
    input_type: session.input_type,
    test_mode: session.test_mode,
    raw_input: session.raw_input,
    provider: session.provider,
    generated_pytest: session.generated_pytest,
    generated_junit: session.generated_junit,
    generated_jest: session.generated_jest,
    generated_by: {
      username: session.generated_by_username || 'unknown',
      email: session.generated_by_email || '',
    },
    quality_score: session.quality_score,
    scores: session.scores,
    created_at: session.created_at,
  }))
}
