import { MongoClient, ObjectId } from 'mongodb'
import { config } from './config.js'

let mongoClient = null
let db = null

export async function connectMongo() {
  if (mongoClient) return db

  mongoClient = new MongoClient(config.mongoUrl)
  await mongoClient.connect()
  db = mongoClient.db(config.mongoDb)
  
  console.log('Connected to MongoDB')
  return db
}

export function isMongoConnected() {
  return db !== null
}

export function getDb() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongo() first.')
  }
  return db
}

export async function disconnectMongo() {
  if (mongoClient) {
    await mongoClient.close()
    mongoClient = null
    db = null
  }
}

// Helper to convert MongoDB ObjectId to number-like ID for compatibility
export function generateId() {
  return new ObjectId().toString()
}

export { ObjectId }
