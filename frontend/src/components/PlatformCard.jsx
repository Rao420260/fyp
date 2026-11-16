import { CheckCircle2 } from 'lucide-react'

export default function PlatformCard({ platform, connectedAs, onConnect, onDisconnect }) {
  const isConnected = Boolean(connectedAs)

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
      {/* Logo */}
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl font-bold text-white ${platform.color}`}
      >
        {platform.logo}
      </span>

      {/* Naam, description, status */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{platform.name}</h3>

          {platform.comingSoon ? (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              Coming soon
            </span>
          ) : isConnected ? (
            <span className="rounded-full bg-published px-3 py-1 text-xs font-medium text-white">
              Connected
            </span>
          ) : (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
              Not connected
            </span>
          )}
        </div>

        <p className="mt-1 text-sm text-gray-500">{platform.description}</p>

        {isConnected && (
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-published">
            <CheckCircle2 size={16} />
            Connected as {connectedAs}
          </p>
        )}
      </div>

      {/* Button */}
      {platform.comingSoon ? (
        <button
          disabled
          className="cursor-not-allowed rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-400"
        >
          Connect
        </button>
      ) : isConnected ? (
        <button
          onClick={onDisconnect}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
        >
          Disconnect
        </button>
      ) : (
        <button
          onClick={onConnect}
          className="rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Connect
        </button>
      )}
    </div>
  )
}