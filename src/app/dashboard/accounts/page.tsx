import Link from "next/link";
import { redirect } from "next/navigation";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import { FundingSourcesPanel, type FundingSource } from "@/app/dashboard/funding-sources-panel";
import { WorkspaceHeader } from "@/app/dashboard/workspace-nav";
import { requireUser } from "@/lib/auth/require-user";
import { getSupabasePublicEnv } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Profile = { currency_code: string };

export default async function AccountsPage() {
  if (!getSupabasePublicEnv()) redirect("/setup");
  const { userId } = await requireUser();
  const supabase = await createSupabaseServerClient();
  const [{ data: profileData }, { data, error }] = await Promise.all([
    supabase.from("profiles").select("currency_code").eq("id", userId).maybeSingle(),
    supabase.from("funding_sources")
      .select("id, name, kind, credit_limit_minor, current_balance_minor, payment_due_date, created_at")
      .eq("user_id", userId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
  ]);
  const profile = profileData as Profile | null;
  const sources = (data ?? []) as FundingSource[];

  return (
    <main className="setup-page" id="main-content" tabIndex={-1}>
      <WorkspaceHeader current="accounts" />
      <section className="setup-card accounts-card">
        <Link className="income-back" href="/dashboard"><ArrowNarrowRightIcon size={14} className="icon-rotate-left" />Back to overview</Link>
        <p className="eyebrow">YOUR ACCOUNTS</p>
        <h1>Manage your accounts.</h1>
        <p className="setup-intro">Add banks, cards, loans, wallets, or cash accounts, then keep their balances and payment details up to date.</p>
        <FundingSourcesPanel sources={sources} loadError={Boolean(error)} currencyCode={profile?.currency_code ?? "PHP"} showHeading={false} />
      </section>
    </main>
  );
}
