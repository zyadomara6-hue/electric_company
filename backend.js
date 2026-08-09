/* ============================================================
   Backend layer (Supabase)
   - Saves customer leads, fetches projects, manages admin
   ============================================================ */

// ---------- Leads: save a customer message ----------
async function saveLead({ name, phone, service, message }) {
    if (!window.appSupabase) return { ok: false, error: "Supabase not configured" };
    try {
        const { error } = await window.appSupabase
            .from("leads")
            .insert([{ name, phone, service, message }]);
        if (error) return { ok: false, error: error.message };
        return { ok: true };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

// ---------- Projects: fetch (public) ----------
async function fetchProjects() {
    // ننتظر حتى تكتمل تهيئة Supabase (dynamic import) لو لسه ناقصة
    if (!window.appSupabase && window.supabaseReady) {
        await new Promise((resolve) => window.supabaseReady(resolve));
    }
    if (!window.appSupabase) return [];
    try {
        const { data, error } = await window.appSupabase
            .from("projects")
            .select("*")
            .eq("status", "active")
            .order("sort_order", { ascending: true });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("fetchProjects error:", e);
        return [];
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
    fetchProjects,
    fetchLeads,
};
