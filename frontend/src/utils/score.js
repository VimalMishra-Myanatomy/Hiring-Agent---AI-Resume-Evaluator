/**
 * Score calculation utilities — mirrors backend score.py logic.
 */

export function capScore(score, max) {
  return Math.min(score, max)
}

export function computeOverallScore(evaluation) {
  if (!evaluation?.scores) return { total: 0, max: 100, net: 0 }

  const categories = Object.values(evaluation.scores)
  let total = 0
  let max = 0

  categories.forEach((cat) => {
    total += capScore(cat.score, cat.max)
    max += cat.max
  })

  const bonus = evaluation.bonus_points?.total ?? 0
  const deductions = evaluation.deductions?.total ?? 0
  const net = Math.max(0, Math.min(total + bonus - deductions, max + 20))

  return { total, max, bonus, deductions, net }
}

export function formatTimestamp(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function downloadFile(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function buildExportPayload({ resume, evaluation, github, fileName, uploadedAt }) {
  return {
    meta: { fileName, uploadedAt, exportedAt: new Date().toISOString() },
    resume,
    evaluation,
    github,
    scores: computeOverallScore(evaluation),
  }
}

export function buildCsvRow({ resume, evaluation, fileName }) {
  const { total, bonus, deductions, net } = computeOverallScore(evaluation)
  const s = evaluation.scores
  const name = resume?.basics?.name ?? ''
  const email = resume?.basics?.email ?? ''

  const headers = [
    'file_name',
    'name',
    'email',
    'open_source',
    'self_projects',
    'production',
    'technical_skills',
    'bonus',
    'deductions',
    'net_score',
    'total_score',
  ]

  const row = [
    fileName,
    name,
    email,
    s.open_source.score,
    s.self_projects.score,
    s.production.score,
    s.technical_skills.score,
    bonus,
    deductions,
    net,
    total,
  ]

  return {
    headers,
    csv: [headers.join(','), row.join(',')].join('\n'),
  }
}
