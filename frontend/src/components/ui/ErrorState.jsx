import Button from './Button'

const ERROR_CONFIG = {
  invalid_pdf: {
    title: 'Invalid file',
    icon: '📄',
    suggestion: 'Upload a valid PDF resume under 10 MB.',
  },
  parse_failed: {
    title: 'Parsing failed',
    icon: '⚠️',
    suggestion: 'The PDF may be scanned, image-only, or corrupted. Try a text-based PDF.',
  },
  github_rate_limit: {
    title: 'GitHub rate limit',
    icon: '⏳',
    suggestion: 'Wait for the rate limit to reset or configure a GITHUB_TOKEN on the server.',
  },
  api_failure: {
    title: 'API error',
    icon: '🔌',
    suggestion: 'Check LLM provider configuration (API key, model name) and try again.',
  },
  timeout: {
    title: 'Request timed out',
    icon: '⌛',
    suggestion: 'The evaluation took too long. Try again or use a shorter resume.',
  },
}

export default function ErrorState({ type = 'api_failure', message, onRetry, onReset }) {
  const config = ERROR_CONFIG[type] ?? ERROR_CONFIG.api_failure

  return (
    <div className="max-w-lg mx-auto text-center animate-fade-in">
      <div className="glass-card p-10 shadow-card">
        <div className="text-5xl mb-4">{config.icon}</div>
        <h2 className="text-xl font-semibold text-hr-text mb-2">{config.title}</h2>
        <p className="text-hr-muted text-sm mb-2">{message}</p>
        <p className="text-hr-muted/80 text-xs mb-8">{config.suggestion}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="primary">
              Try again
            </Button>
          )}
          {onReset && (
            <Button onClick={onReset} variant="secondary">
              Upload new resume
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-4 bg-hr-border/60 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 bg-hr-border/40 rounded mb-2"
          style={{ width: `${90 - i * 15}%` }}
        />
      ))}
    </div>
  )
}
