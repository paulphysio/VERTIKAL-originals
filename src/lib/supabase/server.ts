import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Standard Supabase SSR server client for use inside Server Components,
// Server Actions, and Route Handlers. If you already created this file in
// Phase 2, keep yours — this is only here so the homepage below has
// something to import while you wire up real data.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // called from a Server Component with no writable cookies — safe to ignore
          }
        },
      },
    }
  );
}
