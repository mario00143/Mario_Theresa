# Admin Guide

For whoever is running the WeddingOS workspace day-to-day — usually the
couple or a close family member acting as the tech-comfortable point
person. Written for someone who isn't a developer.

## Accounts and signing in

Everyone gets their own account (email + password) — there's no shared
login. To create your own account, go to the production URL and click
**Sign up**. Forgot your password? **Forgot password** on the login
screen sends a reset link to your email.

## Roles

Every person in the workspace has exactly one role, set by an Admin or
Couple member:

| Role | Can do |
|---|---|
| Admin | Everything, including managing members and workspace settings |
| Couple | Almost everything Admin can, except granting the Admin role itself |
| Finance Lead | Full read/write on Vendors & Budget; read-only elsewhere |
| Family Editor | Read/write on most planning modules; read-only on finance |
| Day-of Operator | Full access to Wedding Day modules; limited elsewhere |
| Viewer | Read-only everywhere |

Change a role: **Settings → Members**, find the person, pick a new role
from the dropdown. Only an Admin can promote someone to Admin.

## Invitations

**Settings → Members → Create Invite** — pick an email and a role, copy
the generated link, and send it to them yourself (WhatsApp, SMS, email —
whatever's easiest; WeddingOS doesn't send it for you, to avoid needing a
paid email/SMS service). Invites expire after 7 days and are single-use.
If one goes unused and expires, just create a new one.

To remove someone's access: **Settings → Members → Remove** next to their
name. This doesn't delete anything they created, only their access.

## Workspace settings

**Settings → Workspace** — the wedding name/slug shown in the UI. This is
separate from the couple/event details in **Settings → Event Details**,
which is where the actual couple names, dates, venue, and denomination
live.

## Backups

**Settings → Backup → Download backup** downloads a JSON file with
everything in the workspace. Take one regularly, and especially before
big changes (a cleanup run, a Supabase project change) — see
`docs/BACKUP_RECOVERY.md` for the full guide and a rehearsed recovery
drill you should do at least once before the wedding.

## Migrations

If someone had been using WeddingOS in Demo Mode before your Supabase
project existed, **Settings → Migrate Local Data** brings their local
browser data into the real workspace. This is a one-time, per-device
action — do it once from whichever browser/device actually has the real
data.

## Documents

**Documents** — upload contracts, quotes, invoices, receipts. Files are
private to your workspace; nobody outside it can access them, even with a
guessed link (links expire after 10 minutes and are generated fresh each
time you open a document).

## Diagnostics

**Settings → Diagnostics** (Admin-only) — app version, connectivity to
Supabase, last sync time, Offline Pack status, and a **Run System Check**
button that tests auth/database/storage/offline-storage/service-worker in
one click, with plain-language explanations if anything's wrong. Also
includes a local error log you can export if something's misbehaving and
you want to share details.

## Offline Pack

**Wedding Day → Offline Pack** — a device-local copy of the run sheet,
emergency contacts, vendor contacts, manifests, and other Wedding-Day
critical data, saved so it's usable even with no signal. Refresh it
manually any time, and definitely again in the 24 hours before the
wedding on every device that will be used that day.

## System Check

Same as Diagnostics' Run System Check — a quick Pass/Warning/Fail read on
whether this device can currently reach Supabase, write to its own
offline storage, and has an active service worker.

## Data Cleanup

Two separate tools, both Admin-only, both requiring you to actively visit
them and confirm — neither ever runs automatically:

- **Demo Data Cleanup** (Settings → Demo Data Cleanup) — identifies and
  lets you delete the app's original fictional demo content, if any is
  still in your workspace (e.g. because you migrated from Demo Mode).
  It only ever selects records it can positively identify by their
  original id — never by guessing from a similar-looking name — so
  anything you or a family member actually created is never at risk.
- **Post-Wedding Cleanup** (Settings → Post-Wedding Cleanup) — after the
  wedding, clears guest phone/email, travel booking references, and
  logistics notes you no longer need to retain, plus expired invites and
  this device's Offline Pack. Never touches payments, refunds, budget
  items, contracts, or the audit log.

## Password reset

If you (or anyone) forgets their password: **Forgot password** on the
login screen. If the email never arrives, check spam first — WeddingOS
doesn't send this itself, Supabase's built-in auth email does.

## Common problems

| Symptom | Likely cause / fix |
|---|---|
| "Supabase is not configured" | Env vars missing on this deploy — check `docs/DEPLOYMENT.md` step 7 |
| A role can't see something they should | Check their actual role in Settings → Members against the table above |
| Invite link says invalid/expired | Invites expire after 7 days, single-use — create a new one |
| Someone's changes aren't showing on another device | Check they're online — Wedding Day tables sync live, everything else syncs on your next action; check Settings → Diagnostics for sync status |
| "Offline — using last saved data" won't go away | Genuinely check the device's network connection, not just WeddingOS |
