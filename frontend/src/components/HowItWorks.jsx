import { Link2, PenSquare, Rocket } from 'lucide-react'

// Teen steps ka data
const steps = [
  {
    number: '1',
    icon: Link2,
    title: 'Connect your accounts',
    text: 'Link your Meta and LinkedIn accounts in a few clicks. We only ask for permission to post.',
  },
  {
    number: '2',
    icon: PenSquare,
    title: 'Create and approve',
    text: 'Write your post, send it for approval, and let your manager review it and pick the time.',
  },
  {
    number: '3',
    icon: Rocket,
    title: 'Publish automatically',
    text: 'Your post goes live at the scheduled time. Track its status from draft to published.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-600">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-gray-900 sm:text-4xl">
            Up and running in 3 simple steps
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            No complicated setup. Connect, create, and let the system do the rest.
          </p>
        </div>

        {/* 3 steps */}
        <div className="relative mt-16 grid gap-10 md:grid-cols-3">
          {/* Teeno circles ko jorne wali line (sirf bari screen par) */}
          <div className="absolute left-[16.7%] right-[16.7%] top-8 hidden border-t-2 border-dashed border-primary-100 md:block" />

          {steps.map((s) => (
            <div key={s.number} className="relative text-center">
              {/* Number wala gol circle */}
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-2xl font-bold text-white shadow-lg ring-8 ring-gray-50">
                {s.number}
              </div>

              {/* Card */}
              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <s.icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}