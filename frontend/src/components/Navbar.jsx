
import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, loading } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
            <CalendarClock size={20} />
          </span>
          <span className="text-xl font-bold text-gray-900">PostFlow</span>
        </Link>

        <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
          <a href="#features" className="transition hover:text-primary-600">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-primary-600">
            How it works
          </a>
        </div>

        <div className="flex items-center gap-3">
          {!loading &&
            (user ? (
              <Link
                to="/dashboard"
                className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                >
                  Get Started
                </Link>
              </>
            ))}
        </div>
      </nav>
    </header>
  )
}
