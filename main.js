AOS.init({
    duration: 1000,
    once: true
});

/* ==========================
   Hero Background Video
========================== */

const heroVideo = document.querySelector(".hero-video");

if (heroVideo) {
    heroVideo.play().catch(() => {});

    // Replay the video whenever it ends (full-loop safety)
    heroVideo.addEventListener("ended", () => {
        heroVideo.play().catch(() => {});
    });
}

/* ==========================
   Mobile Menu
========================== */

const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const menuBackdrop = document.querySelector(".mobile-menu-backdrop");

function closeMobileMenu() {
    if (navLinks) navLinks.classList.remove("active");
    if (menuBackdrop) menuBackdrop.classList.remove("active");
    document.body.style.overflow = "";
}

function openMobileMenu() {
    if (navLinks) navLinks.classList.add("active");
    if (menuBackdrop) menuBackdrop.classList.add("active");
    document.body.style.overflow = "hidden";
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.contains("active");
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });

    // Close when tapping the backdrop
    if (menuBackdrop) {
        menuBackdrop.addEventListener("click", closeMobileMenu);
    }

    // Close when pressing Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeMobileMenu();
        }
    });

    // Close when resizing to desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 992) {
            closeMobileMenu();
        }
    });
}

/* ==========================
   Dark Mode (Lamp) with localStorage persistence
========================== */

const lamp = document.getElementById("lampToggle");

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add("dark-mode");
        if (lamp) lamp.classList.add("on");
    } else {
        document.body.classList.remove("dark-mode");
        if (lamp) lamp.classList.remove("on");
    }
}

// Load saved theme
try {
    const savedTheme = localStorage.getItem("omara_theme");
    if (savedTheme === "dark") {
        applyTheme(true);
    }
} catch (e) {}

if (lamp) {
    lamp.addEventListener("click", () => {
        const isDark = !document.body.classList.contains("dark-mode");
        applyTheme(isDark);
        try {
            localStorage.setItem("omara_theme", isDark ? "dark" : "light");
        } catch (e) {}
    });
}

/* ==========================
   Language Switch (AR | EN)
========================== */

