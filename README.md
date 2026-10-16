# Siklo — Money Tracker for Savings

A Next.js app for tracking received income, card and loan payments, manual balances, savings, and purchases across two monthly cutoffs. The public home page is an illustrative preview; it does not display or store anyone's financial data.

## Local setup

1. Install Node.js 20.9 or newer.
2. Install dependencies with `npm ci`.
3. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key. Set `NEXT_PUBLIC_APP_URL` to `http://localhost:3000` locally.
4. Create a Supabase project and apply any unapplied SQL files in `supabase/migrations/` in filename order using the Supabase SQL Editor or Supabase CLI. Do not rerun migrations already applied. The migrations create the private finance tables, automatically create a profile for every Auth user, add secure obligation scheduling, and add manual card/loan balances, income-only cutoff entries, and split payment reservations.
5. In Supabase Auth, set the local Site URL and allow only the exact callback URL `http://localhost:3000/auth/callback`. Use the deployed HTTPS origin for production.
6. Start the development server with `npm run dev` and open `http://localhost:3000`.

Do not commit `.env.local`. The app uses a Supabase **publishable** key in its SSR client; never add a `service_role`/secret key to a `NEXT_PUBLIC_` variable or browser code.

## Security foundation

- Database migrations enable and force RLS on every user-owned table, including cutoff payment reservations. Grants are limited to authenticated users; each operation has an owner policy.
- Composite foreign keys prevent linking a row to another user's account or obligation.
- The Next.js Proxy refreshes cookie sessions and emits a per-request nonce-based CSP. Sensitive routes verify token claims server-side.
- Auth actions validate fields on the server, use generic sign-in errors, and do not accept caller-controlled redirect URLs.
- The setup page and landing preview do not query financial tables. Do not add private queries until the Supabase migration and Auth configuration are applied.

See `DESIGN.md` for the product and OWASP Top 10:2025 security baseline, and `PROMPTS.md` for implementation prompts. Graphify's Codex skill and project guidance are in `.codex/skills/graphify/` and `AGENTS.md`.
