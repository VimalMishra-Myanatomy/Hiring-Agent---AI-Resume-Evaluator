import SectionCard from '../ui/SectionCard'
import Button from '../ui/Button'
import { buildCsvRow, buildExportPayload, downloadFile } from '../../utils/score'

export default function ExportPanel({ resume, evaluation, github, fileName, uploadedAt }) {
  const handleJson = () => {
    const payload = buildExportPayload({
      resume,
      evaluation,
      github,
      fileName,
      uploadedAt,
    })
    downloadFile(
      JSON.stringify(payload, null, 2),
      `${sanitize(fileName)}_evaluation.json`,
      'application/json'
    )
  }

  const handleCsv = () => {
    const { csv } = buildCsvRow({ resume, evaluation, fileName })
    downloadFile(csv, `${sanitize(fileName)}_evaluation.csv`, 'text/csv')
  }

  return (
    <SectionCard title="Export" subtitle="Download evaluation results">
      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" onClick={handleJson}>
          <DownloadIcon />
          Download JSON
        </Button>
        <Button variant="secondary" onClick={handleCsv}>
          <DownloadIcon />
          Download CSV
        </Button>
      </div>
    </SectionCard>
  )
}

function sanitize(name) {
  return (name || 'resume').replace(/\.pdf$/i, '').replace(/[^\w.-]/g, '_')
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}
