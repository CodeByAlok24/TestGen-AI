import axios from 'axios'

const TOKEN_KEY = 'testgen_token'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

API.interceptors.request.use((request) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }

  return request
})

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('testgen_user')
    }
    return Promise.reject(error)
  },
)

function persistAuth(data) {
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }

  return data
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
}

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

export async function getGlobalLeaderboard(limit = 10, period = 'global') {
  const { data } = await API.get('/leaderboards/global', {
    params: { limit, period },
  })
  return data
}
