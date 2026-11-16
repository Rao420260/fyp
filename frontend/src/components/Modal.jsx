import { X } from 'lucide-react'

export default function Modal({ open, onClose, children }) {
  // Agar open nahi hai to kuch mat dikhao
  if (!open) return null

  return (
    // Andhera background: us par click karo to popup band
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      {/* Safed box: isay click karne se band nahi hota */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-gray-600"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}