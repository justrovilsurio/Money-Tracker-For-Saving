# Money Tracker for Savings — Product and Design Brief

**Status:** v1 in implementation; requirements update in progress  
**Working title:** Money Tracker for Savings  
**Primary audience:** People who split monthly income across two pay cutoffs and need to reserve money for bills and installment payments

## 1. Product goal

Help each person answer, for every 15th and 30th (or last day of February) cutoff:

1. How much income was received in this pay period?
2. How much should be set aside now for upcoming card and loan payments?
3. How much has already gone to savings and daily purchases?
4. What amount remains safe to spend?
5. What individual payments are coming due across this calendar year and next year?

This is a planning and tracking tool. It does not connect to banks, initiate payments, or represent a live account balance.

## 2. Product decisions for v1

- Support multiple independent user accounts. Each person sees only their own records. Household sharing is not included in v1.
- Use Supabase Auth and enforce user ownership in Postgres Row Level Security (RLS) on every user-owned table.
- Keep a bill's **actual due date** separate from the **funding cutoff** from which the user plans to reserve money.
- Default funding cutoffs are the 15th and 30th. In February, the second cutoff is the last calendar day. They should be configurable in a user's settings, with these defaults prefilled.
- Income is a single income stream (for example, Salary). Record income, not separate planned and actual amounts. For each month, let the user enter an amount for each cutoff or enter one monthly amount that is split evenly into the two cutoff entries; show the amount assigned to each cutoff.
- Track a card's credit limit and current outstanding balance so available credit is visible. Track loan balance separately as outstanding debt; a loan does not have revolving available credit unless the user explicitly identifies it as a credit line.
- Store each card or loan's default regular payment due date. Each scheduled occurrence keeps its actual due date, separate from the cutoff(s) funding it.
- Keep a payment's due date and amount due separate from its reserve contributions. A single payment can be funded by one cutoff or split into contributions from two cutoffs, with each contribution visible on the relevant cutoff overview.
- Let users record received income for each cutoff and daily purchases and other spending.
- Show the whole calendar year, with year navigation and a visible next-year continuation for plans that cross into January.
- Use PHP as the default display currency, with a currency setting. Amounts are stored as integer minor units (centavos) to avoid floating-point errors.
- Use Asia/Manila for date display and cutoff calculations by default. Store dates as date-only values where possible so a due date does not shift with timezone conversion.

## 3. Core user journeys

### First use

1. Create an account and sign in.
2. Set currency, timezone, and the two monthly cutoff days.
3. Choose whether income is entered by cutoff or as a monthly total split across both cutoffs; record the received amount.
4. Add one or more accounts (for example ShopeePay, MariBank Loan, MariBank CC, another bank, cash, or a custom label).
5. Add cards and loans with a credit limit where applicable, current debt, and payment due date; add each bill or installment payment with its amount due and date.
6. Review the generated cutoff plan and adjust assignments.

### Plan a cutoff

1. Select a cutoff from the year view or dashboard.
2. Review income received, each upcoming payment and its reserve contribution, savings target, and the discretionary amount available before daily purchases.
3. Record savings contributions and daily purchases as they happen.
4. Mark bills paid when payment is made.
5. See remaining-to-spend recalculate from the current cutoff's plan and recorded spending.

### Review the year

1. Pick a calendar year.
2. Scan a Jan–Dec overview with each cutoff's income, planned bill reserves, savings, recorded spending, and remaining amount.
3. Open a cutoff to see the line items and which source they belong to.
4. Move to the adjacent year and review individual payments entered for that year.

## 4. V1 feature scope

### Include

