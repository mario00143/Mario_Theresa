# Wedding Day Operator Guide

For whoever is running the Command Center on the actual wedding day —
the Day-of Coordinator, a trusted family member, or a hired planner given
Day-of Operator access. This is the one document worth printing and
keeping in your pocket alongside the printed Command Sheet.

## Before your shift

- Confirm your device is installed as an app (not just a browser tab) and
  signed in.
- Refresh the Offline Pack one more time: **Wedding Day → Offline Pack →
  Refresh Offline Pack**.
- Check **Wedding Day → Device Readiness** — installed, online, Offline
  Pack fresh, run sheet/emergency contacts cached, device time correct.
- Turn on **Wedding Day Mode** from the header toggle.
- Confirm your phone is charged and you have a charger/power bank.
- Know who has the backup phone, and that it's also signed in and
  installed.

## Command Center

Your home screen for the day. Shows the current run sheet item, upcoming
items, open issues, and any alerts needing attention — all at a glance,
no digging through menus.

## Run Sheet statuses

Each item moves through: **Planned → Ready → In Progress → Complete**
(or **Delayed**/**Skipped**/**Cancelled** as needed). Tap **Start** when
something begins, **Complete** when it's done. Use **Delay** if something
is running late — this doesn't just log the delay, it can show you which
downstream items are affected so you can decide whether to shift them
too.

## Issue escalation

Log a problem the moment you notice it: **Wedding Day → Issues → new
issue**, pick a category and severity. Critical and High issues that stay
open too long automatically get flagged for escalation — the app doesn't
call anyone for you, but it makes sure an unresolved critical issue
doesn't quietly fall off your radar. Add a mitigation note as you work
it, and mark it resolved once it's actually handled.

## Vendor check-in

**Wedding Day → Vendors** — mark each vendor as arrived when they show
up, and flag anyone late past their grace period. This is your fastest
way to answer "has the photographer arrived yet?" without a phone call.

## Item custody

**Wedding Day → Ceremony Items** — for rings, minnu, manthrakodi, and
other critical items: record every hand-off (**Record movement**) so
there's always a clear answer to "who has the rings right now, and where
were they last verified?" Critical items should show **Verified** before
they're needed — if one still shows **Not Verified** close to when it's
needed, that's worth chasing down in person.

## Manifests

**Wedding Day → Manifests** — guest arrivals, hotel rooming, church/
reception shuttles, and departures, all in one place. Useful for
answering driver/hotel questions without re-deriving them from the full
guest list.

## Offline behavior

If your device loses signal: you'll see **"Offline — using last saved
Wedding Day data"** at the top. The run sheet, emergency contacts, vendor
contacts, manifests, and other critical data stay visible from the
Offline Pack. You can still:

- Log a new Live Issue
- Update a Run Sheet item's status
- Record a Ceremony Item movement
- Update a Closeout item's status

These are saved on your device and marked **Pending Sync** — never shown
as if they've already reached the server. Everything else (payments,
role changes, workspace settings, document uploads, room/vehicle
assignments, invites) is disabled while offline rather than silently
failing, with a note explaining why. Once you're back online, queued
changes sync automatically. If a change conflicts with something someone
else did on another device while you were offline, you'll be shown both
versions and asked which one to keep — nothing is silently overwritten.

## Emergency

**Wedding Day → Emergency** is reachable in one tap from anywhere in
Wedding Day Mode, online or offline. Hospital, ambulance, police,
venue security, and family emergency contacts, sorted by priority.

## Closeout

**Wedding Day → Closeout** — the end-of-event checklist: gifts/cash
handling, vendor settlement, rental returns, venue handover, lost &
found, leftover food, hotel returns. Work through it as the event winds
down; anything that can't be completed cleanly, mark as an **Exception**
with a note rather than leaving it stuck at Pending.

## What to do if WeddingOS is unavailable

WeddingOS is not the wedding — it's a tool to help run it, and it's
designed to degrade gracefully, not to be a single point of failure:

- **Your phone can't reach the internet at all** → the installed app
  still works from the Offline Pack; log issues/updates as above, they
  sync later.
- **Your phone is lost, dead, or broken** → switch to the backup phone
  (confirmed signed in and installed before the day, per the checklist
  above).
- **Every phone fails** → fall back to the printed Command Sheet and
  printed Emergency Contacts — this is exactly why they're printed in
  advance, not a last resort improvised on the day.
- **Vercel or Supabase themselves have an outage** → the installed PWA
  and Offline Pack keep working for read access and the four safe
  offline actions; anything requiring a live write (payments, role
  changes) simply waits — it's not something that can be worked around
  in the moment, and it's rare enough that the paper fallback is the
  practical answer for anything truly time-critical.

No technology is zero-risk. The combination of an installed app, a
regularly refreshed Offline Pack, a backup device, and printed paper
fallbacks is the actual safety net — not any single piece of it alone.
