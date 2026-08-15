-- ============================================================
--  مؤسسة عمارة للكهرباء والمقاولات — Supabase Schema
--  نفّذ هذه الأوامر في: Supabase Dashboard → SQL Editor
--  ⚠️ الأمان: يعتمد على Row Level Security (RLS)
--     الزائر (anon) يقرأ فقط القسم العام، ولا يرى بيانات العملاء.
-- ============================================================

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

-- الجمهور (anon/سائح) يقرأ المشاريع النشطة فقط — للعرض على الموقع
drop policy if exists "Public read projects" on public.projects;
create policy "Public read projects"
  on public.projects for select
  using (status = 'active');

-- ✅ الأدمن فقط (authenticated) يقدر يضيف مشاريع
drop policy if exists "Admin insert projects" on public.projects;
create policy "Admin insert projects"
  on public.projects for insert
  to authenticated
  with check (true);

-- ✅ الأدمن فقط يقدر يعدّل مشاريع
drop policy if exists "Admin update projects" on public.projects;
create policy "Admin update projects"
  on public.projects for update
  to authenticated
  using (true);

-- ✅ الأدمن فقط يقدر يحذف مشاريع
drop policy if exists "Admin delete projects" on public.projects;
create policy "Admin delete projects"
  on public.projects for delete
  to authenticated
  using (true);

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

-- الزائر (anon) يقدر فقط يُرسل/يحفظ رسالة جديدة (Insert)
-- ⛔ لا يقدر يقرأ الرسائل ولا يعدّلها ولا يحذفها
drop policy if exists "Public insert leads" on public.leads;
create policy "Public insert leads"
  on public.leads for insert
  to anon
  with check (true);

-- ✅ الأدمن فقط (authenticated) يقدر يقرأ رسائل العملاء
drop policy if exists "Admin read leads" on public.leads;
create policy "Admin read leads"
  on public.leads for select
  to authenticated
  using (true);

-- ✅ الأدمن فقط يقدر يحذف رسائل العملاء
drop policy if exists "Admin delete leads" on public.leads;
create policy "Admin delete leads"
  on public.leads for delete
  to authenticated
  using (true);

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
  with check (true);

drop policy if exists "Admin update settings" on public.settings;
create policy "Admin update settings"
  on public.settings for update
  to authenticated
  using (true);

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

-- ✅ الأدمن فقط يرفع ملفات
drop policy if exists "Admin upload project images" on storage.objects;
create policy "Admin upload project images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'project-images');

-- ✅ الأدمن فقط يحدّث ملفات
drop policy if exists "Admin update project images" on storage.objects;
create policy "Admin update project images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'project-images');

-- ✅ الأدمن فقط يحذف ملفات
drop policy if exists "Admin delete project images" on storage.objects;
create policy "Admin delete project images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'project-images');

-- ============================================================
--  ⚠️ ملاحظة أمان مهمة جدًا:
--  لا تضع أبدًا service_role key أو أي Secret key في:
--     main.js  /  backend.js  /  supabase-config.js  /  GitHub
--  الـ anon key آمن للاستخدام العام، والأمان الحقيقي يعتمد
--  على سياسات RLS اللي فوق.
-- ============================================================
