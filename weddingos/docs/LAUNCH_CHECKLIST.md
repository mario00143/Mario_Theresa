# Launch Checklist

A one-time, pre-wedding checklist for the person acting as Admin. Not
every box needs to be checked to use WeddingOS — but review honestly
before treating it as your system of record for the actual wedding day.
The in-app **Settings → Production Readiness** screen (Admin-only)
mirrors most of this automatically; use it alongside this document, not
instead of it — it can only check what's technically observable from the
browser, not things like "did we actually rehearse the recovery drill."

## Infrastructure

- [ ] Supabase project created, all migrations applied (`docs/SUPABASE_SETUP.md`)
- [ ] Storage bucket (`documents`) confirmed private
- [ ] Vercel project deployed, production URL loads from an outside network
- [ ] Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) set in Vercel, anon key only
- [ ] Supabase Auth redirect URLs updated to the real production URL

## Security

- [ ] Reviewed `docs/SECURITY_CHECKLIST.md` in full
- [ ] Confirmed no `service_role` key anywhere in the repo or env vars
- [ ] CSP/security headers verified in the browser network tab against the live deployment
- [ ] File upload tested with a disallowed type (confirm it's rejected)

## Data

- [ ] Demo Data Cleanup run (Settings → Demo Data Cleanup) if this workspace ever held seed/demo content
- [ ] Real-data onboarding checklist complete (Settings → Production Readiness → Data Quality)
- [ ] No broken references reported (Settings → Data Management)

## Users & Roles

- [ ] Every real household member/helper who needs access has an account and the correct role
- [ ] At least one other Admin exists besides you, in case you lose access
- [ ] Reviewed the role matrix (`docs/SECURITY_CHECKLIST.md`) so everyone's access matches what they should see

## Mobile & PWA

- [ ] Every planned Wedding Day operator device has WeddingOS installed
- [ ] Tested at least once on both an Android and an iOS device if both are in use
- [ ] Confirmed offline behavior once on a real device (turn on airplane mode briefly, confirm the Offline banner appears and core screens still show data)

## Backup

- [ ] At least one backup downloaded and kept somewhere safe (not just on the phone that might be lost)
- [ ] Recovery drill completed at least once (`docs/BACKUP_RECOVERY.md`)

## Wedding Day

- [ ] Wedding Week System Checklist reviewed (Settings → Production Readiness)
- [ ] Every Wedding Day device's Offline Pack refreshed within the last 24 hours before the event
- [ ] Simulation Time confirmed off
- [ ] Printed Command Sheet, Emergency Contacts, and manifests as a paper fallback
- [ ] Device redundancy plan confirmed (primary phone, backup phone, command-desk laptop/tablet)
- [ ] Reviewed current Supabase Free plan limits and Vercel Hobby plan limits/terms

## Final Approval

- [ ] Every open Warning/Fail on the Production Readiness screen has been reviewed and is either fixed or a knowingly-accepted risk
- [ ] Admin has clicked **Mark "Production Launch Reviewed"** on the Production Readiness screen
