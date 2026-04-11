import axios from 'axios'

const TOKEN_KEY = 'testgen_token'

// ✅ Clean base URL setup
const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ✅ Attach token automatically
API.interceptors.request.use((request) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

// ✅ Handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('testgen_user')
    }
    return Promise.reject(error)
  }
)

// ✅ Save token
function persistAuth(data) {
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }
  return data
}

// ✅ Clear token
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
}

// ================= AUTH =================

export async function signup(payload) {
  const { data } = await API.post('/auth/signup/', payload)
  return persistAuth(data)
}

export async function login(payload) {
  const { data } = await API.post('/auth/login/', payload)
  return persistAuth(data)
}

export async function requestOtp(payload) {
  const { data } = await API.post('/auth/request-otp/', payload)
  return data
}

export async function verifyOtp(payload) {
  const { data } = await API.post('/auth/verify-otp/', payload)
  return persistAuth(data)
}

// ================= CORE FEATURES =================

export async function generateTests(payload) {
  const { data } = await API.post('/generate/', payload)
  return data
}

export async function healFailingTest(payload) {
  const { data } = await API.post('/heal/', payload)
  return data
}

export async function exportCiWorkflow(payload) {
  const { data } = await API.post('/ci-export/', payload)
  return data
}

// ================= USER DATA =================

export async function getTestCaseHistory() {
  const { data } = await API.get('/testcases/history/')
  return data
}

export async function getGamificationProfile(userId) {
  const { data } = await API.get(`/gamification/user/${userId}`)
  return data
}

export async function getGamificationStats(userId) {
  const { data } = await API.get(`/gamification/stats/${userId}`)
  return data
}

// ================= CHALLENGES =================

export async function getDailyChallenges() {
  const { data } = await API.get('/challenges/daily')
  return data
}

export async function getWeeklyChallenges() {
  const { data } = await API.get('/challenges/weekly')
  return data
}

export async function claimChallengeReward(challengeId) {
  const { data } = await API.post(`/challenges/${challengeId}/claim-reward`)
  return data
}

// ================= LEADERBOARD =================

export async function getGlobalLeaderboard(limit = 10, period = 'global') {
  const { data } = await API.get('/leaderboards/global', {
    params: { limit, period },
  })
  return data
}
