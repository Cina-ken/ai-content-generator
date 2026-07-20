# AI Content Generator — Project Spec

Working name: **ContentForge** (placeholder — rename freely; update `package.json` "name", the README title, and any UI branding text if you do).

## Context

This replaces a fake "AI Content Generator" placeholder card in the `kenneth-dev` portfolio (`Desktop\Kenneth-dev`, live at `kenneth-dev-alpha.vercel.app`) — a template project with a stock photo, a dead demo link (`#`), and a generic GitHub-profile link, never actually built. The pattern being followed: MarketCap already replaced one such placeholder with a real, working, deployed app (repo: `github.com/Cina-ken/Market_Cap`, live: `marketcap-jade.vercel.app`). This project does the same for the "AI Content Generator" card — reusing MarketCap's proven auth/billing plumbing wherever it fits, rather than reinventing it.

## Visual direction

Reference mockups (rough directional references, not pixel specs — build with real Tailwind/React, don't try to clone this markup) at `design-reference/`:
- `landing-page.png` / `landing-page.html` — the public landing page with the live demo
- `generate-screen.png` / `generate-screen.html` — the authenticated `/generate` screen

Palette (dark theme, matching MarketCap and the kenneth-dev portfolio so all three read as one body of work):
- Page/card background: `#0b0f1a`, secondary panel fill `#161b29`, hairline borders `rgba(255,255,255,0.08–0.12)`
- Primary accent (buttons, active states): `#4f5bd5` (indigo)
- Secondary accent (highlights, streaming cursor, links): `#7f77dd` (purple)
- Body text `#d7d8e4` / `#e5e6ee`, secondary text `#9698a8` / `#8688a0`, muted/placeholder text `#6f7186`
- Corner radius: 7-8px on controls, 10-12px on cards, full-round on pills/avatars
- Icons: Tabler outline icon set (`ti ti-*`), 12-20px

Layout patterns worth keeping consistent across screens: the format/content-type selector as pill buttons (not a dropdown, except the smaller "content type" select in the sidebar), the quota bar always visible at the top when authenticated, action buttons (Copy/Save) directly under generated output rather than in a menu, and a streaming-cursor indicator (a thin vertical bar) after in-progress output text.

## Scope — what's in, what's deliberately cut

**In:** one generator screen, a handful of content types via a dropdown, streamed AI output, a free-tier monthly quota, Stripe subscription for unlimited, a simple inline history list, a public landing-page demo that works without signing in.

**Out (don't build these — this is a minimal, real, portfolio-scoped project, not a SaaS clone):** team/multi-user accounts, a public developer API, export formats (PDF/DOCX), a prompt-template marketplace, editing/regeneration threads, admin dashboard. If you find yourself building any of these, stop — it's scope creep.

## Core user flow

1. Visitor lands on `/`, sees a live limited demo (no login) — picks a content type, types a topic, clicks Generate, watches text stream in. Proves the product in ~10 seconds.
2. To save output / get more than the demo's 1-shot limit, they sign up (Supabase auth, email/password — same pattern as MarketCap).
3. Logged in, `/generate` is the main screen: form on one side (content type, topic, tone), streamed output on the other, with a running "X of 5 free this month" counter and an inline history list below.
4. Hit the free quota → a paywall card appears inline (not a jarring error) offering unlimited generations via Stripe Checkout.
5. Subscribed users skip the quota check entirely.

## Architecture

```
Next.js App Router (Vercel)
├─ src/app/page.tsx                    → landing page, public, includes the live limited demo
├─ src/app/generate/page.tsx           → main authenticated app screen (form + streamed output + history)
├─ src/app/pricing/page.tsx            → upgrade page (reuse MarketCap's pricing page structure)
├─ src/app/login/page.tsx, signup/page.tsx  → reuse MarketCap's AuthCard pattern directly
├─ src/app/api/generate/route.ts       → POST, streams AI output (Vercel AI SDK), checks/increments quota atomically before calling the model
├─ src/app/api/stripe/webhook/route.ts → reuse MarketCap's webhook handler almost verbatim
├─ src/lib/supabase/{server,client,middleware,admin}.ts → copy from MarketCap as-is, this plumbing doesn't change
├─ src/lib/stripe.ts, billing-actions.ts, subscription-sync.ts → copy from MarketCap, swap the price ID
├─ src/lib/quota.ts                    → the one genuinely new piece of infrastructure (see "Hard problem" below)
├─ src/lib/generate.ts                 → content-type → system-prompt mapping (the "product" logic)
└─ src/proxy.ts                        → copy from MarketCap as-is (Next.js 16 proxy convention, not middleware.ts — see MarketCap's README for why)

Supabase (Postgres + Auth) — NEW Supabase project, don't reuse MarketCap's
├─ auth.users                          → email/password auth
├─ generations (id, user_id, content_type, prompt, output, created_at)  — RLS: user_id = auth.uid()
├─ quota_counters (user_id, month, count)  — RLS: user_id = auth.uid(), service-role writes only
└─ subscriptions (same exact shape as MarketCap's)  — RLS: user_id = auth.uid(), service-role writes only
```

## Tech stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, RLS) · Stripe · **Vercel AI SDK** (`ai` package) + **OpenAI** (`@ai-sdk/openai`, model: `gpt-4o-mini` — cheap, fast, good enough for this) · Vitest · GitHub Actions · Vercel

New dependency vs. MarketCap: `ai` and `@ai-sdk/openai`. Everything else is the same stack, on purpose — keeps the portfolio's tech story coherent across projects.

## The hard technical problem (this project's README needs one, same as MarketCap's Finnhub/Twelve Data section)

**Quota checking has a check-then-act race condition.** If a user fires two generation requests close together, both requests could read "4 of 5 used" before either one writes back "5 of 5" — letting them slip past the free-tier cap. Worse, since each generation call costs real money (OpenAI tokens), an uncapped race is a real financial exposure, not just a fairness bug.

**Fix:** don't do `SELECT count` then `INSERT` as two separate steps. Use a single atomic Postgres operation — an `UPDATE quota_counters SET count = count + 1 WHERE user_id = $1 AND month = $2 AND count < 5 RETURNING count` (or a `plpgsql` function via Supabase RPC). If the `UPDATE` returns zero rows, the quota was already exhausted — reject the request *before* calling OpenAI. This is the same class of problem as MarketCap's `getAggregateHistory` (get the failure-handling right or it's either silently wrong or breaks completely) — write this section of the README the same way: what could go wrong, what you chose, why.

## Step-by-step implementation plan

1. `npx create-next-app` (TypeScript, Tailwind, App Router, src/ directory) into this folder.
2. Create a **new** Supabase project (don't reuse MarketCap's — keep data/billing fully separate). Get URL + anon key + service role key.
3. Copy `src/lib/supabase/{server,client,middleware,admin}.ts` and `src/proxy.ts` from `Desktop\Market_Cap` verbatim — this plumbing is project-agnostic.
4. Write the SQL for `generations`, `quota_counters`, `subscriptions` tables + RLS policies. Run in the Supabase SQL editor.
5. Write the atomic quota-check RPC function (see "Hard problem" above). Test it directly in the SQL editor with concurrent-looking calls before wiring up the app.
6. Set up a new Stripe product/price (test mode) for "unlimited generations." Copy `src/lib/stripe.ts`, `billing-actions.ts`, `subscription-sync.ts`, and the webhook route from MarketCap, swap in the new price ID.
7. Build `src/app/api/generate/route.ts`: check quota (or subscription status) → call OpenAI via Vercel AI SDK's `streamText` → return a streaming `Response` → increment quota on success only (don't charge quota for a failed generation).
8. Build the landing page (`/`) with the public demo — this one should NOT require auth or touch the database; cap it client-side or with a short-lived cookie/IP-based limit to prevent abuse, since it's unauthenticated.
9. Build `/generate` — the form, the streamed output pane (Vercel AI SDK's `useCompletion` or `useChat` hook), the quota counter, the inline history list (fetch last 10 `generations` rows for the user).
10. Build `/pricing` — reuse MarketCap's pricing page layout/structure directly, change the copy.
11. Wire the "quota exceeded" state in `/generate` to show an inline upgrade card instead of a plain error.
12. Auth pages (`/login`, `/signup`) — copy MarketCap's `AuthCard` component and adapt.
13. Tests (Vitest): the quota RPC logic (mocked Supabase client, same mocking pattern as MarketCap's `watchlist.test.ts`), the content-type → prompt mapping in `generate.ts`.
14. `.github/workflows/ci.yml` — copy MarketCap's, adjust env var names.
15. README — architecture overview, the quota race-condition section, screenshots, setup instructions. Same structure as MarketCap's.
16. Deploy to Vercel. **Connect the GitHub repo from the start this time** (`vercel git connect` or via the dashboard) — don't repeat MarketCap's mistake of deploying manually via CLI for weeks before connecting git.
17. Verify end-to-end for real: sign up a real test user, generate real content (confirm streaming works, not just a single blob response), exhaust the quota and confirm the paywall appears, run a real Stripe test-mode checkout, verify the webhook with `stripe listen` + `stripe trigger` (same process used for MarketCap), confirm the subscription actually unlocks unlimited generations.
18. Update the `kenneth-dev` portfolio: swap the placeholder "AI Content Generator" card's image/description/links for the real project, same way MarketCap's card was done.

## Verification checklist (don't call it done without these)

- [ ] Streaming actually streams (visible token-by-token output), not a single delayed response.
- [ ] Quota correctly blocks the 6th free generation in a month.
- [ ] Quota resets the following calendar month.
- [ ] Two rapid concurrent generation requests near the quota boundary don't both succeed (this is the one to actually try to break — send two requests back to back at "4 of 5 used" and confirm only one succeeds).
- [ ] Stripe test-mode checkout → webhook → subscription status flips to `active` → quota check is bypassed.
- [ ] RLS confirmed: one test user cannot see another's `generations` rows.
- [ ] Public landing-page demo works logged out, and doesn't allow unlimited free generations via repeated requests (rate-limited even without auth).
- [ ] `npm run lint`, `npm test`, `npm run build` all pass, wired into CI.
