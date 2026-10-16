import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function createSupabaseServerClient() {
  const env = getSupabasePublicEnv();
  if (!env) throw new Error("Supabase is not configured.");

  const cookieStore = await cookies();

  return createServerClient(env.url, env.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // Auth cookie refresh happens in proxy.ts. Server Components may be read-only.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Next.js can reject cookie writes during Server Component rendering.
        }
      },
    },
  });
}
