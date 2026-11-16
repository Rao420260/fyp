import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarClock, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import Modal from '../components/Modal'
import PlatformCard from '../components/PlatformCard'

// Platforms ka data
const platforms = [
  {
    id: 'meta',
    name: 'Meta (Facebook + Instagram)',
    shortName: 'Meta',
    description: 'Publish posts to your Facebook Pages and Instagram business account.',
    logo: 'f',
    color: 'bg-[#1877F2]',
    demoName: "Fatima's Business Page",
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    shortName: 'LinkedIn',
    description: 'Share professional posts on your LinkedIn profile or company page.',
    logo: 'in',
    color: 'bg-[#0A66C2]',
    demoName: 'Shanza Imran',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    shortName: 'X',
    description: 'Schedule posts on X. This integration is on our roadmap.',
    logo: 'X',
    color: 'bg-black',
    comingSoon: true,
  },
]

export default function ConnectAccounts() {
  // connected = { meta: "naam", linkedin: "naam" }
  const [connected, setConnected] = useState({})
  // selected = wo platform jis ka popup khula hai (null = koi nahi)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const connectedCount = Object.keys(connected).length

  // Popup me Continue dabane par (fake connection)
  const handleContinue = () => {
    setLoading(true)
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [selected.id]: selected.demoName }))
      setLoading(false)
      toast.success(`${selected.shortName} account connected`)
      setSelected(null)
    }, 1500)
  }

  const handleDisconnect = (platform) => {
    setConnected((prev) => {
      const copy = { ...prev }
      delete copy[platform.id]
      return copy
    })
    toast(`${platform.shortName} disconnected`)
  }

  const closeModal = () => {
    if (!loading) setSelected(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Upar ki patti */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <CalendarClock size={20} />
            </span>
            <span className="text-xl font-bold text-gray-900">PostFlow</span>
          </Link>
          <Link
            to="/assistant"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            Skip for now
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900">Connect your accounts</h1>
        <p className="mt-2 text-gray-500">
          Link your social media accounts so PostFlow can publish your approved
          posts automatically.
        </p>

        {/* Bharosa dilane wala info box */}
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary-100 bg-primary-50 p-4">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-primary-600" />
          <p className="text-sm text-primary-700">
            We only ask for permission to post on your behalf. We never see or
            store your password, and you can disconnect anytime.
          </p>
        </div>

        {/* Platform cards */}
        <div className="mt-8 space-y-4">
          {platforms.map((p) => (
            <PlatformCard
              key={p.id}
              platform={p}
              connectedAs={connected[p.id]}
              onConnect={() => setSelected(p)}
              onDisconnect={() => handleDisconnect(p)}
            />
          ))}
        </div>

        {/* Neeche ka button */}
        <div className="mt-10 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {connectedCount === 0
              ? 'No accounts connected yet.'
              : `${connectedCount} account${connectedCount > 1 ? 's' : ''} connected.`}
          </p>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            {connectedCount === 0 ? 'Continue without connecting' : 'Continue'}
            <ArrowRight size={18} />
          </Link>
        </div>
      </main>

      {/* Popup */}
      <Modal open={Boolean(selected)} onClose={closeModal}>
        {selected && (
          <div className="text-center">
            <span
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-bold text-white ${selected.color}`}
            >
              {selected.logo}
            </span>

            <h2 className="mt-5 text-xl font-bold text-gray-900">
              Connect {selected.shortName}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              You will be redirected to {selected.shortName} to give permission.
              PostFlow will be able to:
            </p>

            <ul className="mt-4 space-y-2 text-left text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                Publish posts on your behalf
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-600" />
                See your page or profile name
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <button
                onClick={closeModal}
                disabled={loading}
                className="flex-1 rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Connecting...' : 'Continue'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}