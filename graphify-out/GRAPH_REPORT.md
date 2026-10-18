# Graph Report - Money Tracker For Saving  (2026-10-18)

## Corpus Check
- 69 files · ~23,579 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 312 nodes · 705 edges · 15 communities (12 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `00738d30`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- layout.tsx
- package.json
- Money Tracker for Savings — Product and Design Brief
- Money Tracker for Savings — Interface Design System
- auth-form.tsx
- compilerOptions
- app/page.tsx
- createSupabaseServerClient
- requireUser
- Siklo — Money Tracker for Savings
- AGENTS.md
- dashboard/page.tsx
- funding-sources/actions.ts

## God Nodes (most connected - your core abstractions)
1. `react` - 29 edges
2. `createSupabaseServerClient()` - 29 edges
3. `getSupabasePublicEnv()` - 24 edges
4. `next` - 21 edges
5. `DashboardPage()` - 20 edges
6. `motion` - 19 edges
7. `AnimatedIconProps` - 19 edges
8. `AnimatedIconHandle` - 19 edges
9. `requireUser()` - 18 edges
10. `Home()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/proxy.ts
- `SignInForm()` --indirect_call--> `signInAction()`  [INFERRED]
  src/app/sign-in/auth-form.tsx → src/app/sign-in/actions.ts
- `SignUpForm()` --indirect_call--> `signUpAction()`  [INFERRED]
  src/app/sign-in/auth-form.tsx → src/app/sign-in/actions.ts
- `AccountsPage()` --calls--> `FundingSourcesPanel()`  [EXTRACTED]
  src/app/dashboard/accounts/page.tsx → src/app/dashboard/funding-sources-panel.tsx
- `AccountsPage()` --calls--> `ArrowNarrowRightIcon`  [EXTRACTED]
  src/app/dashboard/accounts/page.tsx → src/components/ui/arrow-narrow-right-icon.tsx

## Import Cycles
- None detected.

## Communities (15 total, 3 thin omitted)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (39): dependencies, motion, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+31 more)

### Community 2 - "Money Tracker for Savings — Product and Design Brief"
Cohesion: 0.07
Nodes (28): 10. Hosting cost notes (checked 16 Oct 2026), 11. Risks and product guardrails, 12. Security baseline — OWASP Top 10:2025, 13. V1 defaults and decisions, 1. Product goal, 2. Product decisions for v1, 3. Core user journeys, 4. V1 feature scope (+20 more)

### Community 3 - "Money Tracker for Savings — Interface Design System"
Cohesion: 0.11
Nodes (17): Components and interaction, Money Tracker for Savings — Interface Design System, Motion, Page structure, Product feel, References, Tokens, Typography and layout (+9 more)

### Community 4 - "auth-form.tsx"
Cohesion: 0.33
Nodes (7): AuthFrame(), SignInForm(), SignUpForm(), dynamic, SignInPage(), dynamic, SignUpPage()

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.13
Nodes (31): motion, react, bills, Home(), spending, dynamic, SetupPage(), initialState (+23 more)

### Community 7 - "createSupabaseServerClient"
Cohesion: 0.09
Nodes (42): nextConfig, config, proxy(), next, @supabase/ssr, GET(), AccountsPage(), dynamic (+34 more)

### Community 8 - "requireUser"
Cohesion: 0.14
Nodes (19): CutoffIncomeState, incomeSchema, isRealDate(), saveCutoffIncomeAction(), toMinorUnits(), IncomeForm(), initialState, createObligationAction() (+11 more)

### Community 9 - "Siklo — Money Tracker for Savings"
Cohesion: 0.50
Nodes (3): Local setup, Security foundation, Siklo — Money Tracker for Savings

### Community 10 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Canonical project location, graphify, This is NOT the Next.js you know

### Community 11 - "dashboard/page.tsx"
Cohesion: 0.15
Nodes (21): AmountRow, cutoffPeriod(), DashboardPage(), dateInManilaToday(), dynamic, formatDate(), formatMoney(), Income (+13 more)

### Community 13 - "funding-sources/actions.ts"
Cohesion: 0.22
Nodes (15): formatDate(), formatMoney(), fromMinorUnits(), FundingSourceRecord, FundingSourceRow(), FundingSource, FundingSourcesPanel(), initialState (+7 more)

## Knowledge Gaps
- **7 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 138 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `createSupabaseServerClient` to `layout.tsx`, `package.json`, `app/page.tsx`, `requireUser`, `dashboard/page.tsx`, `funding-sources/actions.ts`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Why does `react` connect `app/page.tsx` to `requireUser`, `package.json`, `dashboard/page.tsx`, `funding-sources/actions.ts`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Should `Money Tracker for Savings — Product and Design Brief` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `requireUser`, `dashboard/page.tsx`, `funding-sources/actions.ts`, `app/page.tsx`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Money Tracker for Savings — Interface Design System` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._