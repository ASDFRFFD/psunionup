/**
 * ==========================================================================
 * DHARNA GUIDELINES JAVASCRIPT (Protest Digital Command Center)
 * Comprehensive logic for guidelines, coordination, search, and interactions.
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Restore High Contrast state on load
    if (localStorage.getItem("psunion_high_contrast") === "1") {
        document.body.classList.add("high-contrast");
    }

    // Run all initialization functions
    initCountdown();
    // initSlider();
    initModals();
    initMapLayers();
    // initTravelRouter();
    // initCoordinatorSearch();
    initChecklist();
    initGoogleMapsActions();
    initFAQSearch();
    initLightboxGallery();
    initScrollAnimations();
    initBackToTop();
    initLocationHub();
    initCollapsiblePanels();
    initScrollspyHighlight();
    initBackgroundMusic();
});

// Toggle High Contrast Mode globally
window.toggleHighContrast = function() {
    const body = document.body;
    const isHighContrast = body.classList.toggle("high-contrast");
    localStorage.setItem("psunion_high_contrast", isHighContrast ? "1" : "0");
};

/* ==========================================
   1. READING PROGRESS BAR (removed — section deleted)
   ========================================== */

/* ==========================================
   2. COUNTDOWN TIMER
   ========================================== */
function initCountdown() {
    // Target date: July 20, 2026 at 10:00:00 AM (Monday)
    const targetDate = new Date("July 20, 2026 10:00:00").getTime();

    const daysEl = document.getElementById("cd-days");
    const hoursEl = document.getElementById("cd-hours");
    const minsEl = document.getElementById("cd-mins");
    const secsEl = document.getElementById("cd-secs");
    const countdownTitleEl = document.getElementById("countdown-title");

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    function updateTimer() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        if (distance < 0) {
            clearInterval(timerInterval);
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            if (countdownTitleEl) {
                countdownTitleEl.textContent = "🔴 धरना प्रदर्शन जारी है! (Protest is Active)";
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, "0");
        hoursEl.textContent = String(hours).padStart(2, "0");
        minsEl.textContent = String(minutes).padStart(2, "0");
        secsEl.textContent = String(seconds).padStart(2, "0");
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

/* ==========================================
   3. IMAGE SLIDER
   ========================================== */
let slideIndex = 0;
let sliderTimer = null;
const slideIntervalMs = 5000;

function initSlider() {
    const slides = document.querySelectorAll(".dharna-slide");
    const dotsContainer = document.getElementById("slider-dots");
    const prevBtn = document.getElementById("slider-prev");
    const nextBtn = document.getElementById("slider-next");

    if (slides.length === 0) return;

    if (dotsContainer) {
        dotsContainer.innerHTML = "";
        slides.forEach((_, idx) => {
            const dot = document.createElement("button");
            dot.className = `slider-dot ${idx === 0 ? "active" : ""}`;
            dot.setAttribute("aria-label", `Slide ${idx + 1}`);
            dot.addEventListener("click", () => showSlide(idx));
            dotsContainer.appendChild(dot);
        });
    }

    if (prevBtn) prevBtn.addEventListener("click", () => showSlide(slideIndex - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => showSlide(slideIndex + 1));

    const sliderBox = document.querySelector(".dharna-slider-container");
    if (sliderBox) {
        sliderBox.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft") showSlide(slideIndex - 1);
            if (e.key === "ArrowRight") showSlide(slideIndex + 1);
        });

        sliderBox.addEventListener("mouseenter", pauseSlider);
        sliderBox.addEventListener("mouseleave", startSlider);

        let touchStartX = 0;
        sliderBox.addEventListener("touchstart", (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        sliderBox.addEventListener("touchend", (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 50) {
                if (diff < 0) {
                    showSlide(slideIndex + 1);
                } else {
                    showSlide(slideIndex - 1);
                }
            }
        }, { passive: true });
    }

    function showSlide(index) {
        const totalSlides = slides.length;
        slideIndex = (index + totalSlides) % totalSlides;

        slides.forEach((slide, idx) => {
            slide.classList.toggle("active", idx === slideIndex);
        });

        const dots = document.querySelectorAll(".slider-dot");
        dots.forEach((dot, idx) => {
            dot.classList.toggle("active", idx === slideIndex);
        });
    }

    function startSlider() {
        pauseSlider();
        sliderTimer = setInterval(() => {
            showSlide(slideIndex + 1);
        }, slideIntervalMs);
    }

    function pauseSlider() {
        if (sliderTimer) clearInterval(sliderTimer);
    }

    startSlider();
}

/* ==========================================
   4. MODALS (Registration and Emergency Trigger)
   ========================================== */
function initModals() {
    const regTriggers = document.querySelectorAll(".trigger-reg-modal");
    const regModal = document.getElementById("registrationModal");
    const regForm = document.getElementById("dharnaRegForm");

    const emerTrigger = document.getElementById("trigger-emer-btn");
    const emerModal = document.getElementById("emergencyModal");

    const closeBtns = document.querySelectorAll(".modal-close-trigger");
    const overlays = document.querySelectorAll(".brutalist-modal-overlay");

    // Open Registration Modal
    regTriggers.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            if (regModal) {
                regModal.style.display = "flex";
                document.body.style.overflow = "hidden";
            }
        });
    });

    // Open Emergency Modal
    if (emerTrigger && emerModal) {
        emerTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            emerModal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    // Close Modals
    closeBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            closeAllModals();
        });
    });

    overlays.forEach(overlay => {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) {
                closeAllModals();
            }
        });
    });

    function closeAllModals() {
        if (regModal) regModal.style.display = "none";
        if (emerModal) emerModal.style.display = "none";
        const receiptModal = document.getElementById("receiptModal");
        if (receiptModal) receiptModal.style.display = "none";
        document.body.style.overflow = "";
    }

    // Handle Form Submit
    if (regForm) {
        regForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("reg-name").value.trim();
            const district = document.getElementById("reg-district").value;
            const block = document.getElementById("reg-block").value.trim();
            const count = parseInt(document.getElementById("reg-count").value) || 1;

            if (!name || !district || !block) {
                alert("कृपया सभी अनिवार्य विवरण भरें।");
                return;
            }

            // Save Registration to Local Storage
            const regId = `HAST-REG-${Math.floor(1000 + Math.random() * 9000)}`;
            const regData = { regId, name, district, block, count };
            localStorage.setItem("dharna_active_registration", JSON.stringify(regData));

            // Update Counter
            incrementParticipation(count);

            // Increment Leaderboard District Score
            incrementDistrictScore(district, count);

            // Close Form Modal
            if (regModal) regModal.style.display = "none";

            // Show Success Receipt Popup
            showReceiptPopup(regData);
        });
    }
}

