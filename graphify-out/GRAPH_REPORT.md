# Graph Report - Money Tracker For Saving  (2026-10-16)

## Corpus Check
- 68 files · ~22,970 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 308 nodes · 694 edges · 14 communities (12 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3bf9353`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- getSupabasePublicEnv
- package.json
- Money Tracker for Savings — Product and Design Brief
- Money Tracker for Savings — Interface Design System
- auth-form.tsx
- compilerOptions
- app/page.tsx
- createSupabaseServerClient
- Siklo — Money Tracker for Savings
- AGENTS.md
- dashboard/page.tsx
- funding-sources/actions.ts

## God Nodes (most connected - your core abstractions)
1. `createSupabaseServerClient()` - 29 edges
2. `react` - 28 edges
3. `getSupabasePublicEnv()` - 24 edges
4. `next` - 21 edges
5. `motion` - 19 edges
6. `DashboardPage()` - 19 edges
7. `AnimatedIconProps` - 19 edges
8. `AnimatedIconHandle` - 19 edges
9. `requireUser()` - 18 edges
10. `Home()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/proxy.ts
- `FundingSourcesPanel()` --indirect_call--> `createFundingSourceAction()`  [INFERRED]
  src/app/dashboard/funding-sources-panel.tsx → src/app/funding-sources/actions.ts
- `SignUpForm()` --indirect_call--> `signUpAction()`  [INFERRED]
  src/app/sign-in/auth-form.tsx → src/app/sign-in/actions.ts
- `GET()` --calls--> `createSupabaseServerClient()`  [EXTRACTED]
  src/app/auth/callback/route.ts → src/lib/supabase/server.ts
- `AccountsPage()` --calls--> `getSupabasePublicEnv()`  [EXTRACTED]
  src/app/dashboard/accounts/page.tsx → src/lib/supabase/env.ts

## Import Cycles
- None detected.

## Communities (14 total, 2 thin omitted)

### Community 0 - "getSupabasePublicEnv"
Cohesion: 0.12
Nodes (19): nextConfig, config, proxy(), next, @supabase/supabase-js, GET(), metadata, viewport (+11 more)

### Community 1 - "package.json"
Cohesion: 0.05
Nodes (38): dependencies, motion, next, react, react-dom, @supabase/ssr, @supabase/supabase-js, zod (+30 more)

### Community 2 - "Money Tracker for Savings — Product and Design Brief"
Cohesion: 0.07
Nodes (28): 10. Hosting cost notes (checked 16 Oct 2026), 11. Risks and product guardrails, 12. Security baseline — OWASP Top 10:2025, 13. V1 defaults and decisions, 1. Product goal, 2. Product decisions for v1, 3. Core user journeys, 4. V1 feature scope (+20 more)

### Community 3 - "Money Tracker for Savings — Interface Design System"
Cohesion: 0.11
Nodes (17): Components and interaction, Money Tracker for Savings — Interface Design System, Motion, Page structure, Product feel, References, Tokens, Typography and layout (+9 more)

### Community 4 - "auth-form.tsx"
Cohesion: 0.26
Nodes (11): signInAction(), AuthFrame(), initialState, SignInForm(), SignUpForm(), dynamic, SignInPage(), dynamic (+3 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.15
Nodes (27): motion, react, bills, Home(), spending, dynamic, SetupPage(), ScrollProgress() (+19 more)

### Community 7 - "createSupabaseServerClient"
Cohesion: 0.08
Nodes (46): zod, AccountsPage(), dynamic, Profile, FundingSourcesPanel(), CutoffIncomeState, incomeSchema, isRealDate() (+38 more)

### Community 9 - "Siklo — Money Tracker for Savings"
Cohesion: 0.50
Nodes (3): Local setup, Security foundation, Siklo — Money Tracker for Savings

### Community 10 - "AGENTS.md"
Cohesion: 0.50
Nodes (3): Canonical project location, graphify, This is NOT the Next.js you know

### Community 11 - "dashboard/page.tsx"
Cohesion: 0.18
Nodes (18): AmountRow, cutoffPeriod(), DashboardPage(), dateInManilaToday(), dynamic, formatDate(), formatMoney(), Income (+10 more)

### Community 13 - "funding-sources/actions.ts"
Cohesion: 0.23
Nodes (14): formatDate(), formatMoney(), fromMinorUnits(), FundingSourceRecord, FundingSourceRow(), FundingSource, initialState, createFundingSourceAction() (+6 more)

## Knowledge Gaps
- **7 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 136 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `getSupabasePublicEnv` to `package.json`, `auth-form.tsx`, `app/page.tsx`, `createSupabaseServerClient`, `dashboard/page.tsx`, `funding-sources/actions.ts`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getSupabasePublicEnv` be split into smaller, more focused modules?**
  _Cohesion score 0.11612903225806452 - nodes in this community are weakly interconnected._
- **Why does `react` connect `app/page.tsx` to `package.json`, `auth-form.tsx`, `createSupabaseServerClient`, `dashboard/page.tsx`, `funding-sources/actions.ts`?**
  _High betweenness centrality (0.094) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Why does `createSupabaseServerClient()` connect `createSupabaseServerClient` to `getSupabasePublicEnv`, `auth-form.tsx`, `app/page.tsx`, `dashboard/page.tsx`, `funding-sources/actions.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Money Tracker for Savings — Product and Design Brief` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._