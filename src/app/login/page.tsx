import { login } from '@/lib/actions/auth'
import Link from 'next/link'
import { Suspense } from 'react'

function LoginForm({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="font-display text-4xl uppercase text-ink">SIGN IN</h2>
          <p className="mt-2 font-mono text-sm text-ink/70">
            Or{' '}
            <Link href="/register" className="font-bold text-coral hover:underline">
              create a new account
            </Link>
          </p>
        </div>

        {searchParams.error && (
          <div className="border-2 border-coral bg-coral/10 p-4">
            <p className="font-mono text-sm text-coral">{decodeURIComponent(searchParams.error)}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" action={login}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-mono text-[11px] font-bold uppercase mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block font-mono text-[11px] font-bold uppercase mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-6 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
            >
              SIGN IN
            </button>
          </div>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="font-mono text-sm text-coral hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <Suspense fallback={<LoginForm searchParams={{}} />}>
      <LoginForm searchParams={searchParams as { error?: string }} />
    </Suspense>
  )
}
