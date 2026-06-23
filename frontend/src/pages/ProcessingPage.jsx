import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import LoaderSteps, { ProcessingProgress } from '../components/processing/LoaderSteps'
import SectionCard from '../components/ui/SectionCard'
import { useAppStore } from '../store/useAppStore'
import { runAnalysis } from '../api/analysisApi'
import { getStepsForRun } from '../data/pipelineSteps'

export default function ProcessingPage() {
  const navigate = useNavigate()
  const ran = useRef(false)

  const {
    file,
    includeGitHub,
    currentStepIndex,
    completedSteps,
    processingProgress,
    estimatedSecondsRemaining,
    updateProcessing,
    setResults,
    setError,
  } = useAppStore()

  const steps = getStepsForRun(includeGitHub)

  useEffect(() => {
    if (!file) {
      navigate('/', { replace: true })
      return
    }
    if (ran.current) return
    ran.current = true

    const run = async () => {
      try {
        const result = await runAnalysis({
          file,
          includeGitHub,
          onStepStart: (index) => {
            updateProcessing({
              currentStepIndex: index,
              completedSteps: Array.from({ length: index }, (_, i) => i),
            })
          },
          onProgress: (percent, eta) => {
            updateProcessing({
              processingProgress: percent,
              estimatedSecondsRemaining: eta,
            })
          },
        })

        updateProcessing({
          completedSteps: steps.map((_, i) => i),
          currentStepIndex: steps.length,
          processingProgress: 100,
        })

        await new Promise((r) => setTimeout(r, 400))
        setResults(result)
        navigate('/results', { replace: true })
      } catch (err) {
        const type = err?.type ?? 'api_failure'
        const message = err?.message ?? 'An unexpected error occurred.'
        setError(message, type)
        navigate('/error', { replace: true })
      }
    }

    run()
  }, [
    file,
    includeGitHub,
    navigate,
    setResults,
    setError,
    updateProcessing,
    steps,
  ])

  return (
    <AppLayout minimalHeader>
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hr-green/10 border border-hr-green/25 text-hr-green text-xs font-medium mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-hr-green animate-pulse" />
            Analysis in progress
          </div>
          <h1 className="text-2xl font-bold text-hr-text">Evaluating your resume</h1>
          <p className="text-sm text-hr-muted mt-2">
            Running live AI pipeline — typically 45–90 seconds
          </p>
        </div>

        <SectionCard noPadding className="overflow-hidden">
          <div className="p-6 border-b border-hr-border/60">
            <ProcessingProgress
              progress={processingProgress}
              etaSeconds={estimatedSecondsRemaining}
            />
          </div>
          <div className="p-6">
            <LoaderSteps
              steps={steps}
              currentIndex={currentStepIndex}
              completedIndices={completedSteps}
            />
          </div>
        </SectionCard>

        <p className="text-center text-xs text-hr-muted mt-6">
          File: {file?.name}
        </p>
      </div>
    </AppLayout>
  )
}
