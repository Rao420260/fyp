import { Link } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-primary-50 to-white px-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
        <Compass size={32} />
      </span>

      <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-primary-600">
        Error 404
      </p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-md text-gray-500">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
      >
        <ArrowLeft size={18} />
        Back to home
      </Link>
    </div>
  )
}