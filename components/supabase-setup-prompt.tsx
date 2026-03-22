import { Ghost, ExternalLink } from "lucide-react"

export function SupabaseSetupPrompt() {
  const envExample = `# Copy this file to .env.local and fill in your Supabase values.
# Get them from: https://supabase.com/dashboard/project/_/settings/api

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
`

  return (
    <div className="min-h-screen bg-[var(--ghost-bg-primary)] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-[var(--ghost-accent-primary)]/10 border border-[var(--ghost-accent-primary)]/20">
            <Ghost className="w-8 h-8 text-[var(--ghost-accent-primary)]" />
          </div>
          <span className="text-xl font-semibold">Ghost CRO</span>
        </div>
        <h1 className="text-2xl font-bold text-center mb-2">One-time local setup</h1>
        <p className="text-[var(--ghost-text-muted)] text-center mb-8">
          Supabase isn’t configured for this machine yet. Do this once and you won’t see this again.
        </p>

        <div className="mb-6 p-4 rounded-lg bg-[var(--ghost-accent-primary)]/5 border border-[var(--ghost-accent-primary)]/20">
          <p className="text-sm text-[var(--ghost-text-secondary)]">
            <strong className="text-[var(--ghost-accent-primary)]">Already use Supabase with Vercel?</strong> Copy the same env vars from Vercel (Settings → Environment Variables) or from your Supabase project (Settings → API) into <code className="bg-[var(--ghost-bg-secondary)] px-1 rounded">.env.local</code> in this repo. No new project needed.
          </p>
        </div>

        <ol className="space-y-4 list-decimal list-inside text-[var(--ghost-text-secondary)]">
          <li>
            <strong className="text-white">Create a Supabase project</strong> (free) at{" "}
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--ghost-accent-primary)] hover:underline inline-flex items-center gap-1"
            >
              supabase.com/dashboard
              <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            In the project, go to <strong className="text-white">Settings → API</strong> and copy:
            <ul className="mt-2 ml-4 list-disc text-[var(--ghost-text-muted)] space-y-1">
              <li>Project URL → <code className="text-[var(--ghost-text-secondary)] bg-[var(--ghost-bg-secondary)] px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
              <li>anon public key → <code className="text-[var(--ghost-text-secondary)] bg-[var(--ghost-bg-secondary)] px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
            </ul>
          </li>
          <li>
            In this repo root, create a file named <code className="bg-[var(--ghost-bg-secondary)] px-2 py-0.5 rounded text-[var(--ghost-accent-primary)]">.env.local</code> and paste:
          </li>
        </ol>

        <pre className="mt-4 p-4 rounded-lg bg-[var(--ghost-bg-secondary)] border border-[var(--ghost-border)] text-sm text-[var(--ghost-text-muted)] overflow-x-auto whitespace-pre-wrap font-mono">
          {envExample}
        </pre>
        <p className="mt-2 text-xs text-[var(--ghost-text-subtle)]">
          Replace <code className="text-[var(--ghost-text-muted)]">your-project</code> and <code className="text-[var(--ghost-text-muted)]">your-anon-key</code> with your real values. No quotes needed.
        </p>

        <div className="mt-8 p-4 rounded-lg bg-[var(--ghost-bg-secondary)] border border-[var(--ghost-border)]">
          <p className="text-sm text-[var(--ghost-text-muted)]">
            <strong className="text-white">4.</strong> Restart the dev server (stop with Ctrl+C, then run <code className="bg-[var(--ghost-bg-primary)] px-1 rounded">npm run dev</code> again). Then refresh this page.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--ghost-text-subtle)]">
          More detail in <code className="text-[var(--ghost-text-muted)]">LOCAL_SETUP.md</code> in the repo.
        </p>
      </div>
    </div>
  )
}
