import axios from 'axios'

export const TOKEN_KEY = 'postflow_token'
export const SESSION_EXPIRED_EVENT = 'postflow:session-expired'

// In rasto par token nahi bheja jata (login ke waqt token hota hi nahi)
const PUBLIC_PATHS = ['/auth/login', '/auth/signup']

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`,
  timeout: 15000,
})

// Har request se pehle: token ho to "Authorization" me laga do
api.interceptors.request.use((config) => {
  let token = null
  try {
    token = localStorage.getItem(TOKEN_KEY)
  } catch {
    // storage band ho to koi masla nahi
  }
  if (token && !PUBLIC_PATHS.includes(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Har jawab ke baad: server ne "401" kaha (token galat ya expire) to user ko bahar karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const sentToken = Boolean(error.config?.headers?.Authorization)
    if (error.response?.status === 401 && sentToken) {
      try {
        localStorage.removeItem(TOKEN_KEY)
      } catch {
        // koi masla nahi
      }
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    return Promise.reject(error)
  }
)

// Server ka message, ya server na mile to saaf sa message
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.'
  return 'Cannot reach the server. Is the backend running?'
}

export default api