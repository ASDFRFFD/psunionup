let currentStatus = 'pending';
let currentApproveId = null;
let allApplications = {}; // Map of doc.id -> data

// Pagination & Filtering state
let currentPage = 1;
const pageSize = 25;
let pageAnchors = { 1: null }; // pageNumber -> doc snapshot anchor
let useLocalFallback = false; // Self-healing fallback if compound index is missing
let photoFilterActive = false; // TRUE = only show records with photoData

// Government Orders Dashboard state
let currentView = 'campaign'; // 'campaign' or 'orders'
let ordersPage = 1;
let allOrders = {};

document.addEventListener('DOMContentLoaded', () => {
    // Firebase auth listener
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            document.getElementById('loginContainer').style.display = 'none';
            document.getElementById('dashboardContainer').style.display = 'block';
            loadApplications(currentStatus, 1);
            loadStats();
        } else {
            // No user is signed in
            document.getElementById('loginContainer').style.display = 'flex';
            document.getElementById('dashboardContainer').style.display = 'none';
        }
    });
});

function checkLogin() {
    const email = document.getElementById('adminEmail').value;
    const pwd = document.getElementById('adminPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if(!email || !pwd) {
        showError("Please enter email and password");
        return;
    }

    loginBtn.textContent = 'Logging in...';
    loginBtn.disabled = true;

    firebase.auth().signInWithEmailAndPassword(email, pwd)
        .then((userCredential) => {
            // Logged in successfully, listener will handle UI update
            document.getElementById('loginError').style.display = 'none';
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        })
        .catch((error) => {
            showError("Authentication failed! Check email/password.");
            console.error(error);
            loginBtn.textContent = 'Login';
            loginBtn.disabled = false;
        });
}

function showError(msg) {
    const errDiv = document.getElementById('loginError');
    errDiv.textContent = msg;
    errDiv.style.display = 'block';
}

function logout() {
    firebase.auth().signOut().then(() => {
        // Sign-out successful.
    }).catch((error) => {
        console.error("Logout error:", error);
    });
}

// Allow pressing Enter key to login
document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter' && document.getElementById('loginContainer').style.display !== 'none') {
        checkLogin();
    }
});

// ==========================================
// CORE DATA FETCHING & PAGINATION
// ==========================================

function loadApplications(status, page = 1) {
    currentStatus = status;
    currentPage = page;
    
    // Update tabs UI active states
    document.getElementById('tabPending').classList.toggle('active', status === 'pending');
    document.getElementById('tabApproved').classList.toggle('active', status === 'approved');
    document.getElementById('tabRejected').classList.toggle('active', status === 'rejected');

    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';
    
    const districtFilter = document.getElementById('districtFilter').value;

    // Check if pagination controls should be visible
    document.getElementById('paginationControls').style.display = 'flex';

    if (useLocalFallback || districtFilter || photoFilterActive) {
        // If index is missing or we are filtering by district/photo,
        // use local modes to bypass needing manual compound indexes in Firestore.
        loadApplicationsLocal(status, districtFilter, page);
    } else {
        // High-performance server-side paginated queries
        loadApplicationsServer(status, page);
    }
}

// High performance: queries page size + 1 and uses snapshots to paginate
function loadApplicationsServer(status, page) {
    const tableBody = document.getElementById('tableBody');
    
    let query = db.collection('applications').where('status', '==', status);
    query = query.orderBy('timestamp', 'desc');
    query = query.limit(pageSize + 1);
    
    if (page > 1 && pageAnchors[page]) {
        query = query.startAt(pageAnchors[page]);
    }
    
    query.get().then((snapshot) => {
        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; font-family: var(--mono);">No ${status} applications found.</td></tr>`;
            updatePaginationControls(false);
            return;
        }
        
        const docs = snapshot.docs;
        const hasNextPage = docs.length > pageSize;
        const pageDocs = hasNextPage ? docs.slice(0, pageSize) : docs;
        
        // Save next page start anchor
        if (hasNextPage) {
            pageAnchors[page + 1] = docs[pageSize];
        }
        
        allApplications = {};
        pageDocs.forEach(doc => {
            allApplications[doc.id] = doc.data();
        });
        
        renderTableRows(pageDocs);
        updatePaginationControls(hasNextPage);
    }).catch((error) => {
        console.error("Server-side paginated query failed. Falling back to local mode:", error);
        // Self-heal and remember to use local sorting/pagination to avoid failing
        useLocalFallback = true;
        loadApplications(status, page);
    });
}

// Zero-Config Fallback: Filters by status/district/photo in database without compound orderBy.
// Instantly bypasses composite index errors and paginates/sorts in JavaScript memory.
function loadApplicationsLocal(status, districtFilter, page) {
    const tableBody = document.getElementById('tableBody');
    
    let query = db.collection('applications').where('status', '==', status);
    if (districtFilter) {
        query = query.where('district', '==', districtFilter);
    }
    
    query.get().then((snapshot) => {
        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; font-family: var(--mono);">No records found.</td></tr>`;
            updatePaginationControls(false);
            return;
        }
        
        let docs = snapshot.docs;
        
        // Sort in memory by timestamp descending
        docs.sort((a, b) => {
            const timeA = a.data().timestamp ? a.data().timestamp.toMillis() : 0;
            const timeB = b.data().timestamp ? b.data().timestamp.toMillis() : 0;
            return timeB - timeA;
        });
        
        // Paginate locally
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageDocs = docs.slice(startIndex, endIndex);
        const hasNextPage = docs.length > endIndex;
        
        allApplications = {};
        pageDocs.forEach(doc => {
            allApplications[doc.id] = doc.data();
        });
        
        renderTableRows(pageDocs);
        
        updatePaginationControls(hasNextPage);
    }).catch((error) => {
        console.error("Local mode query failed:", error);
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--blood);">Error loading data. Check console.</td></tr>`;
    });
}

// ==========================================
// PHOTO FILTER TOGGLE
// ==========================================

function togglePhotoFilter() {
    photoFilterActive = !photoFilterActive;
    
    const btn = document.getElementById('tabPhotoOnly');
    const badge = document.getElementById('photoFilterBadge');
    
    if (photoFilterActive) {
        // Turn ON — visually activate button
        if (btn) {
            btn.style.background = '#d97706';
            btn.style.color = '#fff';
            btn.style.borderColor = '#92400e';
            btn.style.boxShadow = '3px 3px 0 #92400e';
            btn.textContent = '📸 Photo Filter: ON ✓';
        }
        if (badge) badge.style.display = 'inline-block';
        
        // Load ALL photo records across ALL statuses
        currentPage = 1;
        loadAllPhotoRecords(1);
    } else {
        // Turn OFF
        if (btn) {
            btn.style.background = '#fff7ed';
            btn.style.color = '#d97706';
            btn.style.borderColor = '#d97706';
            btn.style.boxShadow = '3px 3px 0 #d97706';
            btn.textContent = '📸 Photo वाले देखें';
        }
        if (badge) badge.style.display = 'none';
        
        // Restore normal tab view
        _cachedPhotoDocs = null; // Clear cache so next ON is a fresh fetch
        pageAnchors = { 1: null };
        currentPage = 1;
        loadApplications(currentStatus, 1);
    }
}

// Cached photo docs so we don't re-fetch on every page turn
let _cachedPhotoDocs = null;

