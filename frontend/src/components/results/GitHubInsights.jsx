import SectionCard from '../ui/SectionCard'
import Badge from '../ui/Badge'

export default function GitHubInsights({ github, status }) {
  if (status === 'skipped') {
    return (
      <SectionCard title="GitHub Insights">
        <p className="text-sm text-hr-muted">
          GitHub analysis was disabled for this run.
        </p>
      </SectionCard>
    )
  }

  if (status === 'not_found') {
    return (
      <SectionCard title="GitHub Insights">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-hr-warning/5 border border-hr-warning/20">
          <span className="text-xl">🔗</span>
          <div>
            <p className="text-sm font-medium text-hr-text">No GitHub profile found</p>
            <p className="text-xs text-hr-muted mt-1">
              Add a GitHub URL to your resume profiles section to enable enrichment.
            </p>
          </div>
        </div>
      </SectionCard>
    )
  }

  if (status === 'rate_limit') {
    return (
      <SectionCard title="GitHub Insights">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-hr-danger/5 border border-hr-danger/20">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-medium text-hr-danger">Rate limit exceeded</p>
            <p className="text-xs text-hr-muted mt-1">
              GitHub API rate limit hit. Evaluation continued without GitHub data.
            </p>
          </div>
        </div>
      </SectionCard>
    )
  }

  if (!github?.profile) return null

  const { profile, projects = [] } = github

  return (
    <SectionCard
      title="GitHub Insights"
      subtitle={`@${profile.username} · Top ${projects.length} repositories`}
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="lg:col-span-1 p-5 rounded-xl bg-hr-surface/80 border border-hr-border/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-hr-green/20 border border-hr-green/30 flex items-center justify-center text-hr-green font-bold">
              {profile.username?.[0]?.toUpperCase() ?? 'G'}
            </div>
            <div>
              <p className="font-semibold text-hr-text">{profile.name}</p>
              <p className="text-xs text-hr-muted">@{profile.username}</p>
            </div>
          </div>
          {profile.bio && (
            <p className="text-sm text-hr-muted mb-4 leading-relaxed">{profile.bio}</p>
          )}
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatBox label="Repos" value={profile.public_repos} />
            <StatBox label="Followers" value={profile.followers} />
            <StatBox label="Following" value={profile.following} />
          </div>
        </div>

        {/* Top repos */}
        <div className="lg:col-span-2 space-y-2">
          {projects.slice(0, 7).map((repo, i) => (
            <RepoRow key={repo.name} repo={repo} rank={i + 1} />
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="p-2 rounded-lg bg-hr-card border border-hr-border/40">
      <p className="text-lg font-bold text-hr-text tabular-nums">{value ?? 0}</p>
      <p className="text-xs text-hr-muted">{label}</p>
    </div>
  )
}

function RepoRow({ repo, rank }) {
  const details = repo.github_details ?? {}
  const isOSS = repo.project_type === 'open_source'

  return (
    <a
      href={repo.github_url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-4 p-3 rounded-xl bg-hr-surface/40 border border-hr-border/30 hover:border-hr-green/30 hover:bg-hr-surface/80 transition-all group"
    >
      <span className="text-xs text-hr-muted w-5 tabular-nums">{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm text-hr-text group-hover:text-hr-green transition-colors truncate">
            {repo.name}
          </span>
          <Badge variant={isOSS ? 'success' : 'default'}>
            {isOSS ? 'Open Source' : 'Self Project'}
          </Badge>
        </div>
        {repo.description && (
          <p className="text-xs text-hr-muted truncate mt-0.5">{repo.description}</p>
        )}
      </div>
      <div className="flex items-center gap-4 text-xs text-hr-muted flex-shrink-0">
        <span title="Stars">★ {details.stars ?? 0}</span>
        <span title="Forks">⑂ {details.forks ?? 0}</span>
        <span title="Your commits" className="text-hr-green">
          {repo.author_commit_count ?? 0} commits
        </span>
      </div>
    </a>
  )
}