const translations = {
    ar: {
        nav_home: "الرئيسية",
        nav_about: "من نحن",
        nav_services: "الخدمات",
        nav_projects: "المشاريع",
        nav_contact: "تواصل معنا",
        hero_title: "مؤسسة عمارة للكهرباء والمقاولات",
        hero_desc: "نقدم حلولاً كهربائية متكاملة للمنازل والشركات والمصانع، مع الالتزام بأعلى معايير الجودة والأمان وسرعة التنفيذ.",
        hero_btn_contact: "تواصل معنا",
        hero_btn_services: "خدماتنا",
        about_title: "من نحن",
about_subtitle: "مؤسسة عمارة للكهرباء والمقاولات",
        about_desc: "بخبرة تزيد عن 20 عامًا، نقدم جميع أعمال الكهرباء للمنازل والعمارات والمصانع والمنشآت التجارية، مع الالتزام بأعلى معايير الجودة والسلامة واستخدام أفضل الخامات لتنفيذ جميع المشروعات بكفاءة واحترافية.",
        about_btn_services: "خدماتنا",
        about_btn_contact: "تواصل معنا",
        services_cta: "اطلب خدمتك الآن",
        projects_cta: "ابدأ مشروعك معنا",
        about_placeholder: "صورة المؤسسة",
        brand_tag: "مقاولات كهربائية",
        brand_tag_full: "للكهرباء والمقاولات",
        services_title: "خدماتنا",
        services_desc: "نقدم مجموعة متكاملة من الخدمات الكهربائية بأعلى معايير الجودة والأمان.",
        service_1_title: "تأسيس الكهرباء",
        service_1_desc: "تنفيذ جميع أعمال التأسيس للمنازل والفلل والعمارات والمصانع.",
        service_2_title: "لوحات الكهرباء",
        service_2_desc: "تركيب وصيانة جميع أنواع اللوحات الكهربائية باحترافية.",
        service_3_title: "الصيانة الكهربائية",
        service_3_desc: "نقدم خدمات الصيانة وإصلاح الأعطال الكهربائية بسرعة وكفاءة لجميع المنشآت.",
        service_4_title: "كهرباء المصانع",
        service_4_desc: "تنفيذ وصيانة الأنظمة الكهربائية للمصانع والمنشآت الصناعية.",
        service_5_title: "كهرباء المنازل",
        service_5_desc: "تأسيس وصيانة جميع أعمال الكهرباء للمنازل والشقق والفلل.",
        service_6_title: "عدادات الكهرباء",
        service_6_desc: "تركيب وصيانة عدادات الكهرباء مسبقة الدفع والعدادات الذكية.",
        service_7_title: "السلامة والصحة المهنية",
        service_7_desc: "تطبيق معايير السلامة المهنية وحماية العاملين أثناء تنفيذ الأعمال.",
        service_8_title: "توريد مستلزمات الكهرباء",
        service_8_desc: "توفير جميع الخامات والمستلزمات الكهربائية بأفضل جودة من السوق.",
        projects_title: "مشاريعنا",
        projects_desc: "بعض من الأعمال التي قمنا بتنفيذها باحترافية وجودة عالية.",
        project_placeholder: "صورة المشروع",
        project_1_title: "تأسيس كهرباء فيلا",
        project_1_desc: "تنفيذ جميع أعمال الكهرباء الخاصة بالفيلا بأعلى معايير الجودة.",
project_2_title: "لوحة كهرباء مصنع",
        project_2_desc: "تركيب لوحة كهربائية كاملة مع جميع وسائل الحماية.",
        project_3_title: "عدادات الكهرباء",
        project_3_desc: "تركيب وصيانة العدادات مسبقة الدفع والعدادات الذكية.",
        project_4_title: "مشروع 4",
        project_4_desc: "ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.",
        project_5_title: "مشروع 5",
        project_5_desc: "ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.",
        project_6_title: "مشروع 6",
        project_6_desc: "ضع وصف المشروع هنا، ويمكن إرفاق صورة أو فيديو.",
        video_label: "فيديو",
        swipe_hint: "اسحب لمشاهدة جميع المشاريع",
        why_title: "لماذا تختار مؤسسة عمارة؟",
        why_1_title: "خبرة أكثر من 20 عامًا",
        why_1_desc: "خبرة طويلة في جميع أعمال الكهرباء والمقاولات.",
        why_2_title: "جودة وأمان",
        why_2_desc: "نلتزم بأعلى معايير الجودة والسلامة في جميع الأعمال.",
        why_3_title: "الالتزام بالمواعيد",
        why_3_desc: "تنفيذ المشروعات في الوقت المحدد دون تأخير.",
        why_4_title: "دعم مستمر",
        why_4_desc: "خدمة عملاء ومتابعة بعد تنفيذ جميع الأعمال.",
        contact_title: "تواصل معنا",
        contact_desc: "يسعدنا الرد على جميع استفساراتكم في أي وقت.",
        contact_phone: "اتصل بنا",
        contact_whatsapp: "واتساب",
        contact_whatsapp_desc: "تواصل معنا مباشرة",
        contact_facebook: "فيسبوك",
        contact_facebook_desc: "تواصل معنا عبر صفحتنا الرسمية.",
        form_title: "اطلب خدمة عبر واتساب",
        form_subtitle: "املأ البيانات وسيتم فتح واتساب برسالة جاهزة.",
        form_name: "الاسم",
        form_name_ph: "اكتب اسمك",
        form_phone: "رقم التليفون",
        form_phone_ph: "01xxxxxxxxx",
        form_service: "نوع الخدمة",
        form_service_placeholder: "اختر الخدمة",
        form_opt_1: "تأسيس الكهرباء",
        form_opt_2: "لوحات الكهرباء",
        form_opt_3: "الصيانة الكهربائية",
        form_opt_4: "كهرباء المصانع",
        form_opt_5: "كهرباء المنازل",
        form_opt_6: "عدادات الكهرباء",
        form_opt_7: "توريد مستلزمات الكهرباء",
        form_opt_8: "استفسار عام",
        form_message: "تفاصيل الطلب",
        form_message_ph: "اكتب تفاصيل المطلوب باختصار",
        form_submit: "إرسال عبر واتساب",
        form_msg_intro: "السلام عليكم، أود طلب خدمة من مؤسسة عمارة.",
        form_msg_name: "الاسم",
        form_msg_phone: "رقم التليفون",
        form_msg_service: "نوع الخدمة",
        form_msg_details: "التفاصيل",
        form_error_required: "من فضلك املأ جميع الحقول المطلوبة.",
        form_error_phone: "رقم الهاتف غير صحيح. من فضلك أدخل رقم مصري صحيح (مثال: 01xxxxxxxxx).",
        footer_title: "مؤسسة عمارة للكهرباء والمقاولات",
        footer_desc: "نقدم حلولاً كهربائية متكاملة للمنازل والشركات والمصانع بأعلى معايير الجودة والأمان.",
footer_whatsapp: "واتساب",
        footer_facebook: "فيسبوك",
        copyright: "© جميع الحقوق محفوظة | مؤسسة عمارة للكهرباء والمقاولات",
        lang_btn: "AR | EN"
    },
    en: {
        nav_home: "Home",
        nav_about: "About",
        nav_services: "Services",
        nav_projects: "Projects",
        nav_contact: "Contact",
        hero_title: "Omara Electrical & Contracting",
        hero_desc: "We provide complete electrical solutions for homes, businesses, and factories, with top quality, safety, and fast delivery.",
        hero_btn_contact: "Contact Us",
        hero_btn_services: "Our Services",
        about_title: "About Us",
        about_subtitle: "Omara Electrical & Contracting",
about_desc: "With over 20 years of experience, we handle all electrical work for homes, buildings, factories, and commercial facilities, using high-quality materials and professional standards.",
        about_btn_services: "Our Services",
        about_btn_contact: "Contact Us",
        services_cta: "Request your service now",
        projects_cta: "Start your project with us",
        about_placeholder: "Company Photo",
        brand_tag: "Electrical Contracting",
        brand_tag_full: "Electrical Contracting",
        services_title: "Our Services",
        services_desc: "A complete range of electrical services with the highest quality and safety standards.",
        service_1_title: "Electrical Installation",
        service_1_desc: "Full electrical installation for homes, villas, buildings, and factories.",
        service_2_title: "Electrical Panels",
        service_2_desc: "Professional installation and maintenance of all electrical panel types.",
        service_3_title: "Electrical Maintenance",
        service_3_desc: "Fast and efficient electrical maintenance and fault repair for all facilities.",
        service_4_title: "Factory Electrical",
        service_4_desc: "Installation and maintenance of industrial electrical systems.",
        service_5_title: "Home Electrical",
        service_5_desc: "Installation and maintenance for homes, apartments, and villas.",
        service_6_title: "Electricity Meters",
        service_6_desc: "Installation and maintenance of prepaid and smart meters.",
        service_7_title: "Occupational Safety",
        service_7_desc: "Applying safety standards and protecting workers during all works.",
        service_8_title: "Electrical Supplies",
        service_8_desc: "Supplying high-quality electrical materials and equipment.",
        projects_title: "Our Projects",
        projects_desc: "Some of the works we completed with professionalism and high quality.",
        project_placeholder: "Project Photo",
        project_1_title: "Villa Electrical Setup",
        project_1_desc: "Complete villa electrical works with top quality standards.",
project_2_title: "Factory Electrical Panel",
        project_2_desc: "Full electrical panel installation with all protection systems.",
        project_3_title: "Electricity Meters",
        project_3_desc: "Installation and maintenance of prepaid and smart meters.",
        project_4_title: "Project 4",
        project_4_desc: "Write the project description here, and you can attach an image or video.",
        project_5_title: "Project 5",
        project_5_desc: "Write the project description here, and you can attach an image or video.",
        project_6_title: "Project 6",
        project_6_desc: "Write the project description here, and you can attach an image or video.",
        video_label: "Video",
        swipe_hint: "Swipe to view all projects",
        why_title: "Why Choose Omara?",
        why_1_title: "Over 20 Years Experience",
        why_1_desc: "Long experience in all electrical and contracting works.",
        why_2_title: "Quality & Safety",
        why_2_desc: "We follow the highest quality and safety standards in every job.",
        why_3_title: "On-Time Delivery",
        why_3_desc: "Projects completed on schedule without delays.",
        why_4_title: "Ongoing Support",
        why_4_desc: "Customer service and follow-up after every project.",
        contact_title: "Contact Us",
        contact_desc: "We are happy to answer all your inquiries anytime.",
        contact_phone: "Call Us",
        contact_whatsapp: "WhatsApp",
        contact_whatsapp_desc: "Chat with us directly",
        contact_facebook: "Facebook",
        contact_facebook_desc: "Reach us through our official page.",
        form_title: "Request a service via WhatsApp",
        form_subtitle: "Fill in your details and WhatsApp will open with a ready message.",
        form_name: "Name",
        form_name_ph: "Enter your name",
        form_phone: "Phone number",
        form_phone_ph: "01xxxxxxxxx",
        form_service: "Service type",
        form_service_placeholder: "Select a service",
        form_opt_1: "Electrical Installation",
        form_opt_2: "Electrical Panels",
        form_opt_3: "Electrical Maintenance",
        form_opt_4: "Factory Electrical",
        form_opt_5: "Home Electrical",
        form_opt_6: "Electricity Meters",
        form_opt_7: "Electrical Supplies",
        form_opt_8: "General Inquiry",
        form_message: "Request details",
        form_message_ph: "Briefly describe what you need",
        form_submit: "Send via WhatsApp",
        form_msg_intro: "Hello, I would like to request a service from Omara.",
        form_msg_name: "Name",
        form_msg_phone: "Phone",
        form_msg_service: "Service",
        form_msg_details: "Details",
        form_error_required: "Please fill in all required fields.",
        form_error_phone: "Invalid phone number. Please enter a valid Egyptian number (e.g., 01xxxxxxxxx).",
        footer_title: "Omara Electrical & Contracting",
        footer_desc: "Complete electrical solutions for homes, businesses, and factories with top quality and safety.",
footer_whatsapp: "WhatsApp",
        footer_facebook: "Facebook",
        copyright: "© All Rights Reserved | Omara Electrical & Contracting",
        lang_btn: "EN | AR"
    }
};

