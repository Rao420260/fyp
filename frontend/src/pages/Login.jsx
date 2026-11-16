import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

// Demo ke liye ek click se email bhar do (sirf development me nazar aata hai)
const demoAccounts = [
  { label: 'Creator', email: 'creator@postflow.com' },
  { label: 'Manager', email: 'manager@postflow.com' },
  { label: 'Admin', email: 'admin@postflow.com' },
]

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, login } = useAuth()
  const submitted = useRef(false)
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Login se pehle jis page par jana chahte the, wahin wapas
  const goTo = location.state?.from?.pathname || '/dashboard'

  // Pehle se login ho to is page ki zaroorat nahi
  if (user && !submitted.current) return <Navigate to={goTo} replace />

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError('')
    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    submitted.current = true
    setLoading(true)
    try {
      const loggedIn = await login(form.email.trim(), form.password)
      toast.success(`Welcome back, ${loggedIn.name.split(' ')[0]}!`)
      navigate(goTo, { replace: true })
    } catch (err) {
      submitted.current = false
      setServerError(getErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to manage your posts."
      footer={
        <>
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-rejected"
          >
            {serverError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <div className="text-right">
          <a href="#" className="text-sm font-medium text-primary-600 hover:underline">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {import.meta.env.DEV && (
        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Demo accounts (development only)
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {demoAccounts.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={() => setForm({ email: a.email, password: 'Demo@1234' })}
                className="rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100"
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </AuthLayout>
  )
}