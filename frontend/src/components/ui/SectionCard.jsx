export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
  noPadding = false,
}) {
  return (
    <section
      className={`glass-card shadow-card animate-slide-up ${className}`}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-hr-border/60">
          <div>
            {title && (
              <h2 className="text-base font-semibold text-hr-text">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-hr-muted mt-0.5">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>{children}</div>
    </section>
  )
}
