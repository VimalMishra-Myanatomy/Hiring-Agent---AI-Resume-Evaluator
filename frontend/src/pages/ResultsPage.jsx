import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import ResultsHeader from '../components/results/ResultsHeader'
import OverallScoreCard from '../components/results/OverallScoreCard'
import CategoryBreakdown from '../components/results/CategoryBreakdown'
import StrengthsImprovements from '../components/results/StrengthsImprovements'
import BonusDeductionsPanel from '../components/results/BonusDeductionsPanel'
import ParsedResumeView from '../components/results/ParsedResumeView'
import GitHubInsights from '../components/results/GitHubInsights'
import ExportPanel from '../components/results/ExportPanel'
import SectionCard from '../components/ui/SectionCard'
import {
  useAppStore,
  selectCandidateName,
} from '../store/useAppStore'

export default function ResultsPage() {
  const navigate = useNavigate()
  const {
    evaluation,
    resume,
    github,
    githubStatus,
    fileName,
    uploadedAt,
    rerun,
  } = useAppStore()

  const candidateName = useAppStore(selectCandidateName)

  useEffect(() => {
    if (!evaluation || !resume) {
      navigate('/', { replace: true })
    }
  }, [evaluation, resume, navigate])

  if (!evaluation || !resume) return null

  const handleRerun = () => {
    rerun()
    navigate('/processing')
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <ResultsHeader
          candidateName={candidateName}
          fileName={fileName}
          uploadedAt={uploadedAt}
          onRerun={handleRerun}
        />

        <div className="space-y-6">
          <OverallScoreCard evaluation={evaluation} />

          <SectionCard title="Category Breakdown" subtitle="Scores with evidence per rubric category">
            <CategoryBreakdown scores={evaluation.scores} />
          </SectionCard>

          <StrengthsImprovements
            strengths={evaluation.key_strengths}
            improvements={evaluation.areas_for_improvement}
          />

          <BonusDeductionsPanel
            bonus={evaluation.bonus_points}
            deductions={evaluation.deductions}
          />

          <ParsedResumeView resume={resume} />

          <GitHubInsights github={github} status={githubStatus} />

          <ExportPanel
            resume={resume}
            evaluation={evaluation}
            github={github}
            fileName={fileName}
            uploadedAt={uploadedAt}
          />
        </div>
      </div>
    </AppLayout>
  )
}
