# ✅ Backend + Translation Fixes — Completed

## 🎯 Backend (Supabase): 1 + 3 + 4
- [x] 1. حفظ بيانات العملاء (Leads) في قاعدة البيانات — `schema.sql` + `backend.js` + integration in `main.js`
- [x] 3. لوحة تحكم الأدمن (Admin Panel) — `admin.html` + `admin.js` + `admin-style.css`
- [x] 4. نظام إدارة محتوى (CMS) — المشاريع تُقرأ من قاعدة البيانات ديناميكيًا

## 🔧 Backend files created
- [x] `schema.sql` — جداول projects + leads + settings مع RLS policies
- [x] `supabase-config.js` — إعداد الاتصال (URL + anon key + ready callback)
- [x] `backend.js` — saveLead / fetchProjects / fetchLeads
- [x] `admin.html` — صفحة تسجيل دخول + لوحة تحكم
- [x] `admin.js` — Auth + CRUD للمشاريع + عرض الرسائل
- [x] `admin-style.css` — تنسيق لوحة التحكم

## 🌐 Fix translation issues (hardcoded Arabic that didn't switch to EN)
- [x] `services.html` — إصلاح سكربت supabase إلى UMD build (متسق مع باقي الصفحات)
- [x] `projects.html` — إضافة `data-i18n` لبطاقات المشاريع 4/5/6 + `video_label`
- [x] `main.js` — إضافة ترجمات:
  - `project_4_title/desc`, `project_5_title/desc`, `project_6_title/desc`
  - `video_label` (فيديو / Video)
  - استبدال "فيديو" الثابتة في محمّل CMS الديناميكي بالترجمة

## 📄 Pages consistent (UMD supabase + config + backend + main)
- [x] `index.html`
- [x] `services.html`
- [x] `projects.html`
- [x] `contact.html`

## 📖 README
- [x] خطوات إعداد Supabase كاملة (مفاتيح، جداول، Storage، أدمن، أمان RLS)

## 🛡️ تحديث: تقييد حجم وصيغة ملفات المشاريع
- [x] الحد الأقصى للصور: **5MB** لكل صورة
- [x] الحد الأقصى للفيديو: **50MB** لكل فيديو
- [x] الصور المسموحة: **JPG / JPEG / PNG / WEBP**
- [x] الفيديو المسموح: **MP4 / WEBM**
- [x] رسالة واضحة للمستخدم عند تجاوز الحجم أو الصيغة (تُعرض في `projMsg`)
- [x] منع الرفع قبل إرسال الملف إلى Supabase Storage (تحقق مسبق في `validateFile`)
- [x] تحديث `accept` في حقل رفع الملف + إضافة نص توضيحي (file-hint) في اللوحة
- [x] لم يتغير أي شيء آخر في التصميم أو وظائف لوحة التحكم

## 🏗️ ترحيل المشاريع الثابتة الستة إلى Supabase (Single Source of Truth)
- [x] **الهدف:** Supabase يصبح المصدر الأساسي الوحيد للمشاريع (القديمة + الجديدة) بدون تكرار.
- [x] **السلوك الجديد:** `loadProjectsFromBackend()` — لو فيه بيانات في جدول `projects` → يستبدل محتوى الـ grid بالكامل من قاعدة البيانات فقط (مفيش تكرار مع الثابتة). لو الجدول فاضي → يعرض الكروت الثابتة كاحتياط.
- [x] `main.js` — إضافة `data-db-grid` attribute + إعادة رسم عند تبديل اللغة (re-render) + `project-category` badge.
- [x] `seed-projects.sql` — ملف ترحيل (Seed) آمن للتكرار (Idempotent) ينقل المشاريع الستة لجدول `projects` مع الحفاظ على الصور بروابطها النسبية.
- [x] `schema.sql` — إضافة عمود `category` لجدول `projects`.
- [x] `admin.html` — إضافة حقل "التصنيف / نوع المشروع".
- [x] `admin.js` — حفظ/تعديل/عرض الـ category في الإضافة والتعديل وقائمة المشاريع.
- [x] `admin-style.css` — تنسيق شارة الـ category في قائمة اللوحة.
- [x] `style.css` — تنسيق `.project-category` على بطاقات الموقع (+ الوضع الداكن).
- [x] `README.md` — توثيق خطوة تشغيل `seed-projects.sql` مرة واحدة.

> ⚠️ **خطوة يدوية مطلوبة:** شغّل محتوى `seed-projects.sql` في Supabase SQL Editor مرة واحدة لنقل المشاريع الستة إلى قاعدة البيانات.

## 🐛 إصلاح: اختفاء المشاريع الثابتة والفوتر عند ربط Supabase
- [x] **السبب:** `loadProjectsFromBackend()` كانت تستخدم `grid.innerHTML = ...` مما يستبدل كل محتوى الـ grid بالمشاريع من Supabase فقط، فيُحذف الـ 6 مشاريع الثابتة ويتأثر تخطيط الصفحة/الفوتر.
- [x] **الحل:** أصبحت تستخدم `grid.insertAdjacentHTML("beforeend", ...)` لإضافة مشاريع Supabase **بالإضافة إلى** الثابتة (وليس بدلًا منها)، مع منع التكرار بمقارنة العناوين (`existingTitles`).
- [x] إذا لم توجد مشاريع في Supabase: يظهر المحتوى الثابت كما هو.
- [x] لا يُستبدل `document.body` ولا الـ HTML الكامل للصفحة.
- [x] الـ header والـ footer وجميع الأقسام تُحفظ كما هي.
- [x] التعديل فقط في دالة تحميل/عرض المشاريع في `main.js` دون تغيير التصميم.
- [x] `index.html` لا يحتوي على `.projects-grid`، فالمنطق ينطبق فقط على `projects.html`.
