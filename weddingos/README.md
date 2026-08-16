# WeddingOS — Wedding Command Center

WeddingOS is a private, mobile-first wedding planning application built to coordinate a Kerala-style Christian Indian wedding across two events: an engagement in Goa and a wedding in Hyderabad, 19 days apart. It replaces scattered spreadsheets and chat threads with one operational tool covering tasks, decisions, calendar, guests/RSVP, travel/logistics, vendors/budget, wedding-preparation tracking, and a live wedding-day command center.

This README's feature-by-feature narrative below was written during Phase 2 and documents Phases 1-2 in detail; Phases 3-6 (Logistics, Vendors & Budget, Wedding Prep, Wedding Day Command Center) shipped on top of it without a full rewrite of this file — see each phase's commit history for their scope. **Phase 7 (this phase) is documented in its own section immediately below**, since it changes the persistence model itself.

## Phase 7 — Supabase Production Mode

WeddingOS now runs in one of two modes, decided automatically at boot by
whether Supabase environment variables are present:

- **Demo / Local Mode** (default, zero setup) — everything from Phases
  1-6 works exactly as before: single browser, `localStorage`, no login,
  no network calls. A small **DEMO** badge appears in the sidebar/header
  so it's never ambiguous which mode you're in.
- **Production Mode** (opt-in, requires a free Supabase project) — real
  accounts, a **Workspace** per wedding, role-based **Members**
  (Admin / Couple / Finance Lead / Workstream Lead / Family Editor /
  Viewer / Day-of Operator), cross-device sync, private **Documents**
  storage, an **Audit Log**, and a one-time **local-data migration
  wizard** to bring existing Demo Mode data along.

Setting it up: [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) is a
step-by-step guide written for someone who's never used Supabase before.
Security posture: [`docs/SECURITY_CHECKLIST.md`](docs/SECURITY_CHECKLIST.md).

### What's new in Production Mode

- **Auth** — email/password sign up, sign in, sign out, forgot/reset
  password (`src/pages/auth/`, `src/context/AuthContext.tsx`).
- **Workspaces** — first-run "Create your wedding workspace" flow, a
  selector if you belong to more than one, remembered across sessions
  (`src/context/WorkspaceContext.tsx`, `src/pages/auth/CreateWorkspacePage.tsx`).
- **Members & invites** — free, link-based invites (`/join?token=...`,
  no email-sending service required — copy the link and send it via
  WhatsApp/email yourself), role assignment, suspend/remove
  (`src/features/settings/MembersSection.tsx`).
- **Permissions** — a role capability matrix enforced at the database
  level via Row Level Security (authoritative) and mirrored in the UI
  (`src/utils/permissions.ts`, `src/components/ui/PermissionGate.tsx`).
- **Repository adapter layer** — every pre-existing v1-v6 collection's
  `localStorage` store gained an optional Supabase sync path
  (`src/lib/supabaseSync.ts`) without any hook, repository function, or
  page component being rewritten; new Phase-7-native entities (Workspace,
  Documents, Audit Log, ...) use a parallel generic `RepositoryAdapter`
  (`src/data/adapters/`).
