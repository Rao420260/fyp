import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function CTA() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-linear-to-br from-primary-600 to-primary-700 px-8 py-16 text-center shadow-xl sm:px-16">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to save hours every week?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-primary-100">
          Join businesses and freelancers who plan, approve and publish their
          social media from one simple dashboard.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-7 py-3.5 text-base font-semibold text-primary-600 shadow-sm transition hover:bg-primary-50"
          >
            Start Now
            <ArrowRight size={18} />
          </Link>
          <Link
            to="/login"
            className="inline-flex items-center rounded-lg border border-white/40 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </section>
  )
}