let currentLang = "ar";

const WHATSAPP_NUMBER = "201033442338";

function setLanguage(lang, save = true) {
    currentLang = lang;
    if (save) {
        try {
            localStorage.setItem("omara_lang", lang);
        } catch (e) {}
    }
    const dict = translations[lang] || translations.ar;

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key]) {
            el.setAttribute("placeholder", dict[key]);
        }
    });

const langBtn = document.getElementById("langToggle");
    if (langBtn) {
        langBtn.textContent = dict.lang_btn;
    }

    updateCopyright();

    // Re-render dynamic projects (from Supabase) in the new language.
    // Only if the grid is currently DB-driven (data-db-grid is set).
    if (window.OmaraBackend && window.appSupabase) {
        const grid = document.querySelector(".projects-grid");
        if (grid && grid.hasAttribute("data-db-grid")) {
            loadProjectsFromBackend();
        }
    }
}

const SERVICE_NAMES = {
    installation: { ar: "تأسيس الكهرباء", en: "Electrical Installation" },
    panels: { ar: "لوحات الكهرباء", en: "Electrical Panels" },
    maintenance: { ar: "الصيانة الكهربائية", en: "Electrical Maintenance" },
    factory: { ar: "كهرباء المصانع", en: "Factory Electrical" },
    home: { ar: "كهرباء المنازل", en: "Home Electrical" },
    meters: { ar: "عدادات الكهرباء", en: "Electricity Meters" },
    supplies: { ar: "توريد مستلزمات الكهرباء", en: "Electrical Supplies" },
    general: { ar: "استفسار عام", en: "General Inquiry" }
};

