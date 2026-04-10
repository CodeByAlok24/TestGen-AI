import { config } from './config.js'
import { deleteRedisKey, getRedisJson, isRedisAvailable, setRedisJson } from './redis.js'

let otpRecords = new Map()
let authSessions = new Map()

function withExpiry(value, ttlSeconds) {
  return {
    ...value,
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  }
}

function isExpired(record) {
  if (!record?.expiresAt) return false
  return Date.now() >= new Date(record.expiresAt).getTime()
}

export async function saveOtpRecord(key, value, ttlSeconds = config.otpTtlSeconds) {
  if (isRedisAvailable()) {
    await setRedisJson(key, value, ttlSeconds)
    return
  }

  otpRecords.set(key, withExpiry(value, ttlSeconds))
}

export async function getOtpRecord(key) {
  if (isRedisAvailable()) {
    return getRedisJson(key)
  }

  const value = otpRecords.get(key) || null
  if (isExpired(value)) {
    otpRecords.delete(key)
    return null
  }

  return value
}

export async function deleteOtpRecord(key) {
  if (isRedisAvailable()) {
    await deleteRedisKey(key)
    return
  }

  otpRecords.delete(key)
}

export async function saveAuthSession(key, value, ttlSeconds = config.authSessionTtlSeconds) {
  if (isRedisAvailable()) {
    await setRedisJson(key, value, ttlSeconds)
    return
  }

  authSessions.set(key, withExpiry(value, ttlSeconds))
}

export async function getAuthSession(key) {
  if (isRedisAvailable()) {
    return getRedisJson(key)
  }

  const value = authSessions.get(key) || null
  if (isExpired(value)) {
    authSessions.delete(key)
    return null
  }

  return value
}
