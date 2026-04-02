let otpRecords = new Map()
let authSessions = new Map()

export async function saveOtpRecord(key, value) {
  otpRecords.set(key, value)
}

export async function getOtpRecord(key) {
  return otpRecords.get(key) || null
}

export async function deleteOtpRecord(key) {
  otpRecords.delete(key)
}

export async function saveAuthSession(key, value) {
  authSessions.set(key, value)
}

export async function getAuthSession(key) {
  return authSessions.get(key) || null
}