function updateCopyright() {
    const copyright = document.querySelector(".copyright");
    if (copyright) {
        const year = new Date().getFullYear();
        const dict = translations[currentLang] || translations.ar;
        const base = dict.copyright.split("|")[0].trim();
        const name = dict.copyright.split("|")[1] || dict.copyright;
        copyright.textContent = `${base} ${year} | ${name.trim()}`;
    }
}

const langToggle = document.getElementById("langToggle");

if (langToggle) {
    langToggle.addEventListener("click", () => {
        setLanguage(currentLang === "ar" ? "en" : "ar", true);
    });
}

// Restore saved language preference on initial load
try {
    const savedLang = localStorage.getItem("omara_lang");
    if (savedLang && (savedLang === "en" || savedLang === "ar")) {
        setLanguage(savedLang, false);
    } else {
        updateCopyright();
    }
} catch (e) {
    updateCopyright();
}

/* ==========================
   WhatsApp Form
========================== */

const whatsappForm = document.getElementById("whatsappForm");

if (whatsappForm) {
    const whatsappFormMsg = document.getElementById("whatsappFormMsg");
    const EGYPT_PHONE_REGEX = /^(?:\+?20|0)1[0125][0-9]{8}$/;

    whatsappForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const dict = translations[currentLang];
        const name = document.getElementById("clientName").value.trim();
        const phone = document.getElementById("clientPhone").value.trim();
        const service = document.getElementById("clientService").value;
        const message = document.getElementById("clientMessage").value.trim();

        if (whatsappFormMsg) {
            whatsappFormMsg.textContent = "";
            whatsappFormMsg.classList.remove("form-msg--error");
        }

        if (!name || !phone || !service || !message) {
            if (whatsappFormMsg) {
                whatsappFormMsg.textContent = dict.form_error_required;
                whatsappFormMsg.classList.add("form-msg--error");
            }
            return;
        }

        if (!EGYPT_PHONE_REGEX.test(phone.replace(/[\s-]/g, ""))) {
            if (whatsappFormMsg) {
                whatsappFormMsg.textContent = dict.form_error_phone;
                whatsappFormMsg.classList.add("form-msg--error");
            }
            return;
        }

        const serviceName = SERVICE_NAMES[service] ? SERVICE_NAMES[service][currentLang] : service;

        const text = [
            dict.form_msg_intro,
            "",
            `${dict.form_msg_name}: ${name}`,
            `${dict.form_msg_phone}: ${phone}`,
            `${dict.form_msg_service}: ${serviceName}`,
            `${dict.form_msg_details}: ${message}`
        ].join("\n");

const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

        // === Backend: save lead to Supabase (مع مهلة قصوى حتى لا يعلق) ===
        // الترتيب: حفظ البيانات ← فتح واتساب
        // ولو Supabase فشل أو أبطأ، واتساب يفضل يشتغل دائمًا.
const saveLeadPromise = (window.OmaraBackend && window.appSupabase)
            ? window.OmaraBackend.saveLead({
                name,
                phone,
                service,
                message,
                contact_type: "form",
                page_source: window.location.pathname.split("/").pop() || "index.html",
                wa_link: url
            })
            : Promise.resolve({ ok: false, error: "backend not configured" });

        const TIMEOUT_MS = 2500;
        const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: "timeout" }), TIMEOUT_MS));

        Promise.race([saveLeadPromise, timeoutPromise])
            .then((res) => {
                if (!res.ok) console.warn("Lead not saved:", res.error);
            })
            .catch((err) => console.warn("Lead not saved:", err))
            .finally(() => {
                // واتساب يتفتح دائمًا — سواء نجح الحفظ أو لا
                window.open(url, "_blank");
            });
    });
}

