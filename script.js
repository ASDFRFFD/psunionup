(function () {
  'use strict';

  /* =========================================
     1. HELPER FUNCTIONS
     ========================================= */
  function openInNewTab(url) {
    if (!url) return false;
    window.open(url, '_blank', 'noopener');
  }

  /* =========================================
     2. SERVICE CARDS LOGIC
     ========================================= */
  function initServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    cards.forEach(card => {
      // Accessibility attributes
      if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
      if (!card.getAttribute('role')) card.setAttribute('role', 'button');

      // If card is inside an <a class="service-link">, let the anchor handle navigation — don't override it
      const parentLink = card.closest('a.service-link');
      if (parentLink) return;

      // Only add JS click handler for cards that use data-href (old pattern)
      function onClick(e) {
        if (e) e.preventDefault();
        const url = card.getAttribute('data-href');
        if (!url) {
          alert('Link अभी उपलब्ध नहीं है।');
          return;
        }
        openInNewTab(url);
      }

      function onKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }

      // Remove old listeners to prevent duplicates
      card.removeEventListener('click', onClick);
      card.addEventListener('click', onClick);
      card.addEventListener('keydown', onKey);
    });
  }

  function initSearch() {
    const searchInput = document.getElementById('site-search');
    const clearBtn = document.getElementById('search-clear');
    const searchContainer = document.getElementById('search-container');
    const suggestionsBox = document.getElementById('search-suggestions');
    
    if (!searchInput) return;

    const searchDatabase = [
      { name: "e-District (UP) (ई-डिस्ट्रिक्ट पोर्टल)", type: "Website", url: "https://edistrict.up.gov.in/" },
      { name: "e-Gram Swaraj Portal (ई-ग्राम स्वराज)", type: "Website", url: "https://egramswaraj.gov.in/" },
      { name: "CSC / Sahaj (सीएससी डिजिटल सेवा)", type: "Website", url: "https://digitalseva.csc.gov.in/" },
      { name: "Aadhaar (UIDAI) (आधार सेवा)", type: "Website", url: "https://myaadhaar.uidai.gov.in/" },
      { name: "PM-Kisan Samman Nidhi (पीएम किसान योजना)", type: "Website", url: "https://www.pmkisan.gov.in/" },
      { name: "PFMS Portal (पीएफएमएस सैलरी स्टेटस)", type: "Website", url: "https://pfms.nic.in" },
      { name: "Birth & Death Registration (जन्म मृत्यु प्रमाण पत्र)", type: "Website", url: "https://crsorgi.gov.in" },
      
      { name: "Salary Calculator (सैलरी कैलकुलेटर)", type: "Tool", url: "panchayat-sahayak-salary-calculator.html" },
      { name: "Image Compressor & Resizer (इमेज टूल्स)", type: "Tool", url: "panchayat-sahayak-image-tools.html" },
      { name: "PDF Merge & Compress (पीडीऍफ़ टूल्स)", type: "Tool", url: "panchayat-sahayak-pdf-tools.html" },
      { name: "Auto Letter Generator (ऑटो लेटर जनरेटर)", type: "Tool", url: "panchayat-sahayak-letter-generator.html" },
      { name: "Notice Pad / Letterhead (लेटरहेड जनरेटर)", type: "Tool", url: "panchayat-sahayak-letterhead-generator.html" },
      { name: "Quick List Builder (लिस्ट बिल्डर)", type: "Tool", url: "panchayat-list-builder.html" },
      { name: "Work Register (कार्य रजिस्टर)", type: "Tool", url: "panchayat-sahayak-work-register.html" },
      { name: "Village Profile Builder (विलेज प्रोफाइल)", type: "Tool", url: "panchayat-sahayak-village-profile.html" },
      
      { name: "परिवार रजिस्टर नकल फॉर्म (Family Register Form)", type: "Form", url: "download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D15lneio8p7R3y5nxylvqATFKtm3QynCj2&title=परिवार+रजिस्टर&type=pdf" },
      { name: "स्वघोषित प्रमाण पत्र फॉर्म (Self Declaration Form)", type: "Form", url: "download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D1jPhBkQW-4rg1lJL7kU2DeUuWvqEwIqfY&title=स्वघोषित+प्रमाण+पत्र&type=pdf" },
      { name: "जन्म / मृत्यु प्रमाण पत्र फॉर्म (Birth & Death Form)", type: "Form", url: "panchayat-sahayak-forms-pdfs.html" },
      { name: "पंचायत सहायक अनुबंध प्रारूप (Agreement Form)", type: "Form", url: "download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D1Ljt6LW4b-sL9eGVBsHEScyN0obtTfC6H&title=पंचायत+सहायक+अनुबंध&type=pdf" },
      
      { name: "Panchayat Sahayak Salary Guide 2026", type: "Blog", url: "blog-panchayat-sahayak-salary-2026.html" },
      { name: "Attendance Boycott Protest 2026", type: "Blog", url: "blog-attendance-boycott-2026.html" },
      { name: "Panchayat Sahayak Strike 2026", type: "Blog", url: "blog-panchayat-sahayak-strike-2026.html" },
      { name: "Census Self-Enumeration 2026", type: "Blog", url: "blog-census-self-enumeration-2026.html" },
      { name: "e-Gram Swaraj Data Entry Guide", type: "Blog", url: "blog-egram-swaraj-data-entry.html" }
    ];

    if (searchContainer) {
      searchInput.addEventListener('focus', () => {
        searchContainer.classList.add('focused');
        showSuggestions(searchInput.value);
      });
      searchInput.addEventListener('blur', () => {
        setTimeout(() => {
          searchContainer.classList.remove('focused');
          if (suggestionsBox) suggestionsBox.style.display = 'none';
        }, 200);
      });
    }

    function showSuggestions(query) {
      if (!suggestionsBox) return;
      const cleanQuery = query.toLowerCase().trim();
      if (!cleanQuery) {
        suggestionsBox.style.display = 'none';
        return;
      }

      const matches = searchDatabase.filter(item => 
        item.name.toLowerCase().includes(cleanQuery) || 
        item.type.toLowerCase().includes(cleanQuery)
      ).slice(0, 5);

      if (matches.length === 0) {
        suggestionsBox.innerHTML = `
          <div style="padding: 12px 16px; font-size:12px; color:var(--text-muted); text-align:center;">
            कोई परिणाम नहीं मिला
          </div>
        `;
        suggestionsBox.style.display = 'block';
        return;
      }

      suggestionsBox.innerHTML = matches.map(item => `
        <div class="search-suggestion-item" data-url="${item.url}">
          <span class="search-suggestion-name">${item.name}</span>
          <span class="search-suggestion-type">${item.type}</span>
        </div>
      `).join('');

      suggestionsBox.style.display = 'block';

      // Attach click events
      suggestionsBox.querySelectorAll('.search-suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
          const url = this.getAttribute('data-url');
          if (url) {
            window.location.href = url;
          }
        });
      });
    }

    searchInput.addEventListener('input', function (e) {
      const val = e.target.value.toLowerCase().trim();
      
      if (clearBtn) {
        clearBtn.style.display = val ? 'block' : 'none';
      }

      showSuggestions(val);
      
      // 1. Filter Services (Government Websites)
      const services = document.querySelectorAll('.service-card');
      let serviceVisibleCount = 0;
      services.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matches = text.includes(val);
        const link = card.closest('.service-link');
        if (link) {
          link.style.display = matches ? 'block' : 'none';
        } else {
          card.style.display = matches ? 'flex' : 'none';
        }
        if (matches) serviceVisibleCount++;
      });
      
      // Toggle parent section and header visibility
      const servicesSection = document.getElementById('services');
      const servicesHeader = servicesSection ? servicesSection.previousElementSibling : null;
      if (servicesSection) {
        servicesSection.style.display = serviceVisibleCount > 0 ? 'grid' : 'none';
      }
      if (servicesHeader) {
        servicesHeader.style.display = serviceVisibleCount > 0 ? 'block' : 'none';
      }

      // 2. Filter Tools
      const tools = document.querySelectorAll('.ptool-card');
      let toolsVisibleCount = 0;
      tools.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matches = text.includes(val);
        const link = card.closest('a');
        if (link) {
          link.style.display = matches ? 'block' : 'none';
        } else {
          card.style.display = matches ? 'flex' : 'none';
        }
        if (matches) toolsVisibleCount++;
      });
      const toolsSection = document.querySelector('.panel[aria-labelledby="tools-title"]');
      if (toolsSection) {
        toolsSection.style.display = toolsVisibleCount > 0 ? 'block' : 'none';
      }

      // 3. Filter Forms
      const forms = document.querySelectorAll('.form-item');
      let formsVisibleCount = 0;
      forms.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(val);
        item.style.display = matches ? 'flex' : 'none';
        if (matches) formsVisibleCount++;
      });
      const formsSection = document.getElementById('forms');
      if (formsSection) {
        formsSection.style.display = formsVisibleCount > 0 ? 'block' : 'none';
      }

      // 4. Filter Blogs
      const blogs = document.querySelectorAll('#home-latest-blogs a');
      let blogsVisibleCount = 0;
      blogs.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(val);
        item.style.display = matches ? 'flex' : 'none';
        if (matches) blogsVisibleCount++;
      });
      const blogsSection = document.querySelector('.panel[aria-labelledby="blog-section-title"]');
      if (blogsSection) {
        blogsSection.style.display = blogsVisibleCount > 0 ? 'block' : 'none';
      }

      // 5. Filter Orders / Notices Ticker
      const notices = document.querySelectorAll('#home-ticker-inner > div');
      let noticesVisibleCount = 0;
      notices.forEach(item => {
        const text = item.textContent.toLowerCase();
        const matches = text.includes(val);
        item.style.display = matches ? 'flex' : 'none';
        if (matches) noticesVisibleCount++;
      });
      const noticesSection = document.getElementById('notices');
      if (noticesSection) {
        noticesSection.style.display = noticesVisibleCount > 0 ? 'block' : 'none';
      }
    });

    // Clear Button Logic
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      });
    }
  }

  /* =========================================
     4. VIDEO MODAL & 3D TILT
     ========================================= */
  function initVideoModal() {
    const modal = document.getElementById('videoModal');
    const iframe = document.getElementById('modalIframe');
    const closeBtn = document.getElementById('modalClose');

    if (!modal) return;

    function closeVideo() {
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      iframe.src = ''; // Stop video
    }

    if (closeBtn) closeBtn.addEventListener('click', closeVideo);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeVideo();
    });

    // Open Video on Click
    document.querySelectorAll('.train-card-inner').forEach(card => {
      card.addEventListener('click', function () {
        const vid = this.getAttribute('data-video');
        if (vid) {
          iframe.src = 'https://www.youtube-nocookie.com/embed/' + vid + '?autoplay=1';
          modal.classList.add('show');
          modal.setAttribute('aria-hidden', 'false');
        }
      });

      // 3D Tilt Effect
      card.addEventListener('mousemove', function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        // Sensitivity control
        const rotateY = (x - 0.5) * 10;
        const rotateX = (0.5 - y) * 10;
        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* =========================================
     5. PDF / NOTICE HANDLERS (Global)
     ========================================= */
  // Window functions for onclick="" in HTML
  window.openNotice = function (btn) {
    const notice = btn.closest('.notice');
    const link = notice ? notice.getAttribute('data-drive') : null;
    
    if (link) {
      window.open(link, '_blank');
    } else {
      alert("यह नोटिस अभी अपलोड नहीं हुआ है।");
    }
  };

  window.openForm = function (btn) {
    if (btn) {
      const container = btn.closest('.form-item') || btn.parentElement;
      const nameEl = container ? container.querySelector('.name, div') : null;
      const name = nameEl ? nameEl.textContent.trim() : '';
      if (name.includes('परिवार')) {
        window.location.href = 'download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D15lneio8p7R3y5nxylvqATFKtm3QynCj2&title=' + encodeURIComponent(name) + '&type=pdf';
        return;
      } else if (name.includes('स्वघोषित')) {
        window.location.href = 'download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D1jPhBkQW-4rg1lJL7kU2DeUuWvqEwIqfY&title=' + encodeURIComponent(name) + '&type=pdf';
        return;
      } else if (name.includes('अनुबंध')) {
        window.location.href = 'download.html?file=https://drive.google.com/uc?export%3Ddownload%26id%3D1Ljt6LW4b-sL9eGVBsHEScyN0obtTfC6H&title=' + encodeURIComponent(name) + '&type=pdf';
        return;
      }
    }
    window.location.href = 'panchayat-sahayak-forms-pdfs.html';
  };

  // PDF Modal Close
  const pdfClose = document.getElementById('pdfModalClose');
  if (pdfClose) {
    pdfClose.addEventListener('click', () => {
      document.getElementById('pdfModal').style.display = 'none';
    });
  }

  /* =========================================
     INITIALIZE ALL
     ========================================= */
  document.addEventListener('DOMContentLoaded', () => {
    initServiceCards();
    initSearch();
    initVideoModal();
  });

})();
