import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: string
  children?: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover shadow-sm',
  secondary:
    'bg-surface text-text-primary border border-border-default hover:bg-app-bg shadow-sm',
  ghost: 'bg-transparent text-text-secondary hover:text-text-primary',
  danger: 'bg-status-danger text-on-primary hover:bg-status-danger/90 shadow-sm',
}

export function Button({
  variant = 'primary',
  icon,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-lg font-button-text text-button-text font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {icon && <span className="material-symbols-outlined text-[18px]" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  )
}