/* ==========================
   WhatsApp Click Tracking (Global)
   ===========================
   يسجّل أي ضغطة على زر/رابط واتساب (wa.me) في أي صفحة بالموقع
   بدون ما يمنع فتح واتساب أبدًا (Fire-and-forget).
   يتم تسجيل: نوع التواصل = WhatsApp + الصفحة + التاريخ + الرابط.
   لا يقرأ ولا يحفظ محتوى المحادثة داخل واتساب.
========================== */

function setupWhatsAppTracking() {
    if (!document.body) return;

    document.addEventListener("click", (e) => {
        // ابحث عن أقرب رابط واتساب من العنصر المضغوط
        const anchor = e.target.closest('a[href*="wa.me"]');
        if (!anchor) return;

        const href = anchor.getAttribute("href") || "";
        // استخراج رقم واتساب من الرابط إن توفر
        let waLink = href;
        const match = href.match(/wa\.me\/(\d+)/);
        const numberUsed = match ? match[1] : null;

        // خدمة قابلة للتحديد: يمكن وضعها في data-service على الرابط
        const service = anchor.getAttribute("data-service") || null;

        // Fire-and-forget: نسجل الحدث ولا ننتظر، واتساب يفتح فورًا
        if (window.OmaraBackend && window.OmaraBackend.trackWhatsAppClick) {
            window.OmaraBackend.trackWhatsAppClick({ service, wa_link: waLink });
        }

        // لا preventDefault ولا نمنع فتح واتساب مطلقًا
        // (نكتفي بتسجيل الحدث فقط)
    });
}