- **Local-to-Supabase migration wizard** — analyzes your local data,
  shows record counts and reference warnings, migrates in referential
  order preserving existing IDs, verifies row counts after, and is
  idempotent (won't duplicate the same dataset twice) — never deletes
  your local data (`src/features/migration/MigrationWizard.tsx`).
- **Private documents** — contracts/invoices/receipts/etc., private
  Supabase Storage bucket, signed URLs only, 10MB/file, workspace-isolated
  (`src/pages/DocumentsPage.tsx`, `src/data/supabase/documentRepository.ts`).
- **Audit log** — member/role/settings/finance/deletion actions are
  logged; Admin/Couple can view and filter it
  (`src/data/supabase/auditLogRepository.ts`, `src/features/audit/AuditLogView.tsx`).
- **Backup v7** — adds optional workspace metadata and document metadata
  (never binary file contents) to the existing JSON backup format; v1-v6
  files still import; role-aware export (a Viewer's export never contains
  finance data even if their session has it cached) via
  `src/data/supabase/backupV7.ts`.
- **Realtime, deliberately narrow** — only the five Wedding Day
  operational tables (Run Sheet, Live Issues, Vendor Day Status, Ceremony
  Item Movements, Closeout) push live updates; everything else is
  refresh-based, keeping the app comfortably within Supabase's free tier
  (`src/hooks/useWeddingDayRealtime.ts`).
- **Capacity safety** — room and vehicle-seat capacity are enforced by a
  database trigger (not just client-side), verified against a real
  concurrent-write race condition, not just reasoned about — see
  `docs/SECURITY_CHECKLIST.md`.

### Original Phase 1-2 narrative

This section is unmodified from Phase 2 and describes the app's original scope before Phases 3-7 were added.

## Features

### Phase 1 — Foundation
- **Dashboard** — engagement/wedding countdowns, planning health (completion %, critical completion %, overdue/due-soon/blocked counts), an "Attention Required" feed, upcoming tasks, and completion by workstream.
- **Tasks** — All Tasks (search, filter, sort, edit, delete, duplicate), Kanban, My Tasks, Overdue, Due Soon, and Blocked. A detail drawer covers every task field, subtasks, dependencies, and validation warnings.
- **Calendar** — month view and agenda/list view showing task due dates, the engagement and wedding dates, and the protected engagement period (8–13 Jan 2027).
- **Decisions** — a decision log grouped by status plus Overdue and Due Soon sections.
- **Settings** — couple/engagement/wedding details, denomination, guest counts, budget, currency, timezone, owner role management, and data management.
- **Task rules** — validation warnings, required blocked reasons, required completion evidence, dependency-incomplete warnings, protected-engagement-period alerts.
- 128 seeded tasks, 10 seeded decisions, scheduled against the real planning timeline.

### Phase 2 — Guests, Invitations & RSVP
- **Guests Overview** — household/guest counts, groom/bride-side breakdowns, Wedding/Engagement invitee counts, RSVP tallies (Attending/Declined/Pending), adult/child/infant and dietary breakdowns for confirmed attendees, accommodation/pickup/accessibility counts, and a live data-quality issue count.
- **Households** — a household is the unit of invitation. Search/filter (side, city, invitation priority/status, invited event, RSVP state)/sort, add/edit/delete with a cascade warning (deleting a household deletes its guests), and a full detail drawer (contact info, address, invitation tracking, member list, RSVP summary, notes).
- **Guests** — a guest is the unit of attendance and logistics. Search/filter (side, household, age category, event, RSVP status, dietary preference, accommodation/pickup/accessibility)/sort, add/edit/delete/move-to-another-household, and a detail drawer covering identity, per-event RSVP, food, and hospitality needs, with one-click Mark Attending/Declined/Pending.
- **Invitations** — households grouped by invitation status (Not Prepared → Ready → Sent → Delivered → Follow-up Required → Complete) with per-household Mark Ready/Sent/Delivered/Follow-up/Complete actions and bulk actions (set status, invitation owner, method, or follow-up owner across a multi-select).
- **RSVP** — households grouped by rollup state (Attending / Declined / Partial / Pending) per event, with an expandable fast-entry editor per household (per-member status dropdown, Mark All Attending/Declined, Reset to Pending) and a Follow-Up Queue (households whose invitation was Sent/Delivered but RSVP is still incomplete, with days-since-sent, next follow-up date, and follow-up notes).
- **Reports** — Invitation report, RSVP report (by event and by side), Meal Count (by age category and dietary preference, per event, for confirmed attendees only), Accommodation Requirements, Pickup Requirements (with travel-details status), Accessibility report, and a Guest Data Issues report.
- **Guest Data Issues (automatic)** — missing primary contact, missing phone/email, orphaned guest records, invited-but-no-RSVP-status, Attending-but-no-dietary-preference, accommodation-required-but-not-Attending, pickup-required-but-no-travel-details, duplicate phone/email (households and guests), possible duplicate guest names, and Complete households with an unresolved member RSVP.
- **Duplicate detection** — non-blocking similarity warnings (Levenshtein-based name matching plus exact phone/email matches) shown in the household and guest detail drawers; the user can always proceed.
- **Dashboard integration** — a Guest Snapshot card, plus Attention Required alerts for overdue RSVP follow-ups, households flagged Follow-up Required, and a guest-data-issues summary linking straight to the report.
- **Global search & Quick Add** — search now also matches household name/contact/city and guest name/phone/email, grouped alongside Tasks and Decisions; Quick Add gained New Household and New Guest modes (full detail editable immediately after creation).
- **Backup/restore v2** — the JSON backup format now includes `households` and `guests` (version 2). Version 1 (Phase 1) backups still import successfully; households/guests are simply initialized empty. CSV export added for Households, Guests, and a per-event RSVP report (one row per guest per invited event).
- Seed data: 31 fictional households and 90 fictional guests (Indian Christian placeholder names — clearly demo data, no real people) spread across Hyderabad, Kerala, Bengaluru, Chennai, Mumbai, Goa, Delhi, and overseas, with a realistic mix of invitation stages, RSVP outcomes (including partial-family and pending responses), dietary preferences, accommodation/pickup/accessibility needs, and a handful of intentional duplicate/data-quality examples to exercise those reports.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router (`HashRouter`, so the built app works from a static file server without server-side routing config)
- date-fns
- lucide-react (icons)
- localStorage, behind a repository/store abstraction (see "Data persistence" below) — Demo/Local Mode
- Supabase (Postgres, Auth, Storage, Realtime) — optional Production Mode, see "Phase 7" above
- Vitest + Testing Library for tests
- oxlint for linting

No paid APIs, libraries, databases, or hosting are required anywhere in this app — Supabase's free tier covers all of Phase 7.

## Prerequisites

- Node.js 20+ (developed and tested on Node 22)
- npm
- Optional, for Production Mode: a free [Supabase](https://supabase.com) project — see [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)

## Installation

```bash
cd weddingos
npm install
```

## Running locally

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

Other scripts:

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build locally
npm run lint        # oxlint
```

## Running tests

```bash
npm run test        # run the full Vitest suite once
npm run test:watch  # watch mode
```

The suite (138 tests across 14 files) covers everything from Phase 1 (countdowns, overdue/due-soon detection, completion percentages, protected-engagement-period detection, dependency status, task validation, decision overdue logic, dashboard aggregation, settings updates, Phase 1 seed-data integrity) plus Phase 2: household CRUD and cascade-delete, guest CRUD and move-household, duplicate-phone/email/name detection, individual and household-level RSVP aggregation (Attending/Declined/Partial/Pending) including event-specific counts, guest reports (totals, age/meal counts, accommodation/pickup/accessibility), the full guest data-quality checklist, and backup version 2 export/import plus version 1 backward compatibility and invalid-file rejection.

Manually verified in-browser on both desktop and mobile viewport widths: add/edit/delete a household (with cascade warning) and guest, move a guest between households, record a household RSVP and override one member individually, search by guest name and phone, filter guests by multiple criteria, mark an invitation Sent, record an RSVP follow-up, view the meal count/accommodation/pickup/data-issues reports, export household/guest/RSVP CSVs and a full JSON backup, import that backup back, import a synthesized version 1 (Phase 1) backup and confirm guest data initializes empty, and refresh the browser to confirm persistence — alongside re-verifying every Phase 1 flow (tasks, calendar, decisions, settings) still works unchanged.

## Project structure

```
src/
  components/
    layout/       # Sidebar, BottomNav, Header, AppShell, GlobalSearchModal, QuickAddModal
    ui/            # Reusable primitives: Button, Card, Field, Modal, Drawer, Badge, StatTile, ...
  features/
    dashboard/     # Dashboard-only components (event cards, planning health, attention, upcoming, workstream progress, guest snapshot)
    tasks/         # Task views (All/Kanban/My/Overdue/DueSoon/Blocked), detail drawer, subtasks/dependencies editors
    calendar/      # Month view, agenda view
    decisions/     # Decision list, decision detail drawer
    settings/      # Event details form, owner roles manager, data management
    guests/        # Households, guests, invitations, RSVP, follow-up queue, badges, duplicate warnings
      reports/      # Invitation/RSVP/meal/accommodation/pickup/accessibility/data-issues report panels
  pages/           # One top-level page per route, composing feature components
  data/
    *.seed.ts      # Seed data builders (owners, settings, tasks, decisions, households+guests)
    seed.ts        # Combines the above into one seed bundle
    stores.ts       # The six localStorage-backed stores + reset-to-demo-data
    repositories/   # CRUD functions per domain (tasks, decisions, settings, owners, households, guests, rsvp, invitations, backup)
  hooks/           # React hooks wrapping the stores (useTasks, useDecisions, useSettings, useOwners, useHouseholds, useGuests)
  context/         # UIContext — drawer/modal open state shared across the app (tasks, decisions, households, guests)
  types/           # Strict TypeScript domain models (Task, Decision, AppSettings, Owner, Household, Guest, RsvpResponse, Backup)
  utils/           # Pure domain logic: date, countdown, taskLogic, decisionLogic, calendar, search, dashboardStats, rsvpLogic, guestStats, guestDataQuality, duplicateDetection, invitationLogic, stringSimilarity
  lib/             # Low-level infrastructure: storage.ts (the only file touching localStorage), store.ts, constants, cn, id
tests/             # Vitest test suite (mirrors src/utils and src/data/repositories)
```

## Data persistence

Everything persists to `localStorage`, but no component ever calls `localStorage` directly:

1. **`src/lib/storage.ts`** is the only module that touches `window.localStorage`. It's a thin, safe (try/catch-wrapped) JSON get/set layer.
2. **`src/lib/store.ts`** defines a small observable `Store<T>` on top of that — get/set/subscribe — designed to work with React's `useSyncExternalStore`.
3. **`src/data/stores.ts`** creates the six app-level stores (settings, tasks, decisions, owners, households, guests) and seeds them exactly once (tracked by a `seeded` flag, so deleting all your data doesn't silently re-seed it).
4. **`src/data/repositories/*.ts`** exposes domain-specific CRUD functions (`addTask`, `addHousehold`, `moveGuestToHousehold`, `markSent`, `updateGuestRsvp`, ...) that operate on those stores. RSVP responses live embedded on each guest (`guest.rsvpResponses`) and invitation tracking lives on the household record — there's no separate RSVP/invitation store, keeping the relational shape simple (`Guest.householdId` is the one foreign key) while still going through dedicated repository modules (`rsvpRepository.ts`, `invitationRepository.ts`) for clean call sites.
5. **`src/hooks/*.ts`** wraps the stores/repositories in React hooks so components only ever call `useTasks()`, `useDecisions()`, `useSettings()`, `useOwners()`, `useHouseholds()`, `useGuests()`.

This repository-pattern layering is intentional: a later Supabase phase can swap `stores.ts` and `repositories/*.ts` for Supabase-backed implementations without touching any page or feature component, since they only depend on the hooks. IDs are UUID-based throughout (not array indices) to stay migration-friendly.

Data persists across page refreshes automatically. It does **not** sync across devices or browsers yet — that requires the Supabase-backed persistence planned for a later phase.

## Backup and restore

Settings → Data Management provides:

- **Export backup (JSON)** — downloads a single version-2 file containing `{ version, exportedAt, settings, tasks, decisions, owners, households, guests }`.
- **Import backup (JSON)** — validates the file's structure before enabling the import. A version-1 (Phase 1) file is still accepted: households/guests are simply initialized to empty arrays, with a message telling you that happened. Invalid files are rejected with a specific error list and nothing is changed. A valid file always requires an explicit confirmation before it overwrites current data.
- **Export tasks / households / guests (CSV)** — spreadsheet-friendly exports of each collection's core fields.
- **Export RSVP report (CSV)** — one row per guest per invited event, with status, response method/date, and dietary/accommodation/pickup flags.
- **Reset to demo data** — requires confirmation; discards all current data and restores the original seed dataset.

Exported filenames include a timestamp, e.g. `weddingos-backup-2026-08-15T09-30-00-000Z.json`.

## Known limitations

- **Demo/Local Mode** (no Supabase configured) is single-device only: data lives in one browser's `localStorage`, with no login and no cross-device sync. **Production Mode** (Phase 7, see above) removes this limitation — see `docs/SUPABASE_SETUP.md`.
- In Demo/Local Mode there is no real backend, so there is no protection against clearing browser storage — use the JSON export regularly as a backup. In Production Mode, data lives in Supabase Postgres; the JSON export remains available as an additional backup.
- Kanban re-ordering is done via a status dropdown per card, not drag-and-drop.
- Global search does not currently rank or highlight matches, and caps results at 20 per category per type.
- No offline/PWA support yet — the app requires the dev server or a static file server to be running (planned for Phase 8).
- Duplicate detection is a non-blocking warning (name similarity via Levenshtein distance, plus exact phone/email matches) — it will not catch every real-world duplicate and can occasionally flag genuinely distinct people who share a common name.
- The RSVP page's household rollup state (Attending/Declined/Partial/Pending) is computed per selected event; a household invited to both events needs the Engagement and Wedding tabs checked separately.
- Owner names are plain strings on tasks/decisions/households (not foreign keys), so renaming a role updates all assigned records, but there's no history of previous assignments.
- Phase 7-specific limitations: workspace deletion is intentionally not implemented (see `docs/SECURITY_CHECKLIST.md`); permission-aware UI gating (`PermissionGate`) is applied to all new Phase 7 surfaces and a representative sample of existing modules, not exhaustively to every pre-existing v1-v6 control — Row Level Security remains the actual authoritative enforcement either way.

## Planned future phases

- **Phase 8 will add PWA/offline resilience, production deployment, performance optimization, final security hardening, observability, and launch-readiness QA.**
