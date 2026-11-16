import { Clock } from 'lucide-react'

// Jo pages abhi banne hain, un ke liye ek saaf sa "jald aa raha hai" page
export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Clock size={26} />
      </span>
      <h1 className="mt-5 text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        This page is coming soon. The backend for it is already ready.
      </p>
    </div>
  )
}