setupWhatsAppTracking();

/* ==========================
   Full-Screen Lightbox Gallery Modal (Images & Videos)
========================== */

let activeLightboxMedia = [];
let activeLightboxIndex = 0;

const lightboxModal = document.getElementById("lightboxModal");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxVideo = document.getElementById("lightboxVideo");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxTitle = document.getElementById("lightboxTitle");
const lightboxDesc = document.getElementById("lightboxDesc");
const lightboxThumbs = document.getElementById("lightboxThumbs");
const lightboxClose = document.getElementById("lightboxClose");
const lightboxPrev = document.getElementById("lightboxPrev");
const lightboxNext = document.getElementById("lightboxNext");

function openLightbox(projectData, startIndex = 0) {
    if (!lightboxModal) return;

    let media = [];
    if (Array.isArray(projectData.media) && projectData.media.length) {
        media = projectData.media.map((m) => {
            const url = typeof m === "string" ? m : m.url;
            const type = (typeof m === "object" && m.type) ? m.type : (/\.(mp4|webm|ogg)(\?|$)/i.test(url) ? "video" : "image");
            return { url, type };
        });
    } else if (projectData.image_url) {
        const isVid = /\.(mp4|webm|ogg)(\?|$)/i.test(projectData.image_url);
        media = [{ url: projectData.image_url, type: isVid ? "video" : "image" }];
    }

    if (!media.length) return;

    activeLightboxMedia = media;
    activeLightboxIndex = Math.max(0, Math.min(startIndex, media.length - 1));

    if (lightboxTitle) lightboxTitle.textContent = projectData.title || "";
    if (lightboxDesc) lightboxDesc.textContent = projectData.desc || projectData.description || "";

    lightboxModal.classList.add("active");
    lightboxModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    updateLightboxView();
    renderLightboxThumbs();
}

