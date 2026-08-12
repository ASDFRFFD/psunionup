// notifications.js
// Handles real-time announcements from Firestore and renders the notification bell, badge, drawer, and live toast alerts.

(function () {
  'use strict';
  console.log("notifications.js IIFE loaded!");

  const firebaseConfig = {
    apiKey: "AIzaSyACe8pL0vqD_2NqzhTNOi0VoTyJaYVTkbA",
    authDomain: "panchayat-sahahayk-portal-up.firebaseapp.com",
    projectId: "panchayat-sahahayk-portal-up",
    storageBucket: "panchayat-sahahayk-portal-up.firebasestorage.app",
    messagingSenderId: "709368114724",
    appId: "1:709368114724:web:208c828040f499060e72b1",
    measurementId: "G-5K1E4LZV20"
  };

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // Inject markup for bell icon, drawer, and toast container
  function injectNotificationMarkup() {
    // 1. Inject Bell Icon into .header-utils or .premium-header-container or body
    const bellHTML = `
      <div class="notification-bell-container" id="notificationBellContainer" title="सूचनाएं (Announcements)">
        <button class="notification-bell-btn" id="notificationBellBtn" aria-label="Notifications">
          🔔
          <span class="notification-badge" id="notificationBadge" style="display: none;">0</span>
        </button>
      </div>
    `;

    console.log("injectNotificationMarkup execution start");
    // Try finding header utility areas
    let headerUtils = document.querySelector('.header-utils') || 
                      document.querySelector('.nic-top-right') || 
                      document.querySelector('.premium-header-container') ||
                      document.querySelector('.nic-header-container');
    console.log("injectNotificationMarkup headerUtils matched:", headerUtils);

    if (headerUtils) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = bellHTML.strip ? bellHTML.strip() : bellHTML;
      headerUtils.insertBefore(tempDiv.firstElementChild, headerUtils.firstChild);
    }

    // 2. Inject Drawer and Toast Container into document.body
    const drawerHTML = `
      <div class="notification-backdrop" id="notificationBackdrop"></div>
      <div class="notification-drawer" id="notificationDrawer">
        <div class="notification-drawer-header">
          <h3>🔔 सूचनाएं (Announcements)</h3>
          <button class="notification-close-btn" id="notificationCloseBtn" aria-label="Close">✕</button>
        </div>
        <div class="notification-drawer-body" id="notificationDrawerBody">
          <div class="notification-empty-state">
            <div class="notification-empty-icon">📭</div>
            <p>कोई नई सूचना नहीं है।</p>
          </div>
        </div>
      </div>
      <div class="notification-toast-container" id="notificationToastContainer"></div>
    `;

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = drawerHTML;
    while (tempContainer.firstChild) {
      document.body.appendChild(tempContainer.firstChild);
    }
  }

  // Format date helper
  function defFormatDate(date) {
    try {
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      return date.toLocaleDateString('hi-IN', options);
    } catch (e) {
      return date.toDateString();
    }
  }

  // Show Toast Alert
  function showLiveToast(announcement) {
    const container = document.getElementById('notificationToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
      <div class="notification-card-icon">📢</div>
      <div class="notification-card-content">
        <div class="notification-card-title">${announcement.title || 'नई सूचना'}</div>
        <div class="notification-card-body">${announcement.body || ''}</div>
      </div>
    `;

    container.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 6000);
  }

  // Update Drawer contents
  function updateNotificationDrawer(announcements) {
    const drawerBody = document.getElementById('notificationDrawerBody');
    const badge = document.getElementById('notificationBadge');
    if (!drawerBody) return;

    if (announcements.length === 0) {
      drawerBody.innerHTML = `
        <div class="notification-empty-state">
          <div class="notification-empty-icon">📭</div>
          <p>कोई नई सूचना नहीं है।</p>
        </div>
      `;
      if (badge) badge.style.display = 'none';
      return;
    }

    const lastReadTime = parseInt(localStorage.getItem('gp_last_read_announcement') || '0', 10);
    let unreadCount = 0;

    let html = '';
    announcements.forEach((ann) => {
      const isUnread = ann.createdAt.getTime() > lastReadTime;
      if (isUnread) unreadCount++;

      html += `
        <div class="notification-card ${isUnread ? 'unread' : ''}" data-id="${ann.id}">
          <div class="notification-card-icon">${ann.icon || '📢'}</div>
          <div class="notification-card-content">
            <div class="notification-card-title">${ann.title}</div>
            <div class="notification-card-body">${ann.body}</div>
            <div class="notification-card-time">${defFormatDate(ann.createdAt)}</div>
          </div>
        </div>
      `;
    });

    drawerBody.innerHTML = html;

    // Update Badge
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  // Setup Event Listeners
  function setupEventListeners() {
    const bellBtn = document.getElementById('notificationBellBtn');
    const closeBtn = document.getElementById('notificationCloseBtn');
    const backdrop = document.getElementById('notificationBackdrop');
    const drawer = document.getElementById('notificationDrawer');

    if (!bellBtn || !drawer) return;

    const toggleDrawer = () => {
      const isOpen = drawer.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      
      if (isOpen) {
        // Mark all as read
        localStorage.setItem('gp_last_read_announcement', Date.now().toString());
        const badge = document.getElementById('notificationBadge');
        if (badge) badge.style.display = 'none';
        
        // Remove unread class from cards in drawer
        document.querySelectorAll('.notification-card.unread').forEach((card) => {
          card.classList.remove('unread');
        });
      }
    };

    bellBtn.addEventListener('click', toggleDrawer);
    if (closeBtn) closeBtn.addEventListener('click', toggleDrawer);
    if (backdrop) backdrop.addEventListener('click', toggleDrawer);
  }

  // Initialize Notifications
  async function init() {
    console.log("notifications.js init function starting");
    injectNotificationMarkup();
    setupEventListeners();

    try {
      // Dynamic load Firebase if missing
      if (typeof firebase === 'undefined') {
        await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
        await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js");
      } else if (typeof firebase.firestore === 'undefined') {
        await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js");
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }

      const db = firebase.firestore();
      let isFirstLoad = true;

      db.collection("announcements")
        .orderBy("createdAt", "desc")
        .limit(20)
        .onSnapshot((snapshot) => {
          let announcements = [];
          
          // Check for new notifications since load (if not first load)
          if (!isFirstLoad) {
            snapshot.docChanges().forEach((change) => {
              if (change.type === 'added') {
                showLiveToast(change.doc.data());
              }
            });
          }

          snapshot.forEach((doc) => {
            const data = doc.data();
            announcements.push({
              id: doc.id,
              title: data.title || '',
              body: data.body || '',
              createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
              icon: data.icon || '📢'
            });
          });

          updateNotificationDrawer(announcements);
          isFirstLoad = false;
        }, (error) => {
          console.error("Announcements listener failed", error);
        });

      // Register FCM Web Push notifications
      if ('Notification' in window && 'serviceWorker' in navigator) {
        db.collection("config").doc("fcm_keys").get().then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.vapidKey) {
              setupFCM(data.vapidKey, db);
            }
          }
        }).catch((e) => console.log("Failed to fetch VAPID key", e));
      }

    } catch (e) {
      console.error("Failed to initialize announcements notifications system", e);
    }
  }

  // Setup FCM function
  async function setupFCM(vapidKey, db) {
    try {
      await loadScript("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");
      const messaging = firebase.messaging();
      
      // Request Permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const reg = await navigator.serviceWorker.ready;
        const currentToken = await messaging.getToken({
          vapidKey: vapidKey,
          serviceWorkerRegistration: reg
        });
        
        if (currentToken) {
          // Save the token to Firestore
          await db.collection("push_tokens").doc(currentToken).set({
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          }, { merge: true });
        } else {
          console.log('No FCM registration token available.');
        }
      } else {
        console.warn("Notification permission denied by user.");
      }
    } catch (err) {
      console.warn("FCM setup failed:", err);
    }
  }

  // Run on DOM load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
