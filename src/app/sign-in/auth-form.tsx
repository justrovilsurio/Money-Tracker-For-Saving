"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import EyeIcon from "@/components/ui/eye-icon";
import LayersIcon from "@/components/ui/layers-icon";
import ShieldCheck from "@/components/ui/shield-check";
import { signInAction, signUpAction, type AuthState } from "./actions";

const initialState: AuthState = {};

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, initialState);
  return (
    <form className="auth-form" action={action}>
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete="current-password" maxLength={128} required />
      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      <button className="button button-primary auth-submit" type="submit" disabled={pending}>{pending ? "Signing in…" : "Sign in"}<ArrowNarrowRightIcon size={15} /></button>
      <p className="auth-switch">New to Siklo? <Link href="/sign-up">Create an account</Link></p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initialState);
  return (
    <form className="auth-form" action={action}>
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" maxLength={254} required />
      <label htmlFor="password">Create a password</label>
      <input id="password" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required aria-describedby="password-hint" />
      <small id="password-hint" className="field-hint">Use at least 12 characters. Password managers and paste are supported.</small>
      {state.error ? <p className="form-message form-error" role="alert">{state.error}</p> : null}
      {state.message ? <p className="form-message form-success" role="status">{state.message}</p> : null}
      <button className="button button-primary auth-submit" type="submit" disabled={pending}>{pending ? "Creating account…" : "Create private account"}<ArrowNarrowRightIcon size={15} /></button>
      <p className="auth-switch">Already registered? <Link href="/sign-in">Sign in</Link></p>
    </form>
  );
}

export function AuthFrame({ children, mode }: { children: ReactNode; mode: "sign-in" | "sign-up" }) {
  return (
    <main className="auth-page" id="main-content" tabIndex={-1}>
      <Link href="/" className="brand auth-brand"><span className="brand-mark"><LayersIcon size={18} /></span><span>Siklo<span className="brand-period">.</span></span></Link>
      <section className="auth-card">
        <span className="auth-shield"><ShieldCheck size={19} /></span>
        <p className="eyebrow">YOUR FINANCES STAY PRIVATE</p>
        <h1>{mode === "sign-in" ? "Welcome back" : "Start with a secure account"}</h1>
        <p className="auth-description">{mode === "sign-in" ? "Sign in to continue your cutoff plan." : "Create your personal workspace. Other users cannot see your financial records."}</p>
        {children}
        <div className="auth-privacy"><ShieldCheck size={14} />Supabase Auth · Private account data</div>
      </section>
      <Link className="auth-back" href="/"><EyeIcon size={14} />Back to the sample preview</Link>
    </main>
  );
}
