import { createClient } from 'redis'
import { config } from './config.js'

export const redis = createClient({
  url: config.redisUrl,
  socket: {
    connectTimeout: 1500,
    reconnectStrategy: false,
  },
})

let redisAvailable = false
let redisErrorLogged = false

redis.on('error', (error) => {
  if (!redisErrorLogged) {
    console.warn(`Redis disabled for this run: ${error?.message || 'Unknown Redis error'}`)
    redisErrorLogged = true
  }
})

export async function connectRedis() {
  if (!config.redisEnabled) {
    redisAvailable = false
    console.log('Redis disabled by configuration.')
    return
  }

  if (!redis.isOpen) {
    try {
      await redis.connect()
      redisAvailable = true
    } catch (error) {
      redisAvailable = false
      if (!redisErrorLogged) {
        console.warn(`Redis unavailable, continuing without cache: ${error?.message || 'Unknown Redis error'}`)
        redisErrorLogged = true
      }
    }
  }
}

export function isRedisAvailable() {
  return redisAvailable && redis.isOpen
}

export async function setRedisJson(key, value, ttlSeconds) {
  if (!isRedisAvailable()) return false

  await redis.set(key, JSON.stringify(value), ttlSeconds ? { EX: ttlSeconds } : undefined)
  return true
}

export async function getRedisJson(key) {
  if (!isRedisAvailable()) return null

  const raw = await redis.get(key)
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export async function deleteRedisKey(key) {
  if (!isRedisAvailable()) return false
  await redis.del(key)
  return true
}
