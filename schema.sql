-- ============================================================
--  مؤسسة عمارة للكهرباء والمقاولات — Supabase Schema
--  نفّذ هذه الأوامر في: Supabase Dashboard → SQL Editor
--  ⚠️ الأمان: يعتمد على Row Level Security (RLS) + جدول admin_users
--     الزائر يقرأ المشاريع المنشورة فقط، ولا يرى بيانات العملاء.
--     أي حساب authenticated عادي ليس أدمن.
--  قاعدة موجودة مسبقاً: نفّذ أيضاً admin-security-fix.sql
-- ============================================================

-- ------------------------------------------------------------
-- 0) حسابات الأدمن المصرّح لها + دالة is_admin()
-- ------------------------------------------------------------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;

revoke all on table public.admin_users from public, anon, authenticated;

drop policy if exists "Admin users select own" on public.admin_users;

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
-- 1) جدول المشاريع (Projects) — يعمل كـ CMS
-- ------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  description text,
  description_en text,
  image_url text,
  media jsonb default '[]'::jsonb,  -- قائمة الصور والفيديوهات للمشروع الواحد
  category text,
  status text default 'active',
  sort_order bigint default 0,
  created_at timestamptz default now()
);

-- لو الجدول موجود مسبقاً، يضيف العمود دون مساس بالبيانات القديمة
alter table public.projects add column if not exists media jsonb default '[]'::jsonb;

alter table public.projects enable row level security;

-- الجمهور يقرأ المشاريع النشطة فقط — للعرض على الموقع
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Admin read all projects" on public.projects;
drop policy if exists "Admin insert projects" on public.projects;
drop policy if exists "Admin update projects" on public.projects;
drop policy if exists "Admin delete projects" on public.projects;

create policy "Public read projects"
  on public.projects for select
  using (status = 'active');

create policy "Admin read all projects"
  on public.projects for select
  to authenticated
  using (public.is_admin());

create policy "Admin insert projects"
  on public.projects for insert
  to authenticated
  with check (public.is_admin());

create policy "Admin update projects"
  on public.projects for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admin delete projects"
  on public.projects for delete
  to authenticated
  using (public.is_admin());

-- ------------------------------------------------------------
-- 2) جدول رسائل وتواصل العملاء (Leads 2.0) — 🔒 بيانات حساسة
-- ------------------------------------------------------------
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  service text,
  message text,
  contact_type text default 'form',   -- 'form' (طلب فورم) أو 'whatsapp' (ضغطة واتساب مباشرة)
  page_source text,                    -- الصفحة التي تم منها التواصل (index.html, services.html, ...)
  wa_link text,                        -- رابط واتساب المستخدم إن توفر
  created_at timestamptz default now()
);

alter table public.leads enable row level security;

-- الزائر والمستخدم العادي: إدراج فقط (فورم التواصل / واتساب)
-- ⛔ القراءة والحذف للأدمن عبر is_admin() فقط
drop policy if exists "Public insert leads" on public.leads;
drop policy if exists "Admin read leads" on public.leads;
drop policy if exists "Admin delete leads" on public.leads;

create policy "Public insert leads"
  on public.leads for insert
  to anon, authenticated
  with check (true);

create policy "Admin read leads"
  on public.leads for select
  to authenticated
  using (public.is_admin());

create policy "Admin delete leads"
  on public.leads for delete
  to authenticated
  using (public.is_admin());

-- مؤشرات لتسريع الاستعلامات والفلترة
create index if not exists idx_leads_contact_type on public.leads (contact_type);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

-- ------------------------------------------------------------
-- 3) جدول الإعدادات / المحتوى العام (اختياري)
-- ------------------------------------------------------------
create table if not exists public.settings (
  key text primary key,
  value text
);

alter table public.settings enable row level security;

drop policy if exists "Public read settings" on public.settings;
create policy "Public read settings"
  on public.settings for select
  using (true);

drop policy if exists "Admin write settings" on public.settings;
create policy "Admin write settings"
  on public.settings for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists "Admin update settings" on public.settings;
create policy "Admin update settings"
  on public.settings for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ============================================================
--  🖼️ Storage — رفع الـ images/الفيديوهات
--  ⚠️ إنشاء bucket (Public) + سياسات القراءة والرفع والحذف
-- ============================================================

-- إنشاء الـ bucket (public) تلقائيًا — يشغّل مرة واحدة فقط
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

-- الجمهور يقرأ الملفات فقط (للعرض على الموقع)
drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

drop policy if exists "Admin upload project images" on storage.objects;
create policy "Admin upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admin update project images" on storage.objects;
create policy "Admin update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin())
  with check (bucket_id = 'project-images' and public.is_admin());

drop policy if exists "Admin delete project images" on storage.objects;
create policy "Admin delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images' and public.is_admin());

-- ============================================================
--  ⚠️ ملاحظة أمان مهمة جدًا:
--  لا تضع أبدًا service_role key أو أي Secret key في:
--     main.js  /  backend.js  /  supabase-config.js  /  GitHub
--  الـ anon key آمن للاستخدام العام، والأمان الحقيقي يعتمد
--  على سياسات RLS ودالة is_admin() أعلاه.
--  بعد إنشاء حساب الأدمن في Authentication، أضفه إلى admin_users.
-- ============================================================
