import Button from '../ui/Button'
import Badge from '../ui/Badge'
import { formatTimestamp } from '../../utils/score'

export default function ResultsHeader({
  candidateName,
  fileName,
  uploadedAt,
  onRerun,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-slide-up">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="success">Analysis complete</Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-hr-text">
          {candidateName}
        </h1>
        <p className="text-sm text-hr-muted mt-1">
          {fileName} · Analyzed {formatTimestamp(uploadedAt)}
        </p>
      </div>
      <Button variant="secondary" onClick={onRerun} className="flex-shrink-0">
        <RefreshIcon />
        Re-run analysis
      </Button>
    </div>
  )
}

function RefreshIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  )
}
