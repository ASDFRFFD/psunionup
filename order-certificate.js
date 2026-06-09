// order-certificate.js

function initCertificate() {
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('id');

    if (!appId) {
        alert("त्रुटि: प्रमाण पत्र आईडी अमान्य है।");
        return;
    }

    const DEPT_MAP = {
        'panchayati_raj': 'पंचायती राज विभाग',
        'rural_dev': 'ग्राम्य विकास विभाग',
        'revenue': 'राजस्व विभाग',
        'social_welfare': 'समाज कल्याण विभाग',
        'food_civil_supplies': 'खाद्य एवं रसद विभाग',
        'health': 'चिकित्सा, स्वास्थ्य एवं कल्याण',
        'education': 'बेसिक शिक्षा विभाग',
        'other': 'अन्य विभाग'
    };

    const WORK_MAP = {
        'Feeding': 'डेटा फीडिंग',
        'Survey': 'सर्वेक्षण',
        'Office Work': 'कार्यालय कार्य',
        'Nirikshan': 'निरीक्षण',
        'Satyapan': 'भौतिक सत्यापन',
        'Geo Tag': 'जियो-टैगिंग',
        'Awareness': 'जागरूकता अभियान'
    };

    const renderCertificate = (data) => {
        // Populate fields
        document.getElementById('certReportId').textContent = data.reportId || 'N/A';
        
        // Format Date
        let dateStr = 'N/A';
        if (data.timestamp) {
            let dateObj;
            if (typeof data.timestamp.toDate === 'function') {
                dateObj = data.timestamp.toDate();
            } else if (data.timestamp.seconds) {
                dateObj = new Date(data.timestamp.seconds * 1000);
            } else {
                dateObj = new Date(data.timestamp);
            }
            dateStr = dateObj.toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } else {
            dateStr = new Date().toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        document.getElementById('certDate').textContent = dateStr;
        
        document.getElementById('certName').textContent = data.name || '—';
        document.getElementById('certBlock').textContent = data.block || '—';
        document.getElementById('certDistrict').textContent = data.district || '—';
        
        // Translate department and work type if mapped, otherwise display raw value
        const deptDisplay = DEPT_MAP[data.orderDepartment] || data.orderDepartment || 'अन्य विभाग';
        const workDisplay = WORK_MAP[data.orderWorkType] || data.orderWorkType || 'अन्य कार्य';
        
        const certDeptEl = document.getElementById('certDept');
        if (certDeptEl) certDeptEl.textContent = deptDisplay;
        
        const certWorkEl = document.getElementById('certWork');
        if (certWorkEl) certWorkEl.textContent = workDisplay;
    };

    if (appId === 'mock') {
        renderCertificate({
            reportId: "WORK-987654",
            name: "राहुल कुमार",
            block: "सरोजनी नगर",
            district: "लखनऊ",
            orderDepartment: "panchayati_raj",
            orderWorkType: "Survey",
            timestamp: new Date()
        });
        return;
    }

    const loadLocalData = (appId) => {
        const localDataStr = localStorage.getItem(appId);
        if (localDataStr) {
            try {
                const data = JSON.parse(localDataStr);
                renderCertificate(data);
                return true;
            } catch (err) {
                console.error("Error parsing local storage data:", err);
            }
        }
        return false;
    };

    // Try loading from Firestore first
    db.collection('work_reports').doc(appId).get()
        .then((doc) => {
            if (doc.exists) {
                renderCertificate(doc.data());
            } else {
                // Check localStorage fallback (works offline and instantly!)
                if (!loadLocalData(appId)) {
                    alert("त्रुटि: रिपोर्ट विवरण नहीं मिल सका।");
                }
            }
        })
        .catch((error) => {
            console.warn("Firestore offline/quota exceeded, trying local storage fallback:", error);
            if (!loadLocalData(appId)) {
                alert("विवरण लोड करने में असमर्थ। कृपया इंटरनेट कनेक्शन की जांच करें।");
            }
        });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCertificate);
} else {
    initCertificate();
}
