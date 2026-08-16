/* ============================================================
   Backend layer (Supabase)
   - Saves customer leads, fetches projects, manages admin
   ============================================================ */

// ---------- Leads: save a customer contact event ----------
// بيانات اختيارية كلها (قد تأتي من فورم أو من ضغطة واتساب مباشرة)
// name/phone قد يظلان فارغين عند ضغط واتساب مباشرة بدون بيانات.
async function saveLead(opts) {
    if (!window.appSupabase) return { ok: false, error: "Supabase not configured" };

    const {
        name = null,
        phone = null,
        service = null,
        message = null,
        contact_type = "form",   // 'form' أو 'whatsapp'
        page_source = null,      // الصفحة التي جاء منها التواصل
        wa_link = null           // رابط واتساب المستخدم (إن توفر)
    } = opts || {};

    try {
        const { error } = await window.appSupabase
            .from("leads")
            .insert([{
                name,
                phone,
                service,
                message,
                contact_type,
                page_source,
                wa_link
            }]);
        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ---------- Leads: تسجيل حدث تواصل واتساب مباشر ----------
// يُستدعى قبل فتح واتساب عند الضغط على أي زر/رابط واتساب بالموقع.
// - لا يمنع فتح واتساب أبدًا (Fire-and-forget).
// - لا يخترع بيانات العميل؛ يترك name/phone فارغين إن لم تتوفر.
async function trackWhatsAppClick({ service = null, wa_link = null }) {
    const page_source = window.location.pathname.split("/").pop() || "index.html";
    const payload = {
        name: null,          // لا تخمين — يظل فارغًا
        phone: null,         // رقم العميل مش متاح في ضغطة مباشرة
        service,
        message: null,
        contact_type: "whatsapp",
        page_source,
        wa_link
    };

    const result = await saveLead(payload);
    // نقوم فقط بالـ log — لا ننتظر ولا نمنع أي شيء
    if (!result.ok) console.warn("WhatsApp click not tracked:", result.error);
    return result;
}

// ---------- Projects: fetch (public) ----------
async function fetchProjects() {
    // ننتظر حتى تكتمل تهيئة Supabase (dynamic import) لو لسه ناقصة
    if (!window.appSupabase && window.supabaseReady) {
        await new Promise((resolve) => window.supabaseReady(resolve));
    }
    if (!window.appSupabase) {
        return { ok: false, data: [], error: "تعذر الاتصال بخدمة المشاريع." };
    }
    try {
        const { data, error } = await window.appSupabase
            .from("projects")
            .select("*")
            .eq("status", "active")
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return { ok: true, data: data || [], error: null };
    } catch (e) {
        console.error("fetchProjects error:", e);
        return { ok: false, data: [], error: "تعذر تحميل المشاريع حاليًا." };
    }
}

// ---------- Admin: fetch all leads ----------
async function fetchLeads() {
    if (!window.appSupabase) return [];
    try {
        const { data, error } = await window.appSupabase
            .from("leads")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("fetchLeads error:", e);
        return [];
    }
}

// Make available globally
window.OmaraBackend = {
    saveLead,
    trackWhatsAppClick,
    fetchProjects,
    fetchLeads,
};
