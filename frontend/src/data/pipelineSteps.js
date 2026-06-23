/** Pipeline step definitions — mirrors backend pipeline.PIPELINE_STEPS */

export const PIPELINE_STEPS = [
  { id: 'parse', label: 'Parsing PDF' },
  { id: 'extract', label: 'Extracting Sections' },
  { id: 'github', label: 'Fetching GitHub Data' },
  { id: 'evaluate', label: 'Evaluating Resume' },
]

export function getStepsForRun(includeGitHub) {
  return includeGitHub
    ? PIPELINE_STEPS
    : PIPELINE_STEPS.filter((s) => s.id !== 'github')
}

export function getEstimatedDuration(includeGitHub) {
  return includeGitHub ? 60 : 45
}
