document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const appId = urlParams.get('id');

    if (!appId) {
        alert("Invalid Certificate ID");
        return;
    }

    const renderCertificate = (data) => {
        // Populate fields
        document.getElementById('certMemNo').textContent = data.membershipNumber || data.receiptNo || 'N/A';
        
        // Format Date
        let dateStr = 'N/A';
        if (data.approvalDate) {
            let dateObj;
            if (typeof data.approvalDate.toDate === 'function') {
                dateObj = data.approvalDate.toDate();
            } else if (data.approvalDate.seconds) {
                dateObj = new Date(data.approvalDate.seconds * 1000);
            } else {
                dateObj = new Date(data.approvalDate);
            }
            dateStr = dateObj.toLocaleDateString('en-IN');
        } else if (data.applicationDate) {
            dateStr = data.applicationDate;
        }
        document.getElementById('certDate').textContent = dateStr;

        if (data.photoData) {
            const certPhoto = document.getElementById('certPhoto');
            if (certPhoto) {
                certPhoto.src = data.photoData;
                certPhoto.style.display = 'block';
            }
            const photoBox = document.querySelector('.photo-box');
            if (photoBox) photoBox.style.display = 'block';
        } else {
            const photoBox = document.querySelector('.photo-box');
            if (photoBox) photoBox.style.display = 'none';
        }
        
        document.getElementById('certName').textContent = data.name;
        document.getElementById('certGuardian').textContent = data.guardianName;
        document.getElementById('certAddress').textContent = data.address;
        
        // In offline/local mode, memberType might be missing -> show 'मांग समर्थक'
        document.getElementById('certType').textContent = data.memberType || 'मांग समर्थक';
        
        let postingInfo = data.postingPlace || '';
        if (data.block) {
            postingInfo += `, विकास खण्ड: ${data.block}`;
        }
        document.getElementById('certPosting').textContent = postingInfo;

        // Optional: Automatically trigger print dialog after a slight delay to ensure fonts/images load
        setTimeout(() => {
            // window.print(); // Uncomment to auto-print
        }, 1000);
    };

    const loadLocalData = (appId) => {
        const localDataStr = localStorage.getItem(appId);
        if (localDataStr) {
            try {
                const data = JSON.parse(localDataStr);
                // Treat offline submissions as approved locally so users get their certificates immediately!
                data.status = 'approved';
                renderCertificate(data);
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
                const data = doc.data();

                // Check if approved
                if (data.status !== 'approved') {
                    alert("This application is not approved yet.");
                    return;
                }

                renderCertificate(data);
            } else {
                // Check localStorage fallback
                if (!loadLocalData(appId)) {
                    alert("No such document!");
                }
            }
        })
        .catch((error) => {
            console.warn("Firestore offline/quota exceeded, trying local storage fallback:", error);
            if (!loadLocalData(appId)) {
                alert("Error fetching certificate data. Please check connection.");
            }
        });
});
