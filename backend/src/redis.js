import { getDb } from './db.js'

// MongoDB cache collection for Redis-like operations
const CACHE_COLLECTION = 'cache'
let cacheReady = false

export async function initializeCache() {
  try {
    const db = getDb()
    const collection = db.collection(CACHE_COLLECTION)
    
    // Create TTL index for automatic expiration
    await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
    
    cacheReady = true
    console.log('Cache collection initialized')
  } catch (error) {
    console.warn(`Cache initialization failed: ${error?.message || 'Unknown error'}`)
  }
}

export function isRedisAvailable() {
  return cacheReady
}

export async function setRedisJson(key, value, ttlSeconds) {
  if (!cacheReady) return false

  try {
    const db = getDb()
    const collection = db.collection(CACHE_COLLECTION)
    
    const expiresAt = ttlSeconds 
      ? new Date(Date.now() + ttlSeconds * 1000)
      : new Date(Date.now() + 366 * 24 * 60 * 60 * 1000) // default 1 year
    
    await collection.updateOne(
      { _id: key },
      {
        $set: {
          _id: key,
          value: value,
          expiresAt: expiresAt,
        },
      },
      { upsert: true }
    )
    return true
  } catch (error) {
    console.warn(`Cache set error: ${error?.message || 'Unknown error'}`)
    return false
  }
}

export async function getRedisJson(key) {
  if (!cacheReady) return null

  try {
    const db = getDb()
    const collection = db.collection(CACHE_COLLECTION)
    
    const doc = await collection.findOne({ _id: key })
    return doc?.value || null
  } catch (error) {
    console.warn(`Cache get error: ${error?.message || 'Unknown error'}`)
    return null
  }
}

export async function deleteRedisKey(key) {
  if (!cacheReady) return false

  try {
    const db = getDb()
    const collection = db.collection(CACHE_COLLECTION)
    
    const result = await collection.deleteOne({ _id: key })
    return result.deletedCount > 0
  } catch (error) {
    console.warn(`Cache delete error: ${error?.message || 'Unknown error'}`)
    return false
  }
}