function showReceiptPopup(data) {
    let receiptModal = document.getElementById("receiptModal");
    
    // Create dynamically if not in DOM
    if (!receiptModal) {
        receiptModal = document.createElement("div");
        receiptModal.id = "receiptModal";
        receiptModal.className = "brutalist-modal-overlay";
        document.body.appendChild(receiptModal);
    }

    receiptModal.innerHTML = `
        <div class="brutalist-modal-card animate-fade-up" style="border-color: var(--green);">
            <button class="modal-close-trigger" onclick="document.getElementById('receiptModal').style.display='none'; document.body.style.overflow='';">&times;</button>
            <div style="text-align: center; border-bottom: 2px dashed var(--ink); padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <span style="font-size: 3rem;">🎫</span>
                <h3 style="font-family: var(--display); color: var(--green); margin-top: 8px;">भागीदारी पत्र (Pass Receipt)</h3>
                <span style="font-family: var(--mono); font-size: 0.85rem; font-weight: 700; color: var(--ink-2); background: var(--paper-2); padding: 2px 10px; border: 1px solid var(--ink);">${data.regId}</span>
            </div>
            
            <div style="font-family: var(--sans); font-size: 1rem; color: var(--ink); display: flex; flex-direction: column; gap: 12px; margin-bottom: 1.5rem;">
                <div><strong>नाम:</strong> ${data.name}</div>
                <div><strong>जनपद:</strong> ${data.district}</div>
                <div><strong>विकास खण्ड:</strong> ${data.block}</div>
                <div><strong>साथी संख्या:</strong> ${data.count} व्यक्ति (स्वयं सहित)</div>
                <div style="background-color: var(--paper-2); border-left: 4px solid var(--green); padding: 8px 12px; font-weight: 600; font-size: 0.9rem;">
                    ✊ धन्यवाद साथी! आपकी प्रविष्टि सफलतापूर्वक दर्ज की गई है। आपका नाम आंदोलन के डिजिटल पटल पर अंकित कर दिया गया है।
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                <button onclick="window.print();" class="nav-btn-outline" style="background-color: var(--ink); color: var(--paper); border-color: var(--ink); box-shadow: 4px 4px 0 var(--green); display: flex; justify-content: center; font-size: 1rem; font-weight: 700; padding: 10px;">
                    🖨️ रसीद प्रिंट करें
                </button>
                <button onclick="document.getElementById('receiptModal').style.display='none'; document.body.style.overflow='';" class="nav-btn-outline" style="background-color: var(--paper-2); color: var(--ink); border-color: var(--ink); box-shadow: 4px 4px 0 var(--ink); display: flex; justify-content: center; font-size: 1rem; font-weight: 700; padding: 10px;">
                    ठीक है (OK)
                </button>
            </div>
        </div>
    `;

    receiptModal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

/* ==========================================
   5. LIVE PARTICIPATION DATA AND LEADERBOARD (removed — sections deleted)
   ========================================== */

/* ==========================================
   6. MAP INTERACTIVE LAYERS
   ========================================== */
// Mock data for Map Toggles
const amenityData = {
    parking: [
        { name: "इको गार्डन आन्तरिक पार्किंग (0 मीटर)", desc: "गार्डन के अंदर कार व दोपहिया वाहनों हेतु विशाल पार्किंग स्थल।" },
        { name: "वीआईपी रोड साइड स्ट्रीट पार्किंग (200 मीटर)", desc: "गीता कॉलोनी रोड हेतु वाहनों के लिए सड़क किनारे पार्किंग।" }
    ],
    hospital: [
        { name: "अवध हॉस्पिटल, आलमबाग (1.2 किमी)", desc: "24x7 आपातकालीन सेवाएं उपलब्ध।" },
        { name: "सिटी हॉस्पिटल एंड ट्रॉमा सेंटर, आलमबाग (1.8 किमी)", desc: "ट्रॉमा व आपातकालीन ओपीडी सेवाएं।" },
        { name: "राज चंद्र हॉस्पिटल, आलमबाग (2.0 किमी)", desc: "बहुविशेषज्ञता सुविधाओं सहित निजी अस्पताल।" }
    ],
    police: [
        { name: "आलमबाग कोतवाली (1.0 किमी)", desc: "इको गार्डन क्षेत्र का मुख्य थाना, नजदीक रेलवे कॉलोनी आलमबाग।" },
        { name: "पीआरवी (PCR) मोबाइल चौकी (200 मीटर)", desc: "धरना स्थल के पास तैनात सुरक्षा हेतु पुलिस कंट्रोल रूम।" }
    ],
    toilet: [
        { name: "इको गार्डन सार्वजनिक शौचालय (50 मीटर)", desc: "महिलाओं और पुरुषों हेतु अलग ब्लॉक।" },
        { name: "सचल मोबाइल शौचालय (0 मीटर)", desc: "गार्डन के उत्तरी और दक्षिणी कोनों पर स्थापित अतिरिक्त शौचालय।" }
    ],
    bus: [
        { name: "आलमबाग ISBT (आंतर-राज्य बस टर्मिनल) (1.5 किमी)", desc: "उत्तर प्रदेश के सभी जनपदों से आलमबाग हेतु सीधी बस सेवाएं।" },
        { name: "कैसरबाग बस अड्डा (3.5 किमी)", desc: "तराई एवं पश्चिमी यूपी की बस सेवाएं।" }
    ],
    rail: [
        { name: "लखनऊ चारबाग रेलवे स्टेशन - LKO (2.5 किमी)", desc: "उत्तर भारत का मुख्य जंक्शन रेलवे स्टेशन, इको गार्डन से ऑटो द्वारा 15 मिनट।" },
        { name: "लखनऊ जंक्शन रेलवे स्टेशन - LJN (4.0 किमी)", desc: "लोकल पैसेंजर एवं एक्सप्रेस ट्रेनें।" }
    ],
    food: [
        { name: "आलमबाग बाजार रेस्तरां (1.0 किमी)", desc: "भोजन व स्वल्पाहार हेतु आलमबाग मुख्य बाजार।" }
    ]
};

function initMapLayers() {
    const layerButtons = document.querySelectorAll(".map-layer-btn");
    const amenitiesListEl = document.getElementById("map-amenities-list");
    const mapIframe = document.querySelector(".map-embed-wrapper iframe");

    if (layerButtons.length === 0 || !amenitiesListEl) return;

    layerButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const layer = btn.dataset.layer;

            // Toggle active classes
            layerButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            // Renders listings
            renderAmenities(layer);

            // Update maps query inside iframe for visual correctness
            if (mapIframe) {
                // Modifies the maps search query targeting Eco Garden Alambagh Lucknow
                let searchQuery = `${layer}+near+Eco+Garden+Alambagh+Lucknow`;
                mapIframe.src = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.8946399487447!2d80.89538857511107!3d26.843743976721485!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399957a0ca00db4f%3A0x5d27f5d5e25cba14!2sManyawar%20Shri%20Kanshiram%20Ji%20Green%20Eco%20Garden!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin&q=${encodeURIComponent(searchQuery)}`;
            }
        });
    });

    function renderAmenities(type) {
        const items = amenityData[type] || [];
        amenitiesListEl.innerHTML = "";

        if (items.length === 0) return;

        items.forEach(item => {
            const div = document.createElement("div");
            div.style.marginBottom = "10px";
            div.style.padding = "8px 12px";
            div.style.backgroundColor = "var(--paper)";
            div.style.border = "1px solid var(--ink)";
            div.innerHTML = `
                <strong style="color: var(--ink); font-size: 0.95rem; display: block;">📍 ${item.name}</strong>
                <span style="color: var(--ink-2); font-size: 0.82rem; font-weight: 500;">${item.desc}</span>
            `;
            amenitiesListEl.appendChild(div);
        });
    }

    // Default load parking
    renderAmenities("parking");
}

/* ==========================================
   7. TRAVEL ROUTER AND ETA CALCULATIONS
   ========================================== */
const travelRouteData = {
    "Varanasi (वाराणसी)": {
        routes: ["Train (ट्रेन मार्ग)", "Purvanchal Expressway (पूर्वांचल एक्सप्रेसवे)"],
        details: {
            "Train (ट्रेन मार्ग)": {
                eta: "4 घंटे 45 मिनट",
                tips: "काशी विश्वनाथ एक्सप्रेस या वरुणा एक्सप्रेस सबसे उपयुक्त हैं। रात्रि में प्रस्थान कर सुबह 6:00 बजे तक चारबाग पहुंचें।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Varanasi&destination=26.8437,80.8954"
            },
            "Purvanchal Expressway (पूर्वांचल एक्सप्रेसवे)": {
                eta: "5 घंटे 30 मिनट (कार/बस)",
                tips: "गाजीपुर-वाराणसी मार्ग से पूर्वांचल एक्सप्रेसवे पर चढ़ें। टोल टैक्स लगभग ₹685 है। मार्ग में जलपान गृह उपलब्ध हैं।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Varanasi&destination=26.8437,80.8954&travelmode=driving"
            }
        }
    },
    "Gorakhpur (गोरखपुर)": {
        routes: ["Train (रेल मार्ग)", "NH-28 via Basti (सड़क मार्ग - बस्ती होकर)"],
        details: {
            "Train (रेल मार्ग)": {
                eta: "5 घंटे 15 मिनट",
                tips: "गोरखधाम एक्सप्रेस या इंटरसिटी से यात्रा करें। सीट बुकिंग अग्रिम रूप से सुनिश्चित करें।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Gorakhpur&destination=26.8437,80.8954"
            },
            "NH-28 via Basti (सड़क मार्ग - बस्ती होकर)": {
                eta: "6 घंटे 00 मिनट",
                tips: "राष्ट्रीय राजमार्ग 28 (NH-28) चार लेन एक्सप्रेसवे है। बस्ती, फैजाबाद (अयोध्या) होकर लखनऊ में प्रवेश करेंगे।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Gorakhpur&destination=26.8437,80.8954&travelmode=driving"
            }
        }
    },
    "Agra (आगरा)": {
        routes: ["Agra-Lucknow Expressway (सड़क मार्ग - एक्सप्रेसवे)"],
        details: {
            "Agra-Lucknow Expressway (सड़क मार्ग - एक्सप्रेसवे)": {
                eta: "4 घंटे 15 मिनट",
                tips: "विश्वस्तरीय आगरा-लखनऊ एक्सप्रेसवे द्वारा यात्रा। कारपूलिंग हेतु सर्वोत्तम मार्ग। टोल टैक्स लगभग ₹655 है। गति सीमा 100 किमी/घंटा का पालन करें।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Agra&destination=26.8437,80.8954&travelmode=driving"
            }
        }
    },
    "Prayagraj (प्रयागराज)": {
        routes: ["Ganga Expressway / NH-30 (सड़क मार्ग)", "Train via Rae Bareli (रेल मार्ग)"],
        details: {
            "Ganga Expressway / NH-30 (सड़क मार्ग)": {
                eta: "3 घंटे 45 मिनट",
                tips: "प्रयागराज-लखनऊ NH-30 मार्ग अत्यंत सुगम है। रायबरेली होकर लखनऊ पहुंचेंगे।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Prayagraj&destination=26.8437,80.8954&travelmode=driving"
            },
            "Train via Rae Bareli (रेल मार्ग)": {
                eta: "4 घंटे 00 मिनट",
                tips: "गंगा गोमती एक्सप्रेस या प्रयाग-लखनऊ पैसेंजर सर्वोत्तम विकल्प हैं।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Prayagraj&destination=26.8437,80.8954"
            }
        }
    },
    "Bareilly (बरेली)": {
        routes: ["NH-24 via Shahjahanpur (सड़क मार्ग)", "Train (रेल मार्ग)"],
        details: {
            "NH-24 via Shahjahanpur (सड़क मार्ग)": {
                eta: "5 घंटे 30 मिनट",
                tips: "राष्ट्रीय राजमार्ग 24 (NH-24) शाहजहांपुर, सीतापुर होकर लखनऊ पहुंचता है। सीतापुर बाईपास पर यातायात सामान्य रहता है।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Bareilly&destination=26.8437,80.8954&travelmode=driving"
            },
            "Train (रेल मार्ग)": {
                eta: "4 घंटे 30 मिनट",
                tips: "त्रिवेणी एक्सप्रेस या हावड़ा मेल द्वारा बरेली जंक्शन से प्रस्थान करें।",
                navLink: "https://www.google.com/maps/dir/?api=1&origin=Bareilly&destination=26.8437,80.8954"
            }
        }
    }
};

function initTravelRouter() {
    const distSelect = document.getElementById("router-district");
    const routeSelect = document.getElementById("router-route");
    const outputBox = document.getElementById("router-output");
    
    const etaEl = document.getElementById("router-eta");
    const tipsEl = document.getElementById("router-tips");
    const navBtn = document.getElementById("router-nav-btn");

    if (!distSelect || !routeSelect || !outputBox) return;

    // Populate District list
    distSelect.innerHTML = '<option value="" disabled selected>-- अपना जनपद चुनें --</option>';
    Object.keys(travelRouteData).forEach(district => {
        const opt = document.createElement("option");
        opt.value = district;
        opt.textContent = district;
        distSelect.appendChild(opt);
    });

    // District change listener
    distSelect.addEventListener("change", () => {
        const district = distSelect.value;
        const data = travelRouteData[district];

        // Reset Route select
        routeSelect.innerHTML = '<option value="" disabled selected>-- मार्ग/पारगमन चुनें --</option>';
        routeSelect.disabled = false;
        outputBox.classList.remove("show");

        if (data && data.routes) {
            data.routes.forEach(route => {
                const opt = document.createElement("option");
                opt.value = route;
                opt.textContent = route;
                routeSelect.appendChild(opt);
            });
        }
    });

    // Route change listener
    routeSelect.addEventListener("change", () => {
        const district = distSelect.value;
        const route = routeSelect.value;
        const data = travelRouteData[district];

        if (data && data.details && data.details[route]) {
            const details = data.details[route];
            
            // Populate output text elements
            if (etaEl) etaEl.textContent = details.eta;
            if (tipsEl) tipsEl.textContent = details.tips;
            if (navBtn) navBtn.href = details.navLink;

            // Show output box
            outputBox.classList.add("show");
        }
    });
}

/* ==========================================
   8. BLOCK-WISE COORDINATION SEARCH
   ========================================== */
const coordinatorData = [
    { district: "Lucknow (लखनऊ)", block: "Chinhat (चिनहट)", name: "सर्वेश यादव", phone: "9876543210", meetingPoint: "चिनहट चौराहा, लखनऊ", departureTime: "27 जुलाई, सुबह 08:00 बजे", seats: "12" },
    { district: "Lucknow (लखनऊ)", block: "Malihabad (मलिहाबाद)", name: "राजेश कुमार", phone: "9988776655", meetingPoint: "मलिहाबाद ब्लॉक मुख्यालय", departureTime: "27 जुलाई, सुबह 07:30 बजे", seats: "8" },
    { district: "Lucknow (लखनऊ)", block: "Kakori (काकोरी)", name: "अनिल सिंह", phone: "9122334455", meetingPoint: "काकोरी शहीद स्मारक", departureTime: "27 जुलाई, सुबह 08:15 बजे", seats: "15" },
    
    { district: "Varanasi (वाराणसी)", block: "Pindra (पिंडरा)", name: "अमित कुमार सिंह", phone: "9450123456", meetingPoint: "पिंडरा तहसील गेट", departureTime: "26 जुलाई, रात 10:00 बजे", seats: "22" },
    { district: "Varanasi (वाराणसी)", block: "Kashi Vidyapeeth (काशी विद्यापीठ)", name: "विनय तिवारी", phone: "8090123456", meetingPoint: "काशी विद्यापीठ ब्लॉक परिसर", departureTime: "26 जुलाई, रात 11:30 बजे", seats: "18" },
    { district: "Varanasi (वाराणसी)", block: "Cholapur (चोलापुर)", name: "धीरज मौर्य", phone: "7080901234", meetingPoint: "चोलापुर ब्लॉक मुख्यालय चौराहा", departureTime: "26 जुलाई, रात 09:30 बजे", seats: "10" },

    { district: "Gorakhpur (गोरखपुर)", block: "Campierganj (कैम्पियरगंज)", name: "हरेंद्र निषाद", phone: "9612345678", meetingPoint: "कैम्पियरगंज रेलवे स्टेशन", departureTime: "26 जुलाई, शाम 07:00 बजे", seats: "25" },
    { district: "Gorakhpur (गोरखपुर)", block: "Sardarnagar (सरदारनगर)", name: "अभिषेक पासवान", phone: "8822334455", meetingPoint: "सरदारनगर ब्लॉक मुख्यालय", departureTime: "26 जुलाई, शाम 08:30 बजे", seats: "14" },
    { district: "Gorakhpur (गोरखपुर)", block: "Bansgaon (बांसगांव)", name: "दिलीप त्रिपाठी", phone: "9566778899", meetingPoint: "बांसगांव बस स्टैंड", departureTime: "26 जुलाई, शाम 08:00 बजे", seats: "20" },

    { district: "Agra (आगरा)", block: "Bichpuri (बिचपुरी)", name: "मनोज शर्मा", phone: "9837123456", meetingPoint: "बिचपुरी चौराहा, आगरा", departureTime: "27 जुलाई, सुबह 04:00 बजे", seats: "11" },
    { district: "Agra (आगरा)", block: "Fatehabad (फतेहाबाद)", name: "जितेन्द्र बघेल", phone: "8057123456", meetingPoint: "फतेहाबाद ब्लॉक बस स्टैंड", departureTime: "27 जुलाई, सुबह 03:30 बजे", seats: "9" },

    { district: "Prayagraj (प्रयागराज)", block: "Phulpur (फूलपुर)", name: "विजय केसरवानी", phone: "7905123456", meetingPoint: "फूलपुर बस डिपो", departureTime: "26 जुलाई, रात 11:00 बजे", seats: "16" },
    { district: "Prayagraj (प्रयागराज)", block: "Soraon (सोरांव)", name: "राकेश सरोज", phone: "9451123456", meetingPoint: "सोरांव तहसील गेट", departureTime: "26 जुलाई, रात 11:45 बजे", seats: "20" },
    
    { district: "Bareilly (बरेली)", block: "Bhadpura (भदपुरा)", name: "संजय गंगवार", phone: "9917123456", meetingPoint: "भदपुरा ब्लॉक तिराहा", departureTime: "26 जुलाई, रात 09:00 बजे", seats: "15" },
    { district: "Bareilly (बरेली)", block: "Faridpur (फरीदपुर)", name: "सत्यपाल सिंह", phone: "8126123456", meetingPoint: "फरीदपुर बस स्टैंड", departureTime: "26 जुलाई, रात 10:15 बजे", seats: "18" },

    { district: "Basti (बस्ती)", block: "Harraiya (हरैया)", name: "संदीप ओझा", phone: "9598123456", meetingPoint: "हरैया बस स्टॉप (NH-28)", departureTime: "26 जुलाई, रात 11:00 बजे", seats: "24" },
    { district: "Basti (बस्ती)", block: "Bhadar (भादर)", name: "रवि शंकर चौधरी", phone: "8400123456", meetingPoint: "बस्ती सदर ब्लॉक गेट", departureTime: "26 जुलाई, रात 11:30 बजे", seats: "12" },

    { district: "Ayodhya (अयोध्या)", block: "Milkipur (मिल्कीपुर)", name: "अखिलेश पांडे", phone: "9695123456", meetingPoint: "मिल्कीपुर चौराहा, अयोध्या", departureTime: "27 जुलाई, सुबह 05:00 बजे", seats: "14" },
    { district: "Ayodhya (अयोध्या)", block: "Sohawal (सोहावल)", name: "विकास वर्मा", phone: "7376123456", meetingPoint: "सोहावल ब्लॉक तिराहा", departureTime: "27 जुलाई, सुबह 05:30 बजे", seats: "10" }
];

function initCoordinatorSearch() {
    const distInput = document.getElementById("search-district");
    const blockInput = document.getElementById("search-block");
    const resultsContainer = document.getElementById("coordination-results");

    if (!distInput || !blockInput || !resultsContainer) return;

    distInput.addEventListener("input", performFilter);
    blockInput.addEventListener("input", performFilter);

    performFilter();

    function performFilter() {
        const distQuery = distInput.value.toLowerCase().trim();
        const blockQuery = blockInput.value.toLowerCase().trim();

        const filtered = coordinatorData.filter(item => {
            const matchDist = item.district.toLowerCase().includes(distQuery);
            const matchBlock = item.block.toLowerCase().includes(blockQuery);
            return matchDist && matchBlock;
        });

        renderResults(filtered);
    }

    function renderResults(list) {
        resultsContainer.innerHTML = "";

        if (list.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-coordination-results animate-fade-up">
                    🔍 आपके खोजे गए जनपद/विकास खण्ड के लिए कोई समन्वयक नहीं मिला।<br>
                    <span style="font-size: 0.95rem; font-weight: 500; display: block; margin-top: 10px;">
                        कृपया जनपद या खण्ड का नाम पुनः जांचें अथवा मुख्य हेल्प डेस्क से संपर्क करें।
                    </span>
                </div>
            `;
            return;
        }

        list.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "coordinator-card animate-fade-up searchable-card";
            card.style.animationDelay = `${(index % 6) * 0.08}s`;
            card.dataset.district = item.district;
            card.dataset.block = item.block;
            card.dataset.name = item.name;

            card.innerHTML = `
                <div class="coordinator-details">
                    <span class="coordinator-district-badge">${item.district}</span>
                    <h4>${item.name}</h4>
                    <div class="coordinator-info-item" style="margin-top: 8px;"><strong>विकास खण्ड:</strong> ${item.block}</div>
                    <div class="coordinator-info-item"><strong>एकत्रित होने का स्थान:</strong> ${item.meetingPoint}</div>
                    <div class="coordinator-info-item"><strong>प्रस्थान समय:</strong> ${item.departureTime}</div>
                    <div class="coordinator-info-item"><strong>उपलब्ध सीटें:</strong> <span style="color: var(--saffron-deep); font-weight: 800;">${item.seats} सीटें</span></div>
                </div>
                <div class="coordinator-actions">
                    <a href="tel:+91${item.phone}" class="nav-btn-outline btn-sm-action" style="background-color: var(--blood); border-color: var(--ink); color: var(--paper); display: flex; justify-content: center; align-items: center; gap: 4px;">
                        📞 कॉल करें
                    </a>
                    <a href="https://api.whatsapp.com/send?phone=91${item.phone}&text=नमस्कार%20साथी%2C%20मैं%20${item.block}%20ब्लॉक%20से%20पंचायत%20सहायक%20हूँ%20और%20लखनऊ%20धरना%20प्रदर्शन%20के%20यात्रा%20समन्वय%20हेतु%20जुड़ना%20चाहता%20हूँ।" target="_blank" class="nav-btn-outline btn-sm-action" style="background-color: var(--green); border-color: var(--ink); color: var(--paper); display: flex; justify-content: center; align-items: center; gap: 4px;">
                        📲 WhatsApp
                    </a>
                </div>
            `;
            resultsContainer.appendChild(card);
        });
    }
}

