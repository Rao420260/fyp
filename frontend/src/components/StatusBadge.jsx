const styles = {
  Draft: 'bg-draft',
  Pending: 'bg-pending',
  Approved: 'bg-approved',
  Scheduled: 'bg-scheduled',
  Published: 'bg-published',
  Rejected: 'bg-rejected',
  Failed: 'bg-rejected',
}

export default function StatusBadge({ status }) {
  // Server chhote letters bhejta hai ("pending"), hum pehla letter bara kar dete hain
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : ''

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium text-white ${
        styles[label] || 'bg-draft'
      }`}
    >
      {label}
    </span>
  )
}