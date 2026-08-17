# Deployment Guide (Phase 8)

A step-by-step guide to putting WeddingOS online for real use, written for
someone who has never deployed a web app before. Total recurring cost at
the end of this guide: **₹0**, using only free tiers.

You need three things, all free:

1. A [GitHub](https://github.com) account (to hold the code)
2. A [Supabase](https://supabase.com) account (the database/backend — see
   `docs/SUPABASE_SETUP.md` for the detailed version of steps 2-6 below)
3. A [Vercel](https://vercel.com) account (hosts the actual website)

---

## 1. Push the code to GitHub

If you're reading this from a copy of the repository already on your
machine, push it to a **private** GitHub repository:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

(If you received this project already on GitHub, skip to step 2.)

## 2. Create a free Supabase project

Follow `docs/SUPABASE_SETUP.md`, steps 1-2, to create a project and copy
your **Project URL** and **anon key**. Keep this tab open — you'll need
those two values again in step 7.

## 3. Run the database migrations

Follow `docs/SUPABASE_SETUP.md`, step 4. When it's done you should see
~61 tables in **Table Editor**, all showing an "RLS" badge.

## 4. Confirm the storage bucket

Follow `docs/SUPABASE_SETUP.md`, step 6. **Storage** should show a
private `documents` bucket — this is created automatically by the
migrations, nothing to click.

## 5. Set the redirect URLs (important — do this before real users sign up)

In the Supabase dashboard, go to **Authentication → URL Configuration**:

- **Site URL**: set to your eventual production URL (you'll get this in
  step 8 — come back and fill this in once you know it, e.g.
  `https://your-wedding.vercel.app`).
- **Redirect URLs**: add the same URL (and `http://localhost:5173` if
  you also want local development to keep working against this project).

This matters because Supabase's password-reset and email-confirmation
links only work for URLs on this allow-list — leaving it as the default
`localhost` means those emails will send people to a broken link once
you're live.

## 6. Create a free Vercel project

1. Go to [vercel.com](https://vercel.com) and sign up (GitHub sign-in is
   easiest — it also makes step 7 automatic).
2. Click **Add New → Project**.
3. Import the GitHub repository from step 1.
4. Vercel will detect this as a Vite project automatically. Leave the
   defaults:
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - (Both are also written explicitly in `vercel.json` in this repo, so
     Vercel will pick them up even if autodetection changes.)

## 7. Add your environment variables

Still in the Vercel project setup (or **Project Settings → Environment
Variables** if you already created it), add:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | from step 2 |
| `VITE_SUPABASE_ANON_KEY` | from step 2 |

Apply these to **Production** (and Preview/Development too, if you want
preview deployments to also talk to the same Supabase project — see the
note on preview deployments below).

⚠️ Only ever put the **anon** key here. Never the `service_role` key —
see `docs/SUPABASE_SETUP.md`'s warning on this.

## 8. Deploy

Click **Deploy**. Vercel builds and publishes the site — you'll get a URL
like `https://your-project-name.vercel.app`. **No custom domain is
required**; this `*.vercel.app` address is a completely normal, permanent
production URL and is what this guide assumes you're using.

## 9. Go back and fix the redirect URLs

Now that you have your real Vercel URL, go back to step 5 in the
Supabase dashboard and set **Site URL** / **Redirect URLs** to your
actual `https://your-project-name.vercel.app` address (not a placeholder
this time). Redeploy is not required for this — it takes effect
immediately.

## 10. Verify

1. Open your Vercel URL. You should see the WeddingOS login screen (not
   Demo Mode — Demo Mode only appears when the env vars are absent).
2. Sign up, confirm your email if prompted, and create your workspace.
3. On your phone, open the same URL in Chrome (Android) or Safari (iOS)
   and confirm the **Install WeddingOS** prompt appears (Android) or
   follow the manual "Add to Home Screen" instructions shown (iOS) — see
   `docs/PRODUCTION_SMOKE_TEST.md` for the full 10-15 minute checklist.

## 11. Migrate your existing local planning data (if any)

If you'd already been using WeddingOS in Demo Mode with real data, follow
`docs/SUPABASE_SETUP.md` step 11 (**Settings → Migrate Local Data**)
before you stop using the Demo Mode browser/device.

## 12. Take a backup

Once your real data is in, go to **Settings → Backup** and download a
JSON backup. Do this again periodically, and definitely again right
before the wedding — see `docs/BACKUP_RECOVERY.md`.

---

## Preview deployments — a safety note

Every pull request/branch you push to GitHub gets its own Vercel
"preview" deployment with its own throwaway URL. If you gave preview
deployments the same `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` as
production (step 7), a preview deployment talks to your **real**
production Supabase project — RLS still protects data by workspace
membership, but avoid using preview URLs for anything you wouldn't want
a link possibly shared outside your household. If you'd rather keep
previews fully isolated, create a second free Supabase project for
previews only and set the env vars per-environment in Vercel.

## Free-tier awareness

Both Supabase's Free plan and Vercel's Hobby plan have limits and terms
that can change — **review Supabase's current Free plan limits and
Vercel's current Hobby plan limits and terms before your production
launch**, especially in the days before the wedding (see
`docs/KNOWN_LIMITATIONS.md` and the in-app pre-wedding readiness
recommendation on the Production Readiness screen). This guide
deliberately does not hard-code specific numbers, since free-tier terms
are set by Supabase/Vercel and can change independently of this app.

## Rollback

Vercel keeps every previous deployment. If a deploy has a problem,
**Deployments → (previous one) → Promote to Production** reverts
instantly — no rebuild needed.
