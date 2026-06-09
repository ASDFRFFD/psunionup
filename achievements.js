/* ==========================================================================
   ACHIEVEMENTS CINEMATIC JS
   Designed for: Panchayat Assistant Achievements Portal
   Features: Canvas Particles, GSAP ScrollTrigger, Image Slider, Interactive Network
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize GSAP & ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // ==========================================================================
    // HERO CANVAS PARTICLES ENGINE
    // ==========================================================================
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        window.addEventListener('resize', () => {
            if (canvas) {
                width = canvas.width = canvas.offsetWidth;
                height = canvas.height = canvas.offsetHeight;
            }
        });

        // Mouse interaction coordinates
        let mouse = { x: null, y: null, radius: 120 };
        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.size = Math.random() * 2 + 1;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.4 - 0.2;
                this.color = Math.random() > 0.5 ? '#E0651E' : '#1F5A2E'; // Saffron or Green
                this.opacity = Math.random() * 0.5 + 0.25;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                // Bounce off edges
                if (this.x < 0 || this.x > width) this.speedX *= -1;
                if (this.y < 0 || this.y > height) this.speedY *= -1;

                // Mouse repel effect
                if (mouse.x !== null && mouse.y !== null) {
                    const dx = this.x - mouse.x;
                    const dy = this.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < mouse.radius) {
                        const force = (mouse.radius - dist) / mouse.radius;
                        const angle = Math.atan2(dy, dx);
                        this.x += Math.cos(angle) * force * 1.5;
                        this.y += Math.sin(angle) * force * 1.5;
                    }
                }
            }

            draw() {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.shadowBlur = 6;
                ctx.shadowColor = this.color;
                ctx.fill();
                ctx.restore();
            }
        }

        // Initialize particles based on screen size
        const count = Math.min(Math.floor(width / 12), 120);
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            
            // Draw background subtle grid lines
            ctx.strokeStyle = 'rgba(26, 17, 8, 0.03)';
            ctx.lineWidth = 1;
            const gridSpacing = 40;
            for (let x = 0; x < width; x += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += gridSpacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Update & draw particles
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Connect close particles with lines
            ctx.save();
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 75) {
                        const alpha = (1 - (dist / 75)) * 0.15;
                        ctx.strokeStyle = `rgba(26, 17, 8, ${alpha})`;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
            ctx.restore();

            requestAnimationFrame(animate);
        }
        animate();
    }

    // ==========================================================================
    // GSAP STORYTELLING ANIMATIONS
    // ==========================================================================

    const playHeroEntrance = () => {
        gsap.from('.hero-badge', 
            { opacity: 0, y: -20, duration: 1, ease: 'power3.out' }
        );
        gsap.from('.hero-title-glowing span', 
            { opacity: 0, y: 35, duration: 1.2, stagger: 0.15, ease: 'power4.out', delay: 0.2 }
        );
        gsap.from('.hero-subtitle-cinematic', 
            { opacity: 0, y: 20, duration: 1, ease: 'power3.out', delay: 0.6 }
        );
        gsap.from('.scroll-indicator-wrap', 
            { opacity: 0, y: 10, duration: 0.8, ease: 'power2.out', delay: 1.0 }
        );
        gsap.from('.history-cta-btn',
            { opacity: 0, scale: 0.92, duration: 0.7, ease: 'back.out(1.5)', delay: 1.2 }
        );

        // Show history popup after 1.8s (disabled to prevent intrusive floating clocks/overlays)
        // if (!sessionStorage.getItem('histPopupSeen')) {
        //     setTimeout(showHistoryPopup, 1800);
        // }
    };

    // ── History Popup Logic ────────────────────────────────────────────────
    function showHistoryPopup() {
        const overlay = document.getElementById('histPopupOverlay');
        const box     = document.getElementById('histPopupBox');
        if (!overlay) return;

        overlay.style.display = 'flex';
        sessionStorage.setItem('histPopupSeen', '1');

        function closePopup() {
            box.classList.add('closing');
            setTimeout(() => {
                overlay.style.display = 'none';
                box.classList.remove('closing');
            }, 300);
        }

        document.getElementById('histPopClose')?.addEventListener('click', closePopup);
        document.getElementById('histPopSkip')?.addEventListener('click',  closePopup);

        // Close on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closePopup();
        });

        // Close on Escape key
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closePopup();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    // Fade-in sections with class `.scroll-reveal`
    document.querySelectorAll('.scroll-reveal').forEach((section) => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: 'top 100%', // Trigger immediately as top enters viewport
                toggleActions: 'play none none none',
            },
            y: 30, // Smooth slide-up transition without opacity locks
            duration: 0.8,
            ease: 'power2.out'
        });
    });

    // 25 Years Section Image Transitions (Parallax Fade)
    const storyWipeSection = document.querySelector('.story-visual-pane');
    if (storyWipeSection) {
        const slides = document.querySelectorAll('.visual-slide');
        let activeIndex = 0;
        
        setInterval(() => {
            slides[activeIndex].style.opacity = 0;
            activeIndex = (activeIndex + 1) % slides.length;
            slides[activeIndex].style.opacity = 1;
        }, 5000);
    }

    // Staggered slide-in animation for compact line-by-line service list
    gsap.from('.service-list-item', {
        scrollTrigger: {
            trigger: '.compact-services-list',
            start: 'top 100%' // Robust trigger
        },
        x: -25, // Staggered slide-in transition from the left
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out'
    });

    // Staggered fade and scale animation for 3D Tribute Cards (Above Chapter 1)
    gsap.from('.animate-tribute', {
        scrollTrigger: {
            trigger: '.tribute-cards-grid',
            start: 'top 100%', 
            toggleActions: 'play none none none'
        },
        y: 25, // Smooth floating entry from below
        scale: 0.97,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out'
    });

    // Ayushman Card Counter animation (Stable running on scroll & hover)
    const counterEl = document.getElementById('ayushmanCounterNum');
    if (counterEl) {
        let counterValue = { val: 0 };
        const targetVal = 50000000;
        let isCounterRunning = false;
        
        const runCounter = () => {
            if (isCounterRunning) return;
            isCounterRunning = true;
            gsap.fromTo(counterValue, 
                { val: 0 },
                {
                    val: targetVal,
                    duration: 2.2,
                    ease: 'power2.out',
                    onUpdate: function() {
                        counterEl.innerHTML = Math.floor(counterValue.val).toLocaleString('en-IN') + "+";
                    },
                    onComplete: function() {
                        isCounterRunning = false;
                    }
                }
            );
        };

        // ScrollTrigger animation
        ScrollTrigger.create({
            trigger: '.ayushman-counter-box',
            start: 'top 100%', // Safest threshold to fire immediately on entry
            onEnter: runCounter,
            once: true
        });

        // Hover mouseenter re-trigger (Cursor interactivity)
        const counterBox = document.querySelector('.ayushman-counter-box');
        if (counterBox) {
            counterBox.addEventListener('mouseenter', () => {
                runCounter();
            });
        }
    }

    // ==========================================================================
    // SWACHH BHARAT BEFORE/AFTER SLIDER
    // ==========================================================================
    const sliderWrap = document.querySelector('.slider-wrapper');
    const afterImg = document.querySelector('.slider-img.after-img');
    const dragHandle = document.querySelector('.slider-drag-handle');
    const dragBtn = document.querySelector('.slider-button');

    if (sliderWrap && afterImg && dragHandle) {
        let isDragging = false;

        const updateSlider = (clientX) => {
            const rect = sliderWrap.getBoundingClientRect();
            const posX = clientX - rect.left;
            let percentage = (posX / rect.width) * 100;

            // Restrict bounds
            if (percentage < 0) percentage = 0;
            if (percentage > 100) percentage = 100;

            afterImg.style.width = `${percentage}%`;
            dragHandle.style.left = `${percentage}%`;
        };

        const startDragging = () => { isDragging = true; };
        const stopDragging = () => { isDragging = false; };

        // Desktop Events
        dragHandle.addEventListener('mousedown', startDragging);
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            updateSlider(e.clientX);
        });

        // Touch/Mobile Events
        dragHandle.addEventListener('touchstart', startDragging);
        window.addEventListener('touchend', stopDragging);
        window.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            updateSlider(e.touches[0].clientX);
        });

        // Click on slider wraps to focus
        sliderWrap.addEventListener('click', (e) => {
            if (e.target === dragHandle || e.target === dragBtn) return;
            updateSlider(e.clientX);
        });
    }

    // ==========================================================================
    // PANCHAYAT DEVELOPMENT INDEX (PDI) DASHBOARD LOGIC
    // ==========================================================================
    const mockPdiData = {
        sitapur: { score: 94.6, ranking: "1st", rankCol: "var(--green)", activeAssistants: "1,524", digitalFiles: "86,210", coverage: "98.2%" },
        gorakhpur: { score: 92.8, ranking: "2nd", rankCol: "var(--saffron-deep)", activeAssistants: "1,240", digitalFiles: "74,180", coverage: "96.5%" },
        varanasi: { score: 91.5, ranking: "3rd", rankCol: "var(--blood)", activeAssistants: "1,180", digitalFiles: "68,450", coverage: "95.1%" },
        lucknow: { score: 89.7, ranking: "4th", rankCol: "var(--saffron)", activeAssistants: "984", digitalFiles: "59,320", coverage: "92.8%" },
        basti: { score: 87.2, ranking: "6th", rankCol: "var(--ink-2)", activeAssistants: "840", digitalFiles: "48,960", coverage: "89.4%" }
    };

    const dashboardSelect = document.getElementById('pdiDistrictSelect');
    if (dashboardSelect) {
        dashboardSelect.addEventListener('change', (e) => {
            const district = e.target.value;
            const data = mockPdiData[district];
            if (data) {
                // Animate value changes cleanly
                gsap.to('#pdiScoreVal', {
                    innerHTML: data.score,
                    duration: 1,
                    snap: { innerHTML: 0.1 },
                    onUpdate: function() {
                        document.getElementById('pdiScoreVal').innerHTML = parseFloat(document.getElementById('pdiScoreVal').innerHTML).toFixed(1) + "%";
                    }
                });

                document.getElementById('pdiRankVal').textContent = data.ranking;
                document.getElementById('pdiRankVal').style.color = data.rankCol;
                document.getElementById('pdiActiveAssistants').textContent = data.activeAssistants;
                document.getElementById('pdiDigitalRecords').textContent = data.digitalFiles;
                document.getElementById('pdiCoveragePercent').textContent = data.coverage;

                // Trigger small scale pop animation on score card
                gsap.fromTo('#pdiMetricCard', { scale: 0.95 }, { scale: 1, duration: 0.4, ease: 'back.out(1.5)' });
            }
        });
    }

    // ==========================================================================
    // DEPARTMENT NODE NETWORK HOVER EFFECTS
    // ==========================================================================
    const nodes = document.querySelectorAll('.network-node');
    const infoPanel = document.getElementById('networkInfoPanel');

    const departmentDescriptions = {
        "Ã Â¤ÂªÃ Â¤â€šÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤Ã Â¥â‚¬ Ã Â¤Â°Ã Â¤Â¾Ã Â¤Å“": "Ã Â¤â€”Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â® Ã Â¤Â¸Ã Â¤Å¡Ã Â¤Â¿Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â²Ã Â¤Â¯Ã Â¥â€¹Ã Â¤â€š Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â°Ã Â¥â€š Ã Â¤Â¸Ã Â¤â€šÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â²Ã Â¤Â¨, Ã Â¤ÂªÃ Â¤Â°Ã Â¤Â¿Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â° Ã Â¤Â°Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â° Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â·Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿, Ã Â¤Å“Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â®-Ã Â¤Â®Ã Â¥Æ’Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â¯Ã Â¥Â Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂªÃ Â¤Â¤Ã Â¥ÂÃ Â¤Â° Ã Â¤Â¸Ã Â¤â€šÃ Â¤â€¢Ã Â¤Â²Ã Â¤Â¨ Ã Â¤â€Ã Â¤Â° Ã Â¤Â¡Ã Â¤Â¿Ã Â¤Å“Ã Â¤Â¿Ã Â¤Å¸Ã Â¤Â² Ã Â¤â€”Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â® Ã Â¤ÂªÃ Â¤â€šÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤Ã Â¥â€¹Ã Â¤â€š Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¦Ã Â¥Æ’Ã Â¤Â¢Ã Â¤Â¼Ã Â¥â‚¬Ã Â¤â€¢Ã Â¤Â°Ã Â¤Â£Ã Â¥Â¤",
        "Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¥Ã Â¥ÂÃ Â¤Â¯ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â­Ã Â¤Â¾Ã Â¤â€”": "Ã Â¤â€ Ã Â¤Â¯Ã Â¥ÂÃ Â¤Â·Ã Â¥ÂÃ Â¤Â®Ã Â¤Â¾Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¡ Ã Â¤Â¨Ã Â¤Â¿Ã Â¤Â°Ã Â¥ÂÃ Â¤Â®Ã Â¤Â¾Ã Â¤Â£ (5+ Ã Â¤â€¢Ã Â¤Â°Ã Â¥â€¹Ã Â¤Â¡Ã Â¤Â¼), Ã Â¤Â¸Ã Â¤â€šÃ Â¤Å¡Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â°Ã Â¥â€¹Ã Â¤â€” Ã Â¤Â¨Ã Â¤Â¿Ã Â¤Â¯Ã Â¤â€šÃ Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¤Â£ Ã Â¤â€¦Ã Â¤Â­Ã Â¤Â¿Ã Â¤Â¯Ã Â¤Â¾Ã Â¤Â¨ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â·Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿, Ã Â¤â€Ã Â¤Â° Ã Â¤â€”Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â®Ã Â¥â‚¬Ã Â¤Â£ Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â¥Ã Â¥ÂÃ Â¤Â¯ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â°Ã Â¥â€¹Ã Â¤â€š Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¤Ã Â¤â€¢Ã Â¤Â¨Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¨Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¯Ã Â¥Â¤",
        "Ã Â¤â€¢Ã Â¥Æ’Ã Â¤Â·Ã Â¤Â¿ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â­Ã Â¤Â¾Ã Â¤â€”": "Ã Â¤Â«Ã Â¤Â¸Ã Â¤Â² Ã Â¤Â¸Ã Â¤Â°Ã Â¥ÂÃ Â¤ÂµÃ Â¥â€¡Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â£ (Crop Survey), Ã Â¤Â¡Ã Â¤Â¿Ã Â¤Å“Ã Â¤Â¿Ã Â¤Å¸Ã Â¤Â² Ã Â¤Â«Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â®Ã Â¤Â° Ã Â¤Â°Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¥ÂÃ Â¤Â°Ã Â¥â‚¬ (Farmer Registry), Ã Â¤Â¸Ã Â¤Â®Ã Â¥ÂÃ Â¤Â®Ã Â¤Â¾Ã Â¤Â¨ Ã Â¤Â¨Ã Â¤Â¿Ã Â¤Â§Ã Â¤Â¿ Ã Â¤Â¸Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤ÂªÃ Â¤Â¨, Ã Â¤â€Ã Â¤Â° Ã Â¤Â¤Ã Â¤â€¢Ã Â¤Â¨Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â«Ã Â¥â‚¬Ã Â¤Â¡Ã Â¤Â¿Ã Â¤â€šÃ Â¤â€”Ã Â¥Â¤",
        "Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â­Ã Â¤Â¾Ã Â¤â€”": "Ã Â¤Â¬Ã Â¥â€¡Ã Â¤Â¸Ã Â¤Â¿Ã Â¤â€¢ Ã Â¤Â¶Ã Â¤Â¿Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â¾ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â­Ã Â¤Â¾Ã Â¤â€” Ã Â¤â€¢Ã Â¥â€¡ Ã Â¤â€¦Ã Â¤â€šÃ Â¤Â¤Ã Â¤Â°Ã Â¥ÂÃ Â¤â€”Ã Â¤Â¤ Ã Â¤Â¸Ã Â¥ÂÃ Â¤â€¢Ã Â¥â€šÃ Â¤Â² Ã Â¤Â¡Ã Â¥ÂÃ Â¤Â°Ã Â¥â€°Ã Â¤ÂªÃ Â¤â€ Ã Â¤â€°Ã Â¤Å¸Ã Â¥ÂÃ Â¤Â¸ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â·Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿, Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¾Ã Â¤â€¢Ã Â¤Â²Ã Â¥ÂÃ Â¤Âª Ã Â¤Â°Ã Â¤Â¿Ã Â¤ÂªÃ Â¥â€¹Ã Â¤Â°Ã Â¥ÂÃ Â¤Å¸ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â«Ã Â¥â‚¬Ã Â¤Â¡Ã Â¤Â¿Ã Â¤â€šÃ Â¤â€”, Ã Â¤â€Ã Â¤Â° Ã Â¤â€ºÃ Â¤Â¾Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°-Ã Â¤â€ºÃ Â¤Â¾Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤â€œÃ Â¤â€š Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¿Ã Â¤â€¢Ã Â¥â€°Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¡ Ã Â¤Â¸Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤ÂªÃ Â¤Â¨Ã Â¥Â¤",
        "Ã Â¤Â°Ã Â¤Â¾Ã Â¤Å“Ã Â¤Â¸Ã Â¥ÂÃ Â¤Âµ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â­Ã Â¤Â¾Ã Â¤â€”": "Ã Â¤Â¸Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¾Ã Â¤Â®Ã Â¤Â¿Ã Â¤Â¤Ã Â¥ÂÃ Â¤Âµ Ã Â¤Â¯Ã Â¥â€¹Ã Â¤Å“Ã Â¤Â¨Ã Â¤Â¾ (Gharouni) Ã Â¤Â¹Ã Â¥â€¡Ã Â¤Â¤Ã Â¥Â Ã Â¤Â¡Ã Â¥ÂÃ Â¤Â°Ã Â¥â€¹Ã Â¤Â¨ Ã Â¤Â¸Ã Â¤Â°Ã Â¥ÂÃ Â¤ÂµÃ Â¥â€¡Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â£ Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¨Ã Â¥ÂÃ Â¤ÂµÃ Â¤Â¯, Ã Â¤â€“Ã Â¤Â¸Ã Â¤Â°Ã Â¤Â¾-Ã Â¤â€“Ã Â¤Â¤Ã Â¥Å’Ã Â¤Â¨Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤ÂªÃ Â¤Â¨ Ã Â¤Â¸Ã Â¤Â¹Ã Â¤Â¾Ã Â¤Â¯Ã Â¤Â¤Ã Â¤Â¾, Ã Â¤â€Ã Â¤Â° Ã Â¤â€ Ã Â¤ÂªÃ Â¤Â¦Ã Â¤Â¾ Ã Â¤Â°Ã Â¤Â¾Ã Â¤Â¹Ã Â¤Â¤ Ã Â¤Â¸Ã Â¤Â°Ã Â¥ÂÃ Â¤ÂµÃ Â¥â€¡ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤ÂÃ Â¤â€šÃ Â¤Å¸Ã Â¥ÂÃ Â¤Â°Ã Â¥â‚¬Ã Â¥Â¤",
        "Ã Â¤Â¸Ã Â¤Â®Ã Â¤Â¾Ã Â¤Å“ Ã Â¤â€¢Ã Â¤Â²Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤Â£": "Ã Â¤ÂµÃ Â¥Æ’Ã Â¤Â¦Ã Â¥ÂÃ Â¤Â§Ã Â¤Â¾Ã Â¤ÂµÃ Â¤Â¸Ã Â¥ÂÃ Â¤Â¥Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥â€¡Ã Â¤â€šÃ Â¤Â¶Ã Â¤Â¨, Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â§Ã Â¤ÂµÃ Â¤Â¾ Ã Â¤ÂªÃ Â¥â€¡Ã Â¤â€šÃ Â¤Â¶Ã Â¤Â¨, Ã Â¤Â¦Ã Â¤Â¿Ã Â¤ÂµÃ Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤â€šÃ Â¤â€” Ã Â¤ÂªÃ Â¥â€¡Ã Â¤â€šÃ Â¤Â¶Ã Â¤Â¨ Ã Â¤Â¹Ã Â¥â€¡Ã Â¤Â¤Ã Â¥Â Ã Â¤â€˜Ã Â¤Â¨Ã Â¤Â²Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â¨ Ã Â¤â€ Ã Â¤ÂµÃ Â¥â€¡Ã Â¤Â¦Ã Â¤Â¨ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â·Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿, Ã Â¤Ë†-Ã Â¤â€¢Ã Â¥â€¡Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Ë†Ã Â¤Â¸Ã Â¥â‚¬ Ã Â¤Â¸Ã Â¤Â¤Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤ÂªÃ Â¤Â¨, Ã Â¤â€Ã Â¤Â° Ã Â¤â€¢Ã Â¤Â¨Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥ÂÃ Â¤Â®Ã Â¤â€šÃ Â¤â€”Ã Â¤Â²Ã Â¤Â¾ Ã Â¤Â¯Ã Â¥â€¹Ã Â¤Å“Ã Â¤Â¨Ã Â¤Â¾ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â¸Ã Â¤â€šÃ Â¤â€¢Ã Â¤Â²Ã Â¤Â¨Ã Â¥Â¤",
        "Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¤Â¾Ã Â¤Âµ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¯": "Ã Â¤Â®Ã Â¤Â¤Ã Â¤Â¦Ã Â¤Â¾Ã Â¤Â¤Ã Â¤Â¾ Ã Â¤Â¸Ã Â¥â€šÃ Â¤Å¡Ã Â¥â‚¬ Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â¨Ã Â¤Â°Ã Â¥â‚¬Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â·Ã Â¤Â£ (Voter List), Ã Â¤Â¬Ã Â¥â‚¬Ã Â¤ÂÃ Â¤Â²Ã Â¤â€œ Ã Â¤Å¸Ã Â¥â€¡Ã Â¤â€¢Ã Â¥ÂÃ Â¤Â¨Ã Â¤Â¿Ã Â¤â€¢Ã Â¤Â² Ã Â¤â€¦Ã Â¤Â¸Ã Â¤Â¿Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¥â€¡Ã Â¤â€šÃ Â¤Â¸, Ã Â¤Â¬Ã Â¥â€šÃ Â¤Â¥Ã Â¥â€¹Ã Â¤â€š Ã Â¤â€¢Ã Â¥â‚¬ Ã Â¤Â®Ã Â¥Ë†Ã Â¤ÂªÃ Â¤Â¿Ã Â¤â€šÃ Â¤â€”, Ã Â¤â€Ã Â¤Â° Ã Â¤Å¡Ã Â¥ÂÃ Â¤Â¨Ã Â¤Â¾Ã Â¤ÂµÃ Â¥â‚¬ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤Â¬Ã Â¤â€šÃ Â¤Â§Ã Â¤Â¨ Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â­Ã Â¤Â¾Ã Â¤Â°Ã Â¥Â¤",
        "Ã Â¤â€”Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â®Ã Â¥ÂÃ Â¤Â¯ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¸": "Ã Â¤ÂªÃ Â¥â‚¬Ã Â¤ÂÃ Â¤Â® Ã Â¤â€ Ã Â¤ÂµÃ Â¤Â¾Ã Â¤Â¸ Ã Â¤Â¯Ã Â¥â€¹Ã Â¤Å“Ã Â¤Â¨Ã Â¤Â¾ (PM Awas) Ã Â¤Å“Ã Â¤Â¿Ã Â¤Â¯Ã Â¥â€¹-Ã Â¤Å¸Ã Â¥Ë†Ã Â¤â€”Ã Â¤Â¿Ã Â¤â€šÃ Â¤â€”, Ã Â¤Â®Ã Â¤Â¨Ã Â¤Â°Ã Â¥â€¡Ã Â¤â€”Ã Â¤Â¾ (MGNREGA) Ã Â¤Â®Ã Â¤Â¾Ã Â¤Â¸Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â° Ã Â¤Â°Ã Â¥â€¹Ã Â¤Â² Ã Â¤â€˜Ã Â¤Â¨Ã Â¤Â²Ã Â¤Â¾Ã Â¤â€¡Ã Â¤Â¨ Ã Â¤ÂªÃ Â¥ÂÃ Â¤Â°Ã Â¤ÂµÃ Â¤Â¿Ã Â¤Â·Ã Â¥ÂÃ Â¤Å¸Ã Â¤Â¿, Ã Â¤â€Ã Â¤Â° Ã Â¤â€”Ã Â¥ÂÃ Â¤Â°Ã Â¤Â¾Ã Â¤Â®Ã Â¥ÂÃ Â¤Â¯ Ã Â¤ÂµÃ Â¤Â¿Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â¸ Ã Â¤â€¢Ã Â¤Â²Ã Â¥ÂÃ Â¤Â¯Ã Â¤Â¾Ã Â¤Â£Ã Â¤â€¢Ã Â¤Â¾Ã Â¤Â°Ã Â¥â‚¬ Ã Â¤Â¯Ã Â¥â€¹Ã Â¤Å“Ã Â¤Â¨Ã Â¤Â¾Ã Â¤â€œÃ Â¤â€š Ã Â¤â€¢Ã Â¤Â¾ Ã Â¤Â¡Ã Â¥â€¡Ã Â¤Å¸Ã Â¤Â¾ Ã Â¤Â¬Ã Â¥â€¡Ã Â¤Â¸Ã Â¥Â¤"
    };

    if (nodes && infoPanel) {
        nodes.forEach(node => {
            node.addEventListener('mouseenter', () => {
                const depName = node.getAttribute('data-dep');
                const desc = departmentDescriptions[depName];
                if (desc) {
                    infoPanel.innerHTML = `
                        <h4 style="font-family: var(--condensed); font-size: 1.4rem; color: var(--saffron); margin-bottom: 0.6rem; text-transform: uppercase;">
                            Ã¢Å¡Â¡ ${depName}
                        </h4>
                        <p style="font-family: var(--sans); font-size: 1.05rem; color: var(--text-light); line-height: 1.6; margin: 0;">
                            ${desc}
                        </p>
                    `;
                    // Highlight laser path connected to this department by speeding animation or scaling
                    const pathId = node.getAttribute('id').replace('node-', 'ray-');
                    const ray = document.getElementById(pathId);
                    if (ray) {
                        ray.style.stroke = 'var(--saffron)';
                        ray.style.strokeWidth = '3';
                        ray.setAttribute('animation', 'strokePulse 1.5s linear infinite');
                    }
                }
            });

            node.addEventListener('mouseleave', () => {
                const pathId = node.getAttribute('id').replace('node-', 'ray-');
                const ray = document.getElementById(pathId);
                if (ray) {
                    ray.style.stroke = 'rgba(26, 17, 8, 0.15)';
                    ray.style.strokeWidth = '1.5';
                    ray.setAttribute('animation', 'strokePulse 4s linear infinite');
                }
            });
        });
    }

    // ==========================================================================
    // DEMANDS CARD STAGGER ANIMATIONS
    // ==========================================================================
    gsap.from('.demand-cinematic-card', {
        scrollTrigger: {
            trigger: '.demands-row-grid',
            start: 'top 100%' // Robust trigger for bottom of the viewport
        },
        y: 20, // Slide-up animation without opacity overrides
        duration: 0.8,
        stagger: 0.08,
        ease: 'power2.out'
    });

    // ==========================================================================
    // MULTILAYER 3D INTERACTIVE MOUSE PARALLAX (TRIBUTE CARDS)
    // ==========================================================================
    const tributeSection = document.querySelector('.tribute-cards-grid');
    if (tributeSection) {
        window.addEventListener('mousemove', (e) => {
            const rect = tributeSection.getBoundingClientRect();
            // Check if section is within or close to the viewport
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = e.clientX - centerX;
                const mouseY = e.clientY - centerY;

                // Move 3D images with distinct depth coefficients
                gsap.to('.cm-3d', {
                    x: mouseX * 0.045,
                    y: mouseY * 0.045,
                    rotationY: mouseX * 0.015,
                    rotationX: -mouseY * 0.015,
                    duration: 0.8,
                    ease: 'power2.out'
                });
                gsap.to('.secretary-3d', {
                    x: mouseX * 0.03,
                    y: mouseY * 0.03,
                    rotationY: mouseX * 0.01,
                    rotationX: -mouseY * 0.01,
                    duration: 0.8,
                    ease: 'power2.out'
                });
                gsap.to('.sahayak-3d', {
                    x: mouseX * 0.02,
                    y: mouseY * 0.02,
                    rotationY: mouseX * 0.007,
                    rotationX: -mouseY * 0.007,
                    duration: 0.8,
                    ease: 'power2.out'
                });
            }
        });

        // Reset positions smoothly when mouse leaves
        tributeSection.addEventListener('mouseleave', () => {
            gsap.to(['.cm-3d', '.secretary-3d', '.sahayak-3d'], {
                x: 0,
                y: 0,
                rotationX: 0,
                rotationY: 0,
                duration: 1.2,
                ease: 'elastic.out(1, 0.75)'
            });
        });
    }

    // ==========================================================================
    // CINEMATIC GATEWAY — ULTRA MICRO DETAIL INK BLEED
    // ==========================================================================
    const gateway   = document.getElementById('portalGateway');
    const inkCanvas = document.getElementById('inkCanvas');
    const body      = document.body;

    if (gateway && inkCanvas) {
        body.classList.add('gateway-active');
        body.style.overflow = 'hidden';

        // Size canvas to full viewport
        inkCanvas.width  = window.innerWidth;
        inkCanvas.height = window.innerHeight;
        const ctx = inkCanvas.getContext('2d');

        const cx = inkCanvas.width  / 2;
        const cy = inkCanvas.height / 2;
        // Max radius to cover all corners
        const maxRadius = Math.sqrt(cx * cx + cy * cy) + 30;

        // Organic wobble points â€” gives irregular ink-blob edge feel
        const WOBBLE_POINTS = 14;
        const wobbleOffsets = Array.from({ length: WOBBLE_POINTS }, () => Math.random() * Math.PI * 2);

        function drawInkFrame(progress) {
            ctx.clearRect(0, 0, inkCanvas.width, inkCanvas.height);

            const radius = maxRadius * progress;
            if (radius <= 0) return;

            // --- Draw organic ink blob ---
            ctx.beginPath();
            for (let i = 0; i <= WOBBLE_POINTS; i++) {
                const angle = (i / WOBBLE_POINTS) * Math.PI * 2;
                // Organic wobble: reduces as ink fills (more circular when big)
                const wobbleMag = 0.09 * (1 - progress * 0.7);
                const wobble = 1 + wobbleMag * Math.sin(angle * 3 + wobbleOffsets[i % WOBBLE_POINTS] + progress * 8);
                const r = radius * wobble;
                const x = cx + Math.cos(angle) * r;
                const y = cy + Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(x, y);
                else         ctx.lineTo(x, y);
            }
            ctx.closePath();

            // Deep ink radial gradient: center warm, edges pure ink dark
            const inkGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            inkGrad.addColorStop(0,    '#2C1A08');
            inkGrad.addColorStop(0.35, '#1A0E03');
            inkGrad.addColorStop(1,    '#0A0602');
            ctx.fillStyle = inkGrad;
            ctx.fill();

            // --- Saffron glow from center (grows in after ink starts spreading) ---
            if (progress > 0.15) {
                const glowP    = Math.min(1, (progress - 0.15) / 0.5);
                const glowRad  = radius * 0.55 * glowP;
                const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRad);
                glowGrad.addColorStop(0,   `rgba(224, 101, 30, ${0.28 * glowP})`);
                glowGrad.addColorStop(0.45,`rgba(212, 175, 55, ${0.12 * glowP})`);
                glowGrad.addColorStop(1,    'rgba(0,0,0,0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(cx, cy, glowRad, 0, Math.PI * 2);
                ctx.fill();
            }

            // --- Expanding ripple ring at the bleeding edge ---
            const ringAlpha = (1 - progress) * 0.7;
            if (ringAlpha > 0.05) {
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 0.97, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(224, 101, 30, ${ringAlpha})`;
                ctx.lineWidth = 4 * (1 - progress * 0.5);
                ctx.stroke();

                // Second trailing ring
                ctx.beginPath();
                ctx.arc(cx, cy, radius * 0.88, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(212, 175, 55, ${ringAlpha * 0.45})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // --- Fine ink splatter dots at the edge ---
            if (progress > 0.05 && progress < 0.85) {
                const splatCount = 8;
                for (let i = 0; i < splatCount; i++) {
                    const angle  = (i / splatCount) * Math.PI * 2 + progress * 3.5;
                    const dist   = radius * (0.98 + Math.sin(i * 137.5) * 0.06);
                    const sx     = cx + Math.cos(angle) * dist;
                    const sy     = cy + Math.sin(angle) * dist;
                    const sSize  = 2 + Math.abs(Math.sin(i * 97.3 + progress * 5)) * 3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, sSize, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(224, 101, 30, ${0.3 * (1 - progress)})`;
                    ctx.fill();
                }
            }
        }

        // --- Animation loop ---
        let startTime = null;
        const SPREAD_DURATION = 900; // ms to fully spread

        function animateInk(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed  = timestamp - startTime;
            const rawP     = Math.min(elapsed / SPREAD_DURATION, 1);
            // Ease-out curve: slow at end for dramatic pause before logo appears
            const progress = 1 - Math.pow(1 - rawP, 2.2);

            drawInkFrame(progress);

            if (rawP < 1) {
                requestAnimationFrame(animateInk);
            } else {
                // Ink has fully covered screen â€” show logo
                gsap.to('.ink-center-content', {
                    opacity: 1,
                    y: 0,
                    duration: 0.45,
                    ease: 'power2.out',
                    onComplete: () => {
                        // Hold for user to see emblem, then wipe out
                        setTimeout(exitGateway, 700);
                    }
                });
            }
        }

        function exitGateway() {
            // Fade logo first
            gsap.to('.ink-center-content', { opacity: 0, duration: 0.3, ease: 'power2.in' });

            // Collapse clip-path circle from center outward revealing the page
            gsap.to(gateway, {
                clipPath: 'circle(0% at 50% 50%)',
                duration: 0.7,
                delay: 0.15,
                ease: 'power3.inOut',
                onComplete: () => {
                    gateway.style.display = 'none';
                    body.classList.remove('gateway-active');
                    body.style.overflow = '';
                    playHeroEntrance();
                }
            });
        }

        // Set initial clip-path so gateway covers screen fully
        gsap.set(gateway, { clipPath: 'circle(150% at 50% 50%)' });

        // Start ink animation
        requestAnimationFrame(animateInk);

    } else {
        playHeroEntrance();
    }
});
