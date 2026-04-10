import { getDb } from './db.js'

export async function ensureSchema() {
  const db = getDb()

  // Create collections with validation and indexes
  try {
    // Users collection
    await db.createCollection('users', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['username', 'email', 'password_hash', 'created_at'],
          properties: {
            _id: { bsonType: 'objectId' },
            username: { bsonType: 'string' },
            username_normalized: { bsonType: 'string' },
            email: { bsonType: 'string' },
            email_normalized: { bsonType: 'string' },
            password_hash: { bsonType: 'string' },
            created_at: { bsonType: 'date' },
          },
        },
      },
    })
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }

  // Create indexes for users
  const usersCollection = db.collection('users')
  await usersCollection.createIndex({ username: 1 }, { unique: true })
  await usersCollection.createIndex({ email: 1 }, { unique: true })
  await usersCollection.createIndex({ username_normalized: 1 }, { unique: true, sparse: true })
  await usersCollection.createIndex({ email_normalized: 1 }, { unique: true, sparse: true })

  // TestGen Sessions collection
  try {
    await db.createCollection('testgen_sessions')
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }
  const sessionsCollection = db.collection('testgen_sessions')
  await sessionsCollection.createIndex({ user_id: 1, created_at: -1 })
  await sessionsCollection.createIndex({ generated_by_username: 1, created_at: -1 })

  // User Gamification collection
  try {
    await db.createCollection('user_gamification')
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }
  const gamificationCollection = db.collection('user_gamification')
  await gamificationCollection.createIndex({ user_id: 1 }, { unique: true })

  // User Challenges collection
  try {
    await db.createCollection('user_challenges')
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }
  const challengesCollection = db.collection('user_challenges')
  await challengesCollection.createIndex({ user_id: 1, challenge_id: 1 }, { unique: true })
  await challengesCollection.createIndex({ user_id: 1 })

  // Contributions collection
  try {
    await db.createCollection('contributions')
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }
  const contributionsCollection = db.collection('contributions')
  await contributionsCollection.createIndex({ contributor_id: 1 })
  await contributionsCollection.createIndex({ created_at: -1 })
  await contributionsCollection.createIndex({ trending: 1, created_at: -1 })

  // Contribution Ratings collection
  try {
    await db.createCollection('contribution_ratings')
  } catch (error) {
    if (error.codeName !== 'NamespaceExists') throw error
  }
  const ratingsCollection = db.collection('contribution_ratings')
  await ratingsCollection.createIndex({ contribution_id: 1, user_id: 1 }, { unique: true })
  await ratingsCollection.createIndex({ contribution_id: 1 })

  console.log('MongoDB schema initialized')
}
