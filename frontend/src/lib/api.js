import axios from 'axios'

const TOKEN_KEY = 'testgen_token'

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 🔐 Attach token
API.interceptors.request.use((request) => {
  const token = localStorage.getItem(TOKEN_KEY)

  console.log("TOKEN:", token) // ✅ DEBUG

  if (token) {
    request.headers.Authorization = `Bearer ${token}`
  }

  return request
})

// ⚠️ Handle 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      console.error("401 ERROR - Unauthorized")

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('testgen_user')
    }
    return Promise.reject(error)
  }
)

// ✅ Save token
function persistAuth(data) {
  console.log("LOGIN RESPONSE:", data) // ✅ DEBUG

  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token)
  }
  return data
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY)
}

// ================= AUTH =================

export async function signup(payload) {
  const { data } = await API.post('/auth/signup', payload)
  return persistAuth(data)
}

export async function login(payload) {
  const { data } = await API.post('/auth/login', payload)
  return persistAuth(data)
}

export async function requestOtp(payload) {
  const { data } = await API.post('/auth/request-otp', payload)
  return data
}

export async function verifyOtp(payload) {
  const { data } = await API.post('/auth/verify-otp', payload)
  return persistAuth(data)
}

// ================= CORE =================

export async function generateTests(payload) {
  const { data } = await API.post('/generate', payload)
  return data
}

export async function healFailingTest(payload) {
  const { data } = await API.post('/heal', payload)
  return data
}

export async function exportCiWorkflow(payload) {
  const { data } = await API.post('/ci-export', payload)
  return data
}
