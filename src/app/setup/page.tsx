import Link from "next/link";
import ArrowNarrowRightIcon from "@/components/ui/arrow-narrow-right-icon";
import CheckedIcon from "@/components/ui/checked-icon";
import PlugConnectedIcon from "@/components/ui/plug-connected-icon";
import ShieldCheck from "@/components/ui/shield-check";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";

export default function SetupPage() {
  const configured = Boolean(getSupabasePublicEnv());

  return (
    <main className="setup-page" id="main-content" tabIndex={-1}>
      <Link href="/" className="brand setup-brand"><span className="brand-mark"><ShieldCheck size={18} /></span><span>Siklo<span className="brand-period">.</span></span></Link>
      <section className="setup-card">
        <p className="eyebrow">PRIVATE BY DESIGN</p>
        <h1>Connect your secure workspace</h1>
        <p className="setup-intro">Financial records will only load after Supabase Auth and row-level policies are configured.</p>
        <ol className="setup-steps">
          <li><span className="setup-step-icon"><PlugConnectedIcon size={17} /></span><span><strong>Create a Supabase project</strong><small>Keep the project URL and publishable key private to your local environment.</small></span></li>
          <li><span className="setup-step-icon"><ShieldCheck size={17} /></span><span><strong>Apply the database migration</strong><small>It enables RLS and owner-only policies for every financial table.</small></span></li>
          <li className={configured ? "setup-step-complete" : ""}><span className="setup-step-icon"><CheckedIcon size={17} /></span><span><strong>{configured ? "Environment detected" : "Add local environment values"}</strong><small>Copy .env.example to .env.local and enter the Supabase URL and publishable key.</small></span></li>
        </ol>
        <div className="setup-status" role="status"><span className={configured ? "status-dot status-ready" : "status-dot"} />{configured ? "Supabase environment is present. Apply the migration before using financial features." : "Supabase is not connected yet. No financial data is being loaded or stored."}</div>
        <Link className="button button-outline setup-back" href="/"><ArrowNarrowRightIcon size={15} className="icon-rotate-left" />Back to preview</Link>
      </section>
      <p className="setup-footnote">Never paste a service-role key into the browser or a public environment variable.</p>
    </main>
  );
}