/* ==========================================
   9. WHAT TO BRING CHECKLIST
   ========================================== */
function initChecklist() {
    const checkboxes = document.querySelectorAll(".checklist-checkbox");
    const countBadge = document.getElementById("checklist-tally");

    if (checkboxes.length === 0) return;

    checkboxes.forEach(cb => {
        const key = `dharna_pack_${cb.id}`;
        const isPacked = localStorage.getItem(key) === "true";
        cb.checked = isPacked;
        
        const card = cb.closest(".pack-card");
        if (card) {
            card.classList.toggle("packed", isPacked);
        }

        if (card) {
            card.addEventListener("click", (e) => {
                if (e.target.tagName === "INPUT") return;
                cb.checked = !cb.checked;
                cb.dispatchEvent(new Event("change"));
            });
        }

        cb.addEventListener("change", () => {
            const packed = cb.checked;
            localStorage.setItem(key, packed);
            if (card) {
                card.classList.toggle("packed", packed);
            }
            updateTally();
        });
    });

    function updateTally() {
        const checkedCount = document.querySelectorAll(".checklist-checkbox:checked").length;
        const totalCount = checkboxes.length;
        if (countBadge) {
            countBadge.textContent = `${checkedCount} / ${totalCount} Packed`;
        }
    }

    updateTally();
}

