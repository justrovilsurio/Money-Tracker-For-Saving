import Link from "next/link";
import { signOutAction } from "@/app/sign-out/actions";

export function WorkspaceNav({ current }: { current: "overview" | "income" | "bills" | "accounts" | "spending" }) {
  return (
    <nav className="workspace-nav" aria-label="Your money">
      <Link href="/dashboard" aria-current={current === "overview" ? "page" : undefined}>Overview</Link>
      <Link href="/dashboard/income" aria-current={current === "income" ? "page" : undefined}>Cutoff income</Link>
      <Link href="/dashboard/obligations" aria-current={current === "bills" ? "page" : undefined}>Bills &amp; installments</Link>
      <Link href="/dashboard/spending" aria-current={current === "spending" ? "page" : undefined}>Spending</Link>
      <Link href="/dashboard/accounts" aria-current={current === "accounts" ? "page" : undefined}>Accounts</Link>
    </nav>
  );
}

export function WorkspaceSignOut() {
  return (
    <form className="workspace-signout-form" action={signOutAction}>
      <button className="workspace-signout" type="submit">Sign out</button>
    </form>
  );
}

export function WorkspaceHeader({ current }: { current: "overview" | "income" | "bills" | "accounts" | "spending" }) {
  return (
    <header className="workspace-header">
      <Link className="brand" href="/dashboard" aria-label="Siklo dashboard">
        <span className="brand-mark">S</span>
        <span>Siklo<span className="brand-period">.</span></span>
      </Link>
      <WorkspaceNav current={current} />
      <WorkspaceSignOut />
    </header>
  );
}
