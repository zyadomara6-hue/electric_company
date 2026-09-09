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
    // ---------- Projects CRUD with Multi-Media Support ----------
    let editingId = null; // معرف المشروع الجاري تعديله (null = إضافة جديدة)
    let currentMediaList = []; // مصفوفة الوسائط الحالية: [{ id, url, previewUrl, type, file, isLocal }]

    const projImages = document.getElementById("projImages");
    const projLinkInput = document.getElementById("projLinkInput");
    const addLinkBtn = document.getElementById("addLinkBtn");
    const mediaManagerContainer = document.getElementById("mediaManagerContainer");
    const mediaGalleryPreview = document.getElementById("mediaGalleryPreview");
    const mediaCount = document.getElementById("mediaCount");
    const clearAllMediaBtn = document.getElementById("clearAllMediaBtn");

    function isVideoUrlOrFile(urlOrName) {
        return /\.(mp4|webm|ogg)(\?|$)/i.test(urlOrName || "");
    }

    function renderMediaGallery() {
        if (!mediaManagerContainer || !mediaGalleryPreview) return;
        if (!currentMediaList.length) {
            mediaManagerContainer.style.display = "none";
            mediaGalleryPreview.innerHTML = "";
            if (mediaCount) mediaCount.textContent = "0";
            return;
        }

        mediaManagerContainer.style.display = "block";
        if (mediaCount) mediaCount.textContent = currentMediaList.length;

        mediaGalleryPreview.innerHTML = currentMediaList.map((item, index) => {
            const isVideo = item.type === "video" || isVideoUrlOrFile(item.url || item.file?.name);
            const displaySrc = item.previewUrl || item.url;
            return `
                <div class="media-gallery-item ${index === 0 ? 'media-gallery-item--cover' : ''}" data-index="${index}">
                    ${index === 0 ? '<span class="media-cover-badge"><i class="fa-solid fa-star"></i> الغلاف</span>' : ''}
                    <span class="media-type-badge">${isVideo ? '<i class="fa-solid fa-video"></i>' : '<i class="fa-solid fa-image"></i>'}</span>
                    ${isVideo
                        ? `<div class="media-thumb-video"><video src="${displaySrc}" muted></video></div>`
                        : `<img src="${displaySrc}" alt="معاينة" class="media-thumb-img">`
                    }
                    <button type="button" class="media-remove-btn" title="حذف" onclick="removeMediaItem(${index})">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
            `;
        }).join("");
    }

    window.removeMediaItem = (index) => {
        currentMediaList.splice(index, 1);
        renderMediaGallery();
    };

    if (clearAllMediaBtn) {
        clearAllMediaBtn.addEventListener("click", () => {
            if (!currentMediaList.length) return;
            if (confirm("هل تريد مسح جميع الصور والفيديوهات المحددة لهذا المشروع؟")) {
                currentMediaList = [];
                if (projImages) projImages.value = "";
                renderMediaGallery();
            }
        });
    }

    // إضافة ملفات من الجهاز (عدة ملفات)
    if (projImages) {
        projImages.addEventListener("change", (e) => {
            const files = Array.from(e.target.files || []);
            for (const file of files) {
                const validation = validateFile(file);
                if (!validation.ok) {
                    alert(validation.message);
                    continue;
                }
                const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
                const previewUrl = URL.createObjectURL(file);
                currentMediaList.push({
                    id: Math.random().toString(36).slice(2, 9),
                    file,
                    previewUrl,
                    type: isVideo ? "video" : "image",
                    isLocal: true
                });
            }
            renderMediaGallery();
            projImages.value = "";
        });
    }

    // إضافة رابط مباشر
    if (addLinkBtn && projLinkInput) {
        addLinkBtn.addEventListener("click", () => {
            const url = projLinkInput.value.trim();
            if (!url) return;
            const isVideo = isVideoUrlOrFile(url);
            currentMediaList.push({
                id: Math.random().toString(36).slice(2, 9),
                url,
                previewUrl: url,
                type: isVideo ? "video" : "image",
                isLocal: false
            });
            projLinkInput.value = "";
            renderMediaGallery();
        });
    }

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
        document.getElementById("projSort").value = data.sort_order || 0;
        document.getElementById("projMsg").textContent = "✏️ تعديل المشروع — عدّل البيانات والوسائط ثم اضغط حفظ.";
        document.getElementById("projSubmit").innerHTML = '<i class="fa-solid fa-save"></i> حفظ التعديلات';
        document.getElementById("projCancelEdit").style.display = "inline-block";

        // تحميل الوسائط
        currentMediaList = [];
        if (Array.isArray(data.media) && data.media.length) {
            currentMediaList = data.media.map((m) => {
                const url = typeof m === "string" ? m : m.url;
                const type = (typeof m === "object" && m.type) ? m.type : (isVideoUrlOrFile(url) ? "video" : "image");
                return { id: Math.random().toString(36).slice(2, 9), url, previewUrl: url, type, isLocal: false };
            });
        } else if (data.image_url) {
            currentMediaList = [{
                id: Math.random().toString(36).slice(2, 9),
                url: data.image_url,
                previewUrl: data.image_url,
                type: isVideoUrlOrFile(data.image_url) ? "video" : "image",
                isLocal: false
            }];
        }
        renderMediaGallery();

        document.getElementById("projectForm").scrollIntoView({ behavior: "smooth" });
    };

    window.cancelEdit = () => {
        editingId = null;
        projectForm.reset();
        currentMediaList = [];
        renderMediaGallery();
        document.getElementById("projMsg").textContent = "";
        document.getElementById("projSubmit").innerHTML = '<i class="fa-solid fa-save"></i> حفظ المشروع';
        document.getElementById("projCancelEdit").style.display = "none";
    };

    async function loadProjects() {
        const { data, error } = await sb().from("projects").select("*").order("sort_order", { ascending: true });
        if (error) { projectsList.innerHTML = `<p class="empty">خطأ: ${error.message}</p>`; return; }
        if (!data.length) { projectsList.innerHTML = `<p class="empty">لا توجد مشاريع بعد. أضف أول مشروع.</p>`; return; }
        projectsList.innerHTML = data.map((p) => {
            const count = Array.isArray(p.media) && p.media.length ? p.media.length : (p.image_url ? 1 : 0);
            return `
            <div class="project-admin-item">
                <div class="project-admin-thumb-wrap">
                    ${p.image_url ? `<img src="${p.image_url}" alt="" class="project-admin-thumb">` : '<div class="project-admin-thumb project-admin-thumb--empty"><i class="fa-solid fa-image"></i></div>'}
                    ${count > 1 ? `<span class="project-admin-mediacount" title="${count} صور وفيديوهات"><i class="fa-solid fa-photo-film"></i> ${count}</span>` : ''}
                </div>
                <div class="project-admin-info">
                    <strong>${escapeHtml(p.title || "")}</strong>
                    <span>${escapeHtml(p.title_en || "")}</span>
                    <div class="project-admin-meta">
                        ${p.category ? `<span class="project-admin-category">${escapeHtml(p.category)}</span>` : ""}
                        ${count > 1 ? `<span class="project-admin-tag-media">${count} وسائط</span>` : ""}
                    </div>
                </div>
                <div class="project-admin-actions">
                    <button class="admin-btn admin-btn--ghost" onclick="editProject('${p.id}')"><i class="fa-solid fa-pen"></i> تعديل</button>
                    <button class="admin-btn admin-btn--ghost" onclick="toggleStatus('${p.id}','${p.status}')">${p.status === 'active' ? 'إخفاء' : 'إظهار'}</button>
                    <button class="admin-btn admin-btn--danger" onclick="deleteProject('${p.id}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        `;
        }).join("");
    }

    window.deleteProject = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا المشروع وجميع ملفاته؟")) return;

        // حذف الملفات المرتبطة من storage
        const { data } = await sb().from("projects").select("image_url, media").eq("id", id).single();
        if (data) {
            const urls = [];
            if (data.image_url) urls.push(data.image_url);
            if (Array.isArray(data.media)) {
                data.media.forEach((m) => {
                    const u = typeof m === "string" ? m : m.url;
                    if (u) urls.push(u);
                });
            }

            const marker = "/object/public/project-images/";
            const pathsToDelete = [];
            urls.forEach((url) => {
                const idx = url.indexOf(marker);
                if (idx !== -1) {
                    const path = url.substring(idx + marker.length).split("?")[0];
                    if (path && !pathsToDelete.includes(path)) pathsToDelete.push(path);
                }
            });

            if (pathsToDelete.length) {
                await sb().storage.from("project-images").remove(pathsToDelete).catch(() => {});
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

    // ---------- File validation ----------
    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;   // 5MB
    const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB

    function validateFile(file) {
        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
        if (!isImage && !isVideo) {
            return {
                ok: false,
                message: "❌ صيغة الملف غير مدعومة. الصور المسموحة: JPG / JPEG / PNG / WEBP | الفيديو المسموح: MP4 / WEBM."
            };
        }

        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        const limitText = isVideo ? "50MB" : "5MB";
        if (file.size > maxSize) {
            return {
                ok: false,
                message: `❌ حجم الملف (${file.name}) يتجاوز الحد المسموح (${limitText} كحد أقصى).`
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
        const sort = Number(document.getElementById("projSort").value) || 0;

        // رفع وحفظ الوسائط المحددة
        const finalMedia = [];
        if (currentMediaList.length > 0) {
            projMsg.textContent = "جاري معالجة ورفع الوسائط...";
            try {
                for (let i = 0; i < currentMediaList.length; i++) {
                    const item = currentMediaList[i];
                    if (item.isLocal && item.file) {
                        projMsg.textContent = `جاري رفع الملف (${i + 1} من ${currentMediaList.length})...`;
                        const uploadedUrl = await uploadFile(item.file);
                        finalMedia.push({
                            url: uploadedUrl,
                            type: item.type || (isVideoUrlOrFile(uploadedUrl) ? "video" : "image")
                        });
                    } else if (item.url) {
                        finalMedia.push({
                            url: item.url,
                            type: item.type || (isVideoUrlOrFile(item.url) ? "video" : "image")
                        });
                    }
                }
            } catch (err) {
                projMsg.textContent = "❌ خطأ أثناء الرفع: " + err.message;
                return;
            }
        }

        const coverUrl = finalMedia.length > 0 ? finalMedia[0].url : null;

        let result;
        if (editingId) {
            // وضع التعديل
            result = await sb().from("projects").update({
                title, title_en: titleEn, category: category || null,
                description: desc, description_en: descEn,
                image_url: coverUrl,
                media: finalMedia,
                sort_order: sort
            }).eq("id", editingId);
        } else {
            // وضع الإضافة
            result = await sb().from("projects").insert([{
                title, title_en: titleEn, category: category || null,
                description: desc, description_en: descEn,
                image_url: coverUrl,
                media: finalMedia,
                sort_order: sort, status: "active"
            }]);
        }

        if (result.error) {
            projMsg.textContent = "خطأ: " + result.error.message;
        } else {
            projMsg.textContent = editingId ? "✅ تم حفظ التعديلات والوسائط بنجاح" : "✅ تمت إضافة المشروع بجميع وسائطه بنجاح";
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

    // يسمح فقط بروابط واتساب حقيقية (https + wa.me أو api.whatsapp.com).
    // أي قيمة تانية (زي javascript: أو أي scheme غريب) بترفض تمامًا
    // حتى لو مرت بـ escapeHtml — الحماية هنا من نوع الرابط نفسه مش بس من كسر الـ HTML.
    function safeWaLink(url) {
        if (typeof url !== "string") return null;
        const trimmed = url.trim();
        if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(trimmed)) {
            return trimmed;
        }
        return null;
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

    // ---------- Delete Lead ----------
    window.deleteLead = async (id) => {
        if (!confirm("هل أنت متأكد من حذف هذا السجل نهائيًا؟")) return;
        const { error } = await sb().from("leads").delete().eq("id", id);
        if (error) {
            alert("خطأ أثناء الحذف: " + error.message);
        } else {
            loadLeads();
        }
    };

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
                    <div class="lead-head__actions">
                        <span class="lead-date">${new Date(l.created_at).toLocaleString("ar-EG")}</span>
                        <button class="admin-btn admin-btn--danger admin-btn--sm" title="حذف السجل" onclick="deleteLead('${l.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div class="lead-body">
                    ${l.phone ? `<p><i class="fa-solid fa-phone"></i> ${escapeHtml(l.phone)}</p>` : ""}
                    ${l.service ? `<p><i class="fa-solid fa-tag"></i> ${escapeHtml(serviceLabel(l.service))}</p>` : ""}
                    ${l.page_source ? `<p class="lead-source"><i class="fa-solid fa-location-crosshairs"></i> المصدر: ${escapeHtml(pageSourceLabel(l.page_source))}</p>` : ""}
                    ${l.wa_link ? (() => {
                        const safeLink = safeWaLink(l.wa_link);
                        return safeLink
                            ? `<p class="lead-walink"><i class="fa-brands fa-whatsapp"></i> <a href="${escapeHtml(safeLink)}" target="_blank" rel="noopener noreferrer">${escapeHtml(safeLink)}</a></p>`
                            : `<p class="lead-walink"><i class="fa-solid fa-triangle-exclamation"></i> رابط غير صالح: ${escapeHtml(l.wa_link)}</p>`;
                    })() : ""}
                    ${l.message ? `<p class="lead-msg">${escapeHtml(l.message)}</p>` : ""}
                </div>
            </div>
        `;
        }).join("");
    }

    // ---------- CSV injection guard ----------
    // إكسل/جوجل شيتس بيفسّروا أي خلية تبدأ بـ = أو + أو - أو @ كصيغة (formula)
    // فلو رسالة عميل خبيثة بدأت بيهم، ممكن تتنفذ كأمر لما الأدمن يفتح ملف الإكسبورت.
    // الحل: نضيف علامة اقتباس بسيطة (') قبل أي قيمة بتبدأ برموز الصيغ دي.
    function csvSafe(value) {
        const str = String(value == null ? "" : value);
        return /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
    }

    // ---------- Export Leads to CSV (Excel) ----------
    function exportLeadsToCSV() {
        if (!allLeads || !allLeads.length) {
            alert("لا توجد سجلات لتصديرها.");
            return;
        }

        const headers = ["التاريخ", "نوع التواصل", "الاسم", "رقم الهاتف", "الخدمة", "المصدر", "رابط واتساب", "الرسالة"];
        const rows = allLeads.map((l) => [
            `"${csvSafe(new Date(l.created_at).toLocaleString("ar-EG")).replace(/"/g, '""')}"`,
            `"${csvSafe(l.contact_type === "whatsapp" ? "تواصل واتساب" : "طلب فورم").replace(/"/g, '""')}"`,
            `"${csvSafe(l.name || "").replace(/"/g, '""')}"`,
            `"${csvSafe(l.phone || "").replace(/"/g, '""')}"`,
            `"${csvSafe(serviceLabel(l.service)).replace(/"/g, '""')}"`,
            `"${csvSafe(pageSourceLabel(l.page_source)).replace(/"/g, '""')}"`,
            `"${csvSafe(l.wa_link || "").replace(/"/g, '""')}"`,
            `"${csvSafe(l.message || "").replace(/"/g, '""')}"`
        ]);

        // UTF-8 BOM (\uFEFF) for Arabic display in Excel
        const csvContent = "\uFEFF" + [
            headers.map((h) => `"${h}"`).join(","),
            ...rows.map((r) => r.join(","))
        ].join("\r\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `omara-leads-${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    const exportLeadsBtn = document.getElementById("exportLeadsBtn");
    if (exportLeadsBtn) {
        exportLeadsBtn.addEventListener("click", exportLeadsToCSV);
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