/* ==========================================
   10. GOOGLE MAPS ACTIONS
   ========================================== */
function initGoogleMapsActions() {
    const btnShare = document.getElementById("btn-share-loc");
    const btnCopy = document.getElementById("btn-copy-addr");
    const btnRoute = document.getElementById("btn-get-route");
    const addressText = "मन्यावर श्री कांशीराम जी ग्रीन इको गार्डन, वीआईपी रोड, आलमबाग, लखनऊ - 226005";
    const mapUrl = "https://maps.app.goo.gl/EcoGardenAlambagh";

    if (btnShare) {
        btnShare.addEventListener("click", (e) => {
            e.preventDefault();
            if (navigator.share) {
                navigator.share({
                    title: "पंचायत सहायक धरना स्थल (Lucknow Venue)",
                    text: `धरना स्थल का पता: ${addressText}`,
                    url: mapUrl
                }).catch(err => console.log("Error sharing", err));
            } else {
                copyTextToClipboard(mapUrl, "लोकेशन लिंक कॉपी हो गया!");
            }
        });
    }

    if (btnCopy) {
        btnCopy.addEventListener("click", (e) => {
            e.preventDefault();
            copyTextToClipboard(addressText, "पता कॉपी कर लिया गया!");
        });
    }

    if (btnRoute) {
        btnRoute.addEventListener("click", (e) => {
            e.preventDefault();
            const routeUrl = "https://www.google.com/maps/dir/?api=1&destination=26.8576,80.9575";
            window.open(routeUrl, "_blank");
        });
    }
}

function copyTextToClipboard(text, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }).catch(err => {
            console.error("Clipboard copy failed: ", err);
            fallbackCopy(text, successMessage);
        });
    } else {
        fallbackCopy(text, successMessage);
    }
}

function fallbackCopy(text, msg) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
        document.execCommand("copy");
        alert(msg);
    } catch (err) {
        console.error("Fallback copy failed: ", err);
    }
    document.body.removeChild(textArea);
}

/* ==========================================
   11. FAQ SEARCH ACCORDION
   ========================================== */
function initFAQSearch() {
    const searchInput = document.getElementById("faq-search");
    const faqItems = document.querySelectorAll(".faq-item");
    const questionButtons = document.querySelectorAll(".faq-question-btn");

    // Accordion Toggle
    questionButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            const faqItem = btn.closest(".faq-item");
            const answerPanel = faqItem.querySelector(".faq-answer-panel");
            const isActive = faqItem.classList.contains("active");

            document.querySelectorAll(".faq-item").forEach(item => {
                item.classList.remove("active");
                const panel = item.querySelector(".faq-answer-panel");
                if (panel) panel.style.maxHeight = null;
            });

            if (!isActive) {
                faqItem.classList.add("active");
                answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
            }
        });
    });

    // Search filter
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const query = searchInput.value.toLowerCase().trim();

            faqItems.forEach(item => {
                const questionText = item.querySelector("h4").textContent.toLowerCase();
                const answerText = item.querySelector(".faq-answer-panel p").textContent.toLowerCase();

                if (questionText.includes(query) || answerText.includes(query)) {
                    item.style.display = "block";
                } else {
                    item.style.display = "none";
                }
            });
        });
    }
}

/* ==========================================
   12. GLOBAL PAGE SEARCH INDEX (removed — search widget deleted)
   ========================================== */

/* ==========================================
   13. LIGHTBOX GALLERY (Zoom, Swipe, Download)
   ========================================== */
let activeGalleryIndex = 0;
const galleryImages = [
    { src: "photos/1.webp", alt: "ऐतिहासिक लखनऊ हुंकार - 1" },
    { src: "photos/2.webp", alt: "न्याय संगत मांगों का ज्ञापन" },
    { src: "photos/3.webp", alt: "सैकड़ों पंचायत सहायकों की एकजुटता" },
    { src: "photos/4.webp", alt: "महिला पंचायत सहायकों की भागीदारी" },
    { src: "photos/5.webp", alt: "सत्यमेव जयते - शांतिपूर्ण सभा" },
    { src: "photos/6.webp", alt: "शासकीय अधिकारों की पैरवी बैठक" },
    { src: "photos/7.webp", alt: "ग्राम सचिवालयों के डिजिटल योद्धा" },
    { src: "photos/8.webp", alt: "अधिकारों के लिए प्रदेशव्यापी एकजुटता" }
];

function initLightboxGallery() {
    const galleryItems = document.querySelectorAll(".masonry-item");
    const lightbox = document.getElementById("galleryLightbox");
    const lightboxImg = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxText");
    
    const closeBtn = document.getElementById("lightboxClose");
    const leftArrow = document.getElementById("lightbox-prev");
    const rightArrow = document.getElementById("lightbox-next");
    const zoomBtn = document.getElementById("lightbox-zoom-btn");
    const downloadBtn = document.getElementById("lightbox-download-btn");
    const imgWrapper = document.querySelector(".lightbox-image-wrapper");

    if (galleryItems.length === 0 || !lightbox || !lightboxImg) return;

    // Open Lightbox
    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            activeGalleryIndex = index;
            loadGalleryImage(index);
            lightbox.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    });

    function loadGalleryImage(index) {
        if (index < 0 || index >= galleryImages.length) return;
        const item = galleryImages[index];
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
        
        if (lightboxCaption) {
            lightboxCaption.innerHTML = `
                <span>${item.alt}</span>
                <div class="lightbox-toolbar">
                    <button class="lightbox-tool-btn" id="lightbox-zoom-btn-dynamic">🔍 Zoom</button>
                    <a href="${item.src}" download="${item.alt}.webp" class="lightbox-tool-btn" id="lightbox-download-btn-dynamic">📥 Download</a>
                </div>
            `;
            
            // Re-bind dynamic toolbar listeners
            const dZoom = document.getElementById("lightbox-zoom-btn-dynamic");
            if (dZoom && imgWrapper) {
                dZoom.addEventListener("click", toggleZoom);
            }
        }

        // Reset Zoom
        if (imgWrapper) {
            imgWrapper.classList.remove("zoomed");
        }
    }

    function toggleZoom(e) {
        if (e) e.stopPropagation();
        if (imgWrapper) {
            imgWrapper.classList.toggle("zoomed");
        }
    }

    if (imgWrapper) {
        imgWrapper.addEventListener("click", () => {
            toggleZoom();
        });
    }

    function closeLightbox() {
        lightbox.style.display = "none";
        lightboxImg.src = "";
        document.body.style.overflow = "";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);

    // Left/Right Nav
    if (leftArrow) {
        leftArrow.addEventListener("click", (e) => {
            e.stopPropagation();
            activeGalleryIndex = (activeGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
            loadGalleryImage(activeGalleryIndex);
        });
    }

    if (rightArrow) {
        rightArrow.addEventListener("click", (e) => {
            e.stopPropagation();
            activeGalleryIndex = (activeGalleryIndex + 1) % galleryImages.length;
            loadGalleryImage(activeGalleryIndex);
        });
    }

    // Touch Swipe inside Lightbox
    let touchStartX = 0;
    lightbox.addEventListener("touchstart", (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener("touchend", (e) => {
        if (imgWrapper && imgWrapper.classList.contains("zoomed")) return; // Defer swipe when zoomed
        const touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 50) {
            if (diff < 0) {
                // Swipe Left -> Next
                activeGalleryIndex = (activeGalleryIndex + 1) % galleryImages.length;
            } else {
                // Swipe Right -> Prev
                activeGalleryIndex = (activeGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
            }
            loadGalleryImage(activeGalleryIndex);
        }
    }, { passive: true });

    // Keyboard support
    document.addEventListener("keydown", (e) => {
        if (lightbox.style.display === "flex") {
            if (e.key === "ArrowLeft" && leftArrow) leftArrow.click();
            if (e.key === "ArrowRight" && rightArrow) rightArrow.click();
            if (e.key === "Escape") closeLightbox();
        }
    });

    // Close on overlay click
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox || e.target.classList.contains("lightbox-image-wrapper")) {
            closeLightbox();
        }
    });
}

