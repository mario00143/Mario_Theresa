# Production Smoke Test (10-15 minutes)

Run this once right after a production deploy, and again after any
significant update. It's a walk-through, not a formal test suite — the
goal is catching an obviously broken deploy before real people rely on it.

Use a real phone for the mobile/PWA steps, not just a resized browser
window.

- [ ] **Site loads** — open your production URL. No blank page, no
      console errors visible if you check devtools.
- [ ] **Login** — sign in with a real account (or sign up a fresh test
      account if this is the very first deploy).
- [ ] **Workspace** — you land in a workspace (or the create-workspace
      screen on a first-ever sign-in). The Dashboard renders with real
      counts, not placeholders.
- [ ] **Create a task** — Tasks → add one, confirm it appears in the list
      and the count updates.
- [ ] **Create a guest** — Guests → add one to an existing or new
      household, confirm it appears.
- [ ] **Logistics** — open a travel/hotel/transport record, confirm it
      loads and can be edited.
- [ ] **Finance** — open Vendors & Budget, confirm budget/payment figures
      render (if your role can see them).
- [ ] **Wedding Prep** — open any Wedding Prep module, confirm readiness
      percentages render.
- [ ] **Wedding Day** — open Command Center, confirm it loads without
      error even before the wedding date.
- [ ] **Document upload** — Documents → upload a small PDF, confirm it
      appears and a preview/download link opens it.
- [ ] **Backup** — Settings → Backup → download a backup, confirm the
      file downloads and opens as valid JSON.
- [ ] **Offline Pack** — Wedding Day → Offline Pack → Refresh Offline
      Pack, confirm it shows "Offline Pack Ready" with a fresh timestamp.
- [ ] **Diagnostics** — Settings → Diagnostics (Admin) → Run System Check,
      confirm Auth/Database/Storage all show Pass.
- [ ] **Mobile PWA install** — on your phone, open the production URL in
      Chrome (Android) or Safari (iOS); confirm the Install prompt (or iOS
      manual instructions) appears, and that installing/adding to home
      screen works and opens WeddingOS full-screen.
- [ ] **Logout** — sign out, confirm you land back on the login screen
      and cannot navigate back into app data via the browser back button.

If every box is checked, the deploy is good. If anything fails, check
`docs/DEPLOYMENT.md`'s troubleshooting-adjacent steps in
`docs/SUPABASE_SETUP.md`, and re-run this checklist after fixing it —
don't assume a partial fix resolved everything.
