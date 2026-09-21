/* future.js — Interactive Cyber Portal, simulator math, and scroll animations for the Future Vision page */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize GSAP and ScrollTrigger
    if (typeof gsap !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
    }

    // --- HERO ENTRANCE FUNCTION ---
    const playHeroEntrance = () => {
        if (typeof gsap === 'undefined') return;

        gsap.from('.future-main-title', {
            opacity: 0,
            y: 40,
            duration: 1.1,
            ease: 'back.out(1.2)'
        });

        gsap.from('.future-hero-desc', {
            opacity: 0,
            y: 20,
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.3
        });

        gsap.from('.hero-scroll-badge', {
            opacity: 0,
            scale: 0.9,
            duration: 0.6,
            ease: 'back.out(1.5)',
            delay: 0.6
        });

        // Staggered reveals for cards and blocks as they enter the screen
        gsap.utils.toArray('.scroll-reveal').forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                },
                opacity: 0,
                y: 30,
                duration: 0.6,
                ease: 'power2.out'
            });
        });

        // Revolutions grid staggered entrance (without conflicts)
        gsap.from('.revolution-card', {
            scrollTrigger: {
                trigger: '.revolutions-grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            },
            opacity: 0,
            y: 40,
            duration: 0.7,
            stagger: 0.12,
            ease: 'power2.out'
        });
    };

    // ==========================================================================
    // FUTURISTIC HOLOGRAPHIC CYBER PORTAL REVEAL
    // ==========================================================================
    const cyberPortal        = document.getElementById('cyberPortal');
    const cyberCanvas        = document.getElementById('cyberCanvas');
    const cyberScanner       = document.getElementById('cyberScanner');
    const cyberProgressBar   = document.getElementById('cyberProgressBar');
    const cyberProgressText  = document.getElementById('cyberProgressText');
    const cyberFlash         = document.getElementById('cyberFlash');
    const futurePage         = document.getElementById('futurePage');
    const termLine1          = document.getElementById('termLine1');
    const termLine2          = document.getElementById('termLine2');
    const termLine3          = document.getElementById('termLine3');

    if (cyberPortal && cyberCanvas && typeof gsap !== 'undefined') {
        document.body.classList.add('gateway-active');
        document.body.style.overflow = 'hidden';

        // Size canvas to viewport
        cyberCanvas.width  = window.innerWidth;
        cyberCanvas.height = window.innerHeight;
        const ctx = cyberCanvas.getContext('2d');
        let width = cyberCanvas.width;
        let height = cyberCanvas.height;

        // Resize handler inside gateway
        const handlePortalResize = () => {
            if (cyberCanvas) {
                width = cyberCanvas.width = window.innerWidth;
                height = cyberCanvas.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handlePortalResize);

        // Grid nodes particles for high-tech holographic blue effect
        const nodes = Array.from({ length: 45 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: Math.random() * 0.5 - 0.25,
            vy: Math.random() * 0.5 - 0.25,
            size: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI
        }));

        // Binary code streams raining down in cyber-blue
        const codeStreams = Array.from({ length: 28 }, () => ({
            x: Math.random() * width,
            y: Math.random() * height - 80,
            vy: 1.2 + Math.random() * 1.8,
            chars: Array.from({ length: 6 + Math.floor(Math.random() * 6) }, () => Math.random() > 0.5 ? '1' : '0'),
            alpha: 0.03 + Math.random() * 0.12,
            size: 8 + Math.floor(Math.random() * 5)
        }));

        function drawCyberPortalBackground() {
            if (!cyberPortal || cyberPortal.style.display === 'none') return;
            ctx.clearRect(0, 0, width, height);

            // 1. Draw falling digital code streams
            ctx.font = 'bold 11px monospace';
            codeStreams.forEach(s => {
                s.y += s.vy;
                if (s.y > height) {
                    s.y = -80;
                    s.x = Math.random() * width;
                }
                ctx.fillStyle = `rgba(0, 210, 255, ${s.alpha})`;
                s.chars.forEach((char, idx) => {
                    ctx.fillText(char, s.x, s.y + idx * 12);
                });
            });

            // 2. Update and draw nodes
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                n.pulse += 0.05;

                // Wrap boundaries
                if (n.x < 0) n.x = width;
                if (n.x > width) n.x = 0;
                if (n.y < 0) n.y = height;
                if (n.y > height) n.y = 0;

                const opacity = 0.25 + Math.sin(n.pulse) * 0.15;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(0, 210, 255, ${opacity})`;
                ctx.fill();
            });

            // 3. Connect nearby nodes
            ctx.strokeStyle = 'rgba(0, 210, 255, 0.05)';
            ctx.lineWidth = 0.8;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 130) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(drawCyberPortalBackground);
        }
        drawCyberPortalBackground();

        // Continuous laser scanner line sweep (ambient)
        gsap.to(cyberScanner, {
            top: '100%',
            duration: 2.5,
            ease: 'none',
            repeat: -1
        });

        // Ticking progress bar from 0% to 100%
        let progressObj = { value: 0 };
        gsap.to(progressObj, {
            value: 100,
            duration: 2.2,
            ease: 'power1.inOut',
            onUpdate: () => {
                const p = Math.round(progressObj.value);
                if (cyberProgressBar) {
                    cyberProgressBar.style.width = `${p}%`;
                }
                if (cyberProgressText) {
                    cyberProgressText.textContent = `${p}%`;
                }

                // Typewriter/Reveal status lines
                if (p >= 35 && termLine2) {
                    termLine2.style.opacity = 1;
                }
                if (p >= 70 && termLine3) {
                    termLine3.style.opacity = 1;
                }
            },
            onComplete: () => {
                exitPortal();
            }
        });

        function exitPortal() {
            window.removeEventListener('resize', handlePortalResize);
            
            // Fast final scanner wipe
            gsap.set(cyberScanner, { top: '0%' });
            gsap.to(cyberScanner, {
                top: '100%',
                duration: 0.4,
                ease: 'power3.in'
            });

            // Bright cyber white flash
            gsap.to(cyberFlash, {
                opacity: 1,
                duration: 0.2,
                onComplete: () => {
                    // Hide cyber portal overlay
                    cyberPortal.style.display = 'none';
                    document.body.classList.remove('gateway-active');
                    document.body.style.overflow = '';
                    
                    // Reveal main page wrapper
                    if (futurePage) {
                        futurePage.style.opacity = 1;
                    }
                    
                    // Start hero section animations
                    playHeroEntrance();

                    // Fade out flash overlay
                    gsap.to(cyberFlash, {
                        opacity: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                }
            });
        }
    } else {
        // Fallback if GSAP is missing or elements not found
        if (cyberPortal) cyberPortal.style.display = 'none';
        document.body.classList.remove('gateway-active');
        document.body.style.overflow = '';
        if (futurePage) futurePage.style.opacity = 1;
        playHeroEntrance();
    }


    // ==========================================================================
    // 2. SIMULATOR LOGIC (7 Toggles, 9 Metrics)
    // ==========================================================================
    const toggleWage = document.getElementById('toggleWage');
    const togglePermanency = document.getElementById('togglePermanency');
    const toggleAuthority = document.getElementById('toggleAuthority');
    const toggleHardware = document.getElementById('toggleHardware');
    const toggleTraining = document.getElementById('toggleTraining');
    const toggleTreasury = document.getElementById('toggleTreasury');
    const togglePromotion = document.getElementById('togglePromotion');

    const fillDelivery = document.getElementById('fillDelivery');
    const fillLiteracy = document.getElementById('fillLiteracy');
    const fillRedressal = document.getElementById('fillRedressal');
    const fillTransparency = document.getElementById('fillTransparency');
    const fillAttrition = document.getElementById('fillAttrition');
    const fillTrainingCost = document.getElementById('fillTrainingCost');
    const fillPunctuality = document.getElementById('fillPunctuality');
    const fillFootfall = document.getElementById('fillFootfall');
    const fillMorale = document.getElementById('fillMorale');

    const valDelivery = document.getElementById('valDelivery');
    const valLiteracy = document.getElementById('valLiteracy');
    const valRedressal = document.getElementById('valRedressal');
    const valTransparency = document.getElementById('valTransparency');
    const valAttrition = document.getElementById('valAttrition');
    const valTrainingCost = document.getElementById('valTrainingCost');
    const valPunctuality = document.getElementById('valPunctuality');
    const valFootfall = document.getElementById('valFootfall');
    const valMorale = document.getElementById('valMorale');

    const masterLed = document.getElementById('masterLed');
    const villageStatus = document.getElementById('villageStatus');

    // Baseline metrics
    const baseline = {
        delivery: 45,
        literacy: 30,
        redressal: 7.0, // in days
        transparency: 40,
        attrition: 75, // percentage
        trainingCost: 85000, // in rupees
        punctuality: 25, // percentage
        footfall: 30, // percentage
        morale: 20 // percentage
    };

    function updateSimulator() {
        let activeTogglesCount = 0;
        
        let addDelivery = 0;
        let addLiteracy = 0;
        let minusRedressal = 0; 
        let addTransparency = 0;
        let minusAttrition = 0;
        let minusTrainingCost = 0;
        let addPunctuality = 0;
        let addFootfall = 0;
        let addMorale = 0;

        // Pillar 1: Wage Upgrade (Pay Level 1)
        if (toggleWage && toggleWage.checked) {
            activeTogglesCount++;
            addDelivery += 10;
            addLiteracy += 5;
            minusRedressal += 1.0;
            addTransparency += 10;
            minusAttrition += 20;
            minusTrainingCost += 20000;
            addPunctuality += 10;
            addMorale += 20;
        }

        // Pillar 2: Job Permanency (स्थायीकरण) - REDUCES ATTRITION RATE & SAVES TRAINING COSTS
        if (togglePermanency && togglePermanency.checked) {
            activeTogglesCount++;
            addDelivery += 10;
            minusRedressal += 1.0;
            addTransparency += 15;
            minusAttrition += 40; // massive drop in attrition
            minusTrainingCost += 40000; // massive drop in re-training costs (money saved)
            addFootfall += 15;
            addMorale += 25;
        }

        // Pillar 3: Administrative Status (सत्यापन का अधिकार)
        if (toggleAuthority && toggleAuthority.checked) {
            activeTogglesCount++;
            addDelivery += 20;
            minusRedressal += 3.0; // drops dressing time heavily
            addTransparency += 20;
            addFootfall += 20;
            addMorale += 15;
        }

        // Pillar 4: High-End Hardware & Solar Backup
        if (toggleHardware && toggleHardware.checked) {
            activeTogglesCount++;
            addDelivery += 15;
            addLiteracy += 25;
            minusRedressal += 0.5;
            addTransparency += 10;
            addFootfall += 15;
        }

        // Pillar 5: Technical Training
        if (toggleTraining && toggleTraining.checked) {
            activeTogglesCount++;
            addDelivery += 8;
            addLiteracy += 20;
            minusRedressal += 0.5;
            addTransparency += 5;
            minusTrainingCost += 5000;
            addMorale += 10;
        }

        // Pillar 6: Direct Treasury Payment (राज्य कोष से वेतन)
        if (toggleTreasury && toggleTreasury.checked) {
            activeTogglesCount++;
            addTransparency += 10;
            addPunctuality += 65; // goes straight to max regular payment status
            addMorale += 20;
        }

        // Pillar 7: Promotion & Career Path (पदोन्नति व अनुकंपा नौकरी)
        if (togglePromotion && togglePromotion.checked) {
            activeTogglesCount++;
            minusAttrition += 15;
            minusTrainingCost += 18000;
            addMorale += 25;
            addFootfall += 5;
        }

        // Apply final values within constraints
        let finalDelivery     = Math.min(98, baseline.delivery + addDelivery);
        let finalLiteracy     = Math.min(90, baseline.literacy + addLiteracy);
        let finalRedressal    = Math.max(0.5, baseline.redressal - minusRedressal);
        let finalTransparency = Math.min(95, baseline.transparency + addTransparency);
        let finalAttrition    = Math.max(10, baseline.attrition - minusAttrition);
        let finalTrainingCost = Math.max(12000, baseline.trainingCost - minusTrainingCost);
        let finalPunctuality  = Math.min(100, baseline.punctuality + addPunctuality);
        let finalFootfall     = Math.min(95, baseline.footfall + addFootfall);
        let finalMorale       = Math.min(95, baseline.morale + addMorale);

        // Update progress bars & numeric values
        // 1. Digital Service Delivery
        animateProgressBar(fillDelivery, finalDelivery);
        animateValue(valDelivery, finalDelivery, '%');

        // 2. Digital Literacy
        animateProgressBar(fillLiteracy, finalLiteracy);
        animateValue(valLiteracy, finalLiteracy, '%');

        // 3. Grievance Redressal Time (Smaller is better)
        let redressalBarWidth = ((finalRedressal / 7.0) * 75) + 10; 
        if (fillRedressal) {
            fillRedressal.style.width = `${redressalBarWidth}%`;
            if (finalRedressal <= 2.5) {
                fillRedressal.classList.add('high-efficiency');
            } else {
                fillRedressal.classList.remove('high-efficiency');
            }
        }
        if (valRedressal) {
            let label = finalRedressal === 0.5 ? '12 घंटे (त्वरित)' : `${finalRedressal.toFixed(1)} दिन`;
            valRedressal.textContent = label;
        }

        // 4. Transparency
        animateProgressBar(fillTransparency, finalTransparency);
        animateValue(valTransparency, finalTransparency, '%');

        // 5. Attrition Rate (Smaller is better)
        if (fillAttrition) {
            fillAttrition.style.width = `${finalAttrition}%`;
            if (finalAttrition <= 25) {
                fillAttrition.classList.add('high-efficiency');
            } else {
                fillAttrition.classList.remove('high-efficiency');
            }
        }
        animateValue(valAttrition, finalAttrition, '%');

        // 6. Re-training Cost (Smaller is better)
        let costBarPercent = (finalTrainingCost / 85000) * 100;
        if (fillTrainingCost) {
            fillTrainingCost.style.width = `${costBarPercent}%`;
            if (finalTrainingCost <= 25000) {
                fillTrainingCost.classList.add('high-efficiency');
            } else {
                fillTrainingCost.classList.remove('high-efficiency');
            }
        }
        if (valTrainingCost) {
            valTrainingCost.textContent = `₹${finalTrainingCost.toLocaleString('hi-IN')}`;
        }

        // 7. Salary Punctuality
        animateProgressBar(fillPunctuality, finalPunctuality);
        animateValue(valPunctuality, finalPunctuality, '%');

        // 8. Daily Footfall
        animateProgressBar(fillFootfall, finalFootfall);
        animateValue(valFootfall, finalFootfall, '%');

        // 9. Morale & Satisfaction
        animateProgressBar(fillMorale, finalMorale);
        animateValue(valMorale, finalMorale, '%');

        // Master LED & Village Status updates
        if (masterLed) {
            if (activeTogglesCount === 7) {
                masterLed.className = 'led-indicator active'; // Green active state
                masterLed.style.backgroundColor = '#22c55e';
                masterLed.style.boxShadow = '0 0 8px #22c55e';
            } else if (activeTogglesCount > 0) {
                masterLed.className = 'led-indicator';
                masterLed.style.backgroundColor = '#eab308'; // Orange/Yellow mid state
                masterLed.style.boxShadow = '0 0 8px #eab308';
            } else {
                masterLed.className = 'led-indicator';
                masterLed.style.backgroundColor = '#ef4444'; // Red default
                masterLed.style.boxShadow = '0 0 6px #ef4444';
            }
        }

        if (villageStatus) {
            if (activeTogglesCount === 0) {
                villageStatus.textContent = 'कमज़ोर सचिवालय';
                villageStatus.className = 'panel-status-tag';
            } else if (activeTogglesCount <= 3) {
                villageStatus.textContent = 'कार्यशील सचिवालय';
                villageStatus.className = 'panel-status-tag stage-2';
            } else if (activeTogglesCount <= 5) {
                villageStatus.textContent = 'सशक्त सचिवालय';
                villageStatus.className = 'panel-status-tag stage-3';
            } else if (activeTogglesCount >= 6) {
                villageStatus.textContent = 'आदर्श डिजिटल ग्राम (2030)';
                villageStatus.className = 'panel-status-tag stage-3';
            }
        }
    }

    function animateProgressBar(barElement, targetValue) {
        if (!barElement) return;
        barElement.style.width = `${targetValue}%`;
        if (targetValue >= 80) {
            barElement.classList.add('high-efficiency');
        } else {
            barElement.classList.remove('high-efficiency');
        }
    }

    function animateValue(labelElement, targetValue, suffix) {
        if (!labelElement) return;
        let currentVal = parseInt(labelElement.textContent) || 0;
        if (currentVal === targetValue) return;

        let steps = 15;
        let increment = (targetValue - currentVal) / steps;
        let count = 0;

        let interval = setInterval(() => {
            currentVal += increment;
            labelElement.textContent = `${Math.round(currentVal)}${suffix}`;
            count++;
            if (count >= steps) {
                clearInterval(interval);
                labelElement.textContent = `${targetValue}${suffix}`;
            }
        }, 25);
    }

    // Bind Event Listeners to simulator checkboxes
    const inputs = [
        toggleWage, togglePermanency, toggleAuthority, toggleHardware, 
        toggleTraining, toggleTreasury, togglePromotion
    ];
    inputs.forEach(input => {
        if (input) {
            input.addEventListener('change', updateSimulator);
        }
    });

    // Run once on load to show base scores
    updateSimulator();
});
