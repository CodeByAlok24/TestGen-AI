import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from './config.js'

export async function hashPassword(password) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function signToken(user) {
  const sessionId = crypto.randomUUID()
  return jwt.sign(
    { sub: user.id, username: user.username, email: user.email, sid: sessionId },
    config.jwtSecret,
    { expiresIn: '7d' },
  )
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret)
}

export function buildCacheKey(payload) {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 1000000))
}

export function normalizeUsername(value) {
  return String(value || '').trim().toLowerCase()
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}
