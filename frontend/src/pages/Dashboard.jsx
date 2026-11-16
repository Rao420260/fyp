import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Clock,
  CalendarCheck,
  Send,
  ArrowRight,
  CheckSquare,
  PlusSquare,
  Users,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api, { getErrorMessage } from '../services/api'
import StatusBadge from '../components/StatusBadge'

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1)

// Server UTC waqt bhejta hai, browser use aap ke apne waqt me badal deta hai
function formatDate(value) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function lastSevenDays(posts) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return {
      key: d.toDateString(),
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      count: 0,
    }
  })
  for (const post of posts) {
    const day = days.find((d) => d.key === new Date(post.created_at).toDateString())
    if (day) day.count += 1
  }
  return days
}

export default function Dashboard() {
  const { role, user } = useAuth()
  const [posts, setPosts] = useState([])
  const [state, setState] = useState('loading') // loading | ready | error
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  // Asli posts server se
  useEffect(() => {
    let cancelled = false
    setState('loading')
    api
      .get('/posts')
      .then((res) => {
        if (cancelled) return
        setPosts(res.data.posts)
        setState('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setError(getErrorMessage(err))
        setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [attempt])

  const count = (status) => posts.filter((p) => p.status === status).length
  const pending = count('pending')

  const stats = [
    { label: 'Total posts', value: posts.length, icon: FileText, color: 'text-primary-600 bg-primary-50' },
    { label: 'Pending approval', value: pending, icon: Clock, color: 'text-pending bg-amber-50' },
    { label: 'Scheduled', value: count('scheduled'), icon: CalendarCheck, color: 'text-scheduled bg-violet-50' },
    { label: 'Published', value: count('published'), icon: Send, color: 'text-published bg-emerald-50' },
  ]

  const banners = {
    creator: {
      icon: PlusSquare,
      title: 'Ready to create your next post?',
      text: 'Write a post, upload an image and send it for approval.',
      button: 'Create post',
      to: '/posts/new',
    },
    manager: {
      icon: CheckSquare,
      title:
        pending === 0
          ? 'No posts are waiting for your approval'
          : `${pending} ${pending === 1 ? 'post is' : 'posts are'} waiting for your approval`,
      text: 'Review them, approve or reject, and pick the publish time.',
      button: 'Review now',
      to: '/approvals',
    },
    admin: {
      icon: Users,
      title: 'Manage your team',
      text: 'Add users, assign roles and keep your workspace organized.',
      button: 'Manage users',
      to: '/users',
    },
  }
  const banner = banners[role]

  const week = useMemo(() => lastSevenDays(posts), [posts])
  const maxDay = Math.max(1, ...week.map((d) => d.count))
  const weekTotal = week.reduce((sum, d) => sum + d.count, 0)

  const upcoming = posts
    .filter((p) => p.status === 'scheduled' && p.scheduled_at)
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
    .slice(0, 4)
  const recent = posts.slice(0, 5)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Welcome back, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="mt-1 text-gray-500">Here is what is happening with your posts today.</p>
      </div>

      {state === 'error' && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-rejected"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </span>
          <button
            onClick={() => setAttempt((n) => n + 1)}
            className="rounded-lg border border-red-200 bg-white px-3 py-1.5 font-semibold text-rejected hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      )}

      {/* Role banner */}
      <div className="flex flex-col gap-4 rounded-2xl bg-linear-to-br from-primary-600 to-primary-700 p-6 text-white sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
            <banner.icon size={24} />
          </span>
          <div>
            <h2 className="text-lg font-semibold">{banner.title}</h2>
            <p className="mt-1 text-sm text-primary-100">{banner.text}</p>
          </div>
        </div>
        <Link
          to={banner.to}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary-600 transition hover:bg-primary-50"
        >
          {banner.button}
          <ArrowRight size={18} />
        </Link>
      </div>

      {/* 4 stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${s.color}`}>
              <s.icon size={20} />
            </span>
            {state === 'loading' ? (
              <div className="mt-4 h-9 w-14 animate-pulse rounded bg-gray-200" />
            ) : (
              <p className="mt-4 text-3xl font-bold text-gray-900">{s.value}</p>
            )}
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Chart aur upcoming posts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Posts created this week</h2>
            <span className="text-sm text-gray-500">{weekTotal} posts</span>
          </div>

          <div className="mt-6 flex h-40 items-end gap-3">
            {week.map((d) => (
              <div
                key={d.key}
                title={`${d.count} posts`}
                className="flex-1 rounded-t-md bg-primary-500 transition hover:bg-primary-700"
                style={{ height: `${Math.max((d.count / maxDay) * 100, 3)}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex gap-3">
            {week.map((d) => (
              <span key={d.key} className="flex-1 text-center text-xs text-gray-500">
                {d.label}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900">Upcoming posts</h2>
          <div className="mt-4 space-y-4">
            {state === 'ready' && upcoming.length === 0 && (
              <p className="text-sm text-gray-500">Nothing is scheduled yet.</p>
            )}
            {upcoming.map((p) => (
              <div key={p.id} className="flex items-start gap-3">
                <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-scheduled" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    {p.platforms.map(capitalize).join(', ')} · {formatDate(p.scheduled_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent posts */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">Recent posts</h2>
          <Link to="/posts" className="text-sm font-medium text-primary-600 hover:underline">
            View all
          </Link>
        </div>

        {state === 'loading' &&
          [1, 2, 3].map((n) => (
            <div key={n} className="border-b border-gray-100 px-6 py-4 last:border-b-0">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-100" />
            </div>
          ))}

        {state === 'ready' && recent.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            No posts yet.{role === 'creator' ? ' Create your first one to see it here.' : ''}
          </p>
        )}

        {recent.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-4 border-b border-gray-100 px-6 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
              <p className="text-xs text-gray-500">
                {p.platforms.map(capitalize).join(', ') || 'No platform'} · {p.author_name} ·{' '}
                {formatDate(p.scheduled_at)}
              </p>
            </div>
            <StatusBadge status={p.status} />
          </div>
        ))}
      </div>
    </div>
  )
}