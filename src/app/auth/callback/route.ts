import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/app-origin";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const env = getSupabasePublicEnv();
  const appOrigin = getAppOrigin();
  if (!code || !env) {
    return NextResponse.redirect(new URL("/sign-in?status=link-error", appOrigin));
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?status=link-error", appOrigin));
  }

  if (!(await ensureUserProfile(supabase))) {
    return NextResponse.redirect(new URL("/sign-in?status=profile-error", appOrigin));
  }

  // Do not accept a user-provided next/redirect URL: this prevents open redirects.
  return NextResponse.redirect(new URL("/dashboard", appOrigin));
}
