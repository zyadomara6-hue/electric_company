/* ============================================================
   Admin Panel Logic (Supabase Auth + CRUD)
   ============================================================ */
(function () {
    const sb = () => window.appSupabase;

    // ---------- Elements ----------
    const loginScreen = document.getElementById("loginScreen");
    const adminPanel = document.getElementById("adminPanel");
    const loginForm = document.getElementById("loginForm");
    const loginError = document.getElementById("loginError");
    const logoutBtn = document.getElementById("logoutBtn");
    const tabs = document.querySelectorAll(".admin-tab");
    const tabPanels = document.querySelectorAll(".admin-tab-panel");
    const leadsCount = document.getElementById("leadsCount");
    const projectsList = document.getElementById("projectsList");
    const leadsList = document.getElementById("leadsList");
    const projectForm = document.getElementById("projectForm");
    const projMsg = document.getElementById("projMsg");

// ---------- Config check ----------
    function configReady() {
        if (!window.appSupabase) {
            loginError.textContent = "⚠️ لم يتم الاتصال بـ Supabase. تأكد من تحميل المكتبة وربط supabase-config.js ثم حدّث الصفحة.";
            return false;
        }
        return true;
    }

    // ---------- Auth ----------
    async function checkSession() {
        if (!configReady()) return;
        try {
            const { data: { session } } = await sb().auth.getSession();
            if (session) {
                showPanel();
                loadProjects();
                loadLeads();
            } else {
                showLogin();
            }
        } catch (err) {
            console.error("checkSession error:", err);
            loginError.textContent = "تعذر الاتصال بـ Supabase: " + err.message;
            showLogin();
        }
    }

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!configReady()) return;
        loginError.textContent = "";
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const { error } = await sb().auth.signInWithPassword({ email, password });
        if (error) {
            loginError.textContent = error.message;
        } else {
            showPanel();
            loadProjects();
            loadLeads();
        }
    });

    logoutBtn.addEventListener("click", async () => {
        await sb().auth.signOut();
        showLogin();
    });

    function showLogin() {
        loginScreen.style.display = "flex";
        adminPanel.style.display = "none";
    }
    function showPanel() {
        loginScreen.style.display = "none";
        adminPanel.style.display = "block";
    }

    // ---------- Tabs ----------
    tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            const target = tab.getAttribute("data-tab");
            tabPanels.forEach((p) => {
                p.classList.remove("active");
                if (p.id === "tab-" + target) p.classList.add("active");
            });
        });
    });

// ---------- Projects CRUD ----------
    let editingId = null; // معرف المشروع الجاري تعديله (null = إضافة جديدة)

    window.editProject = async (id) => {
        const { data, error } = await sb().from("projects").select("*").eq("id", id).single();
        if (error) { alert(error.message); return; }
        if (!data) return;

editingId = id;
        document.getElementById("projTitle").value = data.title || "";
        document.getElementById("projTitleEn").value = data.title_en || "";
        document.getElementById("projCategory").value = data.category || "";
        document.getElementById("projDesc").value = data.description || "";
        document.getElementById("projDescEn").value = data.description_en || "";
        document.getElementById("projLink").value = data.image_url || "";
        document.getElementById("projSort").value = data.sort_order || 0;
        document.getElementById("projMsg").textContent = "✏️ تعديل المشروع — عدّل البيانات ثم اضغط حفظ.";
        document.getElementById("projSubmit").innerHTML = '<i class="fa-solid fa-save"></i> حفظ التعديلات';
        document.getElementById("projCancelEdit").style.display = "inline-block";
        document.getElementById("projForm").scrollIntoView({ behavior: "smooth" });
    };

    window.cancelEdit = () => {
        editingId = null;
        projectForm.reset();
        document.getElementById("projMsg").textContent = "";
        document.getElementById("projSubmit").innerHTML = '<i class="fa-solid fa-save"></i> حفظ المشروع';
        document.getElementById("projCancelEdit").style.display = "none";
    };

    async function loadProjects() {
        const { data, error } = await sb().from("projects").select("*").order("sort_order", { ascending: true });
        if (error) { projectsList.innerHTML = `<p class="empty">خطأ: ${error.message}</p>`; return; }
        if (!data.length) { projectsList.innerHTML = `<p class="empty">لا توجد مشاريع بعد. أضف أول مشروع.</p>`; return; }
        projectsList.innerHTML = data.map((p) => `
            <div class="project-admin-item">
                ${p.image_url ? `<img src="${p.image_url}" alt="" class="project-admin-thumb">` : '<div class="project-admin-thumb project-admin-thumb--empty"><i class="fa-solid fa-image"></i></div>'}
<div class="project-admin-info">
                    <strong>${p.title || ""}</strong>
                    <span>${p.title_en || ""}</span>
                    ${p.category ? `<span class="project-admin-category">${escapeHtml(p.category)}</span>` : ""}
                </div>
<div class="project-admin-actions">
                    <button class="admin-btn admin-btn--ghost" onclick="editProject('${p.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button class="admin-btn admin-btn--ghost" onclick="toggleStatus('${p.id}','${p.status}')">${p.status === 'active' ? 'إخفاء' : 'إظهار'}</button>
                    <button class="admin-btn admin-btn--danger" onclick="deleteProject('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `).join("");
    }

