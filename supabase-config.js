/* ============================================================
   Supabase Configuration
   ------------------------------------------------------------
   الربط الفعلي بمشروع Supabase:
   - Project URL و Publishable Key (anon key عام — آمن للواجهة)
   - هذا الملف مخصص للـ static hosting (GitHub Pages)
   - ⚠️ لا تضع أبدًا service_role أو أي Secret key هنا
   ============================================================ */

const SUPABASE_URL = "https://fcvjpdvrcptogvzftgep.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_XvrRxq_FliVQGMqUmyM3Ig__j_z4SPs";

// نعمّل القيم على window فورًا
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;

/* ============================================================
   تهيئة Supabase
   ------------------------------------------------------------
   محاولتان:
   1) أولًا نستخدم الـ global `window.supabase` (من UMD build
      المُحمّل بـ <script> في الصفحات) — الأكثر موثوقية.
   2) لو مش موجود، نعمل dynamic import() كـ fallback.
   ============================================================ */
async function initSupabase() {
    try {
        let sdk = window.supabase;

        // لو الـ global مش موجود أصلاً، نحاول dynamic import
        if (!sdk || typeof sdk.createClient !== "function") {
            const mod = await import(
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"
            );
            sdk = mod;
        }

        const client = sdk.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabase = client;
        window.appSupabase = client;
        console.log("✅ Supabase configured:", SUPABASE_URL);
    } catch (err) {
        console.warn("⚠️ Supabase init failed:", err);
        window.appSupabase = null;
    } finally {
        // نخبر المستهلكين (admin.js / main.js) أن التهيئة انتهت
        document.dispatchEvent(new CustomEvent("supabase:ready"));
    }
}

/* ============================================================
   window.supabaseReady(callback)
   ------------------------------------------------------------
   ينفّذ `callback` بعدما تكون تهيئة Supabase جاهزة.
   ============================================================ */
window.supabaseReady = function (callback) {
    if (typeof callback !== "function") return;

    // لو `window.appSupabase` اتضبط بالفعل (أو اتعرف إنه null)
    if (window.appSupabase || window.appSupabase === null) {
        callback();
        return;
    }

    let done = false;
    const finish = () => {
        if (done) return;
        done = true;
        document.removeEventListener("supabase:ready", finish);
        callback();
    };

    document.addEventListener("supabase:ready", finish);

    // مهلة أمان: لو حصل خطأ في التحميل، نكمل على أي حال
    setTimeout(finish, 4000);
};

// نبدأ التهيئة
initSupabase();
