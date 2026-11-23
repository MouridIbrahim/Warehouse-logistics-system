type StatusTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral'

const toneClasses: Record<StatusTone, string> = {
  success: 'bg-status-success-bg text-status-success-text',
  warning: 'bg-status-warning-bg text-status-warning-text',
  info: 'bg-status-info-bg text-status-info-text',
  danger: 'bg-status-danger-bg text-status-danger-text',
  neutral: 'bg-status-neutral-bg text-status-neutral-text',
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: StatusTone
  children: React.ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-caption-meta font-caption-meta font-semibold ${toneClasses[tone]}`}
    >
      {children}
    </span>
  )
}
