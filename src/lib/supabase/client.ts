"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const env = getSupabasePublicEnv();
  if (!env) throw new Error("Supabase is not configured.");
  return createBrowserClient(env.url, env.publishableKey);
}
