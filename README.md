# Aura Atelier by V - Production Site

Luxury ritual website for **Aura Atelier by V** built with:

- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Framer Motion (slow ritual animations)
- Supabase (magic link auth, DB, storage, RLS)
- React Hook Form + Zod
- @react-three/fiber + @react-three/drei (3D Bolivianita crystal)
- lucide-react

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Copy env template:

```bash
cp .env.example .env.local
```

3. Fill `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
VAL_VAULT_ALLOWLIST_EMAILS=val@example.com
VAL_VAULT_PASSPHRASE=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=Aura Atelier <noreply@auraatelier.studio>
VAL_ALERT_EMAIL=val@example.com
```

4. Start dev server:

```bash
npm run dev
```

5. Validate before deploy:

```bash
npm run lint
npm run build
```

## Supabase Setup

### 1) Create project

- Create a Supabase project.
- Copy `Project URL` and `anon key` into env.
- Copy `service_role key` into env (server only).

### 2) Run migration

Execute SQL from:

- `supabase/migrations/20260226030000_aura_foundation.sql`

This creates:

- `aura_initiations`
- `aura_initiation_assets`
- `val_vault_notes`
- `val_allowlist`
- storage buckets:
  - `initiation-voice-notes`
  - `initiation-photos`
- RLS policies for user-owned initiation records and Val-only vault access

### 3) Seed Val allowlist

Insert Val's email into `val_allowlist`:

```sql
insert into public.val_allowlist (email)
values ('val@yourdomain.com')
on conflict (email) do nothing;
```

### 4) Configure auth (magic links)

In **Supabase -> Authentication -> URL Configuration**:

- Site URL:
  - `https://auraatelier.studio`
- Redirect URLs:
  - `https://auraatelier.studio/auth/callback`
  - `https://www.auraatelier.studio/auth/callback`
  - `http://localhost:3000/auth/callback`

### 5) Storage

Buckets are private by default from migration. Uploads are written with path:

- `<user_id>/<initiation_id>/<question_id>-<timestamp>.<ext>`

## Ambient Audio Assets

Optional audio files:

- `public/audio/andean-winds-crystal-chimes.mp3`
- `public/audio/val-whisper.mp3`

Without them, site still runs; audio controls stay optional.

## Key Routes

- `/` - public atelier landing
- `/manifiesto` - house manifesto and foundational voice
- `/capitulos/uyuni` - Uyuni chapter
- `/by-appointment` - appointment funnel
- `/auth` - magic link entry
- `/iniciacion` - private initiation ritual flow
- `/val-vault` - Val-only Kanban vault
- `/val-vault/[id]` - initiation detail view

## Vercel Deployment

1. Push this project to GitHub.
2. In Vercel, create a new project from the repo.
3. Framework preset: **Next.js**.
4. Add all env variables from `.env.local` in Vercel Project Settings.
5. Deploy.
6. Verify:
   - `/auth` magic links
   - `/iniciacion` autosave + uploads
   - `/val-vault` access control + passphrase
   - alert email delivery

## Connect Custom Domain (GoDaddy -> Vercel)

For `auraatelier.studio` and `www.auraatelier.studio`:

1. In **Vercel -> Project -> Settings -> Domains**:
   - Add `auraatelier.studio`
   - Add `www.auraatelier.studio`

2. In **GoDaddy DNS** add/update:
   - `A` record
     - Host: `@`
     - Value: `76.76.21.21`
   - `CNAME` record
     - Host: `www`
     - Value: `cname.vercel-dns.com`

3. Remove conflicting old `A`/`CNAME` records for `@` or `www`.
4. Wait for DNS propagation (usually minutes, up to 24h).
5. Confirm both domains show as **Valid** in Vercel.
6. Set `auraatelier.studio` as primary domain.

## Security Notes

- Vault requires:
  - allowlisted Val email (`VAL_VAULT_ALLOWLIST_EMAILS` + `val_allowlist` table)
  - secondary passphrase (`VAL_VAULT_PASSPHRASE`)
- Keep `SUPABASE_SERVICE_ROLE_KEY` and `RESEND_API_KEY` server-only.
- Never expose secrets in client code.

