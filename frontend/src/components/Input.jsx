import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({ label, type = 'text', error, ...props }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={isPassword && show ? 'text' : type}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
            error
              ? 'border-rejected focus:ring-red-200'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-100'
          } ${isPassword ? 'pr-11' : ''}`}
          {...props}
        />

        {/* Password ki eye icon */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {/* Galti ka laal message */}
      {error && <p className="mt-1.5 text-sm text-rejected">{error}</p>}
    </div>
  )
}