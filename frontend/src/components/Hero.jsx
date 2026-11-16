import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, FileText, Clock, CalendarCheck, Send } from 'lucide-react'

// Mockup me dikhane wale fake numbers
const stats = [
  { label: 'Total Posts', value: '128', icon: FileText, color: 'text-primary-600 bg-primary-50' },
  { label: 'Pending', value: '12', icon: Clock, color: 'text-pending bg-amber-50' },
  { label: 'Scheduled', value: '34', icon: CalendarCheck, color: 'text-scheduled bg-violet-50' },
  { label: 'Published', value: '82', icon: Send, color: 'text-published bg-emerald-50' },
]

// Mockup me dikhane wali fake posts
const posts = [
  { title: 'New summer collection is live!', platform: 'Instagram', status: 'Published', badge: 'bg-published' },
  { title: '5 tips to grow your small business', platform: 'LinkedIn', status: 'Scheduled', badge: 'bg-scheduled' },
  { title: 'Weekend sale: up to 30% off', platform: 'Facebook', status: 'Pending', badge: 'bg-pending' },
  { title: 'Meet our amazing team', platform: 'LinkedIn', status: 'Draft', badge: 'bg-draft' },
]

export default function Hero() {
  return (
    <section className="bg-linear-to-b from-primary-50 to-white px-6 pt-20 pb-24">
      {/* Upar ka text */}
      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-1.5 text-sm font-medium text-primary-600">
          <Sparkles size={16} />
          AI-powered social media scheduling
        </span>

        <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Plan, approve and publish your social media in{' '}
          <span className="text-primary-600">one place</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-gray-500">
          Save hours every week. Create posts, get them approved by your team,
          and publish automatically at the perfect time.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-7 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-primary-700"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
          <a
            href="#how-it-works"
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-7 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-100"
          >
            See How It Works
          </a>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
        {/* Browser ki upar wali patti */}
        <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-yellow-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
          <span className="ml-4 rounded-md bg-white px-3 py-1 text-xs text-gray-400">
            app.postflow.com/dashboard
          </span>
        </div>

        <div className="p-6 text-left">
          {/* 4 stat cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-gray-200 p-4">
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon size={18} />
                </span>
                <p className="mt-3 text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Posts ki list */}
          <div className="mt-6 rounded-xl border border-gray-200">
            <p className="border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900">
              Recent posts
            </p>
            {posts.map((p) => (
              <div
                key={p.title}
                className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.platform}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white ${p.badge}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}