// सबसे पहले 100 records लाओ (जब photo mandatory थी)
// Simple approach: orderBy timestamp asc, limit 100
function loadAllPhotoRecords(page) {
    currentPage = page;
    const tableBody = document.getElementById('tableBody');
    document.getElementById('paginationControls').style.display = 'flex';

    // Use cached results for pagination
    if (_cachedPhotoDocs !== null) {
        _renderPhotoPage(_cachedPhotoDocs, page);
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="8" style="text-align:center; font-family:var(--mono); font-weight:700; padding:2rem;">⏳ शुरुआती 100 Photo वाले Forms लोड हो रहे हैं...</td></tr>';

    // पहले 100 records (timestamp के हिसाब से सबसे पुराने) — यही photo वाले हैं
    db.collection('applications')
        .orderBy('timestamp', 'asc')
        .limit(100)
        .get()
        .then((snapshot) => {
            if (snapshot.empty) {
                tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; font-family:var(--mono); padding:2rem;">कोई record नहीं मिला।</td></tr>`;
                updatePaginationControls(false);
                return;
            }

            const docs = snapshot.docs;
            _cachedPhotoDocs = docs;
            _renderPhotoPage(docs, page);
        })
        .catch((err) => {
            console.error("First 100 records fetch failed:", err);
            tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; color:var(--blood); padding:2rem;">❌ Error: ${err.message}</td></tr>`;
        });
}

function _renderPhotoPage(docs, page) {
    const tableBody = document.getElementById('tableBody');
    const totalCount = docs.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageDocs = docs.slice(startIndex, endIndex);
    const hasNextPage = docs.length > endIndex;

    allApplications = {};
    pageDocs.forEach(doc => {
        allApplications[doc.id] = doc.data();
    });

    renderTableRows(pageDocs);

    // Show first and last receipt numbers so user can confirm these are the survey records
    const firstToken = docs[0]?.data()?.receiptNo || '#1';
    const lastToken  = docs[docs.length - 1]?.data()?.receiptNo || `#${totalCount}`;
    document.getElementById('pageIndicator').textContent =
        `Page ${page} | 📸 ${totalCount} Forms | ${firstToken} → ${lastToken}`;

    updatePaginationControls(hasNextPage);
}



function renderTableRows(pageDocs) {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    pageDocs.forEach((doc, index) => {
        const data = doc.data();
        const tr = document.createElement('tr');
        const status = data.status || 'pending';
        
        // Calculate dynamic page-aware Serial Number
        const serialNo = (currentPage - 1) * pageSize + index + 1;
        
        let actionsHtml = '';
        if (status === 'pending') {
            actionsHtml = `
                <button class="action-btn" style="background: var(--text-muted); color: #fff;" onclick="viewDetails('${doc.id}')">View Details</button>
                <button class="action-btn" style="background: #ea580c; color: #fff;" onclick="downloadPDF('${doc.id}')">📄 PDF Form</button>
                <button class="action-btn approve-btn" onclick="openApprovalModal('${doc.id}')">Approve</button>
                <button class="action-btn reject-btn" onclick="rejectApplication('${doc.id}')">Reject</button>
                <a href="receipt.html?id=${doc.id}&view=union" target="_blank" class="cert-btn" style="background:#555;">Union Receipt</a>
            `;
        } else if (status === 'approved') {
            actionsHtml = `
                <button class="action-btn" style="background: var(--text-muted); color: #fff;" onclick="viewDetails('${doc.id}')">View Details</button>
                <button class="action-btn" style="background: #ea580c; color: #fff;" onclick="downloadPDF('${doc.id}')">📄 PDF Form</button>
                <a href="certificate.html?id=${doc.id}" target="_blank" class="cert-btn">View Certificate</a>
                <a href="receipt.html?id=${doc.id}&view=union" target="_blank" class="cert-btn" style="background:#555; margin-left: 10px;">Union Receipt</a>
                <button class="action-btn reject-btn" onclick="rejectApplication('${doc.id}')" style="margin-left: 10px;">Reject</button>
            `;
        } else if (status === 'rejected') {
            actionsHtml = `
                <button class="action-btn" style="background: var(--text-muted); color: #fff;" onclick="viewDetails('${doc.id}')">View Details</button>
                <button class="action-btn" style="background: #ea580c; color: #fff;" onclick="downloadPDF('${doc.id}')">📄 PDF Form</button>
                <button class="action-btn approve-btn" onclick="restoreApplication('${doc.id}')">Restore</button>
            `;
        }

        const photoHtml = data.photoData 
            ? `<img src="${data.photoData}" class="photo-thumb" alt="Photo">` 
            : `<div class="photo-thumb" style="display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: #777; background: var(--paper-2); text-transform: uppercase; border: 2px solid var(--ink); box-sizing: border-box;">No Photo</div>`;

        // Render Token/Receipt number beautifully
        let tokenHtml = `<strong>${data.receiptNo || '-'}</strong>`;
        if (status === 'approved' && data.membershipNumber) {
            tokenHtml += `<br><span style="color: var(--green); font-size: 0.85rem; font-weight: 700;">Appr: ${data.membershipNumber}</span>`;
        }

        tr.innerHTML = `
            <td style="font-family: var(--mono); font-weight: 800; text-align: center;">${serialNo}</td>
            <td>${photoHtml}</td>
            <td>${tokenHtml}</td>
            <td><strong>${data.name}</strong><br><small>${data.guardianName}</small></td>
            <td>${data.mobile}</td>
            <td><strong>${data.district || '-'}</strong><br><small>${data.block || '-'} / ${data.postingPlace || '-'}</small></td>
            <td><span style="color: ${status==='pending'?'var(--primary)':status==='approved'?'var(--success)':'var(--error)'}">${status.toUpperCase()}</span></td>
            <td>${actionsHtml}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function changePage(dir) {
    if (dir === 'first') {
        currentPage = 1;
    } else if (typeof dir === 'number') {
        currentPage += dir;
        if (currentPage < 1) currentPage = 1;
    }
    // If photo filter is ON, paginate through photo records instead of status-based
    if (photoFilterActive) {
        loadAllPhotoRecords(currentPage);
    } else {
        loadApplications(currentStatus, currentPage);
    }
}

function updatePaginationControls(hasNextPage) {
    document.getElementById('pageIndicator').textContent = `Page ${currentPage}`;
    document.getElementById('btnPrevPage').disabled = currentPage === 1;
    document.getElementById('btnFirstPage').disabled = currentPage === 1;
    document.getElementById('btnNextPage').disabled = !hasNextPage;
    
    // Style adjustments for disabled state
    document.getElementById('btnPrevPage').style.opacity = currentPage === 1 ? '0.5' : '1';
    document.getElementById('btnFirstPage').style.opacity = currentPage === 1 ? '0.5' : '1';
    document.getElementById('btnNextPage').style.opacity = !hasNextPage ? '0.5' : '1';
}

function setTabAndReload(status) {
    pageAnchors = { 1: null };
    currentPage = 1;
    loadApplications(status, 1);
}

function applyFilters() {
    pageAnchors = { 1: null };
    currentPage = 1;
    loadApplications(currentStatus, 1);
}

// ==========================================
// DIRECT INSTANT EXACT-MATCH DATABASE SEARCH
// ==========================================

function handleSearchKey(event) {
    if (event.key === 'Enter') {
        triggerExactSearch();
    }
}

function triggerExactSearch() {
    const searchVal = document.getElementById('searchInput').value.trim();
    if (!searchVal) {
        alert("कृपया मोबाइल नंबर या टोकन नंबर दर्ज करें!");
        return;
    }
    
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Searching...</td></tr>';
    
    // Hide pagination controls during single-record search view
    document.getElementById('paginationControls').style.display = 'none';

    // Parallel searches in Firestore for ultimate speed and convenience
    const qMobile = db.collection('applications').where('mobile', '==', searchVal).get();
    const qReceipt = db.collection('applications').where('receiptNo', '==', searchVal).get();
    const qMember = db.collection('applications').where('membershipNumber', '==', searchVal).get();
    
    Promise.all([qMobile, qReceipt, qMember]).then(([resMobile, resReceipt, resMember]) => {
        tableBody.innerHTML = '';
        allApplications = {};
        
        let foundDocs = [];
        const seenIds = new Set();
        
        [resMobile, resReceipt, resMember].forEach(snapshot => {
            snapshot.forEach(doc => {
                if (!seenIds.has(doc.id)) {
                    seenIds.add(doc.id);
                    foundDocs.push(doc);
                }
            });
        });
        
        if (foundDocs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; font-family: var(--mono);">No records found for "${searchVal}".</td></tr>`;
            return;
        }
        
        foundDocs.forEach(doc => {
            allApplications[doc.id] = doc.data();
        });
        
        renderTableRows(foundDocs);
    }).catch(err => {
        console.error("Exact search failed:", err);
        tableBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--blood);">Error occurred during search!</td></tr>`;
    });
}