- Email-based account creation, sign-in, sign-out, and password reset.
- Per-user financial profile, currency, timezone, and cutoff-day settings.
- Accounts with a user-defined name and optional type/color/icon.
- Income entries associated with a specific cutoff.
- One-time bill and installment payment entries from any account.
- Single dated payment entries with due date, assigned funding cutoff, amount, and status (planned, paid, skipped).
- Daily purchase/expense entries with date, amount, category, optional source, and note.
- A savings amount/target per cutoff, plus an optional savings transaction to record the actual transfer.
- Calendar-year and cutoff detail views with previous/next navigation.
- Manual creation, editing, deletion, and reassignment of records.
- Responsive desktop and mobile layouts, empty states, validation, and helpful onboarding.
- CSV export of a user's own records as a practical backup.

### Deliberately out of v1

- Bank or credit-card API connections, automatic transaction imports, bill pay, and payment initiation. They add security and provider-integration work that is unnecessary to validate a manual planning workflow.
- Shared household accounts, roles, and invitations. “Public app for multiple users” means separate private accounts in v1; shared budgets can follow if needed.
- Investment tracking, debt payoff recommendations, credit score data, and financial advice.
- Receipt OCR, AI categorization, notifications, and complex analytics.
- A highly animated interaction on every scroll. Financial data needs stable numbers, fast forms, and accessible motion; animation should clarify hierarchy, not delay routine tasks.

## 5. Calculation rules

Use explicit labels and show the inputs behind every total.

For a selected cutoff:

```text
income received = amount entered for this cutoff (or its half of monthly income)
reserve contribution = full amount for a due date before cutoff two; for a payment due on cutoff two/month-end, half from each cutoff
safe-to-spend before purchases = income received - cutoff payment reservations - planned savings
remaining after purchases = safe-to-spend before purchases - recorded purchases in this cutoff period
available credit = credit limit - current outstanding card balance
```

