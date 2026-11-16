import { Bot, Copy, FilePlus } from 'lucide-react'

export default function ChatMessage({ message, onCopy, onUse }) {
  const isUser = message.role === 'user'

  // User ka message: right side, indigo bubble
  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary-600 px-4 py-3 text-sm text-white sm:max-w-[70%]">
          {message.text}
        </div>
      </div>
    )
  }

  // Bot ka message: left side, safed bubble
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
        <Bot size={20} />
      </span>

      <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 shadow-sm sm:max-w-[70%]">
        <p>{message.text}</p>

        {/* Agar bot ne post banayi hai to usay alag dabbe me dikhao */}
        {message.post && (
          <>
            <div className="mt-3 whitespace-pre-line rounded-lg bg-gray-50 p-3 text-gray-700">
              {message.post}
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => onCopy(message.post)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                <Copy size={14} />
                Copy
              </button>
              <button
                onClick={() => onUse(message.post)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-100"
              >
                <FilePlus size={14} />
                Use in new post
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}