function clearSearchAndReload() {
    document.getElementById('searchInput').value = '';
    document.getElementById('districtFilter').value = '';
    document.getElementById('paginationControls').style.display = 'flex';
    pageAnchors = { 1: null };
    loadApplications(currentStatus, 1);
}

// ==========================================
// EXCEL / CSV DATA EXPORTS
// ==========================================

function handleCSVExport() {
    const choice = confirm("क्या आप सभी 1500+ पंचायत सहायकों का डेटा एक्सपोर्ट करना चाहते हैं?\n\n[OK] = सभी का पूरा डेटा (All Data)\n[Cancel] = केवल वर्तमान पेज का डेटा (Only Current Page)");
    if (choice) {
        exportAllCSV();
    } else {
        exportTableToCSV('current_page_members.csv');
    }
}

// Generates a fully populated clean CSV file containing all text records directly from database
function exportAllCSV() {
    const exportBtn = document.querySelector('button[onclick="handleCSVExport()"]');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '📥 Fetching all...';
    exportBtn.disabled = true;

    db.collection('applications').get().then((snapshot) => {
        if (snapshot.empty) {
            alert("डेटाबेस में कोई डेटा नहीं मिला!");
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
            return;
        }

        const csv = [];
        // CSV Header
        csv.push('"Token Number","Name","Father/Husband Name","Mobile","Occupation/Post","Block","District","Address","Date","Status"');

        // Sort all by date descending in JS memory
        const docs = snapshot.docs;
        docs.sort((a, b) => {
            const timeA = a.data().timestamp ? a.data().timestamp.toMillis() : 0;
            const timeB = b.data().timestamp ? b.data().timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        docs.forEach(doc => {
            const data = doc.data();
            const token = data.membershipNumber || data.receiptNo || '-';
            const name = (data.name || '').replace(/"/g, '""');
            const guardian = (data.guardianName || '').replace(/"/g, '""');
            const mobile = (data.mobile || '').replace(/"/g, '""');
            const occupation = (data.occupation || '').replace(/"/g, '""');
            const block = (data.block || '').replace(/"/g, '""');
            const district = (data.district || '').replace(/"/g, '""');
            const address = (data.address || '').replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");
            const date = (data.applicationDate || '').replace(/"/g, '""');
            const status = (data.status || 'pending').toUpperCase();

            csv.push(`"${token}","${name}","${guardian}","${mobile}","${occupation}","${block}","${district}","${address}","${date}","${status}"`);
        });

        const blob = new Blob(["\uFEFF" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Panchayat_Sahayak_Union_All_Members_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    }).catch(err => {
        console.error("Export all failed:", err);
        alert("एक्सपोर्ट करने में त्रुटि हुई!");
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    });
}

// Exports only the rows that are currently loaded and visible on the table grid
function exportTableToCSV(filename) {
    const csv = [];
    const rows = document.querySelectorAll("table tr");
    rows.forEach(row => {
        if (row.style.display === 'none') return;
        const cols = row.querySelectorAll("td, th");
        const rowData = [];
        
        // Skip photo column [0] and actions column [last]
        for (let j = 1; j < cols.length - 1; j++) {
            const data = cols[j].innerText.replace(/(\r\n|\n|\r)/gm, " ").trim().replace(/"/g, '""');
            rowData.push('"' + data + '"');
        }
        if (rowData.length > 0) csv.push(rowData.join(","));
    });
    
    const blob = new Blob(["\uFEFF" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ==========================================
// STATS SYSTEM
// ==========================================

function loadStats() {
    const statTotal = document.getElementById('statTotal');
    const statApproved = document.getElementById('statApproved');
    const statPending = document.getElementById('statPending');
    const statWithPhoto = document.getElementById('statWithPhoto');

    db.collection('applications').get().then(snap => {
        let total = snap.size;
        let approved = 0;
        let pending = 0;
        let withPhoto = 0;
        let activeSize = 0;
        const districtCounts = {};

        snap.forEach(doc => {
            const data = doc.data();
            if (data.status === 'approved') approved++;
            if (data.status === 'pending') pending++;
            
            // Count records that have a valid photo
            if (data.photoData && data.photoData.trim().length > 10) withPhoto++;
            
            if (data.status !== 'rejected') {
                activeSize++;
                const dist = data.district;
                if (dist) {
                    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
                }
            }
        });

        if (statTotal) statTotal.textContent = total;
        if (statApproved) statApproved.textContent = approved;
        if (statPending) statPending.textContent = pending;
        if (statWithPhoto) statWithPhoto.textContent = withPhoto;

        // Update Campaign Progress Bar
        const target = 57000;
        let percentage = ((total / target) * 100).toFixed(2);
        if (percentage > 100) percentage = 100;
        
        const progressFill = document.getElementById('progressBarFill');
        const progressText = document.getElementById('progressText');
        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '% (' + total + ' / 57,000)';

        // Auto-sync the campaign_stats/live document in the background silently
        const baseOffset = 0;
        const totalSupporters = baseOffset + activeSize;
        db.collection('campaign_stats').doc('live').set({
            totalSupporters: totalSupporters,
            topDistricts: districtCounts,
            lastSynced: firebase.firestore.FieldValue.serverTimestamp()
        }).catch(err => {
            console.warn("Silent background stats sync failed:", err);
        });
    });
}

// ==========================================
// PHOTO FILTER TOGGLE
// ==========================================

function togglePhotoFilter() {
    photoFilterActive = !photoFilterActive;
    
    const btn = document.getElementById('tabPhotoOnly');
    const badge = document.getElementById('photoFilterBadge');
    const statCard = btn ? null : null;
    
    if (photoFilterActive) {
        // Turn ON
        if (btn) {
            btn.style.background = '#d97706';
            btn.style.color = '#fff';
            btn.style.borderColor = '#92400e';
            btn.style.boxShadow = '3px 3px 0 #92400e';
            btn.textContent = '📸 Photo Filter: ON';
        }
        if (badge) badge.style.display = 'inline-block';
    } else {
        // Turn OFF
        if (btn) {
            btn.style.background = '#fff7ed';
            btn.style.color = '#d97706';
            btn.style.borderColor = '#d97706';
            btn.style.boxShadow = '3px 3px 0 #d97706';
            btn.textContent = '📸 Photo वाले देखें';
        }
        if (badge) badge.style.display = 'none';
    }
    
    // Reset to page 1 and reload with filter applied
    pageAnchors = { 1: null };
    currentPage = 1;
    loadApplications(currentStatus, 1);
}

function restoreApplication(id) {
    if (confirm('क्या आप इस आवेदन को वापस Pending में लाना चाहते हैं?')) {
        db.collection('applications').doc(id).update({ status: 'pending' })
            .then(() => {
                alert('Application restored to Pending!');
                pageAnchors = { 1: null };
                loadApplications(currentStatus, currentPage);
                loadStats();
            })
            .catch(err => { console.error(err); alert('Error restoring!'); });
    }
}

function openApprovalModal(id) {
    currentApproveId = id;
    document.getElementById('membershipNumberInput').value = '';
    document.getElementById('approvalModal').style.display = 'flex';
}

function closeModal() {
    currentApproveId = null;
    document.getElementById('approvalModal').style.display = 'none';
}

document.getElementById('confirmApproveBtn').addEventListener('click', () => {
    const memNo = document.getElementById('membershipNumberInput').value.trim();
    if (!memNo) {
        alert("Please enter a Token Number!");
        return;
    }

    if (currentApproveId) {
        db.collection('applications').doc(currentApproveId).update({
            status: 'approved',
            membershipNumber: memNo,
            approvalDate: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            closeModal();
            pageAnchors = { 1: null };
            loadApplications(currentStatus, currentPage); // Refresh active page
            loadStats();
        })
        .catch((error) => {
            console.error("Error approving document: ", error);
            alert("Error approving application!");
        });
    }
});

function rejectApplication(id) {
    if (confirm("Are you sure you want to reject this application?")) {
        db.collection('applications').doc(id).update({
            status: 'rejected'
        })
        .then(() => {
            pageAnchors = { 1: null };
            loadApplications(currentStatus, currentPage);
            loadStats();
        })
        .catch((error) => {
            console.error("Error rejecting document: ", error);
            alert("Error rejecting application!");
        });
    }
}

// ==========================================
// DETAILS MODAL SHOW
// ==========================================

let currentDetailsId = null;

function viewDetails(id) {
    const data = allApplications[id];
    if (!data) return;
    
    currentDetailsId = id;
    const content = document.getElementById('detailsContent');
    
    const photoEl = data.photoData 
        ? `<img src="${data.photoData}" style="width: 100px; height: 120px; object-fit: cover; border: 2px solid var(--saffron); border-radius: 4px; display: inline-block;" alt="Photo">`
        : `<div style="width: 100px; height: 120px; border: 2px dashed var(--ink); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; color: #777; background: var(--paper-2); vertical-align: middle;">No Photo</div>`;
        
    const signEl = data.signData 
        ? `<img src="${data.signData}" style="width: 150px; height: 60px; object-fit: contain; border: 1px solid #ccc; border-radius: 4px; display: inline-block; margin-left: 20px; vertical-align: bottom;" alt="Signature">`
        : `<div style="width: 150px; height: 60px; border: 2px dashed var(--ink); border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; color: #777; background: var(--paper-2); margin-left: 20px; vertical-align: bottom;">No Sign</div>`;

    content.innerHTML = `
        <div style="grid-column: span 2; text-align: center; margin-bottom: 15px;">
            ${photoEl}
            ${signEl}
        </div>
        <div><strong>प्रकार:</strong> ${data.memberType || '-'}</div>
        <div><strong>टोकन संख्या (Receipt No):</strong> ${data.receiptNo || '-'}</div>
        <div><strong>आवेदक का नाम:</strong> ${data.name || '-'}</div>
        <div><strong>पिता / पति का नाम:</strong> ${data.guardianName || '-'}</div>
        <div><strong>जन्म तिथि / उम्र:</strong> ${data.dob || '-'}</div>
        <div><strong>लिंग:</strong> ${data.gender || '-'}</div>
        <div><strong>मोबाइल नंबर:</strong> ${data.mobile || '-'}</div>
        <div><strong>पद (Post):</strong> ${data.occupation || '-'}</div>
        <div><strong>ग्राम पंचायत:</strong> ${data.postingPlace || '-'}</div>
        <div><strong>विकास खण्ड (Block):</strong> ${data.block || '-'}</div>
        <div><strong>जनपद (District):</strong> ${data.district || '-'}</div>
        <div style="grid-column: span 2;"><strong>पूरा पता:</strong> ${data.address || '-'}</div>
        <div><strong>आवेदन की तिथि:</strong> ${data.applicationDate || '-'}</div>
        <div><strong>आवेदन का स्थान:</strong> ${data.applicationPlace || data.postingPlace || '-'}</div>
    `;
    
    // Always restore the footer buttons to standard Edit/Delete state
    const modalButtonsContainer = document.querySelector('#detailsModal .modal-buttons');
    if (modalButtonsContainer) {
        modalButtonsContainer.innerHTML = `
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="modal-btn" id="detailsEditBtn" style="background: var(--saffron-deep); color: var(--paper);" onclick="enableDetailsEdit()">✏️ विवरण सुधारें (Edit)</button>
                <button class="modal-btn" id="detailsDeleteBtn" style="background: var(--blood); color: var(--paper);" onclick="deleteDetailsApplication()">🗑️ स्थायी रूप से हटाएं (Delete)</button>
            </div>
            <button class="modal-btn" style="background: var(--ink); color: var(--paper);" onclick="closeDetailsModal()">बंद करें (Close)</button>
        `;
    }
    
    document.getElementById('detailsModal').style.display = 'flex';
}

function closeDetailsModal() {
    document.getElementById('detailsModal').style.display = 'none';
    currentDetailsId = null;
}

// ==========================================
// DETAILS IN-PLACE EDIT & DELETE ACTIONS
// ==========================================

function deleteDetailsApplication() {
    if (!currentDetailsId) return;
    if (confirm("⚠️ क्या आप वाकई इस आवेदन को स्थायी रूप से हटाना चाहते हैं?\n\nयह एक्शन वापस नहीं लिया जा सकता और डेटाबेस से डेटा डिलीट हो जाएगा!")) {
        db.collection('applications').doc(currentDetailsId).delete()
            .then(() => {
                alert("✅ आवेदन सफलतापूर्वक डिलीट कर दिया गया है!");
                closeDetailsModal();
                pageAnchors = { 1: null };
                loadApplications(currentStatus, currentPage);
                loadStats();
            })
            .catch(err => {
                console.error("Error deleting document:", err);
                alert("❌ आवेदन डिलीट करने में विफलता आई: " + err.message);
            });
    }
}

function enableDetailsEdit() {
    if (!currentDetailsId) return;
    const data = allApplications[currentDetailsId];
    if (!data) return;
    
    const content = document.getElementById('detailsContent');
    
    // Setup districts select element
    const districts = [
        "Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", 
        "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", 
        "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", 
        "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", 
        "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", 
        "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", 
        "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", 
        "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", 
        "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", 
        "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", 
        "Unnao", "Varanasi", "Other"
    ];
    
    let districtOptions = districts.map(d => `<option value="${d}" ${data.district === d ? 'selected' : ''}>${d}</option>`).join('');
    
    content.innerHTML = `
        <div style="grid-column: span 2; background: #fffbe6; padding: 12px; border: 2px solid var(--saffron); border-radius: 4px; font-size: 1rem; color: #8a6d3b; font-weight: 700; margin-bottom: 10px;">
            ✏️ आप वर्तमान में आवेदन का विवरण सुधार रहे हैं। सुधार के बाद "सुरक्षित करें" बटन दबाएं।
        </div>
        <div><strong>प्रकार:</strong> <input type="text" id="editMemberType" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.memberType || 'मांग समर्थक'}"></div>
        <div><strong>टोकन संख्या (Receipt No):</strong> <input type="text" id="editReceiptNo" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.receiptNo || ''}"></div>
        <div><strong>आवेदक का नाम:</strong> <input type="text" id="editName" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.name || ''}" required></div>
        <div><strong>पिता / पति का नाम:</strong> <input type="text" id="editGuardianName" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.guardianName || ''}" required></div>
        <div><strong>जन्म तिथि / उम्र:</strong> <input type="text" id="editDob" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.dob || ''}"></div>
        <div><strong>लिंग:</strong> 
            <select id="editGender" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); height: auto; margin-bottom: 0;">
                <option value="पुरुष" ${data.gender === 'पुरुष' ? 'selected' : ''}>पुरुष</option>
                <option value="महिला" ${data.gender === 'महिला' ? 'selected' : ''}>महिला</option>
                <option value="अन्य" ${data.gender === 'अन्य' ? 'selected' : ''}>अन्य</option>
            </select>
        </div>
        <div><strong>मोबाइल नंबर:</strong> <input type="text" id="editMobile" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.mobile || ''}" required></div>
        <div><strong>पद (Post):</strong> <input type="text" id="editOccupation" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.occupation || 'पंचायत सहायक'}"></div>
        <div><strong>ग्राम पंचायत:</strong> <input type="text" id="editPostingPlace" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.postingPlace || ''}" required></div>
        <div><strong>विकास खण्ड (Block):</strong> <input type="text" id="editBlock" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.block || ''}" required></div>
        <div><strong>जनपद (District):</strong> 
            <select id="editDistrict" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); height: auto; margin-bottom: 0;">
                ${districtOptions}
            </select>
        </div>
        <div style="grid-column: span 2;"><strong>पूरा पता:</strong> <textarea id="editAddress" class="login-input" style="padding: 6px 12px; width: 95%; border: 2px solid var(--ink); font-family: var(--sans); height: 60px; margin-bottom: 0;" required>${data.address || ''}</textarea></div>
        <div><strong>आवेदन की तिथि:</strong> <input type="text" id="editApplicationDate" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.applicationDate || ''}"></div>
        <div><strong>आवेदन का स्थान:</strong> <input type="text" id="editApplicationPlace" class="login-input" style="padding: 4px 8px; width: 80%; border: 2px solid var(--ink); margin-bottom: 0;" value="${data.applicationPlace || ''}"></div>
    `;
    
    // Modify footer buttons to "Save" and "Cancel"
    const modalButtonsContainer = document.querySelector('#detailsModal .modal-buttons');
    if (modalButtonsContainer) {
        modalButtonsContainer.innerHTML = `
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <button class="modal-btn" id="detailsSaveBtn" style="background: var(--green); color: var(--paper);" onclick="saveDetailsEdit()">💾 सुरक्षित करें (Save)</button>
            </div>
            <button class="modal-btn" style="background: var(--ink); color: var(--paper);" onclick="viewDetails(currentDetailsId)">❌ रद्द करें (Cancel)</button>
        `;
    }
}

function saveDetailsEdit() {
    if (!currentDetailsId) return;
    
    const editBtn = document.getElementById('detailsSaveBtn');
    editBtn.disabled = true;
    editBtn.textContent = 'Saving...';
    
    const updatedData = {
        memberType: document.getElementById('editMemberType').value.trim(),
        receiptNo: document.getElementById('editReceiptNo').value.trim(),
        name: document.getElementById('editName').value.trim(),
        guardianName: document.getElementById('editGuardianName').value.trim(),
        dob: document.getElementById('editDob').value.trim(),
        gender: document.getElementById('editGender').value,
        mobile: document.getElementById('editMobile').value.trim(),
        occupation: document.getElementById('editOccupation').value.trim(),
        postingPlace: document.getElementById('editPostingPlace').value.trim(),
        block: document.getElementById('editBlock').value.trim(),
        district: document.getElementById('editDistrict').value,
        address: document.getElementById('editAddress').value.trim(),
        applicationDate: document.getElementById('editApplicationDate').value.trim(),
        applicationPlace: document.getElementById('editApplicationPlace').value.trim()
    };
    
    // Input validation
    if (!updatedData.name || !updatedData.guardianName || !updatedData.mobile || !updatedData.postingPlace || !updatedData.block || !updatedData.address) {
        alert("⚠️ कृपया सभी आवश्यक फ़ील्ड्स (Name, Guardian, Mobile, Gram Panchayat, Block, Address) सही-सही भरें!");
        editBtn.disabled = false;
        editBtn.textContent = '💾 सुरक्षित करें (Save)';
        return;
    }
    
    db.collection('applications').doc(currentDetailsId).update(updatedData)
        .then(() => {
            alert("✅ विवरण सफलतापूर्वक सुधार दिया गया है!");
            
            // Update local memory map
            if (allApplications[currentDetailsId]) {
                Object.assign(allApplications[currentDetailsId], updatedData);
            }
            
            // Restore details view
            viewDetails(currentDetailsId);
            
            // Reload table and sync stats
            pageAnchors = { 1: null };
            loadApplications(currentStatus, currentPage);
            loadStats();
        })
        .catch(err => {
            console.error("Error updating details:", err);
            alert("❌ सुधार सुरक्षित करने में विफलता आई: " + err.message);
            editBtn.disabled = false;
            editBtn.textContent = '💾 सुरक्षित करें (Save)';
        });
}

// ==========================================
// DOWNLOAD PDF FORM
// ==========================================

function downloadPDF(id) {
    const data = allApplications[id];
    if (!data) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    let photoHTML = '';
    if (data.photoData) {
        photoHTML = `<img src="${data.photoData}" style="width: 100%; height: 100%; object-fit: cover;">`;
    } else {
        photoHTML = `<span style="font-size: 12px; color: #555;">PHOTO</span>`;
    }

    let signHTML = '';
    if (data.signData) {
        signHTML = `<img src="${data.signData}" style="height: 50px;">`;
    }

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="hi">
    <head>
        <meta charset="UTF-8">
        <title>Application Form - ${data.name}</title>
        <link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body {
                font-family: 'Mukta', sans-serif;
                margin: 0; padding: 20px;
                color: #000; line-height: 1.6;
            }
            .container {
                width: 100%; max-width: 800px; margin: 0 auto;
            }
            .dotted-line {
                border-bottom: 1px dotted #000; padding: 0 10px; font-weight: bold;
            }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            td { padding: 8px 0; font-size: 15px; }
            .separator { border-top: 3px double #000; height: 5px; margin-bottom: 25px; margin-top: 15px;}
            @media print {
                @page { margin: 15mm; }
                body { padding: 0; }
                .container { max-width: 100%; }
            }
        </style>
    </head>
    <body onload="setTimeout(() => { window.print(); }, 1000)">
        <div class="container">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="font-size: 26px; font-weight: 700; margin: 0;">पंचायत सहायक यूनियन उत्तर प्रदेश</h1>
            </div>

            <!-- Title 1 -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                <div style="font-size: 14px; line-height: 1.2;">
                     सेवा में,<br>महामंत्री<br>पंचायत सहायक यूनियन उत्तर प्रदेश।
                </div>
                <div style="text-align: center; flex: 1;">
                    <h2 style="font-size: 20px; font-weight: 600; margin: 0; text-decoration: underline;">हस्ताक्षर अभियान हेतु समर्थन पत्र</h2>
                </div>
                <div style="font-size: 14px; text-align: right;">
                    टोकन क्रमांक: <span class="dotted-line">${data.membershipNumber || data.receiptNo || '______________'}</span>
                </div>
            </div>

            <!-- Body Paragraph with Photo -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                <div style="font-size: 15px; flex: 1; padding-right: 20px; text-align: justify;">
                    महोदय,<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;मैं पंचायत सहायक यूनियन उत्तर प्रदेश द्वारा चलाए जा रहे हस्ताक्षर अभियान का पूर्ण समर्थन करता/करती हूँ और पंचायत सहायकों की विभिन्न जायज मांगों के निराकरण हेतु अपना समर्थन दर्ज करता/करती हूँ। मेरा विवरण निम्नवत है:-
                </div>
                <div style="width: 110px; height: 140px; border: 1px solid #000; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                    ${photoHTML}
                </div>
            </div>

            <!-- Form Fields -->
            <table>
                <tr>
                    <td style="width: 100px;">नाम:</td>
                    <td class="dotted-line">${data.name || ''}</td>
                    <td style="width: 120px; text-align: right; padding-right: 10px;">पिता / पति का नाम:</td>
                    <td class="dotted-line" style="width: 30%;">${data.guardianName || ''}</td>
                </tr>
                <tr>
                    <td>जन्मतिथि/उम्र:</td>
                    <td class="dotted-line">${data.dob || ''}</td>
                    <td style="text-align: right; padding-right: 10px;">महिला / पुरुष:</td>
                    <td class="dotted-line">${data.gender || ''}</td>
                </tr>
                <tr>
                    <td>पद:</td>
                    <td class="dotted-line">${data.occupation || ''}</td>
                    <td style="text-align: right; padding-right: 10px;">ग्राम पंचायत / विकास खण्ड:</td>
                    <td class="dotted-line">${data.postingPlace || ''}${data.block ? ` / ${data.block}` : ''}</td>
                </tr>
                <tr>
                    <td>स्थायी पता:</td>
                    <td colspan="3" class="dotted-line">${data.address || ''}</td>
                </tr>
                <tr>
                    <td>मोबाइल नम्बर:</td>
                    <td colspan="3" class="dotted-line">${data.mobile || ''}</td>
                </tr>
            </table>

            <!-- Footer 1 -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 15px;">
                <div>
                    दिनांक: <span class="dotted-line">${data.applicationDate || '______________'}</span><br><br>
                    स्थान: <span class="dotted-line">${data.applicationPlace || data.postingPlace || '______________'}</span><br><br>
                    प्रार्थनापत्र स्वीकृत/अस्वीकृत<br><br><br>
                    ह० अध्यक्ष/महामंत्री
                </div>
                <div style="text-align: center; align-self: flex-end;">
                    ${signHTML}
                    <div>ह० सदस्य</div>
                </div>
            </div>

            <div class="separator"></div>

            <!-- Title 2: Certificate -->
            <div style="text-align: center; margin-bottom: 15px;">
                <h1 style="font-size: 22px; font-weight: 700; margin: 0;">पंचायत सहायक यूनियन उत्तर प्रदेश</h1>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <div style="width: 180px;"></div>
                <div style="flex: 1; text-align: center;">
                    <h2 style="font-size: 18px; font-weight: 600; margin: 0; text-decoration: underline;">सहभागिता प्रमाण पत्र</h2>
                </div>
                <div style="font-size: 14px; text-align: right; width: 180px;">
                    टोकन क्रमांक: <span class="dotted-line">${data.membershipNumber || data.receiptNo || '______________'}</span>
                </div>
            </div>

            <!-- Certificate Body -->
            <div style="font-size: 15px; text-align: justify; line-height: 1.8; margin-bottom: 40px;">
                प्रमाणित किया जाता है कि श्री/श्रीमती/सुश्री <span class="dotted-line" style="padding: 0 20px;">${data.name || ''}</span> पुत्र/पुत्री/पत्नी श्री <span class="dotted-line" style="padding: 0 20px;">${data.guardianName || ''}</span> ने पंचायत सहायक यूनियन उत्तर प्रदेश द्वारा चलाए जा रहे हस्ताक्षर अभियान में सक्रिय <span class="dotted-line" style="padding: 0 20px;">${data.memberType || 'समर्थक'}</span> के रूप में अपनी सहभागिता दर्ज की है।
            </div>

            <!-- Footer 2 -->
            <div style="display: flex; justify-content: space-between; font-size: 15px;">
                <div>
                    दिनांक: <span class="dotted-line">${data.applicationDate || '______________'}</span>
                </div>
                <div style="text-align: center;">
                    ह० अध्यक्ष/महामंत्री
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
}

// ==========================================
// LIVE CAMPAIGN DASHBOARD SYNC
// ==========================================

async function syncCampaignStats() {
    const btn = document.getElementById('syncStatsBtn');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '⏳ गणना की जा रही है (Calculating)...';
    btn.style.opacity = '0.7';
    
    try {
        const snapshot = await db.collection('applications').get();
        let activeSize = 0;
        const districtCounts = {};
        
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.status !== 'rejected') {
                activeSize++;
                const dist = data.district;
                if (dist) {
                    districtCounts[dist] = (districtCounts[dist] || 0) + 1;
                }
            }
        });
        
        const baseOffset = 0;
        const totalSupporters = baseOffset + activeSize;
        
        await db.collection('campaign_stats').doc('live').set({
            totalSupporters: totalSupporters,
            topDistricts: districtCounts,
            lastSynced: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        btn.innerHTML = '✅ सिंक सफल हुआ (Sync Complete!)';
        btn.style.background = 'var(--green)';
        btn.style.color = '#fff';
        
        alert(`✅ लाइव डैशबोर्ड सफलता पूर्वक सिंक हुआ!\n\n• कुल समर्थक संख्या: ${totalSupporters.toLocaleString('en-IN')}\n• एक्टिव ऑनलाइन आवेदन: ${activeSize}`);
        
    } catch (err) {
        console.error("Stats synchronization failed:", err);
        alert("❌ सिंक करने में विफलता आई: " + err.message);
    } finally {
        setTimeout(() => {
            btn.disabled = false;
            btn.innerHTML = originalText;
            btn.style.background = 'var(--saffron-deep)';
            btn.style.color = 'var(--paper)';
            btn.style.opacity = '1';
        }, 3000);
    }
}

// ==========================================
// GOVERNMENT ORDERS DASHBOARD FUNCTIONS
// ==========================================

function switchDashboardView(view) {
    currentView = view;
    const campaignSection = document.getElementById('campaignDashboardSection');
    const ordersSection = document.getElementById('ordersDashboardSection');
    const viewCampaignBtn = document.getElementById('viewCampaignBtn');
    const viewOrdersBtn = document.getElementById('viewOrdersBtn');
    const dashboardSubTitle = document.getElementById('dashboardSubTitle');

    if (view === 'campaign') {
        campaignSection.style.display = 'block';
        ordersSection.style.display = 'none';
        viewCampaignBtn.classList.add('active');
        viewOrdersBtn.classList.remove('active');
        dashboardSubTitle.textContent = 'Manage Signature Campaign (हस्ताक्षर अभियान)';
        loadApplications(currentStatus, 1);
    } else {
        campaignSection.style.display = 'none';
        ordersSection.style.display = 'block';
        viewCampaignBtn.classList.remove('active');
        viewOrdersBtn.classList.add('active');
        dashboardSubTitle.textContent = 'Manage Government Orders (शासकीय आदेश संकलन)';
        loadOrders(1);
        loadOrdersStats();
    }
}

function loadOrders(page = 1) {
    ordersPage = page;
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading...</td></tr>';

    const districtFilter = document.getElementById('orderDistrictFilter').value;
    const levelFilter = document.getElementById('orderLevelFilter').value;
    const deptFilter = document.getElementById('orderDeptFilter').value;
    const blockSearch = document.getElementById('orderBlockInput').value.trim().toLowerCase();

    let query = db.collection('work_reports');

    // If filtering by district, query filter at DB level to reduce read cost
    if (districtFilter) {
        query = query.where('district', '==', districtFilter);
    }

    query.get().then((snapshot) => {
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; font-family: var(--mono);">No orders found.</td></tr>';
            updateOrdersPaginationControls(false);
            return;
        }

        let docs = snapshot.docs;

        // Apply remaining filters in-memory
        if (levelFilter) {
            docs = docs.filter(doc => doc.data().orderLevel === levelFilter);
        }
        if (deptFilter) {
            docs = docs.filter(doc => doc.data().orderDepartment === deptFilter);
        }
        if (blockSearch) {
            docs = docs.filter(doc => {
                const blk = doc.data().block || '';
                return blk.toLowerCase().includes(blockSearch);
            });
        }

        // Sort by timestamp desc
        docs.sort((a, b) => {
            const timeA = a.data().timestamp ? a.data().timestamp.toMillis() : 0;
            const timeB = b.data().timestamp ? b.data().timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        if (docs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; font-family: var(--mono);">No matching orders found.</td></tr>';
            updateOrdersPaginationControls(false);
            return;
        }

        // Paginate locally
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const pageDocs = docs.slice(startIndex, endIndex);
        const hasNextPage = docs.length > endIndex;

        allOrders = {};
        pageDocs.forEach(doc => {
            allOrders[doc.id] = doc.data();
        });

        renderOrdersTableRows(pageDocs);
        updateOrdersPaginationControls(hasNextPage);
    }).catch((error) => {
        console.error("Error loading orders:", error);
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--blood);">Error loading data. Check console.</td></tr>';
    });
}

function renderOrdersTableRows(pageDocs) {
    const tableBody = document.getElementById('ordersTableBody');
    tableBody.innerHTML = '';

    // Department translations
    const depts = {
        panchayati_raj: 'पंचायती राज विभाग',
        rural_dev: 'ग्राम्य विकास विभाग',
        revenue: 'राजस्व विभाग',
        social_welfare: 'समाज कल्याण विभाग',
        food_civil_supplies: 'खाद्य एवं रसद विभाग',
        health: 'चिकित्सा एवं स्वास्थ्य',
        education: 'बेसिक शिक्षा विभाग',
        other: 'अन्य विभाग'
    };

    const levels = {
        state: '👑 राज्य स्तर',
        district: '📍 जनपद स्तर',
        block: '🏢 विकास खण्ड स्तर'
    };

    pageDocs.forEach((doc, index) => {
        const data = doc.data();
        const tr = document.createElement('tr');
        const serialNo = (ordersPage - 1) * pageSize + index + 1;

        // Display file upload preview link
        let fileBtn = '';
        if (data.orderFileUrl) {
            const isPdf = data.orderFileName && data.orderFileName.toLowerCase().endsWith('.pdf');
            const btnLabel = isPdf ? '📄 View PDF' : '🖼️ View Image';
            fileBtn = `<a href="${data.orderFileUrl}" target="_blank" class="cert-btn" style="background: var(--saffron-deep); display: inline-flex; align-items: center; gap: 4px;">${btnLabel}</a>`;
        } else {
            fileBtn = '<span style="color: #777;">No File</span>';
        }

        const deptName = depts[data.orderDepartment] || data.orderDepartment || 'अन्य';
        const levelName = levels[data.orderLevel] || data.orderLevel || '-';

        tr.innerHTML = `
            <td style="font-family: var(--mono); font-weight: 800; text-align: center;">${serialNo}</td>
            <td><strong>${data.name}</strong>${data.mobile ? `<br><small>${data.mobile}</small>` : ''}</td>
            <td><strong>${data.district || '-'}</strong><br><small>${data.block || '-'}</small></td>
            <td><span style="font-weight: 700; color: var(--ink);">${levelName}</span></td>
            <td><strong>${deptName}</strong><br><small>${data.orderWorkType || '-'}</small></td>
            <td>${fileBtn}</td>
            <td>
                <button class="action-btn" style="background: var(--ink); color: var(--paper);" onclick="viewOrderDetails('${doc.id}')">Details</button>
                <button class="action-btn reject-btn" onclick="deleteOrder('${doc.id}')">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function changeOrdersPage(dir) {
    if (dir === 'first') {
        ordersPage = 1;
    } else if (typeof dir === 'number') {
        ordersPage += dir;
        if (ordersPage < 1) ordersPage = 1;
    }
    loadOrders(ordersPage);
}

function updateOrdersPaginationControls(hasNextPage) {
    document.getElementById('ordersPageIndicator').textContent = `Page ${ordersPage}`;
    document.getElementById('btnOrdersPrevPage').disabled = ordersPage === 1;
    document.getElementById('btnOrdersFirstPage').disabled = ordersPage === 1;
    document.getElementById('btnOrdersNextPage').disabled = !hasNextPage;

    document.getElementById('btnOrdersPrevPage').style.opacity = ordersPage === 1 ? '0.5' : '1';
    document.getElementById('btnOrdersFirstPage').style.opacity = ordersPage === 1 ? '0.5' : '1';
    document.getElementById('btnOrdersNextPage').style.opacity = !hasNextPage ? '0.5' : '1';
}

function applyOrdersFilters() {
    ordersPage = 1;
    loadOrders(1);
}

function handleOrderBlockKey(event) {
    if (event.key === 'Enter') {
        applyOrdersFilters();
    }
}

function clearOrdersSearchAndReload() {
    document.getElementById('orderDistrictFilter').value = '';
    document.getElementById('orderLevelFilter').value = '';
    document.getElementById('orderDeptFilter').value = '';
    document.getElementById('orderBlockInput').value = '';
    ordersPage = 1;
    loadOrders(1);
}

function loadOrdersStats() {
    const statTotal = document.getElementById('statOrdersTotal');
    const statState = document.getElementById('statOrdersState');
    const statLocal = document.getElementById('statOrdersLocal');

    db.collection('work_reports').get().then(snap => {
        let total = snap.size;
        let stateCount = 0;
        let localCount = 0;

        snap.forEach(doc => {
            const data = doc.data();
            if (data.orderLevel === 'state') stateCount++;
            if (data.orderLevel === 'district' || data.orderLevel === 'block') localCount++;
        });

        if (statTotal) statTotal.textContent = total;
        if (statState) statState.textContent = stateCount;
        if (statLocal) statLocal.textContent = localCount;
    }).catch(err => {
        console.error("Error loading order stats:", err);
    });
}

function deleteOrder(id) {
    if (confirm("⚠️ क्या आप वाकई इस शासकीय आदेश रिपोर्ट को स्थायी रूप से हटाना चाहते हैं?\n\nयह डेटाबेस से हमेशा के लिए डिलीट हो जाएगा!")) {
        db.collection('work_reports').doc(id).delete()
            .then(() => {
                alert("✅ रिपोर्ट सफलतापूर्वक डिलीट कर दी गई!");
                loadOrders(ordersPage);
                loadOrdersStats();
            })
            .catch(err => {
                console.error("Error deleting order:", err);
                alert("❌ डिलीट करने में विफलता आई: " + err.message);
            });
    }
}

function deleteDetailsOrder(id) {
    closeDetailsModal();
    deleteOrder(id);
}

function viewOrderDetails(id) {
    const data = allOrders[id];
    if (!data) return;

    const content = document.getElementById('detailsContent');

    const depts = {
        panchayati_raj: 'पंचायती राज विभाग (Panchayati Raj)',
        rural_dev: 'ग्राम्य विकास विभाग (Rural Dev)',
        revenue: 'राजस्व विभाग (Revenue)',
        social_welfare: 'समाज कल्याण विभाग (Social Welfare)',
        food_civil_supplies: 'खाद्य एवं रसद विभाग (Food & Civil Supplies)',
        health: 'चिकित्सा एवं स्वास्थ्य (Health & Welfare)',
        education: 'बेसिक शिक्षा विभाग (Basic Education)',
        other: 'अन्य विभाग (Other)'
    };

    const levels = {
        state: 'राज्य स्तर (State Level)',
        district: 'जनपद स्तर (District Level)',
        block: 'विकास खण्ड स्तर (Block Level)'
    };

    const levelName = levels[data.orderLevel] || data.orderLevel || '-';
    const deptName = depts[data.orderDepartment] || data.orderDepartment || '-';

    let filePreview = '';
    if (data.orderFileUrl) {
        const isPdf = data.orderFileName && data.orderFileName.toLowerCase().endsWith('.pdf');
        if (isPdf) {
            filePreview = `
                <div style="grid-column: span 2; background: rgba(31,90,46,0.06); padding: 15px; border: 2px solid var(--ink); text-align: center;">
                    <span style="font-size: 2rem;">📄</span>
                    <div style="margin-top: 5px; font-weight: bold;">PDF Document: ${data.orderFileName || 'order.pdf'}</div>
                    <a href="${data.orderFileUrl}" target="_blank" class="cert-btn" style="background: var(--green); color:#fff; margin-top: 10px; display: inline-block;">ओपन PDF (New Tab)</a>
                </div>
            `;
        } else {
            filePreview = `
                <div style="grid-column: span 2; border: 2px solid var(--ink); text-align: center; background: #fff; padding: 10px;">
                    <img src="${data.orderFileUrl}" style="max-width: 100%; max-height: 250px; object-fit: contain;" alt="Order Image">
                    <div style="margin-top: 8px;"><a href="${data.orderFileUrl}" target="_blank" class="cert-btn" style="background: var(--green); color:#fff;">बड़ा आकार देखें (New Tab)</a></div>
                </div>
            `;
        }
    } else {
        filePreview = '<div style="grid-column: span 2; text-align: center; color: #777;">No File Uploaded</div>';
    }

    // Format date
    let dateStr = data.goDate || '';

    const mobileHtml = data.mobile ? `<div><strong>मोबाइल:</strong> ${data.mobile}</div>` : '';
    const gpHtml = data.postingPlace ? `<div><strong>ग्राम पंचायत:</strong> ${data.postingPlace}</div>` : '';
    const goNoHtml = data.goNumber ? `<div><strong>शासनादेश संख्या:</strong> ${data.goNumber}</div>` : '';
    const goDateHtml = dateStr ? `<div><strong>शासनादेश दिनांक:</strong> ${dateStr}</div>` : '';

    content.innerHTML = `
        <div style="grid-column: span 2; border-bottom: 2px solid var(--ink); padding-bottom: 8px; margin-bottom: 10px;">
            <h3 style="color: var(--saffron-deep); margin: 0; font-family: var(--condensed); text-transform: uppercase;">प्रविष्टि विवरण (Report ID: ${data.reportId || '-'})</h3>
        </div>
        <div><strong>नाम:</strong> ${data.name || '-'}</div>
        ${mobileHtml}
        <div><strong>जनपद (District):</strong> ${data.district || '-'}</div>
        <div><strong>विकास खण्ड (Block):</strong> ${data.block || '-'}</div>
        ${gpHtml}
        <div><strong>आदेश का स्तर:</strong> ${levelName}</div>
        <div><strong>आदेश का विभाग:</strong> ${deptName}</div>
        <div><strong>आदेश का विषय:</strong> ${data.orderWorkType || '-'}</div>
        ${goNoHtml}
        ${goDateHtml}
        <div style="grid-column: span 2; border-top: 2px dashed rgba(26,17,8,0.15); padding-top: 10px;">
            <strong>टिप्पणी / विवरण:</strong>
            <p style="margin-top: 5px; font-weight: normal; background: var(--paper-2); padding: 10px; border: 1.5px solid var(--ink);">${data.customWorkDesc || 'कोई टिप्पणी नहीं।'}</p>
        </div>
        <div style="grid-column: span 2; border-top: 2px dashed rgba(26,17,8,0.15); padding-top: 10px; margin-top: 10px;">
            <strong>शासकीय आदेश कॉपी:</strong>
        </div>
        ${filePreview}
    `;

    // Update details modal buttons
    const modalButtonsContainer = document.querySelector('#detailsModal .modal-buttons');
    if (modalButtonsContainer) {
        modalButtonsContainer.innerHTML = `
            <button class="modal-btn" id="detailsDeleteBtn" style="background: var(--blood); color: var(--paper);" onclick="deleteDetailsOrder('${id}')">🗑️ स्थायी रूप से हटाएं (Delete)</button>
            <button class="modal-btn" style="background: var(--ink); color: var(--paper);" onclick="closeDetailsModal()">बंद करें (Close)</button>
        `;
    }

    document.getElementById('detailsModal').style.display = 'flex';
}

function handleOrdersCSVExport() {
    const exportBtn = document.querySelector('button[onclick="handleOrdersCSVExport()"]');
    const originalText = exportBtn.textContent;
    exportBtn.textContent = '📥 Fetching all...';
    exportBtn.disabled = true;

    db.collection('work_reports').get().then((snapshot) => {
        if (snapshot.empty) {
            alert("डेटाबेस में कोई डेटा नहीं मिला!");
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
            return;
        }

        const csv = [];
        // CSV Header
        csv.push('"Report ID","Panchayat Sahayak","Mobile","District","Block","Gram Panchayat","Order Level","Department","Work Type","G.O. Number","G.O. Date","File URL","Comments"');

        const docs = snapshot.docs;
        docs.sort((a, b) => {
            const timeA = a.data().timestamp ? a.data().timestamp.toMillis() : 0;
            const timeB = b.data().timestamp ? b.data().timestamp.toMillis() : 0;
            return timeB - timeA;
        });

        const depts = {
            panchayati_raj: 'पंचायती राज विभाग',
            rural_dev: 'ग्राम्य विकास विभाग',
            revenue: 'राजस्व विभाग',
            social_welfare: 'समाज कल्याण विभाग',
            food_civil_supplies: 'खाद्य एवं रसद विभाग',
            health: 'चिकित्सा एवं स्वास्थ्य',
            education: 'बेसिक शिक्षा विभाग',
            other: 'अन्य विभाग'
        };

        const levels = {
            state: 'राज्य स्तर',
            district: 'जनपद स्तर',
            block: 'विकास खण्ड स्तर'
        };

        docs.forEach(doc => {
            const data = doc.data();
            const reportId = data.reportId || '-';
            const name = (data.name || '').replace(/"/g, '""');
            const mobile = (data.mobile || '').replace(/"/g, '""');
            const district = (data.district || '').replace(/"/g, '""');
            const block = (data.block || '').replace(/"/g, '""');
            const gp = (data.postingPlace || '').replace(/"/g, '""');
            const level = levels[data.orderLevel] || data.orderLevel || '-';
            const dept = depts[data.orderDepartment] || data.orderDepartment || '-';
            const workType = (data.orderWorkType || '').replace(/"/g, '""');
            const goNo = (data.goNumber || '').replace(/"/g, '""');
            const goDate = data.goDate || '-';
            const fileUrl = data.orderFileUrl || '';
            const comment = (data.customWorkDesc || '').replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ");

            csv.push(`"${reportId}","${name}","${mobile}","${district}","${block}","${gp}","${level}","${dept}","${workType}","${goNo}","${goDate}","${fileUrl}","${comment}"`);
        });

        const blob = new Blob(["\uFEFF" + csv.join("\n")], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = `Panchayat_Sahayak_Union_Orders_${new Date().toISOString().slice(0,10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    }).catch(err => {
        console.error("Export orders failed:", err);
        alert("एक्सपोर्ट करने में त्रुटि हुई!");
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    });
}
