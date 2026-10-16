import type { SupabaseClient } from "@supabase/supabase-js";

/** Ensure the authenticated user has the default private profile row. */
export async function ensureUserProfile(supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (error || typeof userId !== "string" || userId.length === 0) return false;

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId }, { onConflict: "id", ignoreDuplicates: true });

  return !profileError;
}