function updateLightboxView() {
    if (!activeLightboxMedia.length) return;
    const current = activeLightboxMedia[activeLightboxIndex];
    if (!current) return;

    if (lightboxCounter) {
        lightboxCounter.textContent = `${activeLightboxIndex + 1} / ${activeLightboxMedia.length}`;
        lightboxCounter.style.display = activeLightboxMedia.length > 1 ? "inline-flex" : "none";
    }

    if (lightboxPrev && lightboxNext) {
        const multi = activeLightboxMedia.length > 1;
        lightboxPrev.style.display = multi ? "flex" : "none";
        lightboxNext.style.display = multi ? "flex" : "none";
    }

    if (current.type === "video") {
        if (lightboxImage) lightboxImage.style.display = "none";
        if (lightboxVideo) {
            lightboxVideo.style.display = "block";
            lightboxVideo.src = current.url;
            lightboxVideo.play().catch(() => {});
        }
    } else {
        if (lightboxVideo) {
            lightboxVideo.pause();
            lightboxVideo.removeAttribute("src");
            lightboxVideo.style.display = "none";
        }
        if (lightboxImage) {
            lightboxImage.style.display = "block";
            lightboxImage.src = current.url;
            lightboxImage.alt = lightboxTitle ? lightboxTitle.textContent : "";
        }
    }

    if (lightboxThumbs) {
        lightboxThumbs.querySelectorAll(".lightbox-thumb").forEach((th, idx) => {
            if (idx === activeLightboxIndex) {
                th.classList.add("active");
                th.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
            } else {
                th.classList.remove("active");
            }
        });
    }
}

function renderLightboxThumbs() {
    if (!lightboxThumbs) return;
    if (activeLightboxMedia.length <= 1) {
        lightboxThumbs.style.display = "none";
        lightboxThumbs.innerHTML = "";
        return;
    }

    lightboxThumbs.style.display = "flex";
    lightboxThumbs.innerHTML = activeLightboxMedia.map((item, idx) => {
        return `
            <button type="button" class="lightbox-thumb ${idx === activeLightboxIndex ? 'active' : ''}" data-index="${idx}" aria-label="عرض الوسيط ${idx + 1}">
                ${item.type === "video"
                    ? '<i class="fa-solid fa-video lightbox-thumb-icon"></i>'
                    : `<img src="${item.url}" alt="">`}
            </button>
        `;
    }).join("");

    lightboxThumbs.querySelectorAll(".lightbox-thumb").forEach((th) => {
        th.addEventListener("click", () => {
            const idx = Number(th.getAttribute("data-index"));
            activeLightboxIndex = idx;
            updateLightboxView();
        });
    });
}

function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove("active");
    lightboxModal.setAttribute("aria-hidden", "true");
    if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute("src");
        lightboxVideo.load();
        lightboxVideo.style.display = "none";
    }
    if (lightboxImage) {
        lightboxImage.style.display = "none";
        lightboxImage.removeAttribute("src");
    }
    document.body.style.overflow = "";
}

function nextLightboxItem() {
    if (activeLightboxMedia.length <= 1) return;
    activeLightboxIndex = (activeLightboxIndex + 1) % activeLightboxMedia.length;
    updateLightboxView();
}

function prevLightboxItem() {
    if (activeLightboxMedia.length <= 1) return;
    activeLightboxIndex = (activeLightboxIndex - 1 + activeLightboxMedia.length) % activeLightboxMedia.length;
    updateLightboxView();
}

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxNext) lightboxNext.addEventListener("click", nextLightboxItem);
if (lightboxPrev) lightboxPrev.addEventListener("click", prevLightboxItem);

if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
        if (e.target.classList.contains("lightbox-backdrop") || e.target === lightboxModal) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (!lightboxModal.classList.contains("active")) return;
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") {
            document.documentElement.dir === "rtl" ? prevLightboxItem() : nextLightboxItem();
        }
        if (e.key === "ArrowLeft") {
            document.documentElement.dir === "rtl" ? nextLightboxItem() : prevLightboxItem();
        }
    });

    // Touch swipe gestures
    let touchStartX = 0;
    let touchEndX = 0;
    lightboxModal.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxModal.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 45) {
            if (diff > 0) {
                document.documentElement.dir === "rtl" ? prevLightboxItem() : nextLightboxItem();
            } else {
                document.documentElement.dir === "rtl" ? nextLightboxItem() : prevLightboxItem();
            }
        }
    }, { passive: true });
}

