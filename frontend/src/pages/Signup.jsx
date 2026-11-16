import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import AuthLayout from '../layouts/AuthLayout'
import Input from '../components/Input'
import { useAuth } from '../context/AuthContext'
import { getErrorMessage } from '../services/api'

export default function Signup() {
  const navigate = useNavigate()
  const { user, signup } = useAuth()
  const submitted = useRef(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'creator',
  })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  // Pehle se login ho to is page ki zaroorat nahi
  if (user && !submitted.current) return <Navigate to="/dashboard" replace />

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Full name is required'
    if (!form.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Enter a valid email'
    if (!form.password) newErrors.password = 'Password is required'
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
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
      await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      })
      toast.success('Account created successfully!')
      navigate('/connect', { replace: true })
    } catch (err) {
      submitted.current = false
      setLoading(false)
      const message = getErrorMessage(err)
      // Email pehle se maujood ho to usi box ke neeche dikhao
      if (err.response?.status === 409) setErrors({ email: message })
      else setServerError(message)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start scheduling your posts in minutes."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary-600 hover:underline">
            Login
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
          label="Full name"
          name="name"
          placeholder="Fatima Maryam"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />

        {/* Role dropdown: value wohi jo backend samajhta hai (creator ya manager) */}
        <div>
          <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-gray-700">
            I am a
          </label>
          <select
            id="role"
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="creator">Content Creator</option>
            <option value="manager">Approver / Manager</option>
          </select>
        </div>

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />

        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  )
}