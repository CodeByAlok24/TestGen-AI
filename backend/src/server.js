import app from './app.js'
import { config } from './config.js'
import { pool } from './db.js'
import { connectRedis } from './redis.js'
import { ensureSchema } from './schema.js'
import { configureStore } from './store.js'

async function start() {
  let databaseAvailable = false

  try {
    await pool.query('SELECT 1')
    await ensureSchema()
    databaseAvailable = true
  } catch (error) {
    console.warn(`PostgreSQL unavailable, continuing with in-memory store: ${error.message}`)
  }

  configureStore({ databaseAvailable, query: pool.query.bind(pool) })
  await connectRedis()

  app.listen(config.port, () => {
    console.log(`Backend listening on port ${config.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start backend:', error)
  process.exit(1)
})
