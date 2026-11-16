import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarClock, Bot, Send, Sparkles } from 'lucide-react'
import ChatMessage from '../components/ChatMessage'
import { generateReply } from '../utils/fakeAI'

// Suggestion chips: label chat me dikhta hai, topic post banane me use hota hai
const suggestions = [
  { label: 'Write a post for a product launch', topic: 'our new product is officially live' },
  { label: 'Announce a weekend sale', topic: 'our weekend sale is here with up to 30% off' },
  { label: 'Introduce my team', topic: 'meet the amazing people behind our brand' },
  { label: 'Share a business tip', topic: 'here is one simple tip to grow your small business' },
]

const tones = ['Professional', 'Friendly', 'Funny']
const platforms = ['Instagram', 'LinkedIn', 'Facebook']

export default function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi! I'm your AI post assistant. Pick a suggestion below or type your own idea, and I'll write a post for you.",
    },
  ])
  const [input, setInput] = useState('')
  const [tone, setTone] = useState('Friendly')
  const [platform, setPlatform] = useState('Instagram')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  // Naya message aaye to neeche tak scroll karo
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  // Message bhejne ka kaam
  const sendMessage = (label, topic) => {
    const text = label.trim()
    if (!text || typing) return

    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }])
    setInput('')
    setTyping(true)

    // Nakli intezar: 1.2 second baad bot ka jawab
    setTimeout(() => {
      const { intro, post } = generateReply(topic || text, tone, platform)
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: intro, post }])
      setTyping(false)
    }, 1200)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleCopy = async (post) => {
    try {
      await navigator.clipboard.writeText(post)
      toast.success('Post copied to clipboard')
    } catch {
      toast.error('Could not copy. Please copy it manually.')
    }
  }

  // Create Post page abhi nahi bana, isliye abhi sirf copy hoga
  const handleUse = async (post) => {
    await handleCopy(post)
    toast('Create Post page is coming soon. Your text is copied.', { icon: '📝' })
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Upar ki patti */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
              <CalendarClock size={20} />
            </span>
            <span className="text-xl font-bold text-gray-900">PostFlow</span>
          </Link>

          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <Sparkles size={18} className="text-primary-600" />
            <span className="hidden sm:inline">AI Post Assistant</span>
          </div>

          <Link
            to="/connect"
            className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            Connect accounts
          </Link>
        </div>
      </header>

      {/* Chat ka area (scroll hota hai) */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} onCopy={handleCopy} onUse={handleUse} />
          ))}

          {/* Typing animation */}
          {typing && (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                <Bot size={20} />
              </span>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-4 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.15s' }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </main>

      {/* Neeche ka hissa: chips, dropdowns, input */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 py-4">
          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.label}
                onClick={() => sendMessage(s.label, s.topic)}
                disabled={typing}
                className="rounded-full border border-primary-100 bg-primary-50 px-4 py-1.5 text-xs font-medium text-primary-700 transition hover:bg-primary-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Tone aur Platform */}
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              Tone
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {tones.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              Platform
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              >
                {platforms.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Custom prompt ka input */}
          <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your post idea, e.g. our new coffee shop opens on Friday"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
            <button
              type="submit"
              disabled={typing || !input.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send size={18} />
              <span className="hidden sm:inline">Generate</span>
            </button>
          </form>
        </div>
      </footer>
    </div>
  )
}