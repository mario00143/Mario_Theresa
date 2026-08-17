# Security Checklist (Phase 7 + Phase 8)

Status of each item as of the Phase 7 commit. Items marked **Verified**
were actually exercised against a real Postgres instance during this
phase (not just reasoned about) — see the method noted for each. Items
marked **Pending live environment** could not be exercised because no
live Supabase project credentials were available in the build
environment; the code implementing them is complete and reviewed, but
running against a real hosted Supabase project is the honest final step.

## Secrets

- [x] **No service-role key anywhere in client code.** `src/lib/supabase/client.ts`
      only reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`. Grep
      confirms no other Supabase key pattern appears in `src/`.
- [x] **No secrets committed.** `.env.example` documents only the two public
      values; `.gitignore` already excludes `*.local` (covers `.env.local`).
- [x] **Invite tokens are hashed, never stored raw.** `workspace_invites.token_hash`
      stores `sha256(token)`; the raw token exists only in memory and in the
      one-time copyable link (`src/lib/hashToken.ts`,
      `accept_workspace_invite()` in the RPC migration). Verified: created an
      invite, hashed the same raw token client-side and server-side, confirmed
      they matched, and confirmed a wrong token is rejected by the RPC.
- [x] **Backups never contain credentials.** `WeddingOSBackup` (types/backup.ts)
      has no field for passwords, tokens, or signed URLs; a dedicated test
      (`tests/backupV7.test.ts`) asserts the exported JSON's serialized text
      never contains the substrings "password", "tokenhash", or "signedurl".
- [x] **Audit logs never contain secrets.** `logAuditAction()` call sites only
      pass IDs, role names, and short human-readable summaries — never
      payment amounts' underlying account numbers, tokens, etc. (there are
      none in this app's data model to begin with).

## Row Level Security

- [x] **Every table has RLS enabled.** Verified by running the query in
      `docs/SUPABASE_SETUP.md` step 5 against a local Postgres instance with
      all 12 migrations applied: 61/61 `public` tables have
      `relrowsecurity = true`, 0 without it.
- [x] **RLS is FORCED, not just enabled**, on every table (`alter table ...
      force row level security`) — so even the table owner role is subject
      to the policies, not just other roles.
- [x] **Workspace isolation verified end-to-end**, not just by reading the
      policy SQL: created two real workspaces as two different simulated
      users in a local Postgres instance, confirmed User B cannot see User
      A's workspace, and cannot see a domain row (a vendor) belonging to
      User A's workspace, via direct `select` — not just through the app UI.
- [x] **Role-based write enforcement verified for four representative roles**
      via `supabase/tests/rls_security_tests.sql` (all 10 scenarios pass):
      Viewer blocked from inserting a task; Finance Lead can update a
      payment; Family Editor cannot update a payment; Day-of Operator can
      update a live issue but not workspace settings; a Removed member has
      zero read access; a non-Admin/Couple role cannot self-promote to
      Admin (both the RLS policy and the `enforce_role_assignment_rule`
      trigger were confirmed to independently block this).
- [x] **Role escalation is blocked at two layers**: the `workspace_members`
      UPDATE policy (only Admin/Couple can change a role at all) and the
      `enforce_role_assignment_rule`/`enforce_invite_role_rule` triggers
      (only an existing Admin can grant or invite someone as Admin).
- [x] **No recursive RLS traps.** The helper functions
      (`is_workspace_member`, `has_workspace_role`, `current_user_profile_id`)
      are `SECURITY DEFINER` with a pinned `search_path`, so policies on
      `workspace_members` itself can call them without re-triggering RLS on
      `workspace_members` from inside the function.

## Storage

- [x] **The `documents` bucket is private** (`public = false` in the bucket
      definition, migration `20260101000009_storage.sql`).
- [x] **Storage policies enforce workspace isolation via path prefix** —
      objects are stored at `<workspace_id>/<category>/<uuid>-<filename>`,
      and every storage policy checks `is_workspace_member`/`has_workspace_role`
      against `(storage.foldername(name))[1]`, so a user cannot read or
      write into another workspace's folder even with a guessed path.
- [x] **No permanent public URLs are ever generated.** `getDocumentSignedUrl()`
      (`src/data/supabase/documentRepository.ts`) only ever calls
      `createSignedUrl` with a 10-minute expiry; there is no code path that
      calls `getPublicUrl` or stores a URL anywhere.
- [x] **File type and size are enforced at the bucket level**
      (`allowed_mime_types`, `file_size_limit` on the bucket itself, not just
      client-side validation) — so even a client that skips the app's own
      `validateDocumentFile()` check cannot upload an oversized or
      disallowed file type. Client-side validation
      (`tests/documentValidation.test.ts`) is a UX nicety, not the security
      boundary.
- [x] **Executable file types are rejected** — the allow-list
      (`ALLOWED_DOCUMENT_MIME_TYPES`) contains only PDF/JPG/PNG/DOCX/XLSX/TXT;
      nothing resembling an executable, script, or archive type is present.

## Capacity / race conditions

- [x] **Room and vehicle capacity are enforced at the database level**,
      not just client-side — `enforce_room_capacity()` /
      `enforce_transport_capacity()` triggers on `room_assignments` /
      `transport_assignments` (migration `20260101000011_capacity_triggers.sql`)
      apply to every insert/update regardless of code path.
- [x] **Race condition safety verified with a real concurrent test**: two
      simultaneous `psql` processes raced to insert the last spot in a
      1-capacity room; exactly one succeeded and the other was rejected
      with the capacity-exceeded error — not just reasoned about, actually
      run and observed.

## Authentication / routes

- [x] **Unauthenticated users cannot reach wedding data.** In Supabase
      mode, `App.tsx`'s route tree only renders the main app
      (`WeddingOSApp`) once `session` exists AND a workspace has been
      selected; every other state renders a login/signup/workspace screen
      or a loading splash — verified via a headless-browser walkthrough
      (see manual QA notes) with zero console errors and zero rendering of
      app data pre-auth.
- [x] **No silent fallback to local storage after an auth failure.**
      `AuthProvider`/`WorkspaceProvider` never write app data to the local
      stores when `supabaseEnabled` is true; Demo Mode and Production Mode
      are mutually exclusive based on whether env vars are present, decided
      once at boot, not per-request.
- [ ] **Pending live environment**: testing the actual password-reset email
      delivery and link, and Supabase's own email-confirmation flow,
      requires a live project's outgoing email — the code path
      (`requestPasswordReset`/`completePasswordReset` in `AuthContext.tsx`,
      `ResetPasswordPage.tsx`) is implemented and unit-testable logic is
      covered, but the actual email round-trip was not observed in this
      environment.

## Phase 8: PWA / offline / launch hardening

- [x] **Service worker caching reviewed** — `vite.config.ts`'s Workbox
      config precaches only the built app shell (`js,css,html,svg,png,
      woff2`); no `runtimeCaching` entries are configured at all, so the
      Supabase origin (API responses, auth tokens, signed document URLs,
      financial payloads) is never intercepted or cached by the service
      worker — confirmed by reading the generated `dist/sw.js` after a
      production build.
- [x] **Offline snapshot scope minimized.** `OfflineSnapshot`
      (`src/types/offlineSnapshot.ts`) only contains the explicitly
      spec'd "Critical Read-Only Offline Data" categories (run sheet,
      emergency/vendor contacts, duties, ceremony items, manifests,
      rooming list, VIP/elderly list, open critical issues, closeout,
      venue details) — no payments, no full guest list, no documents.
- [x] **Offline mutation queue is allowlist-only**, enforced at the type
      level (`OfflineMutationEntityAction` is a closed union of exactly 5
      entity/action pairs), not a generic `{table, payload}` bag —
      verified with a dedicated test asserting the allowlist's exact
      membership (`tests/offlineMutationQueue.test.ts`).
- [x] **CSP tested** against a real page load (Playwright, response
      headers overridden to the exact policy in `vercel.json`) across
      the dashboard and several Wedding Day routes — zero console errors,
      confirming self-hosted assets, Supabase `connect-src`, and inline
      styles all still work under the strict policy.
- [x] **Security headers present** in `vercel.json`: X-Content-Type-
      Options, Referrer-Policy, Permissions-Policy, X-Frame-Options, CSP.
- [x] **CSV injection protected** — every CSV export builder now routes
      through one shared, hardened `csvEscape()` (`src/utils/csv.ts`)
      that prefixes any cell starting with `=`, `+`, `-`, or `@` before
      applying standard quoting; this replaced four independently
      duplicated (and unprotected) copies found during this phase's
      review — see `tests/csv.test.ts`.
- [x] **Uploads sanitized** — filename stripped to a safe character set
      and randomized before storage (`buildDocumentStoragePath`,
      unchanged from Phase 7 but now also cross-checked against a file
      extension allow-list, not MIME type alone — a spoofable
      client-reported MIME type is no longer sufficient by itself).
- [x] **Diagnostics redacted** — `DiagnosticsSection.tsx` and
      `ProductionReadinessSection.tsx` render only: version/build
      metadata, connectivity Pass/Fail booleans, timestamps, and counts.
      Neither ever reads or displays `session.access_token`, the anon
      key, or an invite token — confirmed by code review of every field
      rendered in both files.
- [x] **Error logs redacted** — `lib/errorLog.ts` only records
      timestamp/version/route/category/message/mode/online-status; stack
      traces are captured only in dev builds (`import.meta.env.DEV`),
      never in production, to avoid leaking internal paths in an
      exported diagnostic file.
- [x] **Backup excludes auth/session/offline state** — asserted directly
      in `tests/backupHardening.test.ts`: the serialized backup JSON is
      scanned and confirmed to never contain `offlineSnapshot`,
      `offlineMutationQueue`, `errorLog`, `access_token`,
      `refresh_token`, or `anon_key`.
- [x] **Signed URL TTL confirmed within the 5-15 minute recommended
      range** — 10 minutes (`DOCUMENT_SIGNED_URL_TTL_SECONDS` in
      `documentRepository.ts`), unchanged from Phase 7's original choice,
      now with an explicit named constant instead of a bare literal.
- [x] **Open-redirect / auth-redirect handling reviewed.** Every
      post-login `redirectTo` value is constructed entirely from
      first-party app code (`navigate('/join'+location.search)` style),
      never taken verbatim from a raw URL query string, and is passed to
      React Router's `navigate()` — which only ever performs client-side
      SPA routing, never a `window.location.href` assignment — so even a
      contrived `redirectTo` value cannot cause a real browser redirect
      off-site.
- [x] **No `dangerouslySetInnerHTML` anywhere in the codebase** —
      confirmed by a full-repo search; nothing renders raw HTML from
      user-entered notes/free-text fields.
- [ ] **Pending live environment**: sections 18-22's hosted-Supabase-
      specific checks (migrations applied against a real project, RLS
      re-verified against a live database, storage bucket policies live,
      Realtime scope live, auth email round-trips live) could not be run
      for the same reason noted in the Phase 7 section above — no live
      Supabase project credentials were available in this build
      environment. All corresponding code is implemented and was
      validated against a local Postgres instance using the same
      methodology as Phase 7 (see `supabase/tests/rls_security_tests.sql`);
      that is a real check, but it is not a substitute for hosted
      verification, and this checklist does not claim it is.

## Known gaps (honest, not fixed)

- Workspace deletion is intentionally **not implemented** in the UI (no
  delete-workspace button anywhere) — section 70 explicitly allows marking
  a destructive action "unsupported rather than unsafe" when it isn't ready,
  and a safe cascade-confirm flow for deleting an entire wedding's data
  wasn't something this phase had time to build and test to the standard
  the other destructive-delete confirmations in this app meet. A DB-level
  delete policy exists (Admin only) as a defense-in-depth backstop, but
  nothing in the app calls it.
- Permission-aware UI gating (`PermissionGate`) is applied to the new
  Phase 7 surfaces fully, and to a representative sample of existing
  create buttons (Tasks, Guests, Vendors, Run Sheet) as a proven pattern —
  it is **not** applied to every create/edit/delete control across all
  ~40 pre-existing v1-v6 modules. This is a UX completeness gap, not a
  security gap: RLS is authoritative in every case, so a role that
  shouldn't be able to write something cannot actually write it even
  through a control this phase didn't get to hiding.
- Store hydration (`hydrateSyncedStore` in `lib/supabaseSync.ts`) uses
  `select('*')` per collection rather than an explicit column list.
  Reviewed and accepted: every request is already filtered by
  `workspace_id` (not unfiltered), issued once per collection in
  parallel at bootstrap (not per-row, not N+1), and these are narrow
  domain tables, not wide blob columns — rewriting all ~52 call sites to
  explicit column lists was judged higher risk (a missed column silently
  breaking a feature) than benefit at this app's scale.