window.deleteProject = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا المشروع؟")) return;

        // حذف الصورة/الملف المرتبط من storage أولًا (لو موجود)
        const { data } = await sb().from("projects").select("image_url").eq("id", id).single();
        if (data && data.image_url) {
            const url = data.image_url;
            const marker = "/object/public/project-images/";
            const idx = url.indexOf(marker);
            if (idx !== -1) {
                const path = url.substring(idx + marker.length).split("?")[0];
                if (path) {
                    await sb().storage.from("project-images").remove([path]).catch(() => {});
                }
            }
        }

        const { error } = await sb().from("projects").delete().eq("id", id);
        if (error) alert(error.message);
        loadProjects();
    };

    window.toggleStatus = async (id, status) => {
        const next = status === "active" ? "hidden" : "active";
        const { error } = await sb().from("projects").update({ status: next }).eq("id", id);
        if (error) alert(error.message);
        loadProjects();
    };

// ---------- File validation (before upload to Supabase) ----------
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

    function validateFile(file) {
        // التحقق من الصيغة
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        if (!isImage && !isVideo) {
            return {
                ok: false,
                message: "❌ صيغة الملف غير مدعومة. الصور المسموحة: JPG / JPEG / PNG / WEBP | الفيديو المسموح: MP4 / WEBM."
            };
        }

        // التحقق من الحجم
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        const limitText = isVideo ? "50MB" : "5MB";
        if (file.size > maxSize) {
            return {
                ok: false,
                message: `❌ حجم الملف يتجاوز الحد المسموح (${limitText} كحد أقصى).`
            };
        }

        return { ok: true };
    }

    async function uploadFile(file) {
        const validation = validateFile(file);
        if (!validation.ok) throw new Error(validation.message);

        const ext = file.name.split(".").pop();
        const path = `projects/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const { error } = await sb().storage.from("project-images").upload(path, file);
        if (error) throw error;
        const { data } = sb().storage.from("project-images").getPublicUrl(path);
        return data.publicUrl;
    }

    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        projMsg.textContent = "";
const title = document.getElementById("projTitle").value.trim();
        const titleEn = document.getElementById("projTitleEn").value.trim();
        const category = document.getElementById("projCategory").value.trim();
        const desc = document.getElementById("projDesc").value.trim();
        const descEn = document.getElementById("projDescEn").value.trim();
        const link = document.getElementById("projLink").value.trim();
        const sort = Number(document.getElementById("projSort").value) || 0;
        const file = document.getElementById("projImage").files[0];

let image_url = link;
        if (file) {
            // التحقق من الصيغة والحجم قبل الرفع (لمنع إرسال الملف لـ Supabase)
            const validation = validateFile(file);
            if (!validation.ok) {
                projMsg.textContent = validation.message;
                return;
            }
            projMsg.textContent = "جاري رفع الملف...";
            try {
                image_url = await uploadFile(file);
            } catch (err) {
                projMsg.textContent = err.message;
                return;
            }
        }

let result;
        if (editingId) {
            // وضع التعديل
result = await sb().from("projects").update({
                title, title_en: titleEn, category: category || null,
                description: desc, description_en: descEn,
                image_url: image_url || null, sort_order: sort
            }).eq("id", editingId);
        } else {
            // وضع الإضافة
            result = await sb().from("projects").insert([{
                title, title_en: titleEn, category: category || null,
                description: desc, description_en: descEn,
                image_url: image_url || null, sort_order: sort, status: "active"
            }]);
        }

        if (result.error) {
            projMsg.textContent = "خطأ: " + result.error.message;
        } else {
            projMsg.textContent = editingId ? "✅ تم حفظ التعديلات بنجاح" : "✅ تمت إضافة المشروع بنجاح";
            projectForm.reset();
            cancelEdit();
            loadProjects();
        }
    });

// ---------- Leads ----------
    let allLeads = [];
    let currentLeadFilter = "all";

    // تسمية نصوص الخدمة والدول — للعرض فقط
    const SERVICE_LABELS = {
        installation: { ar: "تأسيس الكهرباء", en: "Electrical Installation" },
        panels: { ar: "لوحات الكهرباء", en: "Electrical Panels" },
        maintenance: { ar: "الصيانة الكهربائية", en: "Electrical Maintenance" },
        factory: { ar: "كهرباء المصانع", en: "Factory Electrical" },
        home: { ar: "كهرباء المنازل", en: "Home Electrical" },
        meters: { ar: "عدادات الكهرباء", en: "Electricity Meters" },
        supplies: { ar: "توريد مستلزمات الكهرباء", en: "Electrical Supplies" },
        general: { ar: "استفسار عام", en: "General Inquiry" }
    };

    function serviceLabel(service) {
        if (!service) return "عام";
        return (SERVICE_LABELS[service] && SERVICE_LABELS[service].ar) || service;
    }

    function typeLabel(type) {
        return type === "whatsapp"
            ? { tag: "تواصل واتساب", cls: "lead-type--whatsapp", icon: "fa-brands fa-whatsapp" }
            : { tag: "طلب فورم", cls: "lead-type--form", icon: "fa-solid fa-file-lines" };
    }

    function pageSourceLabel(src) {
        if (!src) return "غير معروف";
        const names = {
            "index.html": "الرئيسية",
            "services.html": "الخدمات",
            "projects.html": "المشاريع",
            "contact.html": "تواصل معنا"
        };
        return names[src] ? `${names[src]} (${src})` : src;
    }

    async function loadLeads() {
        const { data, error } = await sb().from("leads").select("*").order("created_at", { ascending: false });
        if (error) { leadsList.innerHTML = `<p class="empty">خطأ: ${error.message}</p>`; return; }
        allLeads = data || [];
        leadsCount.textContent = allLeads.length;
        renderLeads();
    }

    function renderLeads() {
        const summary = document.getElementById("leadsSummary");
        const total = allLeads.length;
        const formCount = allLeads.filter((l) => l.contact_type !== "whatsapp").length;
        const waCount = allLeads.filter((l) => l.contact_type === "whatsapp").length;
        if (summary) {
            summary.innerHTML = `
                <span class="leads-summary__item leads-summary__item--total"><i class="fa-solid fa-inbox"></i> الإجمالي: ${total}</span>
                <span class="leads-summary__item leads-summary__item--form"><i class="fa-solid fa-file-lines"></i> طلبات الفورم: ${formCount}</span>
                <span class="leads-summary__item leads-summary__item--wa"><i class="fa-brands fa-whatsapp"></i> تواصل واتساب: ${waCount}</span>
            `;
        }

        const filtered = currentLeadFilter === "all"
            ? allLeads
            : allLeads.filter((l) =>
                currentLeadFilter === "whatsapp"
                    ? l.contact_type === "whatsapp"
                    : l.contact_type !== "whatsapp"
              );

        if (!filtered.length) {
            leadsList.innerHTML = `<p class="empty">لا توجد سجلات في هذا القسم.</p>`;
            return;
        }

        leadsList.innerHTML = filtered.map((l) => {
            const type = typeLabel(l.contact_type);
            return `
            <div class="lead-item">
                <div class="lead-head">
                    <div class="lead-title">
                        <span class="lead-type ${type.cls}"><i class="${type.icon}"></i> ${type.tag}</span>
                        <strong>${escapeHtml(l.name || "عميل من الموقع")}</strong>
                    </div>
                    <span class="lead-date">${new Date(l.created_at).toLocaleString("ar-EG")}</span>
                </div>
                <div class="lead-body">
                    ${l.phone ? `<p><i class="fa-solid fa-phone"></i> ${escapeHtml(l.phone)}</p>` : ""}
                    ${l.service ? `<p><i class="fa-solid fa-tag"></i> ${escapeHtml(serviceLabel(l.service))}</p>` : ""}
                    ${l.page_source ? `<p class="lead-source"><i class="fa-solid fa-location-crosshairs"></i> المصدر: ${escapeHtml(pageSourceLabel(l.page_source))}</p>` : ""}
                    ${l.wa_link ? `<p class="lead-walink"><i class="fa-brands fa-whatsapp"></i> <a href="${escapeHtml(l.wa_link)}" target="_blank" rel="noopener">${escapeHtml(l.wa_link)}</a></p>` : ""}
                    ${l.message ? `<p class="lead-msg">${escapeHtml(l.message)}</p>` : ""}
                </div>
            </div>
        `;
        }).join("");
    }

    // ---------- Leads filter ----------
    const leadsFilter = document.getElementById("leadsFilter");
    if (leadsFilter) {
        leadsFilter.addEventListener("click", (e) => {
            const btn = e.target.closest(".leads-filter__btn");
            if (!btn) return;
            leadsFilter.querySelectorAll(".leads-filter__btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentLeadFilter = btn.getAttribute("data-filter");
            renderLeads();
        });
    }

    function escapeHtml(str) {
        const div = document.createElement("div");
        div.textContent = str || "";
        return div.innerHTML;
    }

// ---------- Init ----------
    // ننتظر حتى تكتمل تهيئة Supabase (dynamic import) قبل فحص الجلسة
    if (window.supabaseReady) {
        window.supabaseReady(() => {
            checkSession();
        });
    } else {
        checkSession();
    }
})();
