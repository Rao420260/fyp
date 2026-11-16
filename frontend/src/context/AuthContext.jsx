import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import api, { TOKEN_KEY, SESSION_EXPIRED_EVENT } from '../services/api'

const AuthContext = createContext(null)

export const roleLabels = {
  creator: 'Content Creator',
  manager: 'Approver / Manager',
  admin: 'Admin',
}

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // storage band ho to login sirf is tab tak chalega
  }
}

function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // koi masla nahi
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Token mila hai to pehle server se poochna hai "main kaun hoon?", tab tak loading
  const [loading, setLoading] = useState(() => Boolean(readToken()))

  // Page khulte hi: purana token ho to check karo ke abhi bhi sahi hai
  useEffect(() => {
    if (!readToken()) return
    let cancelled = false
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled) setUser(res.data.user)
      })
      .catch(() => {
        // 401 ho to token api.js khud hata deta hai. Server band ho to token rehne dete hain
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Token expire ho jaye to login page par wapas
  useEffect(() => {
    const onExpired = () => {
      setUser(null)
      toast.error('Your session has expired. Please log in again.')
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (details) => {
    const { data } = await api.post('/auth/signup', details)
    saveToken(data.token)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, role: user?.role ?? null, loading, login, signup, logout }),
    [user, loading, login, signup, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}