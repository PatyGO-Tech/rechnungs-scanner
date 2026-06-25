-- ============================================================
-- Rechnungs-Scanner – Supabase Setup (Checkpoint 4 + RLS)
-- In Supabase: SQL Editor öffnen, alles einfügen, "Run" klicken.
-- ============================================================

-- 1. Tabelle "invoices"
create table if not exists public.invoices (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  file_url          text,
  rechnungsnummer   text,
  datum             text,
  faelligkeitsdatum text,
  absender          text,
  empfaenger        text,
  positionen        jsonb,
  nettobetrag       numeric,
  mwst              numeric,
  gesamtbetrag      numeric,
  zahlungsmethode   text
);

-- 2. Row Level Security aktivieren
alter table public.invoices enable row level security;

-- 3. Policies: Nutzer sehen/ändern nur eigene Rechnungen (user_id = auth.uid())
drop policy if exists "invoices_select_own" on public.invoices;
create policy "invoices_select_own" on public.invoices
  for select using (auth.uid() = user_id);

drop policy if exists "invoices_insert_own" on public.invoices;
create policy "invoices_insert_own" on public.invoices
  for insert with check (auth.uid() = user_id);

drop policy if exists "invoices_update_own" on public.invoices;
create policy "invoices_update_own" on public.invoices
  for update using (auth.uid() = user_id);

drop policy if exists "invoices_delete_own" on public.invoices;
create policy "invoices_delete_own" on public.invoices
  for delete using (auth.uid() = user_id);

-- 4. Storage-Bucket "invoice-files" (privat)
insert into storage.buckets (id, name, public)
values ('invoice-files', 'invoice-files', false)
on conflict (id) do nothing;

-- 5. Storage-Policies: jeder Nutzer nur in seinem eigenen Ordner (erster Pfadteil = user_id)
drop policy if exists "invoice_files_select_own" on storage.objects;
create policy "invoice_files_select_own" on storage.objects
  for select using (
    bucket_id = 'invoice-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "invoice_files_insert_own" on storage.objects;
create policy "invoice_files_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'invoice-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "invoice_files_delete_own" on storage.objects;
create policy "invoice_files_delete_own" on storage.objects
  for delete using (
    bucket_id = 'invoice-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
