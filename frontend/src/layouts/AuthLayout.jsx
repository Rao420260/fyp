import { Link } from 'react-router-dom'
import { CalendarClock, CheckCircle2 } from 'lucide-react'

const points = [
  'Create and schedule posts in minutes',
  'Approval workflow for your team',
  'AI assistant for ideas and captions',
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side: sirf bari screen par nazar aati hai */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-linear-to-br from-primary-600 to-primary-700 p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
            <CalendarClock size={20} />
          </span>
          <span className="text-xl font-bold">PostFlow</span>
        </Link>

        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Plan. Approve. <br /> Publish.
          </h2>
          <p className="mt-4 max-w-sm text-primary-100">
            Manage all your social media posts from one simple dashboard.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-center gap-3 text-primary-50">
                <CheckCircle2 size={20} className="shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-100">© 2026 PostFlow</p>

        {/* Sajawat ke liye halke gol shapes */}
        <span className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
        <span className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-white/10" />
      </div>

      {/* Right side: form */}
      <div className="flex items-center justify-center bg-white px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile par logo yahan dikhta hai */}
          <Link to="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <CalendarClock size={20} />
            </span>
            <span className="text-xl font-bold text-gray-900">PostFlow</span>
          </Link>

          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="mt-2 text-gray-500">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <p className="mt-8 text-center text-sm text-gray-500">{footer}</p>
        </div>
      </div>
    </div>
  )
}