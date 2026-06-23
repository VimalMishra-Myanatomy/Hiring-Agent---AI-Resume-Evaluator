import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ErrorState from '../components/ui/ErrorState'
import { useAppStore } from '../store/useAppStore'

export default function ErrorPage() {
  const navigate = useNavigate()
  const { error, errorType, file, resetAnalysis, rerun } = useAppStore()

  const handleRetry = () => {
    if (file) {
      rerun()
      navigate('/processing')
    } else {
      navigate('/')
    }
  }

  const handleReset = () => {
    resetAnalysis()
    navigate('/')
  }

  return (
    <AppLayout minimalHeader>
      <div className="px-4 sm:px-6 py-16 sm:py-24">
        <ErrorState
          type={errorType}
          message={error ?? 'Something went wrong.'}
          onRetry={file ? handleRetry : undefined}
          onReset={handleReset}
        />
      </div>
    </AppLayout>
  )
}
