document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('id');

    if (!appId) {
        document.body.innerHTML = '<h2 style="color:red; text-align:center; padding:3rem;">Invalid Receipt ID. Please use the link from your application submission.</h2>';
        return;
    }

    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val !== undefined && val !== null ? val : '';
    };

    const renderReceipt = (data) => {
        // Format date
        let dateStr = new Date().toLocaleDateString('en-IN');
        if (data.timestamp) {
            if (typeof data.timestamp.toDate === 'function') {
                dateStr = data.timestamp.toDate().toLocaleDateString('en-IN');
            } else if (data.timestamp.seconds) {
                dateStr = new Date(data.timestamp.seconds * 1000).toLocaleDateString('en-IN');
            } else {
                dateStr = new Date(data.timestamp).toLocaleDateString('en-IN');
            }
        } else if (data.applicationDate) {
            dateStr = data.applicationDate;
        }

        const posting = data.postingPlace + (data.block ? `, विकास खण्ड: ${data.block}` : '');

        // Normalize old data: show 'मांग समर्थक' for all supporter types
        const memberType = (data.memberType === 'समर्थक' || !data.memberType) 
            ? 'मांग समर्थक' 
            : data.memberType;

        // Populate User Copy (rec1) only
        set('rec1-receiptNo',    data.receiptNo || 'N/A');
        set('rec1-name',         data.name);
        set('rec1-guardian',     data.guardianName);
        set('rec1-mobile',       data.mobile);
        set('rec1-type',         memberType);
        set('rec1-posting',      posting);
        set('rec1-district',     data.district);
        set('rec1-date',         dateStr);
        set('rec1-signer-name',  data.name);

        // Hidden fee elements kept in DOM (no display, avoids null errors)
        set('rec1-admissionFee', data.admissionFee || 0);
        set('rec1-annualFee',    data.annualFee || 0);
        set('rec1-total',        (parseInt(data.admissionFee) || 0) + (parseInt(data.annualFee) || 0));
    };

    const loadLocalData = (appId) => {
        const localDataStr = localStorage.getItem(appId);
        if (localDataStr) {
            try {
                const data = JSON.parse(localDataStr);
                renderReceipt(data);
                return true;
            } catch (err) {
                console.error("Error parsing local storage data:", err);
            }
        }
        return false;
    };

    // Try loading from Firestore first
    db.collection('applications').doc(appId).get()
        .then((doc) => {
            if (doc.exists) {
                renderReceipt(doc.data());
            } else {
                // Check localStorage fallback
                if (!loadLocalData(appId)) {
                    alert("No application found for this ID!");
                }
            }
        })
        .catch((error) => {
            console.warn("Firestore offline/quota exceeded, trying local storage fallback:", error);
            if (!loadLocalData(appId)) {
                alert("Error loading receipt data. Please check connection.");
            }
        });
});
