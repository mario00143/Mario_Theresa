# WeddingOS — Wedding Command Center

WeddingOS is a private, mobile-first wedding planning application built to coordinate a Kerala-style Christian Indian wedding across two events: an engagement in Goa and a wedding in Hyderabad, 19 days apart. It replaces scattered spreadsheets and chat threads with one operational tool for tasks, decisions, calendar, and planning health — professional and calm rather than decorative.

This is **Phase 1**: the technical foundation. It is intentionally scoped to Dashboard, Tasks, Calendar, Decisions, and Settings, with local persistence, tests, and realistic seed data. Guests, RSVPs, travel itineraries, vendor contracts, budget tracking, and authentication are out of scope for this phase (see "Planned future phases" below).

## Phase 1 features

- **Dashboard** — engagement/wedding countdowns, planning health (completion %, critical completion %, overdue/due-soon/blocked counts), an "Attention Required" feed (overdue critical/high tasks, blocked tasks, incomplete dependencies, overdue decisions, protected-period violations), upcoming tasks, and completion by workstream.
- **Tasks** — All Tasks (search, filter, sort, edit, delete, duplicate), Kanban (status-change controls, no drag-and-drop), My Tasks (by owner), Overdue, Due Soon (today / 7 days / 14 days), and Blocked (with blocked reason, dependency, and days-blocked). A detail drawer covers every task field, subtasks, dependencies, and validation warnings.
- **Calendar** — month view and agenda/list view showing task due dates, the engagement and wedding dates, and the protected engagement period (8–13 Jan 2027). January 2027 is visually called out since it contains both events.
- **Decisions** — a decision log grouped by status (Open / Under Discussion / Decided / Deferred) plus Overdue and Due Soon sections, each with options, a recommended option, and an optional link to a related task.
- **Settings** — couple, engagement, and wedding details; denomination, guest counts, budget, currency, and timezone; owner role management (add/rename/delete, with protection against deleting a role that's still assigned); and data management (backup/restore/export/reset).
- **Global search** — matches task title, description, workstream, owner, tags, and decision title, grouped by type.
- **Quick Add** — a fast New Task / New Decision entry point from anywhere in the app; full details can be edited immediately after creation.
- **Task rules** — validation warnings for active tasks missing an owner/due date/priority/completion criteria, a required blocked reason when status is Blocked, a required completion note or evidence when status is Done, dependency-incomplete warnings, and the protected-engagement-period alert for High/Critical wedding tasks due 8–13 Jan 2027.
- **Seed data** — 128 realistic, specific wedding-planning tasks (with dependencies, a mix of statuses, and a couple of intentional protected-period violations to demonstrate the alert) and 10 sample decisions, scheduled against the real planning timeline.

## Tech stack

- React 19 + TypeScript
- Vite
- Tailwind CSS v4
- React Router (`HashRouter`, so the built app works from a static file server without server-side routing config)
- date-fns
- lucide-react (icons)
- localStorage, behind a repository/store abstraction (see "Data persistence" below)
- Vitest + Testing Library for tests
- oxlint for linting

No paid APIs, libraries, databases, or hosting are used anywhere in this phase.

## Prerequisites

- Node.js 20+ (developed and tested on Node 22)
- npm

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

The suite (68 tests across 7 files) covers: countdown calculations, overdue detection, due-soon detection (7-day and 14-day windows), overall and critical completion percentage, protected-engagement-period detection (including both boundary dates), dependency status and circular-dependency prevention, task validation rules, decision overdue/due-soon logic, dashboard attention/health aggregation, JSON backup export/import validation, settings updates, and seed-data integrity (task count, required fields, unique ids, resolvable dependencies).

Manually verified in-browser: add/edit/delete/duplicate a task, change status (including the Blocked validation warning), add a subtask, create a dependency, search, filter, add a decision, edit settings, refresh persistence, JSON export/import (including rejecting an invalid file), CSV export, and reset to demo data — on both desktop and mobile viewport widths.

## Project structure

```
src/
  components/
    layout/       # Sidebar, BottomNav, Header, AppShell, GlobalSearchModal, QuickAddModal
    ui/            # Reusable primitives: Button, Card, Field, Modal, Drawer, Badge, StatTile, ...
  features/
    dashboard/     # Dashboard-only components (event cards, planning health, attention, upcoming, workstream progress)
    tasks/         # Task views (All/Kanban/My/Overdue/DueSoon/Blocked), detail drawer, subtasks/dependencies editors
    calendar/      # Month view, agenda view
    decisions/     # Decision list, decision detail drawer
    settings/      # Event details form, owner roles manager, data management
  pages/           # One top-level page per route, composing feature components
  data/
    *.seed.ts      # Seed data builders (owners, settings, tasks, decisions)
    seed.ts        # Combines the above into one seed bundle
    stores.ts       # The four localStorage-backed stores + reset-to-demo-data
    repositories/   # CRUD functions per domain (tasks, decisions, settings, owners, backup)
  hooks/           # React hooks wrapping the stores (useTasks, useDecisions, useSettings, useOwners)
  context/         # UIContext — drawer/modal open state shared across the app
  types/           # Strict TypeScript domain models (Task, Decision, AppSettings, Owner, Backup)
  utils/           # Pure domain logic: date, countdown, taskLogic, decisionLogic, calendar, search, dashboardStats
  lib/             # Low-level infrastructure: storage.ts (the only file touching localStorage), store.ts, constants, cn, id
tests/             # Vitest test suite (mirrors src/utils and src/data/repositories)
```

## Data persistence

Phase 1 persists everything to `localStorage`, but no component ever calls `localStorage` directly:

1. **`src/lib/storage.ts`** is the only module that touches `window.localStorage`. It's a thin, safe (try/catch-wrapped) JSON get/set layer.
2. **`src/lib/store.ts`** defines a small observable `Store<T>` on top of that — get/set/subscribe — designed to work with React's `useSyncExternalStore`.
3. **`src/data/stores.ts`** creates the four app-level stores (settings, tasks, decisions, owners) and seeds them exactly once (tracked by a `seeded` flag, so deleting all your tasks doesn't silently re-seed them).
4. **`src/data/repositories/*.ts`** exposes domain-specific CRUD functions (`addTask`, `updateDecision`, `deleteOwner`, ...) that operate on those stores.
5. **`src/hooks/*.ts`** wraps the stores/repositories in React hooks so components only ever call `useTasks()`, `useDecisions()`, `useSettings()`, `useOwners()`.

This repository-pattern layering is intentional: Phase 2+ can swap `stores.ts` and `repositories/*.ts` for Supabase-backed implementations without touching any page or feature component, since they only depend on the hooks.

Data persists across page refreshes automatically. It does **not** sync across devices or browsers in Phase 1 — that requires the Supabase-backed persistence planned for a later phase.

## Backup and restore

Settings → Data Management provides:

- **Export backup (JSON)** — downloads a single file containing `{ version, exportedAt, settings, tasks, decisions, owners }`. The `version` field allows future format migrations.
- **Import backup (JSON)** — validates the file's structure (version present, settings/tasks/decisions/owners shaped correctly, enum fields like status/priority valid) before enabling the import. Invalid files are rejected with a specific error list and nothing is changed. A valid file always requires an explicit confirmation before it overwrites current data.
- **Export tasks (CSV)** — a spreadsheet-friendly export of every task's core fields.
- **Reset to demo data** — requires confirmation; discards all current data and restores the original seed dataset.

Exported filenames include a timestamp, e.g. `weddingos-backup-2026-08-15T09-30-00-000Z.json`.

## Known limitations

- Single-device only: data lives in one browser's `localStorage`, with no login and no cross-device sync (planned for the Supabase phase).
- No real backend, so there is no protection against clearing browser storage — use the JSON export regularly as a backup.
- Kanban re-ordering is done via a status dropdown per card, not drag-and-drop (per Phase 1 scope: drag-and-drop was only to be added "if stable").
- Global search does not currently rank or highlight matches, and caps results at 20 per category.
- No offline/PWA support yet — the app requires the dev server or a static file server to be running.
- Owner names are plain strings on tasks/decisions (not foreign keys), so renaming a role updates all assigned tasks, but there's no history of who a task was previously assigned to.

## Planned future phases

- **Phase 2** will add Guests, Invitations, and RSVP management.
- Later phases will add: Travel itinerary management, Hotel/vehicle allocation, Vendor contract management, a full Budget/Payments module, a Church document repository, the Wedding-day run sheet, Supabase-backed authentication and cross-device sync, and production deployment.
