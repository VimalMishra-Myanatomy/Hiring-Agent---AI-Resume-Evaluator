import { useState, useEffect, useCallback } from 'react'
import Button from '../ui/Button'
import {
  getStoredApiKey,
  isApiKeyValidated,
  saveApiKey,
  clearApiKeyValidation,
} from '../../utils/apiKeyStorage'
import { validateGeminiKey } from '../../api/analysisApi'

const STEPS = [
  { text: 'Go to:', link: 'https://aistudio.google.com/app/apikey', label: 'Google AI Studio' },
  { text: 'Sign in with your Google account' },
  { text: 'Click "Create API Key"' },
  { text: 'Copy the key' },
  { text: 'Paste it here' },
]

export default function ApiKeySection({ onValidationChange }) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [status, setStatus] = useState('idle') // idle | validating | success | error
  const [message, setMessage] = useState('')
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredApiKey()
    if (stored) {
      setApiKey(stored)
      if (isApiKeyValidated()) {
        setStatus('success')
        setMessage('API key saved and verified.')
        onValidationChange?.(true)
      }
    }
  }, [onValidationChange])

  const handleKeyChange = (e) => {
    setApiKey(e.target.value)
    setStatus('idle')
    setMessage('')
    clearApiKeyValidation()
    onValidationChange?.(false)
  }

  const handleValidate = useCallback(async () => {
    const trimmed = apiKey.trim()
    if (!trimmed) {
      setStatus('error')
      setMessage('Please enter your API key.')
      onValidationChange?.(false)
      return
    }

    setStatus('validating')
    setMessage('')

    try {
      const result = await validateGeminiKey(trimmed)
      if (result.valid) {
        saveApiKey(trimmed)
        setStatus('success')
        setMessage(result.message || 'API key verified successfully.')
        onValidationChange?.(true)
      } else {
        setStatus('error')
        setMessage(result.message || 'Invalid API key.')
        onValidationChange?.(false)
      }
    } catch (err) {
      setStatus('error')
      setMessage(err?.message || 'Could not validate key. Check your connection.')
      onValidationChange?.(false)
    }
  }, [apiKey, onValidationChange])

  return (
    <div className="glass-card p-5 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-hr-text">Gemini API Key</h3>
        <p className="text-xs text-hr-muted mt-1">
          Required to run AI analysis. Stored only in your browser — never on our servers.
        </p>
      </div>

      {/* Why we ask */}
      <div className="p-3 rounded-lg bg-hr-surface/60 border border-hr-border/40">
        <p className="text-xs font-medium text-hr-text flex items-center gap-1.5">
          <span aria-hidden>🧠</span> Why we ask for an API key?
        </p>
        <p className="text-xs text-hr-muted mt-1.5 leading-relaxed">
          We use your API key so you have full control over usage and cost.
          We do not store your key on our servers.
        </p>
      </div>

      {/* Input row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={handleKeyChange}
            placeholder="Paste your Gemini API key"
            autoComplete="off"
            spellCheck={false}
            className="w-full px-4 py-2.5 pr-10 text-sm rounded-lg bg-hr-surface border border-hr-border text-hr-text placeholder:text-hr-muted/60 focus:outline-none focus:border-hr-green/50 focus:ring-1 focus:ring-hr-green/25 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-hr-muted hover:text-hr-text transition-colors"
            aria-label={showKey ? 'Hide API key' : 'Show API key'}
          >
            {showKey ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
        <Button
          variant="secondary"
          onClick={handleValidate}
          disabled={status === 'validating' || !apiKey.trim()}
          className="sm:w-auto w-full flex-shrink-0"
        >
          {status === 'validating' ? 'Validating…' : 'Validate'}
        </Button>
      </div>

      {/* Status message */}
      {message && (
        <p
          className={`text-xs ${
            status === 'success' ? 'text-hr-green' : status === 'error' ? 'text-hr-danger' : 'text-hr-muted'
          }`}
          role="status"
        >
          {status === 'success' && '✓ '}
          {status === 'error' && '✕ '}
          {message}
        </p>
      )}

      {/* Helper accordion */}
      <div className="border border-hr-border/50 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setHelpOpen(!helpOpen)}
          className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-medium text-hr-muted hover:text-hr-text hover:bg-hr-surface/40 transition-colors"
        >
          <span>Don&apos;t have a key? Follow steps below</span>
          <svg
            className={`w-4 h-4 transition-transform ${helpOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {helpOpen && (
          <div className="px-4 pb-4 pt-1 border-t border-hr-border/40 animate-fade-in">
            <p className="text-xs font-medium text-hr-text mb-3">
              How to get your Gemini API Key:
            </p>
            <ol className="space-y-2.5">
              {STEPS.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs text-hr-muted">
                  <span className="text-hr-green font-medium flex-shrink-0 w-4">
                    {i + 1}.
                  </span>
                  <span>
                    {step.link ? (
                      <>
                        {step.text}{' '}
                        <a
                          href={step.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-hr-green hover:underline"
                        >
                          {step.label}
                        </a>
                      </>
                    ) : (
                      step.text
                    )}
                  </span>
                </li>
              ))}
            </ol>
            <div className="mt-4 p-3 rounded-md bg-hr-warning/5 border border-hr-warning/20">
              <p className="text-xs text-hr-muted">
                <span className="text-hr-warning font-medium">Note:</span>
                <br />
                · Keep your key private
                <br />
                · Do not share it publicly
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EyeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}
