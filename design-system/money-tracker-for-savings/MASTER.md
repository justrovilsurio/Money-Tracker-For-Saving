# Money Tracker for Savings — Interface Design System

This project uses a light-first, accessibility-first adaptation of the UI Pro Max search for a personal finance dashboard. The source search suggested a modern product-demo layout, subtle scroll reveal, and trust-blue/green colors. The dark glassmorphism option is not used for primary data surfaces because financial tables and amounts need stable contrast and clear grouping.

## Product feel

- Calm, clear, private, and practical.
- Users should understand the cutoff calculation at a glance.
- Use motion to show navigation/state changes; never delay access to money data.

## Tokens

| Role | Token | Value |
| --- | --- | --- |
| Page canvas | `--background` | `#F3F6F1` |
| Main surface | `--surface` | `#FFFFFF` |
| Primary text | `--foreground` | `#18251D` |
| Secondary text | `--muted-foreground` | `#526157` |
| Primary / trust | `--primary` | `#18251D` |
| Action / active | `--accent` | `#B7FF72` |
| Positive / savings | `--positive` | `#315E3E` |
| Attention | `--warning` | `#A16207` |
| Error | `--destructive` | `#B42318` |
| Borders | `--border` | `#D8E2D7` |
| Focus ring | `--ring` | `#315E3E` |

Use semantic tokens, not per-component hex values. Verify text contrast at 4.5:1 for normal text; do not use color alone to show paid/overdue/positive state.

## Typography and layout

- Use General Sans for display headings and Switzer for interface text and financial figures, with system fallbacks; keep financial values tabular and aligned.
- Body text at 16px or larger, line height around 1.5. Headings use a compact, clear scale.
- Use a consistent 4/8px spacing rhythm and a readable content width around 1200px.
- Mobile first: no horizontal scrolling at 375px; collapse navigation and card grids deliberately.

## Components and interaction

- Use semantic HTML, visible labels, inline errors, clear loading feedback, and visible keyboard focus.
- Interactive controls should have comfortable 44px minimum targets where practical.
- Use animated icon components sourced from Its Hover where they fit the established interface; decorative icons are hidden from assistive technology, and icon-only actions need accessible names. Do not introduce Lucide icons.
- Charts and status use text/labels in addition to color.
- Prefer solid surfaces for tables and calculations. Reserve blur/glass effects for decorative overlays only.

## Motion

- Motion dial: 6/10. Keep ordinary control transitions short; use the pronounced overview scroll reveal and restrained page entrance for content hierarchy.
- Use the same brief page entrance on the overview and signed-in management pages, including cutoff income, bills and installments, accounts, and authentication. Keep forms and saved rows readable immediately. Saved payment and account rows may reveal as they enter view, with a short rise and opacity transition.
- On the public illustrative preview and signed-in overview, roll the prominent money values on page entry and value changes with transform-only odometer tracks; preserve accessible formatted values and disable the roll for reduced motion. On the overview, use native CSS scroll-driven animation for a sticky, compacting spend hero and pronounced viewport-entry reveals on Payday Details, Upcoming Payments, and Accounts using upward movement, a subtle scale-up, blur-to-sharp, and opacity. On touch screens, give payday cards, payment rows, and account rows their own scroll-entry movement because hover is unavailable. Preserve native document scrolling; keep content static and visible for unsupported browsers and reduced-motion preferences.
- Honor `prefers-reduced-motion`; reduced-motion users see final states without animation.
- Animate `opacity` and `transform`; avoid layout-changing animation for money values.
- Summary-card hover moves the whole card and its contents together; Its Hover icons use a larger 34px/52px treatment. Reuse a subtle lift and shadow for the estimated-spend panel, both cutoff cards, payment rows, saved cutoff-income rows, bills/installment rows, and account rows. Never trigger reflow, and keep transitions minimal for reduced-motion users. Saved cutoff-income and payment rows use the same card treatment as account rows: 12px internal padding, rounded borders, and even spacing between rows.

## Page structure

- Public `/`: clearly labeled sample preview for signed-out visitors. The figures are illustrative and never represent a user's records. A verified signed-in visitor is redirected to `/dashboard`.
- Private `/dashboard`: current cutoff summary and saved upcoming payments, with persistent navigation to overview, cutoff income, bills and installments, and accounts. Every private page uses the authenticated user's Supabase data only.
- Accounts `/dashboard/accounts`: create and update saved banks, cards, loans, wallets, and cash accounts. The overview keeps a read-only list of account rows.
- Cutoff income `/dashboard/income`: saved and editable income plans by cutoff.
- Bills and installments `/dashboard/obligations`: saved schedules and individual due dates, including the funding cutoff.
- Dashboard: current cutoff balance summary, reserved bills, savings, recent activity, and next action.
- Year plan: twelve months with two cutoff markers each and a year switcher.
- Cutoff detail: income → bill reserve → savings → purchases → remaining-to-spend breakdown.
- Forms: short, labeled, and grouped by user intent; errors appear beside fields.

## References

- Product and security requirements: [`DESIGN.md`](../../DESIGN.md)
- Interaction prompts: [`PROMPTS.md`](../../PROMPTS.md)
- Search source: UI Pro Max design-system result for “personal finance money management dashboard calm modern” (light-first adaptation noted above).
