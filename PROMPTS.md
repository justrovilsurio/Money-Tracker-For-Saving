# Money Tracker for Savings — Build Prompts

Use these prompts in order. Keep [DESIGN.md](./DESIGN.md) as the product source of truth. Do not ask an agent to build the whole product in one step.

## 1. Project setup and architecture

```text
Read DESIGN.md and inspect the repository before making changes. Set up a Next.js App Router application using React, TypeScript, and Tailwind CSS in this repository. Use a clear src/ structure for app routes, components, domain calculations, Supabase clients, and validation schemas. Add only the dependencies needed for the agreed v1. Create a concise README with local setup and required environment variables. Do not add financial features yet. Keep secrets out of source control. Report the files created and any setup steps I must perform in Supabase or Vercel.
```

## 2. Database, authentication, and privacy

```text
Read DESIGN.md, especially “Security baseline — OWASP Top 10:2025,” and inspect the existing app before changing anything. Implement Supabase Auth using the current official Next.js SSR guidance and SQL migrations for the v1 data model. Verify the server identity with getClaims() or getUser(); do not authorize from an unverified getSession() result. Every exposed user-owned table must have least-privilege grants, RLS enabled, and policies for select, insert, update, and delete. Set ownership from the verified identity, not submitted form data. Add composite ownership-safe foreign keys, constraints, and indexes for cutoff/year queries and duplicate occurrences. Never use a service-role key in browser code or client components. Add a clear setup guide and .env.example without real secrets. Before building finance screens, explain how the controls block cross-account reads/writes, and list any remaining manual Supabase configuration. Do not claim security is complete until all exposed tables/functions and auth flows have been reviewed.
```

## 3. Money calculations and schedule rules

```text
Read DESIGN.md, especially “Calculation rules” and “Suggested data model.” Implement reusable TypeScript domain functions for cutoff date selection, cutoff-period membership, single-payment reserve allocation, planned savings, recorded purchases, and remaining-to-spend calculations. Use integer minor units for money. Handle local date-only values, month ends, leap years, cutoff adjustments, and payment dates across calendar years without auto-generating monthly entries. Keep calculations separate from React components and make the returned breakdown explicit so the UI can explain every total. Identify ambiguous rules instead of silently choosing new behavior.
```

## 4. Product screens

```text
Read DESIGN.md and inspect the current routes, components, and domain functions. Build the dashboard, annual overview, cutoff detail, obligations, activity, and settings screens described in the brief. Prioritize a clear “safe to spend” amount and a visible breakdown of income, bill reserves, savings, and recorded purchases. Make planned, paid, and actual-spending states distinct. Include loading, empty, validation, and error states. Keep every signed-in query scoped to the current user and rely on RLS as a second boundary. Do not add features that are outside v1.
```

## 5. Visual polish and motion

```text
Read DESIGN.md “Visual and interaction direction.” Refine the existing screens into a calm, modern money-planning interface with a strong numeric hierarchy and mobile-first layout. Design at 320px first, group each form label with its control to prevent conditional fields from overlapping, and use consistent accessible select styling with a visible chevron and focus state. Ensure mobile navigation wraps without horizontal scrolling, keeps sign out fully visible, and highlights the current page with an accessible active state. Stack account forms on mobile and enhance to multi-column grids only at wider breakpoints. Use the overview brief staggered page-load entrance consistently on cutoff income, bills and installments, and accounts, including saved rows; keep it short and honor prefers-reduced-motion. On the overview, make Money Left to Spend a sticky, shrinking hero using native CSS animation-timeline: scroll(); reveal Payday Details, Upcoming Payments, and Accounts cards with a noticeable 90px rise, subtle scale-up, blur-to-sharp, and opacity transition using animation-timeline: view(); preserve native touch scrolling and a static visible fallback. On touch devices, add a distinct larger card rise and individual scroll-entry movement for payday cards, payment rows, and account rows so the interface does not depend on hover. Add other motion only where it helps explain navigation or changes in state. Use scroll-driven scenes for the public landing/onboarding story, not as a barrier to routine financial tasks. Use prominent Its Hover icons in summary cards and coordinated hover lift/shadow on the full card content, estimated-spend panel, cutoff cards, upcoming-payment rows, saved cutoff-income rows, bills/installment rows, and account rows without layout shifts. Give saved cutoff-income and bill/installment rows the same card-style border, corner radius, 12px internal padding, and row gap as account cards. Respect prefers-reduced-motion and preserve keyboard access, focus visibility, contrast, and immediate readability. If using Its Hover icons, verify the individual component's license and avoid making an animated icon the only label for an action. Do not change financial calculations while polishing the visuals.
```

## 6. Review before first public release

```text
Review the complete implementation against DESIGN.md and OWASP Top 10:2025. Focus on financial calculation correctness; date boundaries; single-payment creation without recurring schedules; duplicate writes; cross-user access; verified session handling; RLS and grants for every exposed table/view/function; server-side validation; injection/XSS/redirect risks; security headers and auth redirects; secrets and preview/production separation; dependency/supply-chain risks; privacy-safe logs; error handling; CSV export; account deletion; accessibility; and reduced motion. Identify concrete issues with file and line references. Fix issues clearly within v1 scope. Do not broaden the product or claim a security guarantee. Report what was reviewed, what could not be verified without live provider configuration, and exact manual checks needed before inviting users.

```

## 7. Security review for a code change

```text
Review this change against the OWASP Top 10:2025 and the security baseline in DESIGN.md. Trace how identity is verified, how ownership is enforced in database policies/grants, and how untrusted input reaches queries, rendering, redirects, logs, and exports. Look for secrets in client bundles or diffs, unsafe dependency changes, errors that fail open, and missing constraints. Report only concrete findings with severity and file/line references. Do not claim the app is secure based only on this review; state any assumptions or live Supabase/Vercel checks that could not be verified.
```

## 8. Graphify project skill

After Graphify is installed and the project skill is available, ask Codex to build the graph using the installed skill:

```text
$graphify Map this repository's code into the local knowledge graph. Use code-only extraction; do not run semantic extraction on the planning documents.
```

Then ask focused questions against the generated project graph, for example:

```text
$graphify How does a purchase affect the safe-to-spend amount for a cutoff? Trace the calculation from the UI through the domain function and data query.
```

Keep generated graph output out of source control unless it is useful to the team. Graphify maps repository relationships; it does not replace reading code, checking database policies, or validating financial calculations.
