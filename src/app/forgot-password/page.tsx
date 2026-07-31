import { resetPassword } from '@/lib/actions/auth'
import Link from 'next/link'
import { Suspense } from 'react'

function ForgotPasswordForm({ searchParams }: { searchParams: { error?: string; success?: string } }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="font-display text-4xl uppercase text-ink">Reset your password</h2>
          <p className="mt-2 font-mono text-sm text-ink/70">
            We'll send you an email with a link to reset your password.
          </p>
        </div>

        {searchParams.error && (
          <div className="border-2 border-coral bg-coral/10 p-4">
            <p className="font-mono text-sm text-coral">{decodeURIComponent(searchParams.error)}</p>
          </div>
        )}

        {searchParams.success && (
          <div className="border-2 border-acid bg-acid/10 p-4">
            <p className="font-mono text-sm text-ink">{decodeURIComponent(searchParams.success)}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" action={resetPassword}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block font-mono text-[11px] font-bold mb-2 uppercase">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 border-2 border-ink font-mono text-sm focus:outline-none focus:border-coral transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-6 py-4 border-2 border-ink bg-ink text-paper font-mono text-sm font-bold uppercase tracking-wide hover:bg-coral hover:border-coral transition"
            >
              Send reset link
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="font-mono text-sm text-coral hover:text-ink font-bold uppercase tracking-wide transition">
              Back to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  return (
    <Suspense fallback={<ForgotPasswordForm searchParams={{}} />}>
      <ForgotPasswordForm searchParams={searchParams as { error?: string; success?: string }} />
    </Suspense>
  )
}
