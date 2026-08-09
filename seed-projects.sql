-- ============================================================
--  نقل المشاريع الثابتة الستة إلى Supabase (Seed)
--  نفّذ هذا الملف مرة واحدة في: Supabase Dashboard → SQL Editor
--  ⚠️ آمن للتكرار (Idempotent): لو شغّلته أكتر من مرة
--     مش هيضيف مشاريع مكررة بنفس العنوان.
-- ============================================================

-- ------------------------------------------------------------
-- 1) إضافة عمود التصنيف/نوع المشروع (لو مش موجود)
-- ------------------------------------------------------------
alter table public.projects
  add column if not exists category text;

-- ------------------------------------------------------------
-- 2) إدراج المشاريع الـ6 (مع منع التكرار حسب العنوان)
--    نستخدم INSERT ... SELECT ... WHERE NOT EXISTS
--    الصور محفوظة بروابطها النسبية الحالية (لا كسر للروابط)
-- ------------------------------------------------------------

-- المشروع 1: تأسيس كهرباء فيلا
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'تأسيس كهرباء فيلا',
  'Villa Electrical Setup',
  'تنفيذ جميع أعمال الكهرباء الخاصة بالفيلا بأعلى معايير الجودة.',
  'Complete villa electrical works with top quality standards.',
  'images/project-1.jpg',
  'تأسيس',
  'active',
  1
where not exists (select 1 from public.projects where title = 'تأسيس كهرباء فيلا');

-- المشروع 2: لوحة كهرباء مصنع
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'لوحة كهرباء مصنع',
  'Factory Electrical Panel',
  'تركيب لوحة كهربائية كاملة مع جميع وسائل الحماية.',
  'Full electrical panel installation with all protection systems.',
  'images/project-2.png',
  'لوحات كهرباء',
  'active',
  2
where not exists (select 1 from public.projects where title = 'لوحة كهرباء مصنع');

-- المشروع 3: عدادات الكهرباء
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'عدادات الكهرباء',
  'Electricity Meters',
  'تركيب وصيانة العدادات مسبقة الدفع والعدادات الذكية.',
  'Installation and maintenance of prepaid and smart meters.',
  'images/project-3.png',
  'عدادات',
  'active',
  3
where not exists (select 1 from public.projects where title = 'عدادات الكهرباء');

-- المشروع 4: مشروع 4 (فيديو)
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'مشروع 4',
  'Project 4',
  'ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.',
  'Write the project description here, and you can attach an image or video.',
  'images/hero-video.mp4',
  'فيديو',
  'active',
  4
where not exists (select 1 from public.projects where title = 'مشروع 4');

-- المشروع 5: مشروع 5 (فيديو)
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'مشروع 5',
  'Project 5',
  'ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.',
  'Write the project description here, and you can attach an image or video.',
  'images/hero-video.mp4',
  'فيديو',
  'active',
  5
where not exists (select 1 from public.projects where title = 'مشروع 5');

-- المشروع 6: مشروع 6 (فيديو)
insert into public.projects (title, title_en, description, description_en, image_url, category, status, sort_order)
select
  'مشروع 6',
  'Project 6',
  'ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.',
  'Write the project description here, and you can attach an image or video.',
  'images/hero-video.mp4',
  'فيديو',
  'active',
  6
where not exists (select 1 from public.projects where title = 'مشروع 6');

-- ============================================================
--  عرض المشاريع بعد النقل (للتأكد)
-- ============================================================
select id, title, category, status, sort_order, image_url
from public.projects
order by sort_order;
