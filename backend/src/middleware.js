import { verifyToken } from './utils.js'
import { getRedisJson, isRedisAvailable } from './redis.js'
import { getAuthSession } from './authRuntimeStore.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' })
  }

  try {
    req.user = verifyToken(token)

    // In local fallback mode, allow a valid JWT even if the in-memory
    // session store was cleared by a backend restart.
    if (isRedisAvailable()) {
      const sessionKey = `auth:session:${req.user.sid}`
      const session = await getRedisJson(sessionKey)

      if (!session || session.token !== token) {
        return res.status(401).json({
          error: 'Session expired or not found in Redis.',
        })
      }
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
