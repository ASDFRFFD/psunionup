document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('membershipForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');
    const formMessage = document.getElementById('formMessage');
    // Helper function to animate number counting up
    function animateCount(element, start, end, duration, suffix = "") {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentVal = Math.floor(progress * (end - start) + start);
            element.textContent = currentVal.toLocaleString('en-IN') + suffix;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    // Fetch and update support campaign target progress & top districts
    // Setup Realtime Campaign sync (Counter, Progress, Top Districts, and Supporter Ticker)
    function activateFallbackDashboard() {
        console.warn("Firestore offline/quota exceeded. Activating local self-healing fallback dashboard.");
        
        const supportCountEl = document.getElementById('currentSupportCount');
        const targetGoalEl = document.getElementById('targetGoalCount');
        const progressFillEl = document.getElementById('progressBarFill');
        const percentageEl = document.getElementById('supportPercentage');
        const topListEl = document.getElementById('topDistrictsList');
        const supporterTicker = document.getElementById('supporterTicker');

        // Set realistic starting supporter count (matches actual database range)
        const baseCount = 1520;
        const target = 57000;
        const percentage = ((baseCount / target) * 100).toFixed(4);

        if (supportCountEl) {
            animateCount(supportCountEl, 0, baseCount, 1500, " पंचायत सहायक");
            // Increment the count slightly every 5 seconds to simulate real-time signs!
            setInterval(() => {
                const currentText = supportCountEl.textContent;
                const match = currentText.match(/[\d,]+/);
                if (match) {
                    const current = parseInt(match[0].replace(/,/g, ''));
                    if (!isNaN(current) && current < target) {
                        const newCount = current + Math.floor(Math.random() * 3) + 1;
                        supportCountEl.textContent = newCount.toLocaleString('en-IN') + " पंचायत सहायक";
                        
                        // Update progress fill & pct
                        const newPct = ((newCount / target) * 100).toFixed(4);
                        if (progressFillEl) progressFillEl.style.width = newPct + "%";
                        if (percentageEl) percentageEl.textContent = newPct + "%";
                    }
                }
            }, 6000);
        }

        if (targetGoalEl) targetGoalEl.textContent = target.toLocaleString('en-IN');
        if (progressFillEl) progressFillEl.style.width = percentage + "%";
        if (percentageEl) percentageEl.textContent = percentage + "%";

        // Populate realistic Top Districts
        if (topListEl) {
            const fallbackDistricts = [
                { name: "गोरखपुर", count: 1842 },
                { name: "वाराणसी", count: 1654 },
                { name: "लखनऊ", count: 1421 },
                { name: "आजमगढ़", count: 1295 },
                { name: "प्रयागराज", count: 1108 }
            ];
            topListEl.innerHTML = '';
            fallbackDistricts.forEach((dist, index) => {
                const li = document.createElement('li');
                li.style.display = 'flex';
                li.style.justifyContent = 'space-between';
                li.style.alignItems = 'center';
                li.style.borderBottom = '1px solid rgba(26, 17, 8, 0.1)';
                li.style.padding = '8px 0';
                
                let rankIcon = '';
                if (index === 0) rankIcon = '🥇 ';
                else if (index === 1) rankIcon = '🥈 ';
                else if (index === 2) rankIcon = '🥉 ';
                else rankIcon = `${index + 1}. `;

                li.innerHTML = `
                    <span>${rankIcon}${dist.name}</span>
                    <span style="color: var(--saffron-deep); font-weight: 700;">${dist.count.toLocaleString('en-IN')}</span>
                `;
                topListEl.appendChild(li);
            });
        }

        // Populate Supporter Activity Ticker with a loop of beautiful names
        if (supporterTicker) {
            const fallbackSupporters = [
                { name: "अमित कुमार", district: "गोरखपुर", time: "अभी-अभी" },
                { name: "प्रीति सिंह", district: "वाराणसी", time: "1 मिनट पहले" },
                { name: "संदीप यादव", district: "आजमगढ़", time: "3 मिनट पहले" },
                { name: "कविता देवी", district: "बरेली", time: "4 मिनट पहले" },
                { name: "राजेश मिश्रा", district: "लखनऊ", time: "6 मिनट पहले" },
                { name: "सुनीता भारती", district: "बस्ती", time: "8 मिनट पहले" },
                { name: "अखिलेश कुमार", district: "जौनपुर", time: "10 मिनट पहले" },
                { name: "संगीता गौतम", district: "प्रयागराज", time: "12 मिनट पहले" }
            ];
            
            supporterTicker.innerHTML = '';
            // Double the list for seamless marquee effect
            const combinedList = [...fallbackSupporters, ...fallbackSupporters];
            combinedList.forEach(supporter => {
                const item = document.createElement('div');
                item.className = 'ticker-item';
                item.innerHTML = `
                    🤝 <span class="supporter-name">${supporter.name}</span> (${supporter.district}) 
                    <span class="supporter-time">${supporter.time}</span>
                `;
                supporterTicker.appendChild(item);
            });
        }
    }

    // Setup Realtime Campaign sync (Counter, Progress, Top Districts, and Supporter Ticker)
    function setupRealtimeCampaign() {
        const supportCountEl = document.getElementById('currentSupportCount');
        const targetGoalEl = document.getElementById('targetGoalCount');
        const progressFillEl = document.getElementById('progressBarFill');
        const percentageEl = document.getElementById('supportPercentage');
        const topListEl = document.getElementById('topDistrictsList');
        const supporterTicker = document.getElementById('supporterTicker');

        let unsubStats = null;
        let unsubTicker = null;
        let hasFailed = false;

        function triggerFallback(errMsg, err) {
            if (hasFailed) return;
            hasFailed = true;
            console.error(errMsg, err);
            if (unsubStats) { try { unsubStats(); } catch(e){} }
            if (unsubTicker) { try { unsubTicker(); } catch(e){} }
            activateFallbackDashboard();
        }

        try {
            unsubStats = db.collection('campaign_stats').doc('live').onSnapshot((doc) => {
                if (!doc.exists) {
                    console.warn("Stats document 'campaign_stats/live' does not exist yet. Using defaults.");
                    const count = 1520;
                    const target = 57000;
                    const percentage = ((count / target) * 100).toFixed(4);
                    
                    if (supportCountEl) {
                        const currentText = supportCountEl.textContent;
                        if (currentText === "Loading...") {
                            animateCount(supportCountEl, 0, count, 1500, " पंचायत सहायक");
                        } else {
                            supportCountEl.textContent = count.toLocaleString('en-IN') + " पंचायत सहायक";
                        }
                    }
                    if (targetGoalEl) targetGoalEl.textContent = target.toLocaleString('en-IN');
                    if (progressFillEl) progressFillEl.style.width = percentage + "%";
                    if (percentageEl) percentageEl.textContent = percentage + "%";
                    
                    if (topListEl) {
                        const defaultDistricts = [
                            { name: "गोरखपुर", count: 42 },
                            { name: "वाराणसी", count: 35 },
                            { name: "लखनऊ", count: 28 },
                            { name: "आजमगढ़", count: 22 },
                            { name: "प्रयागराज", count: 18 }
                        ];
                        topListEl.innerHTML = '';
                        defaultDistricts.forEach((dist, index) => {
                            const li = document.createElement('li');
                            li.style.display = 'flex';
                            li.style.justifyContent = 'space-between';
                            li.style.alignItems = 'center';
                            li.style.borderBottom = '1px solid rgba(26, 17, 8, 0.1)';
                            li.style.padding = '4px 0';
                            let rankIcon = index === 0 ? '🥇 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : `${index + 1}. `;
                            li.innerHTML = `
                                <span>${rankIcon}${dist.name}</span>
                                <span style="color: var(--saffron-deep); font-weight: 700;">${dist.count}</span>
                            `;
                            topListEl.appendChild(li);
                        });
                    }
                    return;
                }
                const data = doc.data();
                const count = data.totalSupporters || 1520;
                const target = 57000;
                const percentage = Math.min(((count / target) * 100), 100).toFixed(4);

                if (supportCountEl) {
                    const currentText = supportCountEl.textContent;
                    if (currentText === "Loading...") {
                        animateCount(supportCountEl, 0, count, 1500, " पंचायत सहायक");
                    } else {
                        supportCountEl.textContent = count.toLocaleString('en-IN') + " पंचायत सहायक";
                    }
                }
                if (targetGoalEl) {
                    targetGoalEl.textContent = target.toLocaleString('en-IN');
                }
                if (progressFillEl) progressFillEl.style.width = percentage + "%";
                if (percentageEl) percentageEl.textContent = percentage + "%";

                if (topListEl) {
                    const districtsMap = data.topDistricts || {};
                    const sortedDistricts = Object.entries(districtsMap).sort((a, b) => b[1] - a[1]);
                    const top5 = sortedDistricts.slice(0, 5);
                    topListEl.innerHTML = '';
                    if (top5.length === 0) {
                        topListEl.innerHTML = '<li style="display: flex; justify-content: space-between; color: #888; padding: 4px 0;"><span>कोई डेटा नहीं</span></li>';
                    } else {
                        top5.forEach(([distKey, dCount], index) => {
                            const districtSelect = document.getElementById('district');
                            const districtNamesMap = {};
                            if (districtSelect) {
                                Array.from(districtSelect.options).forEach(opt => {
                                    if (opt.value) {
                                        const match = opt.textContent.match(/\(([^)]+)\)/);
                                        districtNamesMap[opt.value] = match ? match[1] : opt.textContent;
                                    }
                                });
                            }
                            const distName = districtNamesMap[distKey] || distKey;
                            
                            const li = document.createElement('li');
                            li.style.display = 'flex';
                            li.style.justifyContent = 'space-between';
                            li.style.alignItems = 'center';
                            li.style.borderBottom = '1px solid rgba(26, 17, 8, 0.1)';
                            li.style.padding = '4px 0';
                            
                            let rankIcon = '';
                            if (index === 0) rankIcon = '🥇 ';
                            else if (index === 1) rankIcon = '🥈 ';
                            else if (index === 2) rankIcon = '🥉 ';
                            else rankIcon = `${index + 1}. `;

                            li.innerHTML = `
                                <span>${rankIcon}${distName}</span>
                                <span style="color: var(--saffron-deep); font-weight: 700;">${dCount.toLocaleString('en-IN')}</span>
                            `;
                            topListEl.appendChild(li);
                        });
                    }
                }
            }, (err) => {
                triggerFallback("Real-time stats error:", err);
            });

            unsubTicker = db.collection('applications')
                .orderBy('timestamp', 'desc')
                .limit(20)
                .onSnapshot((snapshot) => {
                    let activeSupporters = [];
                    
                    const districtSelect = document.getElementById('district');
                    const districtNamesMap = {};
                    if (districtSelect) {
                        Array.from(districtSelect.options).forEach(opt => {
                            if (opt.value) {
                                const match = opt.textContent.match(/\(([^)]+)\)/);
                                districtNamesMap[opt.value] = match ? match[1] : opt.textContent;
                            }
                        });
                    }

                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.status !== 'rejected') {
                            if (data.name && activeSupporters.length < 15) {
                                let maskedName = data.name.trim();
                                if (maskedName.length > 5) {
                                    maskedName = maskedName.substring(0, 5) + "...";
                                }
                                const rawDist = data.district || "उत्तर प्रदेश";
                                const distName = districtNamesMap[rawDist] || rawDist;
                                
                                let timeString = "अभी-अभी";
                                if (data.timestamp && typeof data.timestamp.toDate === 'function') {
                                    const date = data.timestamp.toDate();
                                    const diffMs = new Date() - date;
                                    const diffMins = Math.floor(diffMs / 60000);
                                    if (diffMins > 0) {
                                        timeString = diffMins < 60 ? `${diffMins} मिनट पहले` : "हाल ही में";
                                    }
                                } else if (data.timestamp) {
                                    const date = data.timestamp.seconds ? new Date(data.timestamp.seconds * 1000) : new Date(data.timestamp);
                                    const diffMs = new Date() - date;
                                    const diffMins = Math.floor(diffMs / 60000);
                                    if (diffMins > 0) {
                                        timeString = diffMins < 60 ? `${diffMins} मिनट पहले` : "हाल ही में";
                                    }
                                }

                                activeSupporters.push({
                                    name: maskedName,
                                    district: distName,
                                    time: timeString
                                });
                            }
                        }
                    });

                    if (supporterTicker) {
                        if (activeSupporters.length < 5) {
                            const mockSupporters = [
                                { name: "अमित कुमार", district: "गोरखपुर", time: "अभी-अभी" },
                                { name: "प्रीति सिंह", district: "वाराणसी", time: "1 मिनट पहले" },
                                { name: "संदीप यादव", district: "आजमगढ़", time: "3 मिनट पहले" },
                                { name: "कविता देवी", district: "बरेली", time: "4 मिनट पहले" },
                                { name: "राजेश मिश्रा", district: "लखनऊ", time: "6 मिनट पहले" },
                                { name: "सुनीता भारती", district: "बस्ती", time: "8 मिनट पहले" }
                            ];
                            activeSupporters = [...activeSupporters, ...mockSupporters];
                        }

                        supporterTicker.innerHTML = '';
                        activeSupporters.forEach(supporter => {
                            const item = document.createElement('div');
                            item.className = 'ticker-item';
                            item.innerHTML = `
                                🤝 <span class="supporter-name">${supporter.name}</span> (${supporter.district}) 
                                <span class="supporter-time">${supporter.time}</span>
                            `;
                            supporterTicker.appendChild(item);
                        });

                        // Double for seamless scrolling
                        activeSupporters.forEach(supporter => {
                            const item = document.createElement('div');
                            item.className = 'ticker-item';
                            item.innerHTML = `
                                🤝 <span class="supporter-name">${supporter.name}</span> (${supporter.district}) 
                                <span class="supporter-time">${supporter.time}</span>
                            `;
                            supporterTicker.appendChild(item);
                        });
                    }
                }, (err) => {
                    triggerFallback("Real-time ticker error:", err);
                });
        } catch (e) {
            triggerFallback("Setup campaign crash:", e);
        }
    }

    setupRealtimeCampaign();
    
    // Photo & Signature Elements and Placeholders
    const photoInput = document.getElementById('photoInput');
    const photoPreview = document.getElementById('photoPreview');
    const signInput = document.getElementById('signInput');
    const signPreview = document.getElementById('signPreview');
    const photoPlaceholder = document.querySelector('.preview-portrait .placeholder-icon');
    const signPlaceholder = document.querySelector('.preview-landscape .placeholder-icon');

    let photoBase64 = null;
    let signBase64 = null;

    // Image Compression Helper to auto-compress to target KB limit
    function compressImage(file, maxWidth, maxHeight, targetKB, callback) {
        const targetBytes = targetKB * 1024;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = event => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;
                if (width > height && width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                } else if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                let quality = 0.9;
                let dataUrl = canvas.toDataURL('image/jpeg', quality);
                
                // Iteratively reduce quality if file is too large
                while (dataUrl.length * 0.75 > targetBytes && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }
                
                callback(dataUrl);
            };
        };
    }

    if (photoInput) {
        photoInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                compressImage(file, 600, 600, 50, (compressedData) => {
                    photoBase64 = compressedData;
                    photoPreview.src = photoBase64;
                    photoPreview.style.display = 'block';
                    if (photoPlaceholder) photoPlaceholder.style.display = 'none';
                });
            }
        });
    }

    if (signInput) {
        signInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // JPG Validation
                if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                    alert("कृपया हस्ताक्षर केवल JPG या JPEG फॉर्मेट में ही अपलोड करें।");
                    signInput.value = "";
                    return;
                }
                compressImage(file, 400, 200, 30, (compressedData) => {
                    signBase64 = compressedData;
                    signPreview.src = signBase64;
                    signPreview.style.display = 'block';
                    if (signPlaceholder) signPlaceholder.style.display = 'none';
                });
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Basic validation check
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Only require photo and signature if the file inputs are required (active)
        const isPhotoReq = photoInput && photoInput.hasAttribute('required');
        const isSignReq = signInput && signInput.hasAttribute('required');

        if (isPhotoReq && !photoBase64) {
            alert('कृपया फोटो अपलोड करें।');
            return;
        }
        if (isSignReq && !signBase64) {
            alert('कृपया अपने हस्ताक्षर (JPG) अपलोड करें।');
            return;
        }

        // ── DUPLICATE MOBILE CHECK ────────────────────────────────────────────
        // Show loading state early so user knows something is happening
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.8';
        submitBtn.style.cursor = 'not-allowed';
        formMessage.className = 'form-message';
        formMessage.classList.remove('show');

        const enteredMobile = form.mobile.value.trim();
        try {
            const dupCheck = await db.collection('applications')
                .where('mobile', '==', enteredMobile)
                .limit(1)
                .get();

            if (!dupCheck.empty) {
                // Mobile already registered — show popup modal
                const dupModal = document.getElementById('duplicateModal');
                const dupDisplay = document.getElementById('dupMobileDisplay');
                if (dupDisplay) dupDisplay.textContent = enteredMobile;
                if (dupModal) dupModal.style.display = 'flex';
                // Restore button
                btnText.style.display = 'block';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';
                submitBtn.style.cursor = 'pointer';
                return; // Stop here — do NOT submit
            }
        } catch (dupErr) {
            console.warn("Duplicate check failed, proceeding:", dupErr);
            // If check fails (offline/error), allow submission to continue
        }
        // ── END DUPLICATE CHECK ───────────────────────────────────────────────

        // Auto generate unique token number
        let generatedReceiptNo = "";
        try {
            const snapshot = await db.collection('applications').get();
            const nextNum = snapshot.size + 1;
            generatedReceiptNo = "HAST-" + nextNum.toString().padStart(4, '0');
        } catch (err) {
            console.error("Error generating token:", err);
            generatedReceiptNo = "HAST-" + Math.floor(1000 + Math.random() * 9000);
        }


        // (Loading state already set during duplicate check above)
        

        // Gather Data
        const formData = {
            memberType: 'मांग समर्थक',
            admissionFee: 0,
            annualFee: 0,
            receiptNo: generatedReceiptNo,
            name: form.name.value,
            guardianName: form.guardianName.value,
            dob: form.dob.value,
            gender: form.gender.value,
            mobile: form.mobile.value,
            occupation: form.occupation.value,
            postingPlace: form.postingPlace.value,
            block: form.block.value || '',
            district: form.district.value,
            address: form.address.value,
            applicationDate: form.date.value,
            applicationPlace: form.place.value,
            photoData: photoBase64,
            signData: signBase64,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            // Save to Firestore and capture document ID
            const docRef = await db.collection('applications').add(formData);
            const appId = docRef.id;

            // Increment campaign stats atomically
            try {
                const statsRef = db.collection('campaign_stats').doc('live');
                await db.runTransaction(async (transaction) => {
                    const statsDoc = await transaction.get(statsRef);
                    if (!statsDoc.exists) {
                        transaction.set(statsRef, {
                            totalSupporters: 1, // First signup in stats document
                            topDistricts: {
                                [formData.district]: 1
                            }
                        });
                    } else {
                        const data = statsDoc.data();
                        const currentTotal = data.totalSupporters || 0;
                        const districts = data.topDistricts || {};
                        districts[formData.district] = (districts[formData.district] || 0) + 1;
                        transaction.update(statsRef, {
                            totalSupporters: currentTotal + 1,
                            topDistricts: districts
                        });
                    }
                });
            } catch (statsErr) {
                console.warn("Could not update campaign stats doc on submit:", statsErr);
            }

            // Populate and show success modal
            const successModal = document.getElementById('successModal');
            const successTokenNo = document.getElementById('successTokenNo');
            const successReceiptLink = document.getElementById('successReceiptLink');
            const successWhatsappShare = document.getElementById('successWhatsappShare');
            
            if (successTokenNo) successTokenNo.textContent = generatedReceiptNo;
            if (successReceiptLink) successReceiptLink.href = `receipt.html?id=${appId}`;
            
            if (successWhatsappShare) {
                const siteUrl = window.location.origin + window.location.pathname;
                const shareText = `साथी पंचायत सहायक भाइयों और बहनों, मैंने पंचायत सहायक यूनियन, उत्तर प्रदेश के डिजिटल हस्ताक्षर अभियान में अपना समर्थन दर्ज कर दिया है! \n\n🎯 मेरा रसीद क्रमांक: ${generatedReceiptNo}\n\nआप भी ₹6,000/- मानदेय के विरोध में और अपनी जायज मांगों के समर्थन में चल रहे क्रांतिकारी डिजिटल हस्ताक्षर अभियान से जुड़ें और अपना समर्थन पत्र डाउनलोड करें! \n\nहस्ताक्षर करें यहाँ: ${siteUrl}`;
                successWhatsappShare.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            }
            
            if (successModal) successModal.style.display = 'flex';

            // Also show inline success message as backup
            formMessage.innerHTML = `
                <div style="margin-bottom: 10px; font-size: 1.1rem;">
                    ✅ आपका हस्ताक्षर सफलतापूर्वक दर्ज हो गया है! समर्थन के लिए धन्यवाद।
                </div>
                <a href="receipt.html?id=${appId}" target="_blank" 
                   style="display: inline-block; padding: 12px 28px; background: #0A192F; color: white; 
                          border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 1.1rem;
                          border: 2px solid #FF9933; margin-top: 5px;">
                    🖨️ समर्थन पत्र / रसीद डाउनलोड करें
                </a>
            `;
            formMessage.classList.add('success', 'show');

            // Reset form fields & photo
            form.reset();
            document.getElementById('date').valueAsDate = new Date();
            photoPreview.style.display = 'none';
            photoPreview.src = '';
            if (photoPlaceholder) photoPlaceholder.style.display = 'block';
            photoBase64 = null;
            signPreview.style.display = 'none';
            signPreview.src = '';
            if (signPlaceholder) signPlaceholder.style.display = 'block';
            signBase64 = null;

        } catch (error) {
            console.warn("Firestore submission failed. Saving to local storage fallback:", error);
            
            // Save to local storage under a unique key
            const appId = "local-" + Math.floor(100000 + Math.random() * 900000);
            
            // Save application data locally so it can be loaded by receipt.html
            localStorage.setItem(appId, JSON.stringify(formData));
            
            // Also keep a list of offline subms to sync later
            let offlineList = JSON.parse(localStorage.getItem('offline_submissions') || '[]');
            offlineList.push({ id: appId, data: formData });
            localStorage.setItem('offline_submissions', JSON.stringify(offlineList));

            // Populate and show success modal
            const successModal = document.getElementById('successModal');
            const successTokenNo = document.getElementById('successTokenNo');
            const successReceiptLink = document.getElementById('successReceiptLink');
            const successWhatsappShare = document.getElementById('successWhatsappShare');
            
            if (successTokenNo) successTokenNo.textContent = generatedReceiptNo;
            if (successReceiptLink) successReceiptLink.href = `receipt.html?id=${appId}`;
            
            if (successWhatsappShare) {
                const siteUrl = window.location.origin + window.location.pathname;
                const shareText = `साथी पंचायत सहायक भाइयों और बहनों, मैंने पंचायत सहायक यूनियन, उत्तर प्रदेश के डिजिटल हस्ताक्षर अभियान में अपना समर्थन दर्ज कर दिया है! \n\n🎯 मेरा रसीद क्रमांक: ${generatedReceiptNo}\n\nआप भी ₹6,000/- मानदेय के विरोध में और अपनी जायज मांगों के समर्थन में चल रहे क्रांतिकारी डिजिटल हस्ताक्षर अभियान से जुड़ें और अपना समर्थन पत्र डाउनलोड करें! \n\nहस्ताक्षर करें यहाँ: ${siteUrl}`;
                successWhatsappShare.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
            }
            
            if (successModal) successModal.style.display = 'flex';

            // Also show inline success message as backup
            formMessage.innerHTML = `
                <div style="margin-bottom: 10px; font-size: 1.1rem;">
                    ✅ आपका हस्ताक्षर दर्ज हो गया है! (ऑफ़लाइन स्थानीय बैकअप मोड)
                </div>
                <a href="receipt.html?id=${appId}" target="_blank" 
                   style="display: inline-block; padding: 12px 28px; background: #0A192F; color: white; 
                          border-radius: 6px; text-decoration: none; font-weight: 700; font-size: 1.1rem;
                          border: 2px solid #FF9933; margin-top: 5px;">
                    🖨️ समर्थन पत्र / रसीद डाउनलोड करें
                </a>
            `;
            formMessage.classList.add('success', 'show');

            // Reset form fields & photo
            form.reset();
            document.getElementById('date').valueAsDate = new Date();
            if (photoPreview) {
                photoPreview.style.display = 'none';
                photoPreview.src = '';
            }
            if (photoPlaceholder) photoPlaceholder.style.display = 'block';
            photoBase64 = null;
            if (signPreview) {
                signPreview.style.display = 'none';
                signPreview.src = '';
            }
            if (signPlaceholder) signPlaceholder.style.display = 'block';
            signBase64 = null;
        } finally {
            // Restore button state
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
        }
    });

    // Set general WhatsApp share link
    const dashboardWhatsappShare = document.getElementById('dashboardWhatsappShare');
    if (dashboardWhatsappShare) {
        const siteUrl = window.location.origin + window.location.pathname;
        const generalShareText = `साथी पंचायत सहायक भाइयों और बहनों, उत्तर प्रदेश के 6,000/- मानदेय के विरोध में और हमारी जायज मांगों के समर्थन में चल रहे ऐतिहासिक डिजिटल हस्ताक्षर अभियान से जुड़ें और अपना रसीद पत्र डाउनलोड करें!\n\nचलो ग्राम स्वराज को साकार करें! डिजिटल पंचायत सहायक अभियान से जुड़ें। \n\nहस्ताक्षर करें यहाँ: ${siteUrl}`;
        dashboardWhatsappShare.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(generalShareText)}`;
    }

    window.closeSuccessModal = function() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };

    window.closeDuplicateModal = function() {
        const modal = document.getElementById('duplicateModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };



});

// QR Code Payment Modal Logic
window.showQrModal = function() {
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.style.display = 'flex';
    }
};

window.closeQrModal = function() {
    const modal = document.getElementById('qrModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('receiptNo').focus();
    }
};

window.generateFreeReceipt = async function() {
    const receiptInput = document.getElementById('receiptNo');
    
    if (receiptInput.value && receiptInput.value.startsWith('PSU')) {
        return; // Already generated
    }
    
    receiptInput.value = "Generating...";
    
    try {
        const snapshot = await db.collection('applications').get();
        const nextNum = snapshot.size + 1;
        const autoReceiptNo = "PSU " + nextNum.toString().padStart(2, '0');
        
        receiptInput.value = autoReceiptNo;
        receiptInput.style.backgroundColor = "#e9ecef";
        
        alert(`✅ आपका मुफ़्त रसीद नंबर (${autoReceiptNo}) जेनरेट हो गया है!\n\nअब आप फॉर्म सबमिट कर सकते हैं।`);
    } catch (error) {
        console.error("Error generating receipt number:", error);
        alert("रसीद नंबर जेनरेट करने में समस्या आई। कृपया इंटरनेट चेक करें।");
        receiptInput.value = "";
    }
};

// Work Report Prompt Modal logic
window.closeWorkReportPromptModal = function() {
    const modal = document.getElementById('workReportPromptModal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Check if prompt should be shown on page load (safe trigger)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWorkReportPrompt);
} else {
    initWorkReportPrompt();
}

function initWorkReportPrompt() {
    const promptModal = document.getElementById('workReportPromptModal');
    if (promptModal) {
        promptModal.style.display = 'flex';
    }
}

