import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { checkHealth } from '../../api/analysisApi'
import { BRANDING } from '../../config/branding'

export default function Header({ minimal = false }) {
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    checkHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  return (
    <header className="border-b border-hr-border/50 bg-hr-surface/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5 group min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hr-green/20 to-hr-teal/10 border border-hr-green/25 flex items-center justify-center group-hover:shadow-glow-sm transition-shadow flex-shrink-0">
            <span className="text-hr-green font-bold text-sm">HA</span>
          </div>
          <div className="min-w-0">
            <span className="font-semibold text-hr-text">Hiring Agent</span>
            {!minimal && (
              <span className="hidden sm:inline text-hr-muted text-sm ml-2">
                AI Resume Evaluator
              </span>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {!minimal && <ApiBadge status={apiStatus} />}
          <PersonalBranding />
        </div>
      </div>
    </header>
  )
}

function PersonalBranding() {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      <span className="brand-credit hidden sm:inline text-xs text-hr-muted whitespace-nowrap">
        Built by {BRANDING.name} 🚀
      </span>
      <span className="brand-credit sm:hidden text-xs text-hr-muted" title={`Built by ${BRANDING.name}`}>
        {BRANDING.name.split(' ')[0]} 🚀
      </span>
      <a
        href={BRANDING.linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-lg border border-hr-border bg-hr-card text-hr-text hover:border-hr-green/50 hover:text-hr-green hover:shadow-glow-sm transition-all duration-200"
      >
        Connect
      </a>
    </div>
  )
}

function ApiBadge({ status }) {
  const config = {
    checking: { label: 'Connecting…', color: 'text-hr-muted', dot: 'bg-hr-muted' },
    online: { label: 'API Live', color: 'text-hr-green', dot: 'bg-hr-green' },
    offline: { label: 'API Offline', color: 'text-hr-danger', dot: 'bg-hr-danger' },
  }
  const { label, color, dot } = config[status] ?? config.checking

  return (
    <span
      className={`hidden md:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-hr-border bg-hr-card ${color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} ${status === 'online' ? 'animate-pulse' : ''}`} />
      {label}
    </span>
  )
}
