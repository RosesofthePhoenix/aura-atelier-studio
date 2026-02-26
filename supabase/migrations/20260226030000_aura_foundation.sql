create extension if not exists "pgcrypto";

create table if not exists public.val_allowlist (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

create or replace function public.is_val_email(target_email text)
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.val_allowlist
    where lower(email) = lower(target_email)
  );
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.aura_initiations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  instagram_handle text,
  answers jsonb not null default '[]'::jsonb,
  status text not null default 'nueva' check (status in ('nueva', 'en_lectura', 'tejiendo', 'completada')),
  piece_recommendation text,
  energy_intensity int check (energy_intensity between 1 and 10),
  draft boolean not null default true,
  completion_ratio numeric(5,2) not null default 0,
  last_step int not null default 0,
  submitted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists aura_initiations_user_idx on public.aura_initiations (user_id);
create index if not exists aura_initiations_status_idx on public.aura_initiations (status);
create index if not exists aura_initiations_created_idx on public.aura_initiations (created_at desc);

drop trigger if exists aura_initiations_updated_at on public.aura_initiations;
create trigger aura_initiations_updated_at
before update on public.aura_initiations
for each row
execute procedure public.touch_updated_at();

create table if not exists public.aura_initiation_assets (
  id uuid primary key default gen_random_uuid(),
  initiation_id uuid not null references public.aura_initiations(id) on delete cascade,
  question_id text not null,
  asset_type text not null check (asset_type in ('voice', 'photo')),
  storage_path text not null,
  mime_type text not null,
  duration_seconds numeric(8,2),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists aura_assets_initiation_idx on public.aura_initiation_assets (initiation_id);
create unique index if not exists aura_assets_unique_question_type_idx
  on public.aura_initiation_assets (initiation_id, question_id, asset_type);

create table if not exists public.val_vault_notes (
  id uuid primary key default gen_random_uuid(),
  initiation_id uuid not null references public.aura_initiations(id) on delete cascade,
  note text not null,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists val_vault_notes_updated_at on public.val_vault_notes;
create trigger val_vault_notes_updated_at
before update on public.val_vault_notes
for each row
execute procedure public.touch_updated_at();

alter table public.aura_initiations enable row level security;
alter table public.aura_initiation_assets enable row level security;
alter table public.val_vault_notes enable row level security;
alter table public.val_allowlist enable row level security;

drop policy if exists "allowlist_read_for_val_only" on public.val_allowlist;
create policy "allowlist_read_for_val_only"
  on public.val_allowlist
  for select
  using (public.is_val_email(auth.jwt()->>'email'));

drop policy if exists "initiate_select_own_or_val" on public.aura_initiations;
create policy "initiate_select_own_or_val"
  on public.aura_initiations
  for select
  using (
    auth.uid() = user_id
    or public.is_val_email(auth.jwt()->>'email')
  );

drop policy if exists "initiate_insert_own" on public.aura_initiations;
create policy "initiate_insert_own"
  on public.aura_initiations
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "initiate_update_own_or_val" on public.aura_initiations;
create policy "initiate_update_own_or_val"
  on public.aura_initiations
  for update
  using (
    auth.uid() = user_id
    or public.is_val_email(auth.jwt()->>'email')
  )
  with check (
    auth.uid() = user_id
    or public.is_val_email(auth.jwt()->>'email')
  );

drop policy if exists "asset_select_own_or_val" on public.aura_initiation_assets;
create policy "asset_select_own_or_val"
  on public.aura_initiation_assets
  for select
  using (
    exists (
      select 1
      from public.aura_initiations ai
      where ai.id = initiation_id
      and (
        ai.user_id = auth.uid()
        or public.is_val_email(auth.jwt()->>'email')
      )
    )
  );

drop policy if exists "asset_insert_own" on public.aura_initiation_assets;
create policy "asset_insert_own"
  on public.aura_initiation_assets
  for insert
  with check (
    exists (
      select 1
      from public.aura_initiations ai
      where ai.id = initiation_id
      and ai.user_id = auth.uid()
    )
  );

drop policy if exists "asset_update_own_or_val" on public.aura_initiation_assets;
create policy "asset_update_own_or_val"
  on public.aura_initiation_assets
  for update
  using (
    exists (
      select 1
      from public.aura_initiations ai
      where ai.id = initiation_id
      and (
        ai.user_id = auth.uid()
        or public.is_val_email(auth.jwt()->>'email')
      )
    )
  )
  with check (
    exists (
      select 1
      from public.aura_initiations ai
      where ai.id = initiation_id
      and (
        ai.user_id = auth.uid()
        or public.is_val_email(auth.jwt()->>'email')
      )
    )
  );

drop policy if exists "vault_notes_val_only" on public.val_vault_notes;
create policy "vault_notes_val_only"
  on public.val_vault_notes
  for all
  using (public.is_val_email(auth.jwt()->>'email'))
  with check (public.is_val_email(auth.jwt()->>'email'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'initiation-voice-notes',
    'initiation-voice-notes',
    false,
    26214400,
    array['audio/webm', 'audio/mpeg', 'audio/wav', 'audio/mp4']
  ),
  (
    'initiation-photos',
    'initiation-photos',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do nothing;

drop policy if exists "voice_and_photos_insert_owner" on storage.objects;
create policy "voice_and_photos_insert_owner"
  on storage.objects
  for insert
  with check (
    bucket_id in ('initiation-voice-notes', 'initiation-photos')
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice_and_photos_read_owner_or_val" on storage.objects;
create policy "voice_and_photos_read_owner_or_val"
  on storage.objects
  for select
  using (
    bucket_id in ('initiation-voice-notes', 'initiation-photos')
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.is_val_email(auth.jwt()->>'email')
    )
  );

drop policy if exists "voice_and_photos_update_owner" on storage.objects;
create policy "voice_and_photos_update_owner"
  on storage.objects
  for update
  using (
    bucket_id in ('initiation-voice-notes', 'initiation-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('initiation-voice-notes', 'initiation-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "voice_and_photos_delete_owner" on storage.objects;
create policy "voice_and_photos_delete_owner"
  on storage.objects
  for delete
  using (
    bucket_id in ('initiation-voice-notes', 'initiation-photos')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