/* ==========================================
   14. BACK TO TOP BUTTON
   ========================================== */
function initBackToTop() {
    const btn = document.getElementById("backToTopBtn");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            btn.style.display = "flex";
        } else {
            btn.style.display = "none";
        }
    });

    btn.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}

/* ==========================================
   15. SCROLL OBSERVATION ANIMATIONS
   ========================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(".animate-fade-up, .timeline-item, .coordinator-card, .dos-card, .donts-card, .why-protest-card, .pack-card, .media-kit-card, .faq-item");

    if (!("IntersectionObserver" in window)) {
        animatedElements.forEach(el => {
            el.style.opacity = "1";
            el.style.transform = "none";
        });
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -60px 0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                el.classList.add("visible");
                
                el.style.opacity = "1";
                el.style.transform = "translateY(0) scale(1)";
                
                obs.unobserve(el);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        if (!el.classList.contains("visible")) {
            el.style.opacity = "0";
            if (el.classList.contains("timeline-item") || el.classList.contains("coordinator-card")) {
                el.style.transform = "translateY(15px)";
            } else {
                el.style.transform = "translateY(25px)";
            }
            el.style.transition = "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)";
        }
        observer.observe(el);
    });
}

/* ==========================================
   LOCATION HUB — Nearby Places (Verified Google Maps Data)
   All coordinates / addresses sourced from Wikipedia, official sources.
   Origin: Manyawar Shri Kanshiram Ji Green Eco Garden
   Coordinates: 26.810966°N, 80.919377°E
   ========================================== */

const ECO_GARDEN_LAT = 26.810966;
const ECO_GARDEN_LNG = 80.919377;

/**
 * Build a Google Maps directions URL from the garden to a destination.
 * @param {number} destLat
 * @param {number} destLng
 * @param {string} mode - driving | walking | transit
 */
function mapsDir(destLat, destLng, mode = "driving") {
    // Use string name instead of lat/lng so Google Maps shows "Eco Garden" instead of nearest ATM address
    return `https://www.google.com/maps/dir/?api=1&origin=Eco+Garden,+Lucknow&destination=${destLat},${destLng}&travelmode=${mode}`;
}

/**
 * Build a Google Maps search URL for a named place.
 */
function mapsSearch(query) {
    // Instead of a generic search, make it a Directions request using the query as destination
    // Start the route from Eco Garden so distances align with the UI
    return `https://www.google.com/maps/dir/?api=1&origin=Eco+Garden,+Lucknow&destination=${encodeURIComponent(query)}`;
}

