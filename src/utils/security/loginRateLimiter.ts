type AttemptRecord = {
  attempts: number
  windowStart: number
  blockedUntil?: number
}

const WINDOW_MS = 5 * 60 * 1000 // 5 minutes
const MAX_ATTEMPTS = 5
const BLOCK_DURATION_MS = 10 * 60 * 1000 // 10 minutes

declare global {
  var __loginRateLimitStore: Map<string, AttemptRecord> | undefined
}

const attemptStore =
  globalThis.__loginRateLimitStore ?? new Map<string, AttemptRecord>()

globalThis.__loginRateLimitStore = attemptStore

export function checkLoginRateLimit(identifier: string) {
  const now = Date.now()
  const record = attemptStore.get(identifier)

  if (record?.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    }
  }

  if (!record || record.windowStart + WINDOW_MS < now) {
    attemptStore.set(identifier, { attempts: 0, windowStart: now })
    return { allowed: true }
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const blockedUntil = now + BLOCK_DURATION_MS
    attemptStore.set(identifier, { ...record, blockedUntil })
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((blockedUntil - now) / 1000),
    }
  }

  return { allowed: true }
}

export function recordFailedLoginAttempt(identifier: string) {
  const now = Date.now()
  const record = attemptStore.get(identifier)

  if (!record || record.windowStart + WINDOW_MS < now) {
    attemptStore.set(identifier, { attempts: 1, windowStart: now })
    return
  }

  const attempts = record.attempts + 1
  const blockedUntil =
    attempts >= MAX_ATTEMPTS ? now + BLOCK_DURATION_MS : record.blockedUntil

  attemptStore.set(identifier, {
    attempts,
    windowStart: record.windowStart,
    blockedUntil,
  })
}

export function resetLoginAttempts(identifier: string) {
  attemptStore.delete(identifier)
}

