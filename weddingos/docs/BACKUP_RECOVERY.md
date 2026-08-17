# Backup & Recovery Drill

WeddingOS backups are plain JSON files you download yourself — there is no
automatic cloud backup beyond Supabase's own database, and no scheduled
job that takes one for you. **You are responsible for taking backups**,
especially in the days before the wedding. This document explains the
format, when to take one, and walks through a full recovery drill so you
know the restore path actually works before you ever need it for real.

## What's in a backup, and what's deliberately excluded

A backup (**Settings → Backup → Download backup**) is a single JSON file
containing every planning collection — tasks, guests, logistics, finance,
wedding prep, wedding day records, settings, and (in Production Mode)
workspace/document metadata.

Deliberately **excluded**, even in Production Mode:

- Your Supabase auth session or access/refresh tokens
- The Supabase anon key or any other secret
- Signed document URLs (these expire in minutes anyway — see
  `docs/SECURITY_CHECKLIST.md`)
- The on-device Offline Pack (IndexedDB) and offline mutation queue —
  these are a device-local cache/outbox, not source data
- The local error log — device-local diagnostics only
- Service worker cache contents

A backup restores your **planning data**, not your **login** — after
restoring into a new workspace you still sign in normally.

## Current format version

The backup format is currently **version 7**. Phase 8 did not require a
new version: the one new piece of Phase 8 state that's meaningful to keep
(the "Production Launch Reviewed" marker) lives inside the existing
`settings.weddingDay` object, which was already backed up wholesale — no
schema change was needed for it to round-trip correctly. Versions 1
through 7 all still import successfully (see `tests/backup*.test.ts` and
`tests/backupV7.test.ts`), each one silently upgraded on import to fill in
any collections that didn't exist yet at that version.

## When to take a backup

- After finishing the initial Migration Wizard (Settings → Migrate Local
  Data)
- Periodically while planning (weekly is reasonable)
- **The week before the wedding**, and again the morning of (see the
  Wedding Week System Checklist on the Production Readiness screen)
- Before running either Data Cleanup tool (Settings → Demo Data Cleanup /
  Post-Wedding Cleanup) — both tools tell you this too
- Before any Supabase project change (plan changes, pausing/resuming a
  project, etc.)

## The recovery drill

Do this once, well before the wedding, so a restore is a known-good,
rehearsed action rather than something you're trying for the first time
under pressure.

1. **Export** — In your real (production) workspace: **Settings → Backup
   → Download backup**. Note the file's guest/task/payment counts shown
   on that screen.
2. **Create a throwaway test workspace** — Sign out, sign back in, and
   create a brand-new workspace with an obviously-test name (e.g. "Backup
   Drill — delete me"). This keeps the drill fully isolated from your real
   data.
3. **Import** — In the new empty workspace, go to **Settings → Backup →
   Restore from backup** and select the file from step 1.
4. **Verify counts** — The import screen shows a per-collection
   before/after count. Every collection's imported count should match
   what you noted in step 1.
5. **Verify references** — Open a few guests and confirm their household
   links are intact; open a few tasks and confirm any linked
   vendor/budget items still resolve; open the Wedding Day Run Sheet and
   confirm items still show their category/timing correctly.
6. **Verify key modules** — Spot-check Dashboard, Guests, Logistics,
   Vendors & Budget, Wedding Prep, and Wedding Day each show sensible,
   non-empty data matching the original workspace.
7. **Confirm no auth credentials were copied** — This is structural, not
   something to "check" per se: the backup file never contained
   credentials in the first place (see above), and importing it does not
   create, modify, or transfer any account, session, or membership — the
   test workspace still requires you to have signed in with your own
   account, and no other person gained access to anything by this import.
8. **Clean up** — Once verified, delete the test data you don't want to
   keep around (or simply leave the throwaway workspace unused — it costs
   nothing and doesn't affect your real workspace). There is currently no
   "delete workspace" button in the UI (see `docs/KNOWN_LIMITATIONS.md`);
   the safest cleanup is to remove yourself as a member if you want it
   gone from your workspace list, or leave it be.

If every check in steps 4-6 passes, your recovery path is proven working.
Re-run this drill again if you ever change hosting, migrate to a new
Supabase project, or simply want reassurance close to the wedding date.

## Malformed or partial backups

`validateBackup()` rejects a file that isn't valid JSON, is missing the
required top-level shape, or has a field of the wrong type — you'll see a
clear error rather than a silent partial import. A backup missing
optional collections entirely (e.g. an old v1 export with no logistics
data at all) still imports cleanly — missing collections are treated as
empty, not as an error (`tests/backup.test.ts`,
`tests/migrationEngine.test.ts`).
