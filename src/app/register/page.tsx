import { signup } from '@/lib/actions/auth'
import Link from 'next/link'
import { Suspense, use } from 'react'

function RegisterForm({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="font-display text-4xl uppercase text-ink">CREATE ACCOUNT</h2>
          <p className="mt-2 font-mono text-sm text-ink/70">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-coral hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {searchParams.error && (
          <div className="border-2 border-coral bg-coral/10 p-4">
            <p className="font-mono text-sm text-coral font-bold uppercase mb-1">Error</p>
            <p className="font-mono text-sm text-coral">{decodeURIComponent(searchParams.error)}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" action={signup}>
          <div className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block font-mono text-[11px] font-bold uppercase mb-2">
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral"
                placeholder="John Doe"
              />
            </div>
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
                autoComplete="new-password"
                required
                minLength={6}
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
              CREATE ACCOUNT
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = use(searchParams)
  return (
    <Suspense fallback={<RegisterForm searchParams={{}} />}>
      <RegisterForm searchParams={params as { error?: string }} />
    </Suspense>
  )
}
