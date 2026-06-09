/* ==========================================================================
   HISTORY PAGE JS — Time Machine Entrance + Scroll Animations
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    // ──────────────────────────────────────────────────────────────────────────
    // ──────────────────────────────────────────────────────────────────────────
    // TIME MACHINE ENTRANCE OVERLAY
    // ──────────────────────────────────────────────────────────────────────────
    const overlay  = document.getElementById('timeMachineOverlay');
    const tmCanvas = document.getElementById('tmCanvas');
    const tmFlash  = document.getElementById('tmFlash');
    const yearEl   = document.getElementById('tmYearNum');
    const histPage = document.getElementById('historyPage');

    if (overlay && tmCanvas) {
        // Lock scroll
        document.body.style.overflow = 'hidden';

        // Canvas setup
        tmCanvas.width  = window.innerWidth;
        tmCanvas.height = window.innerHeight;
        const ctx = tmCanvas.getContext('2d');
        const CX  = tmCanvas.width  / 2;
        const CY  = tmCanvas.height / 2;

        let phase      = 'static';
        let phaseStart = null;
        let clockRot   = 0;         // cumulative clock rotation

    // ── Phase timings (ms) ───────────────────────────────────────────────────
    const STATIC_DUR   = 600;   // TV static noise
    const CLOCK_DUR    = 1800;  // Clock + year counter
    const HOLD_DUR     = 300;   // Brief pause at 1995
    const FLASH_DUR    = 400;   // White flash out

    // ── Random noise (TV static) ─────────────────────────────────────────────
    function drawStatic(alpha) {
        const imgData = ctx.createImageData(tmCanvas.width, tmCanvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
            const v = Math.random() * 180;
            d[i]   = v;
            d[i+1] = v;
            d[i+2] = v;
            d[i+3] = alpha * 255;
        }
        ctx.putImageData(imgData, 0, 0);
    }

    // ── Scanline glitch lines ────────────────────────────────────────────────
    function drawGlitchLines(intensity) {
        const lineCount = Math.floor(intensity * 8);
        for (let i = 0; i < lineCount; i++) {
            const y = Math.random() * tmCanvas.height;
            const h = 1 + Math.random() * 4;
            const shift = (Math.random() - 0.5) * 60 * intensity;
            ctx.save();
            ctx.drawImage(tmCanvas, shift, y, tmCanvas.width, h, shift, y, tmCanvas.width, h);
            ctx.restore();

            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`;
            ctx.fillRect(0, y, tmCanvas.width, h);
        }
    }

    // ── Clock face ───────────────────────────────────────────────────────────
    function drawClock(rotation, alpha, size) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(CX, CY);

        // Outer glow ring
        const glow = ctx.createRadialGradient(0, 0, size * 0.7, 0, 0, size * 1.4);
        glow.addColorStop(0, 'rgba(180, 150, 80, 0.25)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Clock face
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(8, 6, 4, 0.92)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(200, 170, 90, 0.7)';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Inner decorative ring
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200, 170, 90, 0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Hour markers + numbers
        for (let i = 0; i < 12; i++) {
            const ang = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const isMain = i % 3 === 0;
            const r1 = size * (isMain ? 0.72 : 0.78);
            const r2 = size * 0.88;
            ctx.beginPath();
            ctx.moveTo(Math.cos(ang) * r1, Math.sin(ang) * r1);
            ctx.lineTo(Math.cos(ang) * r2, Math.sin(ang) * r2);
            ctx.strokeStyle = isMain
                ? 'rgba(200,170,90,0.85)'
                : 'rgba(200,170,90,0.35)';
            ctx.lineWidth = isMain ? 2.5 : 1;
            ctx.stroke();

            // Roman numeral labels at main positions
            if (isMain) {
                const labels = ['XII', 'III', 'VI', 'IX'];
                const li = i / 3;
                ctx.font = `${size * 0.09}px Playfair Display, serif`;
                ctx.fillStyle = 'rgba(200,170,90,0.6)';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(labels[li],
                    Math.cos(ang) * size * 0.62,
                    Math.sin(ang) * size * 0.62
                );
            }
        }

        // HANDS spinning backwards
        // Hour hand (slow backwards)
        const hAng = -rotation * 0.07 - Math.PI / 2;
        ctx.save();
        ctx.rotate(hAng);
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.lineTo(0, -size * 0.52);
        ctx.lineTo(6, 0);
        ctx.lineTo(0, 6);
        ctx.closePath();
        ctx.fillStyle = 'rgba(220, 195, 140, 0.92)';
        ctx.fill();
        ctx.restore();

        // Minute hand (medium backwards)
        const mAng = -rotation * 0.5 - Math.PI / 2;
        ctx.save();
        ctx.rotate(mAng);
        ctx.beginPath();
        ctx.moveTo(0, 5);
        ctx.lineTo(0, -size * 0.75);
        ctx.lineTo(4, 0);
        ctx.lineTo(0, 5);
        ctx.closePath();
        ctx.fillStyle = 'rgba(220, 195, 140, 0.92)';
        ctx.fill();
        ctx.restore();

        // Second hand (fast backwards — red)
        const sAng = -rotation * 4.5;
        ctx.save();
        ctx.rotate(sAng);
        ctx.beginPath();
        ctx.moveTo(0, size * 0.22);
        ctx.lineTo(0, -size * 0.83);
        ctx.strokeStyle = 'rgba(200, 60, 20, 0.9)';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.restore();

        // Center jewel
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(200, 60, 20, 0.9)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.restore();
    }

    // ── Particle streaks (time warp effect) ──────────────────────────────────
    const streaks = Array.from({ length: 60 }, () => ({
        angle: Math.random() * Math.PI * 2,
        dist:  50 + Math.random() * Math.min(CX, CY) * 0.6,
        speed: 2 + Math.random() * 5,
        len:   20 + Math.random() * 60,
        alpha: 0.1 + Math.random() * 0.3,
        color: Math.random() > 0.6 ? [200,170,80] : [255,255,255],
    }));

    function drawStreaks(progress, opacity) {
        streaks.forEach(s => {
            s.dist += s.speed * progress;
            if (s.dist > Math.max(CX, CY) * 1.5) s.dist = 30;

            const x1 = CX + Math.cos(s.angle) * s.dist;
            const y1 = CY + Math.sin(s.angle) * s.dist;
            const x2 = CX + Math.cos(s.angle) * (s.dist + s.len * progress);
            const y2 = CY + Math.sin(s.angle) * (s.dist + s.len * progress);

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(${s.color.join(',')},${s.alpha * opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    // ── Year counter ─────────────────────────────────────────────────────────
    const START_YEAR = 2024;
    const END_YEAR   = 1995;
    let lastYearVal  = 2024;

    function setYear(p) {
        const y = Math.round(START_YEAR - (START_YEAR - END_YEAR) * p);
        yearEl.textContent = y;
        if (y !== lastYearVal && p > 0 && p < 1) {
            lastYearVal = y;
        }
        // Add blur when counting fast
        yearEl.style.filter = `blur(${p < 0.9 ? (1 - p) * 3 : 0}px)`;
    }

    // ── Main animation loop ───────────────────────────────────────────────────
    let raf;

    function animate(ts) {
        if (phase === 'ready') {
            ctx.clearRect(0, 0, tmCanvas.width, tmCanvas.height);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);
            drawStatic(0.08 + Math.random() * 0.04);
            raf = requestAnimationFrame(animate);
            return;
        }

        if (!phaseStart) phaseStart = ts;
        const elapsed = ts - phaseStart;

        ctx.clearRect(0, 0, tmCanvas.width, tmCanvas.height);

        // ─ PHASE 1: Static ─
        if (phase === 'static') {
            const p = Math.min(elapsed / STATIC_DUR, 1);
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);
            drawStatic(0.7 + Math.random() * 0.3);
            
            // Year flickers
            if (Math.random() > 0.5) setYear(0);

            if (p >= 1) {
                phase = 'clock';
                phaseStart = ts;
            }

        // ─ PHASE 2: Clock + year countdown ─
        } else if (phase === 'clock') {
            const p = Math.min(elapsed / CLOCK_DUR, 1);
            const ease = 1 - Math.pow(1 - p, 2);

            // Black BG
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);

            // Sparse static underneath
            drawStatic(0.08 + Math.random() * 0.06);

            // Time warp streaks
            drawStreaks(ease + 0.5, Math.min(1, p * 2));

            // Clock size grows in
            const clockSize = Math.min(CX, CY) * 0.4 * Math.min(1, p * 3);
            clockRot += 0.08 + p * 0.25; // accelerate rotation
            drawClock(clockRot, Math.min(1, p * 4), clockSize);

            // Glitch lines
            if (Math.random() > 0.7) drawGlitchLines(0.3 + p * 0.4);

            // Year countdown
            setYear(ease);

            // Vignette
            const vig = ctx.createRadialGradient(CX, CY, CX * 0.3, CX, CY, CX * 1.2);
            vig.addColorStop(0, 'rgba(0,0,0,0)');
            vig.addColorStop(1, 'rgba(0,0,0,0.7)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);

            if (p >= 1) {
                phase = 'hold';
                phaseStart = ts;
                setYear(1); // ensure 1995
            }

        // ─ PHASE 3: Hold at 1995 ─
        } else if (phase === 'hold') {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);
            drawStatic(0.04);
            drawClock(clockRot, 0.6, Math.min(CX, CY) * 0.4);
            clockRot += 0.01; // slow idle spin

            if (elapsed >= HOLD_DUR) {
                phase = 'flash';
                phaseStart = ts;
            }

        // ─ PHASE 4: Flash to white ─
        } else if (phase === 'flash') {
            const p = Math.min(elapsed / FLASH_DUR, 1);

            // First half: flash white
            if (p < 0.5) {
                const fp = p / 0.5;
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, tmCanvas.width, tmCanvas.height);
                drawClock(clockRot, 0.6 * (1 - fp), Math.min(CX, CY) * 0.4);
                gsap.set(tmFlash, { opacity: fp });
            } else {
                // Second half: fade overlay out, show history page
                const fp = (p - 0.5) / 0.5;
                gsap.set(tmFlash, { opacity: 1 - fp * 0.3 });
            }

            if (p >= 1) {
                phase = 'done';
                // Remove overlay, show page
                gsap.to(tmFlash, { opacity: 0, duration: 0.3 });
                gsap.to(overlay, {
                    opacity: 0,
                    duration: 0.4,
                    delay: 0.1,
                    onComplete: () => {
                        overlay.style.display = 'none';
                        document.body.style.overflow = '';
                        // Reveal history page
                        gsap.to(histPage, { opacity: 1, duration: 0.5, ease: 'power2.out' });
                        // Trigger masthead animation
                        animateMasthead();
                    }
                });
                cancelAnimationFrame(raf);
                return;
            }
        }

        raf = requestAnimationFrame(animate);
    }

    raf = requestAnimationFrame(animate);
} else {
    if (overlay) overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (histPage) histPage.style.opacity = 1;
    animateMasthead();
}

    // ──────────────────────────────────────────────────────────────────────────
    // MASTHEAD + SCROLL ANIMATIONS (after overlay done)
    // ──────────────────────────────────────────────────────────────────────────
    function animateMasthead() {
        // Masthead elements animate in
        gsap.from('.hist-masthead', {
            y: -40, opacity: 0, duration: 0.8, ease: 'power3.out'
        });
        gsap.from('.masthead-title', {
            letterSpacing: '0.3em', opacity: 0,
            duration: 1, ease: 'power2.out', delay: 0.2
        });
        gsap.from('.masthead-sub, .masthead-ornament, .back-link, .masthead-date', {
            opacity: 0, y: 10, duration: 0.6, stagger: 0.1, delay: 0.4
        });

        // Spine draws itself downward
        gsap.from('.timeline-spine', {
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 1.5,
            ease: 'power2.inOut',
            delay: 0.8
        });

        // Setup scroll reveals
        setupScrollReveals();
    }

    function setupScrollReveals() {
        // Simple IntersectionObserver for timeline entries + .scroll-reveal
        const io = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('revealed');
                    io.unobserve(e.target);

                    // Extra GSAP for timeline cards
                    if (e.target.classList.contains('tl-entry')) {
                        const card = e.target.querySelector('.tl-card');
                        const year = e.target.getAttribute('data-year');
                        // Year number pop-in
                        gsap.from(e.target.querySelector('.tl-year-badge'), {
                            scale: 0.3,
                            opacity: 0,
                            duration: 0.5,
                            ease: 'back.out(1.8)',
                            delay: 0.2
                        });
                        // Photo slide
                        gsap.from(e.target.querySelector('.tl-photo-box'), {
                            opacity: 0,
                            scaleX: 0.8,
                            duration: 0.6,
                            ease: 'power2.out',
                            delay: 0.3
                        });
                        // Bullets stagger
                        gsap.from(e.target.querySelectorAll('.tl-bullets li'), {
                            x: -15,
                            opacity: 0,
                            duration: 0.4,
                            stagger: 0.07,
                            ease: 'power2.out',
                            delay: 0.5
                        });
                        // Headline typewriter underline
                        const rule = e.target.querySelector('.tl-rule');
                        if (rule) {
                            gsap.from(rule, {
                                scaleX: 0,
                                transformOrigin: 'left center',
                                duration: 0.5,
                                ease: 'power2.out',
                                delay: 0.4
                            });
                        }
                        // Dot pulse for victory
                        const dot = e.target.querySelector('.tl-dot');
                        if (dot && dot.classList.contains('dot-victory')) {
                            gsap.to(dot, {
                                scale: 1.5,
                                repeat: 3,
                                yoyo: true,
                                duration: 0.3,
                                delay: 0.6
                            });
                        }
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all timeline entries and scroll-reveal elements
        document.querySelectorAll('.tl-entry, .scroll-reveal').forEach(el => {
            io.observe(el);
        });
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HOVER: Photo placeholder shimmer effect
    // ──────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('.tl-photo-placeholder').forEach(ph => {
        ph.addEventListener('mouseenter', () => {
            gsap.to(ph, { opacity: 0.85, duration: 0.3 });
        });
        ph.addEventListener('mouseleave', () => {
            gsap.to(ph, { opacity: 1, duration: 0.3 });
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // CARD HOVER: subtle tilt
    // ──────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('.tl-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            gsap.to(card, {
                rotationY: x * 4,
                rotationX: -y * 4,
                transformPerspective: 800,
                duration: 0.4,
                ease: 'power2.out'
            });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0, rotationX: 0, duration: 0.5, ease: 'elastic.out(1, 0.7)'
            });
        });
    });

    // ──────────────────────────────────────────────────────────────────────────
    // YEAR NUMBER: parallax scroll speed
    // ──────────────────────────────────────────────────────────────────────────
    document.querySelectorAll('.tl-year-badge').forEach(badge => {
        ScrollTrigger.create({
            trigger: badge,
            start: 'top bottom',
            end: 'bottom top',
            onUpdate: (self) => {
                gsap.set(badge, { y: self.progress * -15 });
            }
        });
    });
});
