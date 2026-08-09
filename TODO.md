# TODO: Backend — نظام Leads المتقدم (Leads 2.0)

## الهدف
- تسجيل **كل** تواصل من العملاء: طلبات الفورم + ضغطات واتساب المباشرة.
- عرضها في لوحة التحكم مع فلترة حسب النوع.

## الخطوات
- [x] 1. `leads-upgrade.sql`: إضافة أعمدة `contact_type` و `page_source` و `wa_link` + جعل الاسم/التليفون اختياريين
- [x] 2. `backend.js`: دالة `saveLead` مرنة + دالة `trackWhatsAppClick` جديدة
- [x] 3. `main.js`: الفورم يرسل `contact_type: "form"` + `page_source` + `wa_link`
- [x] 4. `main.js`: تتبع عالمي لضغطات واتساب (event delegation) بدون منع فتح واتساب
- [x] 5. `admin.html`: إضافة شريط فلترة (الكل / الفورم / واتساب) + ملخص
- [x] 6. `admin.js`: عرض سجلات غنية (شارة نوع + مصدر + رابط) + منطق الفلترة
- [x] 7. `admin-style.css`: تنسيق شريط الفلترة والملخص والشارات
- [x] 8. `README.md`: توثيق نظام Leads 2.0 وخطوات الترقية

## بقي عليك (خطوة يدوية واحدة)
- [ ] 9. تشغيل ملف `leads-upgrade.sql` مرة واحدة في Supabase → SQL Editor
