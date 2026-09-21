// firebase-config.js

const firebaseConfig = {
  apiKey: "AIzaSyCnPwiAQ4yAW4WLrWicxyPWCNAy6Jt_bKw",
  authDomain: "panchayat-27a8c.firebaseapp.com",
  databaseURL: "https://panchayat-27a8c-default-rtdb.firebaseio.com",
  projectId: "panchayat-27a8c",
  storageBucket: "panchayat-27a8c.firebasestorage.app",
  messagingSenderId: "762096652598",
  appId: "1:762096652598:web:9b88dbf4ac005bef476397"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firestore
const db = firebase.firestore();
