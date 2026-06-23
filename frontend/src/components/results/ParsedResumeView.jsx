import { useState } from 'react'
import SectionCard from '../ui/SectionCard'

const TABS = [
  { id: 'basics', label: 'Basics' },
  { id: 'work', label: 'Work Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
]

export default function ParsedResumeView({ resume }) {
  const [activeTab, setActiveTab] = useState('basics')
  const [expanded, setExpanded] = useState(true)

  if (!resume) return null

  return (
    <SectionCard
      title="Parsed Resume"
      subtitle="Structured data extracted from PDF"
      action={
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-hr-muted hover:text-hr-green transition-colors"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      }
      noPadding
    >
      {expanded && (
        <>
          <div className="flex gap-1 px-4 pt-4 overflow-x-auto border-b border-hr-border/60">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors
                  ${
                    activeTab === tab.id
                      ? 'text-hr-green bg-hr-surface border-b-2 border-hr-green -mb-px'
                      : 'text-hr-muted hover:text-hr-text'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="p-6 animate-fade-in">{renderTab(activeTab, resume)}</div>
        </>
      )}
    </SectionCard>
  )
}

function renderTab(tab, resume) {
  switch (tab) {
    case 'basics':
      return <BasicsTab basics={resume.basics} />
    case 'work':
      return <WorkTab work={resume.work} />
    case 'education':
      return <EducationTab education={resume.education} />
    case 'skills':
      return <SkillsTab skills={resume.skills} />
    case 'projects':
      return <ProjectsTab projects={resume.projects} />
    default:
      return null
  }
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-hr-border/30 last:border-0">
      <span className="text-xs text-hr-muted uppercase tracking-wide sm:w-32 flex-shrink-0">
        {label}
      </span>
      <span className="text-sm text-hr-text">{value}</span>
    </div>
  )
}

function BasicsTab({ basics }) {
  if (!basics) return <EmptyTab />
  const loc = basics.location
  const locationStr = loc
    ? [loc.city, loc.region, loc.countryCode].filter(Boolean).join(', ')
    : null

  return (
    <div className="space-y-1">
      <InfoRow label="Name" value={basics.name} />
      <InfoRow label="Email" value={basics.email} />
      <InfoRow label="Phone" value={basics.phone} />
      <InfoRow label="Location" value={locationStr} />
      {basics.summary && (
        <div className="pt-3">
          <p className="text-xs text-hr-muted uppercase tracking-wide mb-2">Summary</p>
          <p className="text-sm text-hr-text/90 leading-relaxed">{basics.summary}</p>
        </div>
      )}
      {basics.profiles?.length > 0 && (
        <div className="pt-3 flex flex-wrap gap-2">
          {basics.profiles.map((p, i) => (
            <a
              key={i}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1.5 rounded-full bg-hr-surface border border-hr-border text-hr-green hover:border-hr-green/50 transition-colors"
            >
              {p.network}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function WorkTab({ work }) {
  if (!work?.length) return <EmptyTab />
  return (
    <div className="space-y-4">
      {work.map((job, i) => (
        <div key={i} className="p-4 rounded-xl bg-hr-surface/60 border border-hr-border/40">
          <div className="flex flex-wrap justify-between gap-2 mb-2">
            <h4 className="font-semibold text-hr-text">{job.position}</h4>
            <span className="text-xs text-hr-muted">
              {job.startDate} — {job.endDate}
            </span>
          </div>
          <p className="text-sm text-hr-green mb-2">{job.name}</p>
          {job.summary && (
            <p className="text-sm text-hr-muted leading-relaxed">{job.summary}</p>
          )}
          {job.highlights?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {job.highlights.map((h, j) => (
                <li key={j} className="text-xs text-hr-muted flex gap-2">
                  <span className="text-hr-green">•</span> {h}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

function EducationTab({ education }) {
  if (!education?.length) return <EmptyTab />
  return (
    <div className="space-y-3">
      {education.map((edu, i) => (
        <div key={i} className="p-4 rounded-xl bg-hr-surface/60 border border-hr-border/40">
          <h4 className="font-semibold text-hr-text">
            {edu.studyType} in {edu.area}
          </h4>
          <p className="text-sm text-hr-muted">{edu.institution}</p>
          <p className="text-xs text-hr-muted mt-1">
            {edu.startDate} — {edu.endDate}
            {edu.score && ` · ${edu.score}`}
          </p>
        </div>
      ))}
    </div>
  )
}

function SkillsTab({ skills }) {
  if (!skills?.length) return <EmptyTab />
  return (
    <div className="space-y-4">
      {skills.map((cat, i) => (
        <div key={i}>
          <p className="text-xs text-hr-muted uppercase tracking-wide mb-2">{cat.name}</p>
          <div className="flex flex-wrap gap-2">
            {cat.keywords?.map((kw, j) => (
              <span
                key={j}
                className="text-xs px-2.5 py-1 rounded-md bg-hr-card border border-hr-border text-hr-text"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ProjectsTab({ projects }) {
  if (!projects?.length) return <EmptyTab />
  return (
    <div className="space-y-4">
      {projects.map((proj, i) => (
        <div key={i} className="p-4 rounded-xl bg-hr-surface/60 border border-hr-border/40">
          <div className="flex justify-between gap-2">
            <h4 className="font-semibold text-hr-text">{proj.name}</h4>
            {proj.url && (
              <a
                href={proj.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-hr-green hover:underline"
              >
                View
              </a>
            )}
          </div>
          {proj.description && (
            <p className="text-sm text-hr-muted mt-2 leading-relaxed">{proj.description}</p>
          )}
          {proj.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {proj.technologies.map((t, j) => (
                <span
                  key={j}
                  className="text-xs px-2 py-0.5 rounded bg-hr-green/10 text-hr-green"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function EmptyTab() {
  return <p className="text-sm text-hr-muted">No data extracted for this section.</p>
}
