import { Link } from 'react-router-dom'
import { CalendarClock } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          {/* Logo aur chhota text */}
          <div className="max-w-xs">
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <CalendarClock size={20} />
              </span>
              <span className="text-xl font-bold text-gray-900">PostFlow</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500">
              Plan, approve and publish your social media posts from one place.
            </p>
          </div>

          {/* Links ke columns */}
          <div className="flex gap-16 text-sm">
            <div>
              <p className="font-semibold text-gray-900">Product</p>
              <ul className="mt-4 space-y-3 text-gray-500">
                <li><a href="#features" className="transition hover:text-primary-600">Features</a></li>
                <li><a href="#how-it-works" className="transition hover:text-primary-600">How it works</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Account</p>
              <ul className="mt-4 space-y-3 text-gray-500">
                <li><Link to="/login" className="transition hover:text-primary-600">Login</Link></li>
                <li><Link to="/signup" className="transition hover:text-primary-600">Sign up</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sab se neeche ki line */}
        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          © 2026 PostFlow. Final Year Project, BSCS.
        </div>
      </div>
    </footer>
  )
}