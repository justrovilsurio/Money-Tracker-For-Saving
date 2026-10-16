# Graph Report - Money Tracker For Saving  (2026-10-16)

## Corpus Check
- 67 files · ~22,532 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 3 file(s) not represented in the graph (top: .example 1, (none) 1, .css 1)

## Summary
- 304 nodes · 671 edges · 16 communities (13 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `03933825`
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
- obligations/page.tsx
- layout.tsx
- Siklo — Money Tracker for Savings
- AGENTS.md
- dashboard/page.tsx
- funding-sources/actions.ts
- income/actions.ts

## God Nodes (most connected - your core abstractions)
1. `react` - 28 edges
2. `createSupabaseServerClient()` - 27 edges
3. `getSupabasePublicEnv()` - 22 edges
4. `next` - 20 edges
5. `motion` - 19 edges
6. `DashboardPage()` - 19 edges
7. `AnimatedIconProps` - 19 edges
8. `AnimatedIconHandle` - 19 edges
9. `Home()` - 16 edges
10. `requireUser()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `proxy()` --calls--> `updateSession()`  [EXTRACTED]
  proxy.ts → src/lib/supabase/proxy.ts
- `SignInForm()` --indirect_call--> `signInAction()`  [INFERRED]
  src/app/sign-in/auth-form.tsx → src/app/sign-in/actions.ts
- `SignUpForm()` --indirect_call--> `signUpAction()`  [INFERRED]
  src/app/sign-in/auth-form.tsx → src/app/sign-in/actions.ts
- `FundingSourceRow()` --indirect_call--> `updateFundingSourceAction()`  [INFERRED]
  src/app/dashboard/funding-source-row.tsx → src/app/funding-sources/actions.ts
- `FundingSourcesPanel()` --indirect_call--> `createFundingSourceAction()`  [INFERRED]
  src/app/dashboard/funding-sources-panel.tsx → src/app/funding-sources/actions.ts

## Import Cycles
- None detected.

## Communities (16 total, 3 thin omitted)

### Community 0 - "getSupabasePublicEnv"
Cohesion: 0.11
Nodes (29): nextConfig, config, proxy(), next, @supabase/ssr, GET(), CutoffIncomePage(), dateInManilaToday() (+21 more)

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
Cohesion: 0.18
Nodes (17): dynamic, SetupPage(), AuthState, AuthFrame(), initialState, SignInForm(), SignUpForm(), dynamic (+9 more)

### Community 5 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 6 - "app/page.tsx"
Cohesion: 0.17
Nodes (22): motion, react, bills, Home(), spending, ScrollProgress(), ArrowNarrowDownIcon, ArrowNarrowUpIcon (+14 more)

### Community 7 - "obligations/page.tsx"
Cohesion: 0.15
Nodes (21): createObligationAction(), isRealDate(), ObligationState, occurrenceAmountSchema, paymentSchema, toMinorUnits(), updateOccurrenceAmountAction(), initialState (+13 more)

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
Cohesion: 0.22
Nodes (15): formatDate(), formatMoney(), fromMinorUnits(), FundingSourceRecord, FundingSourceRow(), FundingSource, FundingSourcesPanel(), initialState (+7 more)

### Community 14 - "income/actions.ts"
Cohesion: 0.31
Nodes (8): zod, CutoffIncomeState, incomeSchema, isRealDate(), saveCutoffIncomeAction(), toMinorUnits(), IncomeForm(), initialState

## Knowledge Gaps
- **7 isolated node(s):** `react-dom`, `@tailwindcss/postcss`, `@types/node`, `@types/react`, `@types/react-dom` (+2 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 134 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `next` connect `getSupabasePublicEnv` to `package.json`, `auth-form.tsx`, `app/page.tsx`, `obligations/page.tsx`, `layout.tsx`, `dashboard/page.tsx`, `funding-sources/actions.ts`, `income/actions.ts`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `react-dom`, `@tailwindcss/postcss`, `@types/node` to the rest of the system?**
  _7 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getSupabasePublicEnv` be split into smaller, more focused modules?**
  _Cohesion score 0.11498257839721254 - nodes in this community are weakly interconnected._
- **Why does `react` connect `app/page.tsx` to `package.json`, `auth-form.tsx`, `obligations/page.tsx`, `dashboard/page.tsx`, `funding-sources/actions.ts`, `income/actions.ts`?**
  _High betweenness centrality (0.097) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Why does `createSupabaseServerClient()` connect `getSupabasePublicEnv` to `app/page.tsx`, `obligations/page.tsx`, `dashboard/page.tsx`, `funding-sources/actions.ts`, `income/actions.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Money Tracker for Savings — Product and Design Brief` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._