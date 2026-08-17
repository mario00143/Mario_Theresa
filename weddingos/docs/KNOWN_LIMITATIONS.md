# Known Limitations

Genuine, unresolved items as of the Phase 8 commit — not a marketing
document. Nothing here is hidden; everything below is either a
deliberate scope decision explained at the time, or something that
simply wasn't finished. Categorized by how much it matters before your
wedding.

## Low risk before the wedding

- **Hosted Supabase verification is pending.** Sections requiring a live
  Supabase project (real migrations applied to a hosted database, live
  RLS re-verification, live storage bucket policies, live Realtime,
  real auth email delivery) could not be run in this build environment —
  no live project credentials were available. Everything is implemented
  and was validated against a local Postgres instance using the same
  methodology proven in Phase 7 (`supabase/tests/rls_security_tests.sql`).
  This is genuinely pending, not fabricated as done — run
  `docs/SUPABASE_SETUP.md` step 5 and `docs/PRODUCTION_SMOKE_TEST.md`
  against your real project once deployed.
- **Actual Vercel deployment was not performed** from this build
  environment (no Vercel CLI/credentials available here either). All
  deployment configuration (`vercel.json`) and `docs/DEPLOYMENT.md` are
  ready; the deploy itself is your next step.
- **`sm`-sized buttons** (32px tall) are used for secondary/dense
  actions throughout the app. This is below the commonly-recommended
  44px minimum touch target. In practice these are supplementary
  actions (not the primary Wedding Day workflow, which uses larger
  controls), and mobile viewport testing at 360/390/430px found no
  functional blocker — but a full touch-target audit wasn't performed.
- **No formal WCAG audit.** This phase fixed the two most impactful,
  concretely-verified accessibility gaps found (print-view chrome
  bleeding onto every printed page; missing focus management in
  Modal/Drawer) rather than running a certified accessibility audit
  tool. Status is not conveyed by color alone (badges always carry
  text), and keyboard navigation/ARIA roles follow standard patterns
  throughout, but this has not been independently audited.
- **`select('*')` used for store hydration** rather than explicit column
  lists — reviewed and accepted, see `docs/SECURITY_CHECKLIST.md`.
- **The remaining ~500KB shared JS chunk** (see Performance in the final
  response) is larger than ideal even after route-level code splitting —
  likely `lucide-react`'s icon set bundled as a shared dependency across
  nearly every module. Per-icon imports across the ~100 files that use
  icons would shrink this further but wasn't attempted this phase.

## Should fix before the wedding (if it applies to you)

- **Seed-id tagging for the Demo Data Cleanup Assistant currently covers
  Tasks, Decisions, Households, and Guests only** — not Logistics,
  Finance, Wedding Prep, or Wedding Day seed records, which still use
  non-deterministic ids from earlier phases and cannot be confidently
  identified after the fact. If your workspace was migrated from Demo
  Mode and still contains fictional logistics/finance/prep/day-of
  content, the Cleanup Assistant will not surface it — review those
  modules manually before relying on the workspace for the real wedding.
- **Only one recovery drill methodology is documented**
  (`docs/BACKUP_RECOVERY.md`) — actually run it yourself at least once;
  reading about it isn't the same as having done it.
- **Review current Supabase Free plan limits and Vercel Hobby plan
  limits/terms** before the wedding specifically — both can change
  independently of this app, and this documentation deliberately avoids
  hard-coding numbers that could go stale.

## Future enhancement (not a blocker)

- **No workspace-delete UI** (carried over from Phase 7) — a DB-level
  Admin-only delete policy exists as a backstop, but no button calls it.
- **Permission-aware UI gating** (hiding controls a role can't use) is
  applied to Phase 7-8 surfaces and a representative sample of
  pre-existing modules, not exhaustively to all ~40 v1-v6 modules — RLS
  is authoritative regardless, so this is a UX polish gap, not a
  security gap.
- **E2E scenarios A-E** from the original spec were exercised as
  targeted integration tests plus manual Playwright-driven QA against a
  live Demo Mode build, not as fully scripted, hosted-Supabase,
  multi-device Playwright suites — the multi-account/multi-device
  scenarios (B, E) specifically need real Supabase credentials and a
  second real session to execute end-to-end, which this build
  environment doesn't have.
- **Install/update floating prompts can visually overlap** on narrow
  mobile viewports in the rare case both an install prompt and an update
  prompt are eligible to show simultaneously — a minor, low-frequency
  cosmetic issue, not a functional one.
