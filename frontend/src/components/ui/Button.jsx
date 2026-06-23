const variants = {
  primary:
    'bg-hr-green text-hr-bg font-semibold hover:bg-hr-green-dim hover:shadow-glow active:scale-[0.98]',
  secondary:
    'bg-hr-card text-hr-text border border-hr-border hover:border-hr-green/50 hover:bg-hr-surface',
  ghost: 'text-hr-muted hover:text-hr-text hover:bg-hr-card/60',
  danger: 'bg-hr-danger/10 text-hr-danger border border-hr-danger/30 hover:bg-hr-danger/20',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
