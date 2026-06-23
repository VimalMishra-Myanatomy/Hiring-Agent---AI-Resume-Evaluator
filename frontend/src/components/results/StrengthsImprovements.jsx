import SectionCard from '../ui/SectionCard'

export default function StrengthsImprovements({ strengths = [], improvements = [] }) {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      <SectionCard title="Key Strengths" noPadding>
        <ul className="p-6 space-y-3">
          {strengths.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-hr-green flex-shrink-0 mt-0.5">✓</span>
              <span className="text-hr-text/90 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="Areas for Improvement" noPadding>
        <ul className="p-6 space-y-3">
          {improvements.map((item, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="text-hr-warning flex-shrink-0 mt-0.5">⚠</span>
              <span className="text-hr-text/90 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  )
}
