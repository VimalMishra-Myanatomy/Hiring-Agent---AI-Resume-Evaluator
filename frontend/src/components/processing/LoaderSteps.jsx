import ProgressBar from '../ui/ProgressBar'

const STEP_ICONS = {
  pending: (
    <span className="w-5 h-5 rounded-full border-2 border-hr-border flex-shrink-0" />
  ),
  active: (
    <span className="w-5 h-5 rounded-full border-2 border-hr-green border-t-transparent animate-spin flex-shrink-0" />
  ),
  done: (
    <span className="w-5 h-5 rounded-full bg-hr-green/20 border border-hr-green flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-hr-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </span>
  ),
  error: (
    <span className="w-5 h-5 rounded-full bg-hr-danger/20 border border-hr-danger flex items-center justify-center flex-shrink-0">
      <svg className="w-3 h-3 text-hr-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </span>
  ),
}

/**
 * CI-pipeline style step loader.
 */
export default function LoaderSteps({ steps, currentIndex, completedIndices = [] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, index) => {
        let status = 'pending'
        if (completedIndices.includes(index)) status = 'done'
        else if (index === currentIndex) status = 'active'

        const isLast = index === steps.length - 1

        return (
          <div key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              {STEP_ICONS[status]}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[2rem] my-1 transition-colors duration-500 ${
                    status === 'done' ? 'bg-hr-green/50' : 'bg-hr-border'
                  }`}
                />
              )}
            </div>
            <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
              <p
                className={`font-medium transition-colors ${
                  status === 'active'
                    ? 'text-hr-green'
                    : status === 'done'
                      ? 'text-hr-text'
                      : 'text-hr-muted'
                }`}
              >
                {step.label}
              </p>
              {status === 'active' && (
                <p className="text-xs text-hr-muted mt-1 animate-pulse">
                  Running LLM extraction…
                </p>
              )}
              {status === 'done' && (
                <p className="text-xs text-hr-green/70 mt-1">Complete</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ProcessingProgress({ progress, etaSeconds }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-hr-muted">Overall progress</span>
        <span className="text-hr-text font-medium tabular-nums">{progress}%</span>
      </div>
      <ProgressBar value={progress} max={100} />
      {etaSeconds > 0 && (
        <p className="text-xs text-hr-muted text-center">
          Estimated time remaining: ~{etaSeconds}s
        </p>
      )}
    </div>
  )
}
