import ScoreCard from '../ui/ScoreCard'

const ORDER = ['open_source', 'self_projects', 'production', 'technical_skills']

export default function CategoryBreakdown({ scores }) {
  if (!scores) return null

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {ORDER.map((key) => {
        const cat = scores[key]
        if (!cat) return null
        return (
          <ScoreCard
            key={key}
            categoryKey={key}
            score={cat.score}
            max={cat.max}
            evidence={cat.evidence}
          />
        )
      })}
    </div>
  )
}
