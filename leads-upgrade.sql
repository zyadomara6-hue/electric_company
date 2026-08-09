-- ============================================================
--  ترقية نظام Leads — مؤسسة عمارة للكهرباء والمقاولات
--  نفّذ هذه الأوامر مرة واحدة في: Supabase Dashboard → SQL Editor
--  ⚠️ تنفيذ هذا الملف مطلوب بعد تحديث الكود (backend.js / main.js / admin.js)
-- ============================================================

-- ------------------------------------------------------------
-- 1) إضافة أعمدة جديدة لجدول leads
--    contact_type : 'form' (طلب فورم) أو 'whatsapp' (تواصل واتساب مباشر)
--    page_source  : الصفحة التي جاء منها التواصل (index.html ...)
--    wa_link      : رابط واتساب المستخدم إن توفر
-- ------------------------------------------------------------
alter table public.leads
  add column if not exists contact_type text default 'form';

alter table public.leads
  add column if not exists page_source text;

alter table public.leads
  add column if not exists wa_link text;

-- ------------------------------------------------------------
-- 2) جعل الاسم ورقم الهاتف اختياريين (nullable)
--    لأن تواصل الواتساب المباشر ممكن يتم بدون تسجيل بيانات العميل
-- ------------------------------------------------------------
alter table public.leads alter column name drop not null;
alter table public.leads alter column phone drop not null;

-- ------------------------------------------------------------
-- 3) (اختياري) مؤشر لتسريع الاستعلامات حسب نوع التواصل
-- ------------------------------------------------------------
create index if not exists idx_leads_contact_type on public.leads (contact_type);
create index if not exists idx_leads_created_at on public.leads (created_at desc);

-- ✅ لا حاجة لتغيير سياسات RLS — القائمة الحالية تكفي:
--    anon:     insert فقط (يحفظ البيانات)
--    authenticated (الأدمن): select فقط (يقرأ في لوحة التحكم)
--    لا أحد يقرأ بيانات العملاء من الخارج. الأمان كما هو.
-- ============================================================
