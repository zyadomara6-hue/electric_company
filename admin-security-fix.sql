-- ============================================================
-- Admin security fix
-- نفّذ مرة واحدة في: Supabase Dashboard → SQL Editor
-- لا يحذف بيانات. لا يضع كلمات مرور أو secret keys.
-- ============================================================

-- ------------------------------------------------------------
-- 1) جدول الأدمن
-- لا يُمنح عليه SELECT/INSERT/UPDATE/DELETE لأي دور عميل.
-- الإدارة تتم من SQL Editor فقط.
-- ------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- 2) قفل الجدول بالكامل
-- ------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

revoke all on table public.admin_users from public, anon, authenticated;

drop policy if exists "Admin users select own" on public.admin_users;

-- ------------------------------------------------------------
-- 3) دالة is_admin()
-- SECURITY DEFINER: تقرأ admin_users بصلاحية المالك، بدون كشف الجدول للعملاء.
-- search_path ثابت: يمنع هجمات search_path.
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ------------------------------------------------------------
-- 4) استخدام is_admin() في سياسات الجداول الأخرى
-- المبدأ: authenticated وحده لا يكفي. الأدمن = is_admin() فقط.
-- ------------------------------------------------------------

alter table public.projects enable row level security;
alter table public.leads enable row level security;
alter table public.settings enable row level security;

-- projects
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Admin read all projects" on public.projects;
drop policy if exists "Admin insert projects" on public.projects;
drop policy if exists "Admin update projects" on public.projects;
drop policy if exists "Admin delete projects" on public.projects;

create policy "Public read projects"
  on public.projects
  for select
  using (status = 'active');

create policy "Admin read all projects"
  on public.projects
  for select
  to authenticated
  using (public.is_admin());

create policy "Admin insert projects"
  on public.projects
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admin update projects"
  on public.projects
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin delete projects"
  on public.projects
  for delete
  to authenticated
  using (public.is_admin());

-- leads
drop policy if exists "Public insert leads" on public.leads;
drop policy if exists "Admin read leads" on public.leads;
drop policy if exists "Admin delete leads" on public.leads;
drop policy if exists "Admin update leads" on public.leads;

create policy "Public insert leads"
  on public.leads
  for insert
  to anon, authenticated
  with check (true);

create policy "Admin read leads"
  on public.leads
  for select
  to authenticated
  using (public.is_admin());

create policy "Admin delete leads"
  on public.leads
  for delete
  to authenticated
  using (public.is_admin());

-- settings
drop policy if exists "Public read settings" on public.settings;
drop policy if exists "Admin write settings" on public.settings;
drop policy if exists "Admin update settings" on public.settings;

create policy "Public read settings"
  on public.settings
  for select
  using (true);

create policy "Admin write settings"
  on public.settings
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admin update settings"
  on public.settings
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- storage: project-images
drop policy if exists "Public read project images" on storage.objects;
drop policy if exists "Admin upload project images" on storage.objects;
drop policy if exists "Admin update project images" on storage.objects;
drop policy if exists "Admin delete project images" on storage.objects;

create policy "Public read project images"
  on storage.objects
  for select
  using (bucket_id = 'project-images');

create policy "Admin upload project images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'project-images' and public.is_admin());

create policy "Admin update project images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());

create policy "Admin delete project images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin());

-- ============================================================
-- إضافة أدمن (يدوياً من SQL Editor بعد نسخ UUID من Authentication → Users):
--
--   insert into public.admin_users (user_id)
--   values ('YOUR_ADMIN_USER_UUID')
--   on conflict (user_id) do nothing;
-- ============================================================
