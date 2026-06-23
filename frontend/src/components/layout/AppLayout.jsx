import Header from './Header'
import { BRANDING } from '../../config/branding'

export default function AppLayout({ children, minimalHeader = false }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header minimal={minimalHeader} />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hr-border/40 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-1.5">
          <p className="text-sm text-hr-text">
            Built with ❤️ by{' '}
            <a
              href={BRANDING.linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-hr-green hover:underline underline-offset-2 transition-colors"
            >
              {BRANDING.name}
            </a>
          </p>
          <p className="text-xs text-hr-muted">AI x Developer Tools</p>
        </div>
      </footer>
    </div>
  )
}
