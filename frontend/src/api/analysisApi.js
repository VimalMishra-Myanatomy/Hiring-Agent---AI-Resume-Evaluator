/**
 * Real API client for the FastAPI backend.
 */

import { getEstimatedDuration, getStepsForRun } from '../data/pipelineSteps'
import { getStoredApiKey } from '../utils/apiKeyStorage'

const API_BASE = import.meta.env.VITE_API_URL || ''

export { getEstimatedDuration }

/** Validate uploaded file is a PDF */
export function validatePdfFile(file) {
  if (!file) return { valid: false, error: 'No file selected.' }
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are supported.' }
  }
  if (file.size > 10 * 1024 * 1024) {
    return { valid: false, error: 'File size must be under 10 MB.' }
  }
  return { valid: true }
}

async function parseErrorResponse(res) {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    if (data.message) return data.message
    if (data.error) return data.error
    return res.statusText
  } catch {
    return res.statusText || 'Request failed'
  }
}

function apiKeyHeaders() {
  const key = getStoredApiKey()
  return key ? { 'X-Gemini-Api-Key': key } : {}
}

/** Check backend is reachable */
export async function checkHealth() {
  const res = await fetch(`${API_BASE}/api/health`)
  if (!res.ok) throw new Error('API unavailable')
  return res.json()
}

/** Validate Gemini API key (never logged client-side) */
export async function validateGeminiKey(apiKey) {
  const res = await fetch(`${API_BASE}/api/validate-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    return { valid: false, message: data.message || 'Invalid API key.' }
  }

  return { valid: true, message: data.message || 'API key verified successfully.' }
}

/** Upload PDF and start analysis job */
export async function startAnalysis(file, includeGitHub) {
  const form = new FormData()
  form.append('file', file)
  form.append('include_github', includeGitHub ? 'true' : 'false')

  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: apiKeyHeaders(),
    body: form,
  })

  if (!res.ok) {
    const message = await parseErrorResponse(res)
    const type = res.status === 400 ? 'invalid_pdf' : 'api_failure'
    throw { type, message }
  }

  return res.json()
}

/** Poll job status */
export async function getJobStatus(jobId) {
  const res = await fetch(`${API_BASE}/api/analyze/${jobId}/status`)
  if (!res.ok) {
    throw { type: 'api_failure', message: 'Failed to fetch job status' }
  }
  return res.json()
}

/** Fetch completed job result */
export async function getJobResult(jobId) {
  const res = await fetch(`${API_BASE}/api/analyze/${jobId}/result`)

  if (res.status === 422) {
    const data = await res.json()
    throw {
      type: data.errorType || 'api_failure',
      message: data.error || 'Analysis failed',
    }
  }

  if (res.status === 202) {
    return null
  }

  if (!res.ok) {
    throw { type: 'api_failure', message: await parseErrorResponse(res) }
  }

  return res.json()
}

const POLL_INTERVAL_MS = 600

/**
 * Full analysis flow: upload → poll status → fetch result.
 */
export async function runAnalysis({
  file,
  includeGitHub,
  onStepStart,
  onProgress,
}) {
  const validation = validatePdfFile(file)
  if (!validation.valid) {
    throw { type: 'invalid_pdf', message: validation.error }
  }

  const { jobId } = await startAnalysis(file, includeGitHub)
  const steps = getStepsForRun(includeGitHub)

  let lastStepIndex = -1

  while (true) {
    const status = await getJobStatus(jobId)

    if (status.stepIndex >= 0 && status.stepIndex !== lastStepIndex) {
      lastStepIndex = status.stepIndex
      const step = steps[status.stepIndex] ?? { id: status.step, label: status.message }
      onStepStart?.(status.stepIndex, step)
    }

    onProgress?.(status.progress, status.etaSeconds)

    if (status.status === 'completed') {
      const result = await getJobResult(jobId)
      return {
        resume: result.resume,
        evaluation: result.evaluation,
        github: result.github,
        githubStatus: result.githubStatus,
        fileName: result.fileName || file.name,
        uploadedAt: result.uploadedAt ? new Date(result.uploadedAt) : new Date(),
      }
    }

    if (status.status === 'failed') {
      throw {
        type: status.errorType || 'api_failure',
        message: status.error || 'Analysis failed',
      }
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS))
  }
}
