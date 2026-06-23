import { create } from 'zustand'

const initialState = {
  // Navigation flow
  screen: 'upload', // upload | processing | results | error

  // Upload
  file: null,
  fileName: '',
  includeGitHub: true,

  // Processing
  currentStepIndex: -1,
  completedSteps: [],
  processingProgress: 0,
  estimatedSecondsRemaining: 0,

  // Results
  uploadedAt: null,
  resume: null,
  evaluation: null,
  github: null,
  githubStatus: 'idle', // idle | loading | success | skipped | rate_limit | not_found

  // Error
  error: null,
  errorType: null, // invalid_pdf | parse_failed | api_failure | timeout | github_rate_limit
}

export const useAppStore = create((set, get) => ({
  ...initialState,

  setIncludeGitHub: (includeGitHub) => set({ includeGitHub }),

  setFile: (file) =>
    set({
      file,
      fileName: file?.name ?? '',
      error: null,
      errorType: null,
    }),

  clearFile: () => set({ file: null, fileName: '', error: null, errorType: null }),

  setError: (error, errorType = 'api_failure') =>
    set({ error, errorType, screen: 'error' }),

  updateProcessing: (partial) => set(partial),

  resetAnalysis: () =>
    set({
      ...initialState,
      includeGitHub: get().includeGitHub,
    }),

  setResults: (payload) =>
    set({
      screen: 'results',
      resume: payload.resume,
      evaluation: payload.evaluation,
      github: payload.github,
      githubStatus: payload.githubStatus,
      uploadedAt: payload.uploadedAt ?? new Date(),
      fileName: payload.fileName,
      processingProgress: 100,
      error: null,
      errorType: null,
    }),

  rerun: () => {
    const { file, fileName, includeGitHub } = get()
    set({
      ...initialState,
      file,
      fileName,
      includeGitHub,
      screen: 'processing',
    })
  },
}))

// Selectors
export const selectHasGitHub = (state) =>
  state.githubStatus === 'success' && state.github !== null

export const selectCandidateName = (state) =>
  state.resume?.basics?.name ?? state.fileName?.replace('.pdf', '') ?? 'Candidate'
