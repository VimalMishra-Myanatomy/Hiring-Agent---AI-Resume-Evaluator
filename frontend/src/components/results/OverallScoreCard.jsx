import { computeOverallScore } from '../../utils/score'

export default function OverallScoreCard({ evaluation }) {
  const { total, max, bonus, deductions, net } = computeOverallScore(evaluation)
  const percent = Math.round((net / max) * 100)
  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (percent / 100) * circumference

  return (
    <div className="glass-card p-8 shadow-glow relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-hr-green/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-center gap-8 relative">
        {/* Circular meter */}
        <div className="relative flex-shrink-0">
          <svg width="140" height="140" className="-rotate-90">
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="#2A3344"
              strokeWidth="10"
            />
            <circle
              cx="70"
              cy="70"
              r="54"
              fill="none"
              stroke="#21C45D"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-hr-text tabular-nums">{net}</span>
            <span className="text-sm text-hr-muted">/ {max}</span>
          </div>
        </div>

        <div className="flex-1 text-center lg:text-left">
          <p className="text-sm text-hr-green font-medium uppercase tracking-wider mb-1">
            AI Evaluation Score
          </p>
          <h2 className="text-2xl font-bold text-hr-text mb-3">
            Overall Performance
          </h2>
          <p className="text-hr-muted text-sm max-w-md">
            Weighted across open source, projects, production experience, and technical skills.
            Adjusted for bonus points and deductions.
          </p>

          <div className="flex flex-wrap gap-4 mt-6 justify-center lg:justify-start">
            {bonus > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hr-green/10 border border-hr-green/25">
                <span className="text-hr-green font-semibold">+{bonus}</span>
                <span className="text-xs text-hr-muted">Bonus</span>
              </div>
            )}
            {deductions > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hr-danger/10 border border-hr-danger/25">
                <span className="text-hr-danger font-semibold">−{deductions}</span>
                <span className="text-xs text-hr-muted">Deductions</span>
              </div>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-hr-card border border-hr-border">
              <span className="text-hr-text font-semibold tabular-nums">{total}</span>
              <span className="text-xs text-hr-muted">Base score</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