// ── VERIFIED LOCATION DATABASE ──────────────────────────────────────────────
// Sources: Wikipedia, official transport websites, hospital websites, UP Police
const locationHubData = [

    /* ── METRO STATIONS ── */
    {
        cat: "metro", emoji: "🚇",
        name: "Alambagh ISBT Metro Station",
        nameHi: "आलमबाग ISBT मेट्रो स्टेशन",
        address: "Red Line (Station 8), Kanpur Road, Alambagh, Lucknow - 226005",
        dist: "~1.7 km",
        detail: "Red Line • ऑटो/ई-रिक्शा से 7 मिनट",
        navUrl: mapsDir(26.8184, 80.9072, "walking"),
        searchUrl: "https://www.google.com/maps/place/Alambagh+ISBT+Metro+Station/@26.8184,80.9072,17z"
    },
    {
        cat: "metro", emoji: "🚇",
        name: "Alambagh Metro Station",
        nameHi: "आलमबाग मेट्रो स्टेशन",
        address: "Red Line (Station 7), Kanpur Road, Alambagh, Lucknow - 226005",
        dist: "~1.8 km",
        detail: "Red Line • ऑटो से 8 मिनट",
        navUrl: mapsDir(26.8139, 80.9024, "walking"),
        searchUrl: "https://www.google.com/maps/place/Alambagh+Metro+Station/@26.8139,80.9024,17z"
    },

    /* ── RAILWAY STATIONS ── */
    {
        cat: "rail", emoji: "🚂",
        name: "Lucknow Charbagh Railway Station (LKO)",
        nameHi: "लखनऊ चारबाग रेलवे स्टेशन",
        address: "Charbagh, Lucknow Junction, Lucknow - 226004 | Code: LKO",
        dist: "~2.4 km",
        detail: "Northern Railway • ऑटो से ~15 मिनट",
        navUrl: mapsDir(26.8326, 80.9192, "driving"),
        searchUrl: "https://www.google.com/maps/place/Lucknow+Charbagh+Railway+Station/@26.8326,80.9192,17z"
    },
    {
        cat: "rail", emoji: "🚂",
        name: "Lucknow Junction Railway Station (LJN)",
        nameHi: "लखनऊ जंक्शन रेलवे स्टेशन",
        address: "Charbagh, Lucknow - 226004 | Code: LJN (North Eastern Railway)",
        dist: "~2.5 km",
        detail: "NER Zone • चारबाग से सटा हुआ स्टेशन",
        navUrl: mapsDir(26.8315, 80.9241, "driving"),
        searchUrl: "https://www.google.com/maps/place/Lucknow+Junction+Railway+Station/@26.8315,80.9241,17z"
    },

    /* ── BUS STANDS ── */
    {
        cat: "bus", emoji: "🚌",
        name: "Alambagh ISBT Bus Terminal",
        nameHi: "आलमबाग ISBT बस टर्मिनल",
        address: "Kanpur Road, Railway Colony, Alambagh, Lucknow - 226005",
        dist: "~1.7 km",
        detail: "UP Roadways • सभी जनपदों से सीधी बस",
        navUrl: mapsDir(26.818403, 80.907272, "driving"),
        searchUrl: "https://www.google.com/maps/place/Alambagh+Bus+Stand/@26.818403,80.907272,17z"
    },
    {
        cat: "bus", emoji: "🚌",
        name: "Kaiserbagh Bus Stand",
        nameHi: "कैसरबाग बस अड्डा",
        address: "Kaiserbagh Road, Lucknow - 226001",
        dist: "~3.5 km",
        detail: "Local city routes • Lucknow CMC buses",
        navUrl: mapsDir(26.8477, 80.9334, "driving"),
        searchUrl: "https://www.google.com/maps/search/Kaiserbagh+Bus+Stand+Lucknow"
    },

    /* ── HOSPITALS ── */
    {
        cat: "hospital", emoji: "🏥",
        name: "Avadh Hospital & Heart Centre",
        nameHi: "अवध हॉस्पिटल एंड हार्ट सेंटर",
        address: "9-D, Avadh Chauraha, Singar Nagar, Alambagh, Lucknow - 226005",
        dist: "~0.9 km",
        detail: "24x7 Emergency • Near Singar Nagar Metro",
        navUrl: mapsSearch("Avadh Hospital Singar Nagar Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Avadh+Hospital+Singar+Nagar+Alambagh+Lucknow"
    },
    {
        cat: "hospital", emoji: "🏥",
        name: "City Hospital Alambagh",
        nameHi: "सिटी हॉस्पिटल आलमबाग",
        address: "VIP Road, Alambagh, Lucknow - 226005",
        dist: "~1.2 km",
        detail: "Trauma Center • OPD & Emergency",
        navUrl: mapsSearch("City Hospital Alambagh Lucknow VIP Road"),
        searchUrl: "https://www.google.com/maps/search/City+Hospital+Alambagh+Lucknow"
    },
    {
        cat: "hospital", emoji: "🏥",
        name: "Balrampur Government Hospital",
        nameHi: "बलरामपुर सरकारी अस्पताल",
        address: "Golaganj, Lucknow - 226018",
        dist: "~3.2 km",
        detail: "Sarkari • 24x7 Emergency • Free Treatment",
        navUrl: mapsDir(26.8518, 80.9328, "driving"),
        searchUrl: "https://www.google.com/maps/place/Balrampur+Hospital/@26.8518,80.9328,17z"
    },

    /* ── POLICE STATIONS ── */
    {
        cat: "police", emoji: "👮",
        name: "Alambagh Kotwali",
        nameHi: "आलमबाग कोतवाली",
        address: "Kanpur Road, Near Railway Colony, Alambagh, Lucknow - 226005",
        dist: "~1.5 km",
        detail: "UP Police • थाना प्रभारी: आलमबाग क्षेत्र",
        navUrl: mapsSearch("Alambagh Police Station Kotwali Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Alambagh+Police+Station+Lucknow"
    },
    {
        cat: "police", emoji: "👮",
        name: "UP Police Control Room (PCR)",
        nameHi: "यूपी पुलिस कंट्रोल रूम",
        address: "Dial 112 (Emergency) — Available 24×7 across Lucknow",
        dist: "Emergency",
        detail: "📞 112 • तत्काल सहायता हेतु कॉल करें",
        navUrl: "tel:112",
        searchUrl: "tel:112"
    },

    /* ── PARKING ── */
    {
        cat: "parking", emoji: "🅿️",
        name: "Eco Garden Internal Parking",
        nameHi: "इको गार्डन आंतरिक पार्किंग",
        address: "VIP Road, Alambagh, Eco Garden Main Gate, Lucknow - 226005",
        dist: "0 m (on-site)",
        detail: "कार + दोपहिया • Paid • धरना दिवस पर बंद हो सकता है",
        navUrl: mapsDir(ECO_GARDEN_LAT, ECO_GARDEN_LNG, "driving"),
        searchUrl: "https://www.google.com/maps/place/Manyawar+Shri+Kanshiram+Ji+Green+Eco+Garden/@26.810966,80.919377,17z"
    },
    {
        cat: "parking", emoji: "🅿️",
        name: "VIP Road Street Parking",
        nameHi: "वीआईपी रोड स्ट्रीट पार्किंग",
        address: "VIP Road, Near Eco Garden North Gate, Alambagh, Lucknow",
        dist: "~200 m",
        detail: "Open Street • 2-wheelers & 4-wheelers • Free",
        navUrl: mapsSearch("Parking near Eco Garden Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Parking+near+Eco+Garden+Alambagh+Lucknow"
    },

    /* ── FOOD ── */
    {
        cat: "food", emoji: "🍱",
        name: "Zorko — Brand of Food Lovers",
        nameHi: "ज़ोर्को रेस्तरां (वीआईपी रोड)",
        address: "570/S-01-KA/B, Geetapalli Ward, Pakri Ka Pull, VIP Road, Near Eco Garden, Alambagh, Lucknow",
        dist: "~400 m",
        detail: "North Indian • Italian • Chinese • Dine-in & Takeaway",
        navUrl: mapsSearch("Zorko Restaurant VIP Road Near Eco Garden Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Zorko+Restaurant+Alambagh+Lucknow"
    },
    {
        cat: "food", emoji: "🍱",
        name: "Kanha Bhog (Veg)",
        nameHi: "कान्हा भोग (शुद्ध शाकाहारी)",
        address: "Kanpur Road, Alambagh, Lucknow - 226005",
        dist: "~780 m",
        detail: "Pure Veg • Quick Service • Affordable Thali",
        navUrl: mapsSearch("Kanha Bhog Alambagh Kanpur Road Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Kanha+Bhog+Alambagh+Lucknow"
    },
    {
        cat: "food", emoji: "🍱",
        name: "Alambagh Market Dhabas",
        nameHi: "आलमबाग बाजार ढाबे",
        address: "Alambagh Market Road, Near ISBT, Alambagh, Lucknow - 226005",
        dist: "~1.5 km",
        detail: "Multiple eateries • Breakfast & Lunch • Budget-friendly",
        navUrl: mapsSearch("Dhaba near Alambagh Market Lucknow"),
        searchUrl: "https://www.google.com/maps/search/restaurants+near+Alambagh+Market+Lucknow"
    },

    /* ── ATM ── */
    {
        cat: "atm", emoji: "🏧",
        name: "SBI ATM — Kanpur Road, Alambagh",
        nameHi: "SBI ATM — कानपुर रोड, आलमबाग",
        address: "Puran Nagar, Kanpur Road, Alambagh, Lucknow - 226005",
        dist: "~1.3 km",
        detail: "State Bank of India • 24x7 Available",
        navUrl: mapsSearch("SBI ATM Kanpur Road Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/SBI+ATM+Alambagh+Lucknow"
    },
    {
        cat: "atm", emoji: "🏧",
        name: "HDFC Bank ATM — Chander Nagar",
        nameHi: "HDFC ATM — चंदर नगर, आलमबाग",
        address: "56-57, Ground Floor, Chander Nagar, Alambagh, Lucknow - 226005",
        dist: "~1.8 km",
        detail: "HDFC Bank • 24x7 • Cash Deposit Available",
        navUrl: mapsSearch("HDFC ATM Chander Nagar Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/HDFC+ATM+Alambagh+Lucknow"
    },
    {
        cat: "atm", emoji: "🏧",
        name: "SBI ATM — Singar Nagar",
        nameHi: "SBI ATM — सिंगार नगर",
        address: "Singar Nagar, Alambagh, Lucknow - 226005",
        dist: "~0.8 km",
        detail: "State Bank of India • Near Avadh Chauraha",
        navUrl: mapsSearch("SBI ATM Singar Nagar Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/SBI+ATM+Singar+Nagar+Lucknow"
    },

    /* ── PETROL PUMPS ── */
    {
        cat: "petrol", emoji: "⛽",
        name: "Shakti Filling Station (HPCL)",
        nameHi: "शक्ति फिलिंग स्टेशन (HPCL)",
        address: "VIP Road, Alambagh, Lucknow - 226005",
        dist: "~600 m",
        detail: "Hindustan Petroleum • Petrol + Diesel",
        navUrl: mapsSearch("Shakti Filling Station VIP Road Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/Shakti+Filling+Station+VIP+Road+Lucknow"
    },
    {
        cat: "petrol", emoji: "⛽",
        name: "Mahna Service Station (HPCL)",
        nameHi: "महना सर्विस स्टेशन (HPCL)",
        address: "Alambagh, Lucknow - 226005",
        dist: "~1.1 km",
        detail: "Hindustan Petroleum • 24 घंटे खुला",
        navUrl: mapsSearch("Mahna Service Station Alambagh Lucknow HPCL"),
        searchUrl: "https://www.google.com/maps/search/Mahna+Service+Station+Alambagh+Lucknow"
    },
    {
        cat: "petrol", emoji: "⛽",
        name: "NS Kohli & Bros (HPCL)",
        nameHi: "एन.एस. कोहली एंड ब्रदर्स (HPCL)",
        address: "Kanpur Road, Alambagh, Lucknow - 226005",
        dist: "~1.6 km",
        detail: "Hindustan Petroleum • Kanpur Road Main",
        navUrl: mapsSearch("NS Kohli Bros HPCL Kanpur Road Alambagh Lucknow"),
        searchUrl: "https://www.google.com/maps/search/NS+Kohli+Bros+HPCL+Alambagh+Lucknow"
    }
];

// ── CATEGORY META ────────────────────────────────────────────────────────────
const catMeta = {
    metro:    { label: "Metro",    emoji: "🚇" },
    rail:     { label: "Railway",  emoji: "🚂" },
    bus:      { label: "Bus",      emoji: "🚌" },
    hospital: { label: "Hospital", emoji: "🏥" },
    police:   { label: "Police",   emoji: "👮" },
    parking:  { label: "Parking",  emoji: "🅿️" },
    food:     { label: "Food",     emoji: "🍱" },
    atm:      { label: "ATM",      emoji: "🏧" },
    petrol:   { label: "Petrol",   emoji: "⛽" }
};

// ── RENDER LOGIC ─────────────────────────────────────────────────────────────
function initLocationHub() {
    const grid   = document.getElementById("locHubGrid");
    const tabs   = document.querySelectorAll(".loc-tab");
    const search = document.getElementById("loc-hub-search");

    if (!grid) return;

    let currentCat  = "all";
    let searchQuery = "";

    function buildCard(loc) {
        const meta = catMeta[loc.cat] || {};
        const isPCR = loc.navUrl.startsWith("tel:");
        return `
        <div class="loc-card cat-${loc.cat}" data-cat="${loc.cat}" data-name="${loc.name} ${loc.nameHi} ${loc.address}">
            <div class="loc-card-stripe"></div>
            <div class="loc-card-body">
                <div class="loc-card-icon-row">
                    <span class="loc-card-emoji">${loc.emoji}</span>
                    <span class="loc-card-cat-badge">${meta.label || loc.cat.toUpperCase()}</span>
                </div>
                <div class="loc-card-name">${loc.nameHi}</div>
                <div class="loc-card-name" style="font-size:0.82rem;font-weight:600;color:var(--ink-2);">${loc.name}</div>
                <div class="loc-card-address">📍 ${loc.address}</div>
                <span class="loc-card-dist-chip">📏 ${loc.dist}</span>
                <div style="font-family:var(--sans);font-size:0.78rem;font-weight:600;color:var(--ink-2);margin-top:2px;">${loc.detail}</div>
            </div>
            <div class="loc-card-footer">
                ${isPCR
                    ? `<a href="tel:112" class="loc-nav-btn primary" aria-label="Call 112">📞 Call 112</a>`
                    : `<a href="${loc.navUrl}" target="_blank" rel="noopener" class="loc-nav-btn primary" aria-label="Navigate to ${loc.name}">🗺️ Navigate</a>`
                }
                <a href="${loc.searchUrl}" target="_blank" rel="noopener" class="loc-nav-btn secondary" aria-label="View on Google Maps">👁 View</a>
            </div>
        </div>`;
    }

    function render() {
        const q = searchQuery.trim().toLowerCase();
        const filtered = locationHubData.filter(loc => {
            const catMatch = currentCat === "all" || loc.cat === currentCat;
            const searchMatch = !q ||
                loc.name.toLowerCase().includes(q) ||
                loc.nameHi.includes(q) ||
                loc.address.toLowerCase().includes(q) ||
                loc.cat.toLowerCase().includes(q) ||
                (catMeta[loc.cat]?.label || "").toLowerCase().includes(q);
            return catMatch && searchMatch;
        });

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="loc-hub-no-results">🔍 कोई परिणाम नहीं मिला। कृपया अलग कैटेगरी या शब्द खोजें।</div>`;
        } else {
            grid.innerHTML = filtered.map(buildCard).join("");
        }
    }

    // Tab filter
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentCat = tab.dataset.cat;
            render();
        });
    });

    // Live search
    if (search) {
        search.addEventListener("input", () => {
            searchQuery = search.value;
            render();
        });
    }

    // Initial render
    render();
}

/* ==========================================
   INTERACTIVE DIGITAL PORTAL EXTENSIONS
   ========================================== */

// 1. PWA Service Worker Registration
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("sw.js")
            .then(reg => console.log("PWA ServiceWorker registered with scope:", reg.scope))
            .catch(err => console.log("PWA ServiceWorker registration failed:", err));
    });
}

// 2. High Contrast Accessibility Toggle
function toggleContrast() {
    const isContrast = document.body.classList.toggle("high-contrast");
    localStorage.setItem("psunion_high_contrast", isContrast ? "1" : "0");
}
// Run contrast mode restore on page load
document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("psunion_high_contrast") === "1") {
        document.body.classList.add("high-contrast");
    }
});

// 3. Voice Search (removed — global search widget deleted)

// 4. Geolocation "मैं पहुँच गया" check-in
const ECO_GARDEN_COORDS = { lat: 26.810966, lng: 80.919377 };

function getDistanceInKm(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

function handleReachedCheckin() {
    const reachBtn = document.getElementById("btn-reached-checkin");
    const reachCounter = document.getElementById("reachers-counter");
    if (localStorage.getItem("psunion_reached_checkin") === "1") {
        alert("आप पहले ही चेक-इन कर चुके हैं।");
        if (reachBtn) {
            reachBtn.textContent = "✅ आपकी उपस्थिति दर्ज है";
            reachBtn.disabled = true;
        }
        return;
    }

    if (!navigator.geolocation) {
        alert("आपके डिवाइस में जियोलोकेशन समर्थित नहीं है।");
        return;
    }

    reachBtn.textContent = "⏳ स्थान जाँचा जा रहा है...";
    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const distance = getDistanceInKm(
                pos.coords.latitude,
                pos.coords.longitude,
                ECO_GARDEN_COORDS.lat,
                ECO_GARDEN_COORDS.lng
            );

            // Allow checking in if within 5 km of Eco Garden
            if (distance <= 5.0) {
                localStorage.setItem("psunion_reached_checkin", "1");
                reachBtn.textContent = "✅ चेक-इन सफल (Verified)";
                reachBtn.disabled = true;
                
                let curReached = parseInt(localStorage.getItem("psunion_reached_count")) || 7842;
                curReached += 1;
                localStorage.setItem("psunion_reached_count", curReached);
                if (reachCounter) {
                    reachCounter.textContent = curReached.toLocaleString("en-IN");
                }
                alert("सत्यापन सफल! आप इको गार्डन, लखनऊ में मौजूद हैं। आपकी उपस्थिति दर्ज कर ली गई है।");
            } else {
                reachBtn.textContent = "🚩 मैं पहुँच गया (I Have Reached)";
                alert(`सत्यापन विफल! आप धरना स्थल (इको गार्डन, लखनऊ) से लगभग ${distance.toFixed(1)} किमी दूर हैं। चेक-इन करने के लिए धरना स्थल के पास होना आवश्यक है।`);
            }
        },
        (err) => {
            reachBtn.textContent = "🚩 मैं पहुँच गया (I Have Reached)";
            const fallback = confirm("जीपीएस सिग्नल प्राप्त नहीं हो सका। क्या आप मैन्युअल सत्यापन के माध्यम से उपस्थिति दर्ज कराना चाहते हैं?");
            if (fallback) {
                localStorage.setItem("psunion_reached_checkin", "1");
                reachBtn.textContent = "✅ चेक-इन सफल (Manual)";
                reachBtn.disabled = true;
                let curReached = parseInt(localStorage.getItem("psunion_reached_count")) || 7842;
                curReached += 1;
                localStorage.setItem("psunion_reached_count", curReached);
                if (reachCounter) {
                    reachCounter.textContent = curReached.toLocaleString("en-IN");
                }
            }
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

// Restore reached check-in button state
document.addEventListener("DOMContentLoaded", () => {
    const reachBtn = document.getElementById("btn-reached-checkin");
    const reachCounter = document.getElementById("reachers-counter");
    if (localStorage.getItem("psunion_reached_checkin") === "1") {
        if (reachBtn) {
            reachBtn.textContent = "✅ चेक-इन सफल (Verified)";
            reachBtn.disabled = true;
        }
    }
    const curReached = parseInt(localStorage.getItem("psunion_reached_count")) || 7842;
    if (reachCounter) {
        reachCounter.textContent = curReached.toLocaleString("en-IN");
    }
});

// 5. Admin Control Panel logic
function triggerAdminPanel() {
    const code = prompt("एडमिन पिन दर्ज करें (Enter Admin Pin):");
    if (code === "1234") {
        const modal = document.getElementById("adminControlModal");
        if (modal) {
            modal.style.display = "flex";
            const statusDot = document.getElementById("stage-status-dot");
            const adminStatusSelect = document.getElementById("admin-stage-status");
            const adminAnnouncementTxt = document.getElementById("admin-announcement");
            const ticker = document.getElementById("announcement-ticker");

            if (adminStatusSelect && statusDot) {
                if (statusDot.classList.contains("active-green")) adminStatusSelect.value = "speech-active";
                else if (statusDot.classList.contains("active-red")) adminStatusSelect.value = "memo-active";
                else adminStatusSelect.value = "ended";
            }
            if (adminAnnouncementTxt && ticker) {
                adminAnnouncementTxt.value = ticker.textContent.trim();
            }
        }
    } else if (code !== null) {
        alert("गलत पिन!");
    }
}

function closeAdminPanel() {
    const modal = document.getElementById("adminControlModal");
    if (modal) modal.style.display = "none";
}

function saveAdminUpdates(event) {
    event.preventDefault();
    const statusSelect = document.getElementById("admin-stage-status").value;
    const annText = document.getElementById("admin-announcement").value.trim();

    const statusDot = document.getElementById("stage-status-dot");
    const statusLabel = document.getElementById("stage-status-text");
    const ticker = document.getElementById("announcement-ticker");

    if (statusDot && statusLabel) {
        statusDot.className = "status-pulse-dot"; // reset
        if (statusSelect === "speech-active") {
            statusDot.classList.add("active-green");
            statusLabel.textContent = "भाषण प्रारंभ (Speeches Active)";
            localStorage.setItem("admin_stage_class", "active-green");
            localStorage.setItem("admin_stage_text", "भाषण प्रारंभ (Speeches Active)");
        } else if (statusSelect === "memo-active") {
            statusDot.classList.add("active-red");
            statusLabel.textContent = "ज्ञापन सौंपा जा रहा है (Memorandum Active)";
            localStorage.setItem("admin_stage_class", "active-red");
            localStorage.setItem("admin_stage_text", "ज्ञापन सौंपा जा रहा है (Memorandum Active)");
        } else {
            statusDot.classList.add("active-gray");
            statusLabel.textContent = "कार्यक्रम समाप्त (Protest Ended)";
            localStorage.setItem("admin_stage_class", "active-gray");
            localStorage.setItem("admin_stage_text", "कार्यक्रम समाप्त (Protest Ended)");
        }
    }

    if (ticker && annText) {
        ticker.textContent = annText;
        localStorage.setItem("admin_announcement_text", annText);
    }

    closeAdminPanel();
    alert("ग्राउंड लाइव स्थिति सफलतापूर्वक अपडेट कर दी गई है।");
}

// Restore Admin states
document.addEventListener("DOMContentLoaded", () => {
    const statusDot = document.getElementById("stage-status-dot");
    const statusLabel = document.getElementById("stage-status-text");
    const ticker = document.getElementById("announcement-ticker");

    const savedClass = localStorage.getItem("admin_stage_class");
    const savedText = localStorage.getItem("admin_stage_text");
    const savedAnn = localStorage.getItem("admin_announcement_text");

    if (statusDot && savedClass) {
        statusDot.className = `status-pulse-dot ${savedClass}`;
    }
    if (statusLabel && savedText) {
        statusLabel.textContent = savedText;
    }
    if (ticker && savedAnn) {
        ticker.textContent = savedAnn;
    }
});

// 6. Distance & ETA Calculator
function calculateLiveDistance() {
    const distText = document.getElementById("gps-distance-text");
    const etaText = document.getElementById("gps-eta-text");
    if (!distText || !etaText) return;

    if (!navigator.geolocation) {
        distText.textContent = "GPS Not Supported";
        return;
    }

    distText.textContent = "⏳ गणना की जा रही है...";
    etaText.textContent = "⏳...";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            const distance = getDistanceInKm(
                pos.coords.latitude,
                pos.coords.longitude,
                ECO_GARDEN_COORDS.lat,
                ECO_GARDEN_COORDS.lng
            );

            distText.textContent = `${distance.toFixed(1)} किमी`;

            const speed = 50; // km/h driving average
            const timeInHours = distance / speed;
            const timeInMins = Math.round(timeInHours * 60);

            if (timeInMins < 60) {
                etaText.textContent = `~${timeInMins} मिनट`;
            } else {
                const hours = Math.floor(timeInMins / 60);
                const mins = timeInMins % 60;
                etaText.textContent = `~${hours} घंटा ${mins} मिनट`;
            }
        },
        (err) => {
            distText.textContent = "GPS Blocked";
            etaText.textContent = "—";
        }
    );
}

// 7. Live Weather (removed — weather section deleted)

// 8. Expanding FAB Menu handler
function toggleHelpFab() {
    const fab = document.getElementById("helpFabContainer");
    if (fab) {
        fab.classList.toggle("open");
    }
}
function openEmergencyModal() {
    const modal = document.getElementById("emergencyModal");
    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        const fab = document.getElementById("helpFabContainer");
        if (fab) fab.classList.remove("open");
    }
}

// 9. Fullscreen Poster lightbox triggers
function openFullscreenPoster() {
    const modal = document.getElementById("fullscreenPosterModal");
    if (modal) {
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    }
}
function closeFullscreenPoster() {
    const modal = document.getElementById("fullscreenPosterModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "";
    }
}
document.addEventListener("DOMContentLoaded", () => {
    const poster = document.querySelector(".poster-image-box img");
    if (poster) {
        poster.style.cursor = "zoom-in";
        poster.addEventListener("click", openFullscreenPoster);
    }
});

// 10. Lost & Found (removed — section deleted)

/* ==========================================
   COLLAPSIBLE PANELS (Updates, Team, Gallery)
   ========================================== */
function initCollapsiblePanels() {
    // Updates: show only first card, hide rest behind toggle
    const updatesPanel = document.querySelector(".updates-list");
    if (updatesPanel) {
        const allUpdates = updatesPanel.querySelectorAll(".update-card-item");
        if (allUpdates.length > 1) {
            const hiddenWrap = document.createElement("div");
            hiddenWrap.id = "older-updates-wrap";
            hiddenWrap.style.display = "none";
            for (let i = 1; i < allUpdates.length; i++) {
                hiddenWrap.appendChild(allUpdates[i]);
            }
            updatesPanel.appendChild(hiddenWrap);

            const toggleBtn = document.createElement("button");
            toggleBtn.id = "toggle-updates-btn";
            toggleBtn.className = "nav-btn-outline";
            toggleBtn.style.cssText = "margin-top:1rem;background:var(--paper-2);border-color:var(--ink);color:var(--ink);box-shadow:3px 3px 0 var(--ink);font-size:0.9rem;padding:8px 20px;cursor:pointer;display:flex;align-items:center;gap:6px;";
            toggleBtn.innerHTML = "📋 सभी अपडेट देखें (View All Updates)";
            toggleBtn.addEventListener("click", () => {
                const isHidden = hiddenWrap.style.display === "none";
                hiddenWrap.style.display = isHidden ? "block" : "none";
                toggleBtn.innerHTML = isHidden
                    ? "🔼 कम करें (Show Less)"
                    : "📋 सभी अपडेट देखें (View All Updates)";
            });
            updatesPanel.appendChild(toggleBtn);
        }
    }

    // Team: show first 2 members, hide rest
    const teamGrid = document.querySelector("#team-section .grid-2");
    if (teamGrid) {
        const allMembers = teamGrid.querySelectorAll(".card");
        if (allMembers.length > 2) {
            const hiddenWrap = document.createElement("div");
            hiddenWrap.id = "extra-team-wrap";
            hiddenWrap.style.cssText = "display:none;grid-column:1/-1;display:none;";
            for (let i = 2; i < allMembers.length; i++) {
                hiddenWrap.appendChild(allMembers[i]);
            }
            teamGrid.appendChild(hiddenWrap);

            const toggleBtn = document.createElement("button");
            toggleBtn.id = "toggle-team-btn";
            toggleBtn.className = "nav-btn-outline";
            toggleBtn.style.cssText = "grid-column:1/-1;margin-top:0.5rem;background:var(--paper-2);border-color:var(--ink);color:var(--ink);box-shadow:3px 3px 0 var(--ink);font-size:0.9rem;padding:8px 20px;cursor:pointer;display:flex;align-items:center;gap:6px;";
            toggleBtn.innerHTML = "👥 पूरी टीम देखें (View Full Team)";
            toggleBtn.addEventListener("click", () => {
                const isHidden = hiddenWrap.style.display === "none";
                hiddenWrap.style.display = isHidden ? "contents" : "none";
                toggleBtn.innerHTML = isHidden
                    ? "🔼 कम करें (Show Less)"
                    : "👥 पूरी टीम देखें (View Full Team)";
            });
            teamGrid.appendChild(toggleBtn);
        }
    }

    // Gallery: show first 3 items, hide rest
    const galleryContainer = document.querySelector(".masonry-gallery-container");
    if (galleryContainer) {
        const allItems = galleryContainer.querySelectorAll(".masonry-item");
        if (allItems.length > 3) {
            const hiddenWrap = document.createElement("div");
            hiddenWrap.id = "extra-gallery-wrap";
            hiddenWrap.style.cssText = "display:none;contents:none;";
            hiddenWrap.className = "masonry-gallery-hidden";
            for (let i = 3; i < allItems.length; i++) {
                hiddenWrap.appendChild(allItems[i]);
            }
            galleryContainer.after(hiddenWrap);

            const toggleBtn = document.createElement("button");
            toggleBtn.id = "toggle-gallery-btn";
            toggleBtn.className = "nav-btn-outline";
            toggleBtn.style.cssText = "margin-top:1.2rem;background:var(--ink);color:var(--paper);border-color:var(--ink);box-shadow:4px 4px 0 var(--saffron);font-size:1rem;font-weight:700;padding:10px 28px;cursor:pointer;display:flex;align-items:center;gap:8px;";
            toggleBtn.innerHTML = "🖼️ विस्तृत गैलरी देखें (View Full Gallery)";
            galleryContainer.after(toggleBtn);
            hiddenWrap.before(toggleBtn);

            toggleBtn.addEventListener("click", () => {
                const isHidden = hiddenWrap.style.display === "none" || hiddenWrap.style.display === "";
                hiddenWrap.style.cssText = isHidden
                    ? "display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:1.2rem;margin-top:1rem;"
                    : "display:none;";
                toggleBtn.innerHTML = isHidden
                    ? "🔼 कम करें (Show Less)"
                    : "🖼️ विस्तृत गैलरी देखें (View Full Gallery)";
            });
        }
    }
}

// 11. Notification Permission and Banner controls
function requestPushNotifications() {
    if (!("Notification" in window)) {
        alert("यह ब्राउज़र पुश नोटिफिकेशन का समर्थन नहीं करता है।");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("यूनियन प्रदेश कार्यालय", {
                body: "सत्यापन सफल! आंदोलन लाइव अलर्ट सक्रिय कर दिए गए हैं।",
                icon: "logo.webp"
            });
            dismissNotificationBanner();
            localStorage.setItem("psunion_push_granted", "1");
        } else {
            alert("सूचना अनुमति अस्वीकृत।");
        }
    });
}
function dismissNotificationBanner() {
    const banner = document.getElementById("notification-permission-banner");
    if (banner) banner.style.display = "none";
    localStorage.setItem("psunion_push_banner_dismissed", "1");
}
document.addEventListener("DOMContentLoaded", () => {
    const banner = document.getElementById("notification-permission-banner");
    if (banner) {
        const isDismissed = localStorage.getItem("psunion_push_banner_dismissed") === "1";
        const isGranted = localStorage.getItem("psunion_push_granted") === "1";
        if (!isDismissed && !isGranted) {
            setTimeout(() => {
                banner.style.display = "block";
            }, 3000);
        }
    }
});

/* ==========================================
   20. SCROLLSPY HIGHLIGHTING
   ========================================== */
function initScrollspyHighlight() {
    const dots = document.querySelectorAll(".scrollspy-dot");
    if (dots.length === 0) return;

    const sections = [];
    dots.forEach(dot => {
        const id = dot.getAttribute("href");
        if (id && id.startsWith("#")) {
            const section = document.querySelector(id);
            if (section) {
                sections.push(section);
            }
        }
    });

    if (sections.length === 0) return;

    // Use IntersectionObserver to detect which section is current
    const observerOptions = {
        root: null,
        rootMargin: "-20% 0px -60% 0px", // Detect when section occupies the active zone
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                updateActiveDot(id);
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));

    function updateActiveDot(id) {
        dots.forEach(dot => {
            if (dot.getAttribute("href") === `#${id}`) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }
}

/* ==========================================
   26. BACKGROUND MUSIC PLAYER & MUTE TOGGLE
   ========================================== */
function initBackgroundMusic() {
    const audio = document.getElementById("bg-audio");
    const toggleBtn = document.getElementById("audioToggleBtn");
    if (!audio || !toggleBtn) return;

    let isPlaying = false;

    // Direct playback handler on interaction
    const playMusic = () => {
        if (isPlaying) return;
        audio.play().then(() => {
            isPlaying = true;
            toggleBtn.textContent = "🔊";
            toggleBtn.style.background = "rgba(16, 185, 129, 0.25)"; // Glow green when active
            cleanupListeners();
        }).catch(err => {
            console.log("Autoplay blocked by browser policy, waiting for direct user tap.", err);
        });
    };

    // Toggle play/pause manually via button click
    const togglePlay = (e) => {
        e.stopPropagation();
        if (audio.paused) {
            audio.play().then(() => {
                isPlaying = true;
                toggleBtn.textContent = "🔊";
                toggleBtn.style.background = "rgba(16, 185, 129, 0.25)";
            });
        } else {
            audio.pause();
            toggleBtn.textContent = "🔇";
            toggleBtn.style.background = "rgba(239, 68, 68, 0.25)"; // Glow red when muted
        }
    };

    toggleBtn.addEventListener("click", togglePlay);

    // Modern browser autoplay compliant interaction listeners
    const events = ["click", "touchstart", "scroll", "keydown"];
    const cleanupListeners = () => {
        events.forEach(evt => document.removeEventListener(evt, playMusic));
    };

    events.forEach(evt => document.addEventListener(evt, playMusic, { passive: true }));
}
