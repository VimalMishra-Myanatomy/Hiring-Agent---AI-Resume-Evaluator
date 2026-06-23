const variants = {
  default: 'bg-hr-border/60 text-hr-muted',
  success: 'bg-hr-green/15 text-hr-green border border-hr-green/30',
  warning: 'bg-hr-warning/15 text-hr-warning border border-hr-warning/30',
  danger: 'bg-hr-danger/15 text-hr-danger border border-hr-danger/30',
}

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
