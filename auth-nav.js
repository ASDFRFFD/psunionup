// auth-nav.js
// Handles lazy-loaded Firebase authentication from the global navbar dropdown

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    let firebaseLoaded = false;
    let isLoading = false;
    let authReady = false;

    const emailInput = document.getElementById('gNavEmail');
    const form = document.getElementById('globalNavLoginForm');
    const btn = document.getElementById('gNavBtn');
    const err = document.getElementById('gNavErr');

    if (form) {
        // Trigger SDK Load on interaction
        const triggerLoad = async () => {
            if (firebaseLoaded || isLoading) return;
            isLoading = true;
            try {
                await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
                await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js");
                
                const firebaseConfig = {
                    apiKey: "AIzaSyACe8pL0vqD_2NqzhTNOi0VoTyJaYVTkbA",
                    authDomain: "panchayat-sahahayk-portal-up.firebaseapp.com",
                    projectId: "panchayat-sahahayk-portal-up",
                    storageBucket: "panchayat-sahahayk-portal-up.firebasestorage.app",
                    messagingSenderId: "709368114724",
                    appId: "1:709368114724:web:208c828040f499060e72b1"
                };
                if (!firebase.apps.length) {
                    firebase.initializeApp(firebaseConfig);
                }
                firebaseLoaded = true;
                authReady = true;
            } catch(e) {
                console.error("Firebase Secure Load Error", e);
            }
        };

        if (emailInput) emailInput.addEventListener('focus', triggerLoad);
        form.addEventListener('mouseenter', triggerLoad);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (err) err.style.display = "none";
            if (btn) {
                btn.innerText = "Verifying...";
                btn.disabled = true;
            }

            if (!authReady) {
                 await triggerLoad();
                 await new Promise(r => setTimeout(r, 600)); // grace period
            }

            if (typeof firebase === 'undefined' || !firebase.auth) {
                if (err) {
                    err.innerText = "⚠️ Connection to auth server failed. Check network.";
                    err.style.display = "block";
                }
                if (btn) {
                    btn.innerText = "Sign In";
                    btn.disabled = false;
                }
                return;
            }
            
            const passInput = document.getElementById('gNavPass');
            const passVal = passInput ? passInput.value : '';

            firebase.auth().signInWithEmailAndPassword(emailInput ? emailInput.value : '', passVal)
                .then(() => {
                    if (btn) {
                        btn.innerText = "✅ Proceeding...";
                        btn.style.background = "#16a34a"; // Green
                    }
                    setTimeout(() => {
                        window.location.href = "admin-dashboard.html";
                    }, 500);
                })
                .catch(error => {
                    let msg = "❌ गलत Email/Password";
                    if (error.code === 'auth/too-many-requests') msg = "⚠️ Too many attempts.";
                    if (err) {
                        err.innerText = msg;
                        err.style.display = "block";
                    }
                    if (btn) {
                        btn.innerText = "Sign In";
                        btn.disabled = false;
                    }
                });
        });
    }

    // -------------------------------------------------------------
    // Dynamic Mobile Navigation Controller (Hamburger & Accordion)
    // -------------------------------------------------------------
    const mainNav = document.querySelector('nav.main-nav');
    if (mainNav) {
        const navInner = mainNav.querySelector('.nav-inner');

        if (navInner && !mainNav.querySelector('.mobile-nav-toggle-bar')) {
            const toggleBar = document.createElement('div');
            toggleBar.className = 'mobile-nav-toggle-bar';
            toggleBar.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:16px;">📋</span>
                    <span>नेविगेशन (Menu)</span>
                </div>
                <button type="button" class="mobile-menu-btn" aria-label="Toggle Navigation Menu">
                    <span class="menu-icon">☰</span>
                    <span class="menu-text">मेनू</span>
                </button>
            `;
            mainNav.insertBefore(toggleBar, navInner);

            let backdrop = document.querySelector('.mobile-nav-backdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'mobile-nav-backdrop';
                document.body.appendChild(backdrop);
            }

            const menuBtn = toggleBar.querySelector('.mobile-menu-btn');
            const menuIcon = toggleBar.querySelector('.menu-icon');
            const menuText = toggleBar.querySelector('.menu-text');

            const toggleMobileMenu = (forceClose = false) => {
                const isOpen = forceClose ? false : !navInner.classList.contains('mobile-active');
                if (isOpen) {
                    navInner.classList.add('mobile-active');
                    backdrop.classList.add('active');
                    if (menuIcon) menuIcon.textContent = '✕';
                    if (menuText) menuText.textContent = 'बंद करें';
                } else {
                    navInner.classList.remove('mobile-active');
                    backdrop.classList.remove('active');
                    if (menuIcon) menuIcon.textContent = '☰';
                    if (menuText) menuText.textContent = 'मेनू';
                }
            };

            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMobileMenu();
            });

            backdrop.addEventListener('click', () => toggleMobileMenu(true));
        }

        // Accordion Support for Sub-menus on Mobile
        const navItems = mainNav.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            const dropdown = item.querySelector('.dropdown');

            if (link && dropdown) {
                link.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        const isOpen = item.classList.contains('open');

                        // Close other nav items
                        navItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('open');
                            }
                        });

                        // Toggle current
                        if (isOpen) {
                            item.classList.remove('open');
                        } else {
                            item.classList.add('open');
                        }
                    }
                });
            }
        });

        // Auto-close menu when clicking a direct link inside dropdown
        const dropdownLinks = mainNav.querySelectorAll('.dropdown a');
        dropdownLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    if (navInner) navInner.classList.remove('mobile-active');
                    const backdrop = document.querySelector('.mobile-nav-backdrop');
                    if (backdrop) backdrop.classList.remove('active');
                    const menuIcon = mainNav.querySelector('.menu-icon');
                    const menuText = mainNav.querySelector('.menu-text');
                    if (menuIcon) menuIcon.textContent = '☰';
                    if (menuText) menuText.textContent = 'मेनू';
                }
            });
        });
    }
});

