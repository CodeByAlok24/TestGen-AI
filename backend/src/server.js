import app from './app.js'
import { config } from './config.js'
import { connectMongo } from './db.js'
import { initializeCache } from './redis.js'
import { ensureSchema } from './schema.js'

async function start() {
  try {
    // Connect to MongoDB
    await connectMongo()
    console.log('Connected to MongoDB')
    
    // Initialize schema and indexes
    await ensureSchema()
    
    // Initialize cache layer
    await initializeCache()
    
    // Start the server
    app.listen(config.port, () => {
      console.log(`Backend listening on port ${config.port}`)
    })
  } catch (error) {
    console.error('Failed to start backend:', error)
    process.exit(1)
  }
}

start()
