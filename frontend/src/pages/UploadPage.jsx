import { useCallback, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import FileDropzone, { GitHubToggle } from '../components/upload/FileDropzone'
import ApiKeySection from '../components/upload/ApiKeySection'
import Button from '../components/ui/Button'
import { useAppStore } from '../store/useAppStore'
import { validatePdfFile, getEstimatedDuration, checkHealth } from '../api/analysisApi'
import { isApiKeyValidated } from '../utils/apiKeyStorage'

export default function UploadPage() {
  const navigate = useNavigate()
  const {
    file,
    includeGitHub,
    setFile,
    clearFile,
    setIncludeGitHub,
    updateProcessing,
  } = useAppStore()

  const [uploadError, setUploadError] = useState(null)
  const [apiOnline, setApiOnline] = useState(true)
  const [keyValidated, setKeyValidated] = useState(isApiKeyValidated)
  const [serverHasKey, setServerHasKey] = useState(false)

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setApiOnline(true)
        setServerHasKey(!!data.geminiConfigured)
        if (data.geminiConfigured) setKeyValidated(true)
      })
      .catch(() => setApiOnline(false))
  }, [])

  const handleFileSelect = useCallback(
    (selected) => {
      const result = validatePdfFile(selected)
      if (!result.valid) {
        setUploadError(result.error)
        return
      }
      setUploadError(null)
      setFile(selected)
    },
    [setFile]
  )

  const handleAnalyze = () => {
    const result = validatePdfFile(file)
    if (!result.valid) {
      setUploadError(result.error)
      return
    }
    updateProcessing({
      screen: 'processing',
      currentStepIndex: -1,
      completedSteps: [],
      processingProgress: 0,
      estimatedSecondsRemaining: getEstimatedDuration(includeGitHub),
    })
    navigate('/processing')
  }

  const eta = getEstimatedDuration(includeGitHub)

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            <span className="hr-gradient-text">AI Resume</span>{' '}
            <span className="text-hr-text">Evaluator</span>
          </h1>
          <p className="text-hr-muted max-w-md mx-auto">
            Upload a PDF resume for fair, explainable scoring across open source,
            projects, production experience, and technical skills.
          </p>
        </div>

        <div className="space-y-5 animate-slide-up">
          {!apiOnline && (
            <div className="p-4 rounded-xl bg-hr-danger/10 border border-hr-danger/25 text-sm text-hr-danger">
              API server is offline. Start it with{' '}
              <code className="text-hr-text bg-hr-card px-1.5 py-0.5 rounded text-xs">
                .\run_api.ps1
              </code>{' '}
              from the project root.
            </div>
          )}

          <ApiKeySection onValidationChange={setKeyValidated} />

          <FileDropzone
            file={file}
            onFileSelect={handleFileSelect}
            error={uploadError}
          />

          <GitHubToggle enabled={includeGitHub} onChange={setIncludeGitHub} />

          <Button
            size="lg"
            className="w-full"
            disabled={!file || !apiOnline || (!keyValidated && !serverHasKey)}
            onClick={handleAnalyze}
          >
            Analyze Resume
            <ArrowIcon />
          </Button>

          <p className="text-center text-xs text-hr-muted">
            {!keyValidated && !serverHasKey
              ? 'Validate your API key to enable analysis'
              : `AI will analyze your resume in ~${eta} seconds`}
          </p>

          {file && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                clearFile()
                setUploadError(null)
              }}
                className="text-xs text-hr-muted hover:text-hr-danger transition-colors"
              >
                Remove file
              </button>
            </div>
          )}
        </div>

        {/* Trust signals */}
        <div className="mt-16 grid grid-cols-3 gap-4 text-center">
          {[
            { value: '4', label: 'Score categories' },
            { value: '100', label: 'Point rubric' },
            { value: '~60s', label: 'Avg. analysis' },
          ].map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl bg-hr-card/40 border border-hr-border/40">
              <p className="text-xl font-bold text-hr-green">{stat.value}</p>
              <p className="text-xs text-hr-muted mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  )
}