function wireProjectCards() {
    document.querySelectorAll(".project-card").forEach((card) => {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => {
            const mediaAttr = card.getAttribute("data-project-media");
            let media = [];
            if (mediaAttr) {
                try { media = JSON.parse(mediaAttr); } catch (e) {}
            }
            if (!media.length) {
                const videoSrc = card.getAttribute("data-video");
                const imgSrc = card.querySelector(".project-image img")?.getAttribute("src");
                if (videoSrc) {
                    media = [{ url: videoSrc, type: "video" }];
                } else if (imgSrc) {
                    media = [{ url: imgSrc, type: "image" }];
                }
            }

            const title = card.querySelector(".project-content h3")?.textContent || "";
            const desc = card.querySelector(".project-content p")?.textContent || "";

            openLightbox({ title, desc, media }, 0);
        });
    });
}

// Initial wire for static cards
wireProjectCards();

/* ==========================
   Dynamic Projects (CMS)
========================== */

async function loadProjectsFromBackend() {
    const grid = document.querySelector(".projects-grid");
    if (!grid) return;

    if (!window.appSupabase || !window.OmaraBackend) {
        wireProjectCards();
        return;
    }

    const projects = await window.OmaraBackend.fetchProjects();
    if (!projects.length) {
        wireProjectCards();
        return;
    }

    const videoLabel = translations[currentLang]?.video_label || "فيديو";

    const cardsHTML = projects.map((p) => {
        const title = currentLang === "ar"
            ? (p.title || p.title_en || "")
            : (p.title_en || p.title || "");
        const desc = currentLang === "ar"
            ? (p.description || p.description_en || "")
            : (p.description_en || p.description || "");
        const category = currentLang === "ar"
            ? (p.category || "")
            : "";

        // Resolve media array
        let media = [];
        if (Array.isArray(p.media) && p.media.length) {
            media = p.media;
        } else if (p.image_url) {
            const isV = /\.(mp4|webm|ogg)(\?|$)/i.test(p.image_url);
            media = [{ url: p.image_url, type: isV ? "video" : "image" }];
        }

        const coverItem = media[0] || { url: "images/project-4.svg", type: "image" };
        const isCoverVideo = coverItem.type === "video" || /\.(mp4|webm|ogg)(\?|$)/i.test(coverItem.url);
        const mediaCount = media.length;
        const mediaJsonStr = JSON.stringify(media).replace(/"/g, '&quot;');

        return `
            <div class="project-card ${isCoverVideo ? "project-card--media" : ""}" data-project-media="${mediaJsonStr}">
                <div class="project-image">
                    ${isCoverVideo
                        ? `<img src="images/project-4.svg" alt="" loading="lazy">
                           <span class="project-media-tag"><i class="fa-solid fa-video"></i> ${escapeHTML(videoLabel)}</span>
                           <span class="project-play-btn"><i class="fa-solid fa-play"></i></span>`
                        : `<img src="${coverItem.url}" alt="${escapeHTML(title)}" loading="lazy">
                           <span class="project-zoom-btn" title="تكبير ومعاينة"><i class="fa-solid fa-expand"></i></span>`
                    }
                    ${mediaCount > 1 ? `<span class="project-media-count-badge" title="${mediaCount} صور وفيديوهات"><i class="fa-solid fa-images"></i> ${mediaCount}</span>` : ''}
                </div>
                <div class="project-content">
                    ${category ? `<span class="project-category">${escapeHTML(category)}</span>` : ""}
                    <h3>${escapeHTML(title)}</h3>
                    <p>${escapeHTML(desc)}</p>
                </div>
            </div>
        `;
    }).join("");

    grid.innerHTML = cardsHTML;
    grid.setAttribute("data-db-grid", "true");

    wireProjectCards();
}

function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str || "";
    return div.innerHTML;
}

// Load dynamic projects after DOM ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadProjectsFromBackend);
} else {
    loadProjectsFromBackend();
}
