import Link from "next/link";
import { signOutAction } from "@/app/sign-out/actions";

export function WorkspaceNav({ current }: { current: "overview" | "income" | "bills" }) {
  return (
    <nav className="workspace-nav" aria-label="Your money">
      <Link href="/dashboard" aria-current={current === "overview" ? "page" : undefined}>Overview</Link>
      <Link href="/dashboard/income" aria-current={current === "income" ? "page" : undefined}>Cutoff income</Link>
      <Link href="/dashboard/obligations" aria-current={current === "bills" ? "page" : undefined}>Bills &amp; installments</Link>
      <Link href="/dashboard#sources-heading">Accounts</Link>
      <form action={signOutAction}><button className="workspace-signout" type="submit">Sign out</button></form>
    </nav>
  );
}
