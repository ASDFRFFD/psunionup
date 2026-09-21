// work-report.js

// TODO: Deploy your Google Apps Script Web App and paste the URL here
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbykdwec5LFtbezCzahb67-ipGsCa7T6LRstsxkaNA0LQUhUQccVPO2V320U2c7lykOg/exec"; 

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('workReportForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.getElementById('btnLoader');
    const formMessage = document.getElementById('formMessage');

    // Handle dynamic work type dropdown change
    const orderWorkType = document.getElementById('orderWorkType');
    const otherWorkInputGroup = document.getElementById('otherWorkInputGroup');
    const otherWorkName = document.getElementById('otherWorkName');

    orderWorkType.addEventListener('change', (e) => {
        if (e.target.value === 'other') {
            otherWorkInputGroup.style.display = 'block';
            otherWorkName.setAttribute('required', 'true');
        } else {
            otherWorkInputGroup.style.display = 'none';
            otherWorkName.removeAttribute('required');
            otherWorkName.value = '';
        }
    });

    // Form submission handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate basic validity
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Get the order file
        const fileInput = document.getElementById('orderFile');
        const file = fileInput.files[0];
        if (!file) {
            alert('कृपया शासकीय आदेश की फ़ाइल (PDF या इमेज) चुनें!');
            return;
        }

        // File size check: 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            alert('फ़ाइल का आकार बहुत बड़ा है! कृपया 5MB से कम आकार की फ़ाइल चुनें।');
            return;
        }

        // File type check: PDF or Image
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type) && !file.type.startsWith('image/')) {
            alert('केवल PDF या Image (JPG, PNG) फ़ाइलें ही स्वीकृत हैं!');
            return;
        }

        // Check if Web App URL is set
        if (APPS_SCRIPT_URL.includes("AKfycbz_Placeholder_URL")) {
            alert("क्रिटिकल अलर्ट: Google Apps Script Web App URL सेट नहीं है! कृपया पहले अपनी Google Script deploy करें और URL को work-report.js में अपडेट करें।");
            return;
        }

        // Setup loading state
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.8';
        submitBtn.style.cursor = 'not-allowed';
        formMessage.className = 'form-message';
        formMessage.classList.remove('show');

        // Progress UI setup
        const progressContainer = document.getElementById('uploadProgressContainer');
        const progressBar = document.getElementById('uploadProgressBar');
        const percentageText = document.getElementById('uploadPercentage');
        const successMsg = document.getElementById('uploadSuccessMessage');
        const statusText = document.getElementById('uploadStatus');

        progressContainer.style.display = 'block';
        successMsg.style.display = 'none';
        progressBar.style.width = '0%';
        percentageText.textContent = '0%';
        statusText.textContent = 'फ़ाइल अपलोड हो रही है...';

        // Generate report ID
        let generatedReportNo = "WORK-" + Math.floor(100000 + Math.random() * 900000);

        try {
            // Upload to Google Drive using Apps Script Web App
            uploadToGoogleDrive(
                file, 
                `${generatedReportNo}_${file.name}`,
                (progress) => {
                    // Update progress bar
                    progressBar.style.width = progress + '%';
                    percentageText.textContent = progress + '%';
                },
                async (driveFileUrl) => {
                    // Upload completed successfully
                    progressBar.style.width = '100%';
                    percentageText.textContent = '100%';
                    statusText.textContent = 'अपलोड पूर्ण!';
                    successMsg.style.display = 'block';

                    try {
                        // Get final work type subject
                        const finalWorkType = form.orderWorkType.value === 'other' 
                            ? form.otherWorkName.value.trim() 
                            : form.orderWorkType.value;

                        // Gather all form data
                        const formData = {
                            reportId: generatedReportNo,
                            name: form.name.value.trim(),
                            district: form.district.value,
                            block: form.block.value.trim(),
                            orderLevel: form.orderLevel.value,
                            orderDepartment: form.orderDepartment.value,
                            orderWorkType: finalWorkType,
                            orderFileUrl: driveFileUrl,
                            orderFileName: file.name,
                            customWorkDesc: form.customWorkDesc.value.trim() || null,
                            timestamp: firebase.firestore.FieldValue.serverTimestamp()
                        };

                        // Save details in Firestore 'work_reports'
                        const docRef = await db.collection('work_reports').add(formData);

                        // Save details to localStorage so they are available immediately (offline fallback)
                        localStorage.setItem(docRef.id, JSON.stringify(formData));

                        // Show success details inside the modal
                        const successModal = document.getElementById('successModal');
                        const successReportId = document.getElementById('successReportId');
                        if (successReportId) successReportId.textContent = generatedReportNo;
                        
                        // Update certificate download button link
                        const downloadCertBtn = document.getElementById('downloadCertBtn');
                        if (downloadCertBtn) {
                            downloadCertBtn.href = `order-certificate.html?id=${docRef.id}`;
                        }

                        if (successModal) successModal.style.display = 'flex';

                        // Show inline success message
                        formMessage.innerHTML = `
                            <div style="font-size: 1.1rem; color: var(--green); font-weight:700;">
                                ✅ आपकी कार्य रिपोर्ट व शासनादेश सफलतापूर्वक दर्ज कर लिया गया है! रिपोर्ट आईडी: <strong>${generatedReportNo}</strong>
                            </div>
                        `;
                        formMessage.classList.add('success', 'show');

                        // Reset form
                        form.reset();
                        
                        // Hide other work input
                        otherWorkInputGroup.style.display = 'none';
                        otherWorkName.removeAttribute('required');
                        
                        // Hide progress bars after a delay
                        setTimeout(() => {
                            progressContainer.style.display = 'none';
                            successMsg.style.display = 'none';
                        }, 5000);

                    } catch (err) {
                        console.error("Firestore save failed:", err);
                        alert("डेटाबेस में रिपोर्ट दर्ज करने में विफलता आई: " + err.message);
                        resetLoadingState();
                    }
                },
                (error) => {
                    console.error("Google Drive upload failed:", error);
                    alert("फ़ाइल अपलोड करने में विफलता आई: " + error.message + "\nकृपया इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।");
                    resetLoadingState();
                }
            );

        } catch (error) {
            console.error("Upload process failed:", error);
            alert("प्रक्रिया में त्रुटि आई: " + error.message);
            resetLoadingState();
        }

        function resetLoadingState() {
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.cursor = 'pointer';
            progressContainer.style.display = 'none';
        }
    });

    // Helper function to handle Google Drive upload using XMLHttpRequest
    function uploadToGoogleDrive(file, filename, onProgress, onSuccess, onError) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Data = e.target.result.split(',')[1];
            
            const xhr = new XMLHttpRequest();
            xhr.open("POST", APPS_SCRIPT_URL, true);
            
            // Simulate upload progress to avoid triggering CORS preflight (xhr.upload.onprogress causes preflight OPTIONS)
            let progress = 0;
            const progressInterval = setInterval(() => {
                if (progress < 90) {
                    progress += Math.floor(Math.random() * 10) + 5;
                    if (progress > 90) progress = 90;
                    onProgress(progress);
                }
            }, 300);
            
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    clearInterval(progressInterval);
                    if (xhr.status === 200) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.status === "success") {
                                onProgress(100);
                                onSuccess(response.url);
                            } else {
                                onError(new Error(response.message || "Apps Script Error"));
                            }
                        } catch (err) {
                            onError(new Error("Invalid JSON response from server"));
                        }
                    } else {
                        onError(new Error("Network response error: " + xhr.statusText));
                    }
                }
            };
            
            xhr.onerror = function() {
                clearInterval(progressInterval);
                onError(new Error("Network connection error"));
            };
            
            // Send as plain text to avoid CORS preflight issues
            xhr.setRequestHeader("Content-Type", "text/plain");
            
            const payload = JSON.stringify({
                filename: filename,
                mimeType: file.type,
                base64Data: base64Data
            });
            
            xhr.send(payload);
        };
        reader.onerror = function(err) {
            onError(err);
        };
        reader.readAsDataURL(file);
    }

    window.closeSuccessModal = function() {
        const modal = document.getElementById('successModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
});
