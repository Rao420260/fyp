import { FilePlus, ShieldCheck, CalendarClock, Bot } from 'lucide-react'

// Har card ka data. Naya card chahiye to bas ek item aur add kar do
const features = [
  {
    icon: FilePlus,
    title: 'Create posts easily',
    text: 'Write text posts, upload images and choose the platforms in one simple form.',
  },
  {
    icon: ShieldCheck,
    title: 'Approval workflow',
    text: 'Managers review every post and approve or reject it before it goes live.',
  },
  {
    icon: CalendarClock,
    title: 'Smart scheduling',
    text: 'Pick a date and time, see everything on a calendar, and never miss a post.',
  },
  {
    icon: Bot,
    title: 'AI post assistant',
    text: 'Get post ideas and captions in seconds, or ask the chatbot with your own prompt.',
  },
]

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            Features
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Everything you need to manage your posts
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            One dashboard for your whole team, from the first draft to the final publish.
          </p>
        </div>

        {/* 4 cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <f.icon size={24} />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}