- A payment occurrence is assigned to a due date separately from one or more cutoff reservations. Payments due on the 22nd are reserved in full from the 15th cutoff. Payments due on the 30th or the second cutoff are split as evenly as possible across the 15th and second cutoff, with any odd cent assigned to the second cutoff.
- Daily purchases belong to the cutoff period containing their transaction date: cutoff day 1 spans the 1st through the 15th; cutoff day 2 spans the 16th through the last day of the month.
- Do not subtract a bill twice. A bill reduces the plan once when reserved; its paid status confirms completion but does not create a second expense. If users also enter the payment as a purchase, the UI should flag the likely duplicate or provide a bill-payment transaction type linked to that occurrence.
- Show negative values as an alert with a breakdown, not as a hidden clamp to zero.
- Keep “reserved”, “paid”, and “recorded spending” visually distinct. Never imply the result is a live bank balance.
- Credit limits and balances are manually maintained planning values, not live issuer data. Only show available credit for revolving credit sources; show remaining debt for loans.
- A credit/loan payment due amount is separate from the source's total outstanding balance. Paying a scheduled amount must not silently imply the entire balance was cleared.
- Calendar calculations must handle month ends and leap years (the second default cutoff is the 30th, clamped to February's last day).

## 6. Suggested data model

Use UUID primary keys, `created_at`/`updated_at` timestamps, and `user_id` ownership on every user-owned record. Reference the authenticated user ID, index common filters, and add RLS policies for select/insert/update/delete.

| Table | Purpose | Key fields |
| --- | --- | --- |
| `profiles` | User preferences | `id` (auth user), `currency_code`, `timezone`, `cutoff_day_one`, `cutoff_day_two` |
| `funding_sources` | Banks, cards, loans, wallets, or custom labels | `id`, `user_id`, `name`, `kind`, `credit_limit_minor` (card limit or original loan amount), `current_balance_minor`, `payment_due_date`, `color`, `archived_at` |
| `cutoff_income` | Income received per pay cutoff | `id`, `user_id`, `cutoff_date`, `income_amount_minor`, `note` (one monthly amount creates two cutoff entries) |
| `obligations` | One-time bill or installment payment entry | `id`, `user_id`, `funding_source_id`, `name`, `kind`, `amount_minor` (where fixed), `cadence`, `first_due_date`, `last_due_date`, `active` |
| `payment_occurrences` | One dated bill/installment or card payment due | `id`, `user_id`, `obligation_id`, `due_date`, `funding_cutoff_date` (legacy primary cutoff), `amount_minor` (amount due), `status`, `paid_at` |
| `payment_reservations` | One occurrence's contribution from a cutoff | `id`, `user_id`, `payment_occurrence_id`, `cutoff_date`, `amount_minor` |
| `cutoff_savings` | Planned savings for a cutoff | `id`, `user_id`, `cutoff_date`, `planned_amount_minor`, `actual_amount_minor`, `note` |
| `expenses` | Daily purchases and other spending | `id`, `user_id`, `expense_date`, `amount_minor`, `category`, `funding_source_id` (nullable), `note` |

Each bill or payment entry creates exactly one dated payment occurrence. Users add another entry when the next amount and due date are known; v1 does not automatically create future monthly occurrences. Card and loan debt stays separate from the amount due on a payment entry, and users can edit an occurrence without changing the account debt.

Credit-card statement payments can vary month to month, so their actual amount due must be stored on each payment occurrence; the source's current outstanding balance and credit limit are separate values. Reservation rows allow one payment to be split over multiple cutoffs, and their amounts must sum to the occurrence's amount due. Balances are updated manually by the user; paying a statement amount does not automatically change the saved debt balance.

## 7. Navigation and screens

The root route `/` is a public, signed-out sample preview. It must clearly label every example figure as illustrative and must never present sample data as a user's account. When Supabase verifies an active session, `/` redirects to the private `/dashboard` overview. Private pages share direct navigation to Overview, Cutoff income, Bills & installments, and Accounts. Saved account data is read only from the authenticated user's records.

- **Dashboard:** current/upcoming cutoff summary, received income, payment due dates and reserve contributions, available credit per card, remaining loan debt, savings target/progress, recent purchases, and a clear next action.
- **Year view:** Jan–Dec calendar or timeline with two cutoff markers per month; year switcher; totals at month and cutoff level; individual payment entries in the selected year.
- **Cutoff detail:** income, planned bills/reserves, savings, purchases, actual payment state, and remaining amount with calculation breakdown.
- **Obligations:** list/filter payments by account, due date, and status; add a single dated payment entry and edit its amount.
- **Activity:** purchase and savings records, filters, edit/delete, and CSV export.
- **Settings:** account, currency, timezone, cutoff schedule, and privacy/account controls.

## 8. Visual and interaction direction

### Visual character

Use a calm, confident money-planning interface with the Forest Graphite (`#18251D`) and Acid Mint (`#B7FF72`) palette. Keep the canvas light and neutral, use graphite for primary text and controls, and reserve mint for primary actions, active navigation, and key highlights. Keep amber/red for attention states. Favor clear numerical hierarchy, generous spacing, compact cards, and clean charts.

### Typography

Use General Sans for display headings and Switzer for interface text, labels, and financial figures. Keep numeric values tabular for easy comparison and retain system sans-serif fallbacks if Fontshare is unavailable.

### Mobile-first layout and forms

- Design and validate screens at 320px wide first, then enhance for tablet and desktop. Keep account lists, cutoff summaries, and payment details inside the viewport without horizontal scrolling.
- Group every form label with its own input in a field wrapper; do not rely on CSS grid auto-placement to pair separate labels and controls. Conditional fields must not shift labels onto the wrong inputs.
- Use full-width, at least 44px-tall controls on touch screens. Stack account fields and edit controls on narrow screens; introduce multi-column form grids only when the viewport has enough space.
- Style selects consistently with a clear chevron, adequate right padding, visible keyboard focus, readable option contrast, and native interaction semantics.
- On small screens, keep the brand and Sign out together in the header first row and wrap the four primary page links beneath them in a balanced two-column grid. Keep Sign out separate from the navigation links. Clearly mark the current page with both a visual active state and aria-current="page"; avoid horizontal scrolling.
- Keep numeric inputs readable, allow long account names to wrap, and make action buttons easy to reach without horizontal scrolling.

### Motion
- On the signed-in overview, use a brief staggered entrance when the page loads so its cards and panels settle into view. Keep content readable immediately and avoid long delays.
- Use scroll-driven storytelling on a public landing/onboarding page: sections can reveal the cutoff-planning idea and sample year view as the user moves down the page.
- In the signed-in product, prefer short transitions for opening a cutoff, updating a total, and revealing upcoming payments. Do not make users scroll through a presentation to reach their finances.
- Its Hover provides animated icon components distributed via shadcn CLI and built with Motion. Use a few appropriate icons (for example, calendar, wallet, savings) after checking each component's license and behavior. Do not rely on icons alone for meaning.
- Honor `prefers-reduced-motion`; provide a setting or disable decorative motion when requested. Keep essential information immediately available without animation.
- Ensure focus indicators, keyboard access, sufficient contrast, reduced-motion behavior, and mobile performance.

### Reference

- Animated icon source: [Its Hover Icons](https://www.itshover.com/icons). Treat it as a component source, not a design system; check individual component licensing before copying into the app.

## 9. Recommended implementation stack

- **Next.js App Router + React + TypeScript:** React is already familiar to the user; Next.js provides the application shell, route structure, and a straightforward Vercel deploy.
- **Supabase Auth + Postgres:** Auth supports independent accounts and Postgres fits dated payments and year/cutoff queries. RLS is essential because the app stores private financial records.
- **Supabase server-side client with current SSR guidance:** use server-side session handling and never expose a service-role key to the browser. Keep financial writes behind authenticated server actions/route handlers or an appropriately protected client flow, and enforce RLS regardless.
- **Vercel:** deploy the Next.js frontend and server routes, connect the Git repository, and use preview deployments for changes.
- **Tailwind CSS and shadcn/ui:** fast accessible primitives that can be adapted to the visual direction; use Motion only for deliberate transitions and scroll scenes.
- **Zod or equivalent schema validation:** validate inputs at form and server boundaries. Store money as integer minor units and validate dates in the user's timezone.

### Setup sequence

1. Initialize Next.js with TypeScript, App Router, and Tailwind in this repository.
2. Create a Supabase project and configure local `.env.local` with the project URL and publishable/anon key. Keep secrets out of Git; use the service-role key only server-side if a specific privileged operation requires it.
3. Add the Supabase SSR/browser client helpers and implement sign-in, sign-up, sign-out, and session refresh.
4. Create SQL migrations for the tables, indexes, constraints, and RLS policies. Verify that a second account cannot read or write the first account's data before adding financial UI.
5. Build the cutoff calculation functions as pure, reusable domain code, then show the calculation breakdown in the UI.
6. Add one-payment creation and verify cutoff calculations around month ends and leap years.
7. Build the year, cutoff, obligation, and activity screens; add motion only after layout and calculations are stable.
8. Connect the repository to Vercel, configure production and preview environment variables, and deploy. Set a production auth redirect URL and test signup/reset links against the deployed domain.

## 10. Hosting cost notes (checked 16 Oct 2026)

- Vercel lists Hobby at **$0/month** for personal, non-commercial use and Pro at **$20/month**. Because this product is intended for multiple public users, use Hobby only for a non-commercial prototype; use Pro if the service is operated commercially. Pro includes $20 of monthly usage credit. [Vercel pricing](https://vercel.com/pricing) and [Vercel Hobby terms](https://vercel.com/legal/terms)
- Supabase Free is **$0**, with two free projects, 500 MB database per project, 5 GB egress, 1 GB file storage, and free projects pause after one week of inactivity. That is enough to build and demo a low-volume tracker, but a public production service should plan for Supabase Pro from **$25/month** for a non-pausing project with backups and larger quotas. [Supabase pricing](https://supabase.com/pricing) and [billing docs](https://supabase.com/docs/guides/platform/billing-on-supabase)
- A realistic always-on production starting point is roughly **$45/month** for Supabase Pro plus Vercel Pro. A non-commercial prototype can start at $0 on both Free/Hobby tiers, with Supabase free-project pausing and Vercel's non-commercial-use restriction in mind. Prices are USD before taxes and usage overages; review live pricing before launch.

## 11. Risks and product guardrails

- **Privacy:** enforce RLS in SQL and validate user ownership on writes. Do not rely on hiding data in the client.
- **Incorrect money math:** use integer minor units; centralize calculation rules; expose line-item breakdowns; handle single-payment cutoff edge cases.
- **Data loss:** include export and explain how a user can delete their account/data. Consider scheduled backups when moving beyond prototype use.
- **Over-animated UI:** keep all totals readable without motion and support reduced motion.
- **Installment ambiguity:** the funding cutoff and actual due date are distinct fields and should always be labeled separately.

## 12. Security baseline — OWASP Top 10:2025

This app stores sensitive personal finance records. Treat security as a design and release requirement, not a later hardening pass. The OWASP Top 10 is a risk awareness checklist, not a guarantee that an app is secure. Apply the controls below throughout implementation and review them before every public release.

| OWASP 2025 risk | Required controls for this app |
| --- | --- |
| **A01 Broken Access Control** | Deny by default. Require a verified Supabase identity for every private route and mutation. Enable RLS on every exposed user-owned table and write `SELECT`, `INSERT`, `UPDATE`, and `DELETE` policies using `auth.uid()`. Set `user_id` from the verified identity on the server; never trust a submitted owner ID. Use composite foreign keys that include `user_id` so a user cannot link their row to another user's source/obligation. Recheck ownership for exports and any future admin action. |
| **A02 Security Misconfiguration** | Separate local, preview, and production credentials; keep `.env*` out of Git except `.env.example`. Configure HTTPS, security headers (CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, frame restrictions, and a minimal `Permissions-Policy`), safe auth redirect allowlists, production error handling, and minimal database grants. Review exposed Supabase schemas and functions; do not assume that enabling RLS alone is sufficient. |
| **A03 Software Supply Chain Failures** | Use the package manager lockfile, keep dependencies minimal and current, review package provenance/maintainer and install scripts for new dependencies, and run dependency/security scans in CI and before release. Protect CI secrets; do not execute untrusted pull-request code with production secrets. |
| **A04 Cryptographic Failures** | Use HTTPS in deployment and provider-managed encryption at rest. Never store bank passwords, card numbers, CVVs, or authentication secrets; collect only amounts and user-defined labels. Do not log financial records or auth tokens. Use Supabase's supported SSR cookie session handling and verified tokens; do not move tokens into ad hoc local storage. |
| **A05 Injection** | Validate and normalize all form, URL, server-action, and API input on the server (for example with Zod). Use parameterized Supabase/Postgres APIs. Avoid raw SQL from user input, unsafe HTML rendering, dynamic redirects, and interpolated shell commands. Treat notes, source names, and imported CSV cells as untrusted text. |
| **A06 Insecure Design** | Keep a lightweight threat model and abuse cases: cross-account reads/updates, forged ownership IDs, payment double counting, duplicate submissions, mass assignment, account enumeration, and export abuse. Make access boundaries and money calculations explicit. Add constraints and idempotency where duplicate financial entries would cause harm. |
| **A07 Authentication Failures** | Use Supabase Auth rather than custom password/token code. Verify identity with `getClaims()` or `getUser()` server-side; do not authorize with an unverified `getSession()` result. Apply provider auth rate limits/bot controls, secure recovery links, generic sign-in/reset errors where practical, and appropriate session expiry/revocation behavior. Offer MFA before a broader sensitive launch if available for the chosen account flow. |
| **A08 Software or Data Integrity Failures** | Do not deserialize or execute untrusted code/config. Use reviewed migrations, trusted CI workflows, and lockfile-based installs. Enforce valid amounts, dates, statuses, and relationships with server validation and database constraints. Protect deployment secrets and production data from preview builds. |
| **A09 Security Logging and Alerting Failures** | Record operational/security events such as repeated auth failures, rejected cross-owner operations, export requests, and server errors without logging passwords, tokens, notes, or full financial amounts. Use provider logs/alerts with defined retention and access controls; document who can inspect them. |
| **A10 Mishandling of Exceptional Conditions** | Fail closed when auth, RLS, validation, or database calls fail. Return generic client errors and safe request identifiers; keep stack traces and SQL/provider details server-side. Never show stale private data as current after a failed refresh. Handle duplicate/retried writes predictably and avoid swallowing exceptions. |

### Implementation gates

1. **Before any database-backed UI:** create migrations with RLS and least-privilege grants; no service-role key in browser bundles, client components, public Git, or preview environments.
2. **Before adding a query/mutation:** confirm it works only with the current authenticated user and that related IDs cannot cross account boundaries.
3. **Before deploy:** check headers, environment separation, auth redirect URLs, exposed API objects/grants/RLS, dependency advisories, error/log redaction, and backup/export behavior.
4. **Before inviting users:** do a dedicated security review of auth, RLS, server actions/routes, CSV export, account deletion, and multi-user isolation. OWASP Top 10 coverage alone is not a penetration test or a security guarantee.

The app's first implementation must not silently use demo financial data as a real signed-in user's records. Any preview data must be clearly labeled and isolated from production queries.

## 13. V1 defaults and decisions

- V1 starts in English with PHP and Asia/Manila defaults; currency and timezone remain user-configurable.
- The second monthly cutoff is the 30th, clamped to February's last calendar day (including leap years).
- Track both planned savings and actual savings transfers.
- Include CSV export for a user's own records, protected by the same ownership checks as the rest of the app.
- Accounts should normally be archived. If a user permanently deletes one, linked obligations and future occurrences are deleted; linked expenses remain with the source link cleared. Account deletion cascades through all owned records.
- The app is for multiple users with separate private accounts. Household sharing is out of scope for v1.

## Sources

- [Graphify official repository](https://github.com/Graphify-Labs/graphify)
- [Graphify quickstart](https://docs.graphify.com/quickstart)
- [Vercel pricing](https://vercel.com/pricing)
- [Supabase pricing](https://supabase.com/pricing)
- [Supabase billing docs](https://supabase.com/docs/guides/platform/billing-on-supabase)
- [Its Hover animated icons](https://www.itshover.com/icons)
- [OWASP Top 10:2025](https://top10.owasp.org/2025/0x00_2025-Introduction/)
- [Supabase SSR client guidance](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Supabase API security guidance](https://supabase.com/docs/guides/api/securing-your-api)
- [Next.js Content Security Policy guide](https://nextjs.org/docs/app/guides/content-security-policy)
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)

## Graphify in this repository

The official `graphifyy` CLI and Codex skill are installed. The CLI is installed in the local Codex Python runtime; its `Scripts` directory may not be on a VS Code terminal's `PATH`. If the `graphify` command is unavailable in a terminal, run the executable from the Python `Scripts` directory or install Graphify in the Python environment you use for development. The project skill is under `.codex/skills/graphify/`, with its repository guidance in `AGENTS.md` and hook registration in `.codex/hooks.json`.

Graphify's code mapping is local and AST-based, so it can reduce repeated broad source reads once the application has code. The repository currently has only planning documents, so build the graph after implementation begins. A graph helps navigate code; it does not remove the need to inspect relevant implementation details or validate money rules and RLS. Graphify's optional semantic extraction for non-code content can use a model, so code-only mapping is the cost-conscious workflow.


