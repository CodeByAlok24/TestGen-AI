import { verifyToken } from './utils.js'
import { getAuthSession } from './authRuntimeStore.js'

const rateLimitBuckets = new Map()

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
  res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self' http://localhost:8000 http://localhost:5173; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
  )

  next()
}

export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  return function applyRateLimit(req, res, next) {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const current = rateLimitBuckets.get(key)

    if (!current || now > current.resetAt) {
      rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    if (current.count >= max) {
      return res.status(429).json({ error: 'Too many requests. Please try again shortly.' })
    }

    current.count += 1
    next()
  }
}

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return res.status(401).json({ error: 'Authentication token is required.' })
  }

  try {
    req.user = verifyToken(token)

    const sessionKey = `auth:session:${req.user.sid}`
    const session = await getAuthSession(sessionKey)

    if (!session || session.token !== token) {
      return res.status(401).json({
        error: 'Session expired or not found.',
      })
    }

    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
