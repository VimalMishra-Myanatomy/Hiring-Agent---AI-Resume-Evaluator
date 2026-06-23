import { useCallback, useState } from 'react'
import Button from '../ui/Button'

export default function FileDropzone({ file, onFileSelect, error }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      const dropped = e.dataTransfer.files?.[0]
      if (dropped) onFileSelect(dropped)
    },
    [onFileSelect]
  )

  const handleChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) onFileSelect(selected)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`
        relative rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center
        transition-all duration-300 cursor-pointer group
        ${
          dragOver
            ? 'border-hr-green bg-hr-green/5 shadow-glow'
            : file
              ? 'border-hr-green/50 bg-hr-green/5'
              : 'border-hr-border hover:border-hr-green/40 hover:bg-hr-card/40'
        }
      `}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Upload resume PDF"
      />

      <div className="pointer-events-none">
        <div
          className={`w-16 h-16 mx-auto mb-5 rounded-2xl flex items-center justify-center transition-all ${
            file ? 'bg-hr-green/20' : 'bg-hr-card border border-hr-border group-hover:border-hr-green/30'
          }`}
        >
          <svg
            className={`w-8 h-8 ${file ? 'text-hr-green' : 'text-hr-muted'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>

        {file ? (
          <>
            <p className="font-medium text-hr-text">{file.name}</p>
            <p className="text-sm text-hr-muted mt-1">
              {(file.size / 1024).toFixed(1)} KB · Click or drop to replace
            </p>
          </>
        ) : (
          <>
            <p className="font-medium text-hr-text">
              Drag & drop your resume PDF
            </p>
            <p className="text-sm text-hr-muted mt-1">or click to browse · Max 10 MB</p>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-hr-danger pointer-events-none">{error}</p>
      )}
    </div>
  )
}

export function GitHubToggle({ enabled, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 rounded-xl border border-hr-border bg-hr-card/50 cursor-pointer hover:border-hr-green/30 transition-colors">
      <div>
        <p className="font-medium text-sm text-hr-text">Include GitHub analysis</p>
        <p className="text-xs text-hr-muted mt-0.5">
          Fetch profile & top repos if GitHub URL is found on resume
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative w-11 h-6 rounded-full transition-colors flex-shrink-0
          ${enabled ? 'bg-hr-green' : 'bg-hr-border'}
        `}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </label>
  )
}
