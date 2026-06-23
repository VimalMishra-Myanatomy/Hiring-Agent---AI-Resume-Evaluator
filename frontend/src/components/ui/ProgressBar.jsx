export default function ProgressBar({
  value,
  max = 100,
  color = 'bg-hr-green',
  height = 'h-2',
  showLabel = false,
  className = '',
}) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between text-xs text-hr-muted mb-1.5">
          <span>Progress</span>
          <span>{percent}%</span>
        </div>
      )}
      <div className={`w-full ${height} bg-hr-surface rounded-full overflow-hidden border border-hr-border/50`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer bg-[length:200%_100%]" />
        </div>
      </div>
    </div>
  )
}
