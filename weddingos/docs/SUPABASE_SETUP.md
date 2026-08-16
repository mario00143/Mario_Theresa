# Supabase Setup Guide (Phase 7)

This guide walks through turning on Supabase Production Mode for WeddingOS —
step by step, written for someone who has never used Supabase before. If you
skip all of this, WeddingOS still works exactly as it always has: **Demo /
Local Mode** (everything in your browser's `localStorage`, no login, no
network calls) is the default and always available.

Production Mode adds: real accounts, multiple people working on the same
wedding from different devices, role-based permissions, private document
storage, an audit trail, and a one-time wizard to bring your existing local
data along.

Everything below uses **Supabase's free tier**. No credit card or paid plan
is required.

---

## 1. Create a free Supabase project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub or email).
2. Click **New Project**.
3. Pick an organization (or create one), give the project a name (e.g.
   "weddingos"), choose a database password (save it somewhere safe — you
   won't need it for the app itself, only if you ever connect directly with
   `psql`), and pick a region close to you.
4. Click **Create new project**. It takes 1-2 minutes to provision.

## 2. Get your project URL and anon key

1. In the Supabase dashboard, go to **Project Settings → API**.
2. Copy the **Project URL** (looks like `https://xxxxxxxx.supabase.co`).
3. Copy the **anon / public** key (a long string starting with `eyJ...`).

⚠️ **Never copy the `service_role` key into anything that runs in a
browser.** That key bypasses every security rule (Row Level Security) this
app relies on. WeddingOS never needs it, and none of the setup below asks
for it.

## 3. Configure the app

In the `weddingos/` folder:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in the two values from step 2:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

`.env.local` is already git-ignored (see `.gitignore`'s `*.local` pattern) —
it will never be committed.

Restart `npm run dev` if it's already running. The app will now boot in
**Production Mode** instead of Demo Mode (you'll see a sign-in screen
instead of the Demo badge in the sidebar).

## 4. Run the database migrations

The SQL that creates every table, security rule, and function lives in
`supabase/migrations/`, in the order they must run (the filenames are
numbered).

**Option A — Supabase CLI (recommended):**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>   # the ref is in your project URL
supabase db push
```

**Option B — SQL Editor (no CLI install needed):**

1. In the Supabase dashboard, open **SQL Editor**.
2. Open each file in `supabase/migrations/` **in filename order** (they're
   numbered `20260101000001_...` through `20260101000012_...`) and run its
   full contents, one file at a time, before moving to the next.

Either way, when it's done you should see ~60 tables under
**Table Editor**, all with a small "RLS" badge (Row Level Security enabled).

## 5. Verify Row Level Security is active

In the SQL Editor, run:

```sql
select count(*) as tables_without_rls
from pg_tables t
where schemaname = 'public'
  and not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = t.tablename and c.relrowsecurity
  );
```

This should return **0**. If it doesn't, one of the migrations in step 4
didn't finish — re-run migration `20260101000008_rls_functions.sql` onward.

For a much more thorough check, run the full test script:

```bash
psql "<your connection string>" -f supabase/tests/rls_security_tests.sql
```

It should print `ALL RLS SECURITY TESTS PASSED` and leave no data behind.
See the comment at the top of that file for exactly how to get a connection
string and simulate different users' logins from plain SQL.

## 6. Create the private documents storage bucket

Migration `20260101000009_storage.sql` already creates the `documents`
bucket and its access policies for you — nothing extra to do here. To
confirm it worked: **Storage** in the dashboard should show a bucket named
`documents` marked **Private**.

## 7. Turn on email auth (already on by default)

Supabase projects have email/password sign-up enabled out of the box. No
change needed unless you've previously disabled it under
**Authentication → Providers → Email**.

If you'd like to skip Supabase's "confirm your email" step during your own
testing (not recommended once real guests/family are using it), you can
turn off **Confirm email** under **Authentication → Providers → Email** —
but leave it on for a real wedding, since it's your only protection against
someone signing up with an email address they don't own.

## 8. Test signup

1. Run the app (`npm run dev`) with `.env.local` configured.
2. Go to **Sign up**, create an account.
3. If email confirmation is on, check your inbox and click the link.
4. Sign in.

## 9. Test workspace creation

After your first sign-in, you'll land on **Create your wedding workspace**
(there's nothing to select yet — you have no workspace). Fill in the form
and submit. You should land on the normal WeddingOS dashboard, now
"talking to" Supabase instead of `localStorage`.

## 10. Test the invite flow

1. In **Settings → Members**, create an invite for a second email address
   with a role (e.g. Viewer).
2. Copy the generated link.
3. Open it in a private/incognito window (or send it to the actual person).
4. Sign up or sign in as that second person — they should land in the same
   workspace with the role you picked.

## 11. Migrate your existing local data

If you'd already been using WeddingOS in Demo Mode and have real planning
data sitting in your browser's `localStorage`, don't lose it:

1. Sign in to your new Supabase-backed workspace.
2. Go to **Settings → Migrate Local Data**.
3. Review the record counts and any reference warnings shown.
4. Click **Migrate local data into `<your workspace>`**.
5. Wait for the collection-by-collection progress to finish, then check the
   verification table — every collection's source and destination counts
   should match.

This step is idempotent: running it again with the exact same local data
is blocked with a clear message rather than creating duplicates (unless
you deliberately migrate into a brand-new workspace).

Your local browser data is **never deleted** by this step — it's still
there if you ever want to fall back to Demo Mode. Download a local JSON
backup first anyway (there's a button for it right on the migration screen)
just to be safe.

## 12. Verify cross-device access

1. On a second device (or a different browser), sign in with the same
   account, or with a second invited account.
2. Confirm you can see the same workspace data.
3. Make a small edit on one device, refresh the other — it should appear.
4. On the Wedding Day tabs specifically (Run Sheet, Issues, Vendor Day,
   Ceremony Items, Closeout), changes should appear on the other device
   within a couple of seconds even without a manual refresh (Realtime is
   scoped to just those five tables — see section 27-28 of the Phase 7
   spec, or `src/hooks/useWeddingDayRealtime.ts`).

## Free-tier notes

- Supabase's free tier includes a generous Postgres database, 1GB file
  storage, 50,000 monthly active users, and unlimited API requests — more
  than enough for planning one wedding.
- Realtime is deliberately limited to 5 tables (not every table) to stay
  well within free-tier connection limits.
- No paid add-ons, edge functions, or third-party auth providers are used
  anywhere in this app.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| App shows Demo Mode even with `.env.local` set | Restart the dev server — Vite only reads `.env.local` at startup. |
| "Supabase is not configured" errors | Double check both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set and the URL has no trailing slash. |
| Sign-up succeeds but sign-in fails immediately after | Email confirmation is likely on — check your inbox. |
| Invite link says "invalid or already used" | Invites expire after 7 days and are single-use; create a new one. |
| A role can't see a page it should be able to read | Check **Settings → Members** for their actual current role, and compare against the matrix in this repo's `src/utils/permissions.ts`. |
