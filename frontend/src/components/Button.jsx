export default function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed'

  const styles = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100',
    ghost: 'text-gray-700 hover:bg-gray-100',
  }

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}