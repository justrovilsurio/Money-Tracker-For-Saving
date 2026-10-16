"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppOrigin } from "@/lib/app-origin";
import { ensureUserProfile } from "@/lib/auth/ensure-user-profile";

export type AuthState = { error?: string; message?: string };

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
}).strict();

const signUpSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(12).max(128),
}).strict();

export async function signInAction(_previousState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Enter a valid email and password." };
  if (!getSupabasePublicEnv()) return { error: "Sign-in is unavailable until Supabase is connected." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Unable to sign in with those details. Check your email and password, then try again." };
  if (!(await ensureUserProfile(supabase))) return { error: "Your account could not be prepared. Please try again." };

  redirect("/dashboard");
}

export async function signUpAction(_previousState: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Use a valid email and a password with at least 12 characters." };

  const env = getSupabasePublicEnv();
  if (!env) return { error: "Account creation is unavailable until Supabase is connected." };

  const supabase = await createSupabaseServerClient();
  const appOrigin = getAppOrigin();
  const { data, error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: new URL("/auth/callback", appOrigin).toString() },
  });

  if (error) return { message: "If this address can be registered, a confirmation email will be sent." };
  if (data.session) {
    if (!(await ensureUserProfile(supabase))) return { message: "Your account was created, but setup could not finish. Please sign in again." };
    redirect("/dashboard");
  }
  return { message: "If this address can be registered, a confirmation email will be sent." };
}
