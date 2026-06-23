import { useState } from 'react'
import ProgressBar from './ProgressBar'

const CATEGORY_META = {
  open_source: { label: 'Open Source', icon: '🌐', color: 'bg-hr-teal' },
  self_projects: { label: 'Self Projects', icon: '🚀', color: 'bg-hr-green' },
  production: { label: 'Production Experience', icon: '🏢', color: 'bg-blue-400' },
  technical_skills: { label: 'Technical Skills', icon: '💻', color: 'bg-violet-400' },
}

export default function ScoreCard({ categoryKey, score, max, evidence }) {
  const [expanded, setExpanded] = useState(false)
  const meta = CATEGORY_META[categoryKey] ?? {
    label: categoryKey,
    icon: '📊',
    color: 'bg-hr-green',
  }
  const capped = Math.min(score, max)

  return (
    <div className="glass-card p-5 hover:border-hr-green/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-xl" aria-hidden>
            {meta.icon}
          </span>
          <div>
            <h3 className="font-semibold text-hr-text">{meta.label}</h3>
            <p className="text-xs text-hr-muted">Max {max} points</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-hr-green tabular-nums">
            {capped}
          </span>
          <span className="text-hr-muted text-sm">/{max}</span>
        </div>
      </div>

      <ProgressBar value={capped} max={max} color={meta.color} />

      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="mt-4 text-sm text-hr-green hover:text-hr-green-dim flex items-center gap-1 transition-colors"
      >
        {expanded ? 'Hide evidence' : 'View evidence'}
        <svg
          className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          expanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-sm text-hr-muted leading-relaxed p-3 rounded-lg bg-hr-surface/80 border border-hr-border/40">
          {evidence}
        </p>
      </div>
    </div>
  )
}
