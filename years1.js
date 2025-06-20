// استيراد Firebase Core & Auth & Firestore
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCV_AIVs3JAeVnIkGTievQdKO_RKVTMNtk",
  authDomain: "mrahmedtarek-ffdac.firebaseapp.com",
  projectId: "mrahmedtarek-ffdac",
  storageBucket: "mrahmedtarek-ffdac.firebasestorage.app",
  messagingSenderId: "660123002704",
  appId: "1:660123002704:web:15b96f9d407042df412e55",
  measurementId: "G-98B9X9J60E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const loadingOverlay = document.getElementById('loading-overlay');

let currentUserName = "زائر";
let isFirebaseReady = false;

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const closeSidebarButton = document.getElementById("closeSidebarButton");
  const userIcon = document.getElementById("userIcon");
  const sidebarContent = document.getElementById("sidebarContent");
  const bannerButtonsContainer = document.getElementById("bannerButtons");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const freeCourseBtn = document.getElementById('free-course-btn');
  const paidCourseStatus = document.getElementById('paid-course-status');

  const isUserLoggedIn = () => auth.currentUser !== null;
  const getUserName = () => currentUserName;

  const firebaseLogout = async () => {
    try {
      await signOut(auth);
      updateUI();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  if (loadingOverlay) loadingOverlay.style.display = 'none';

  const renderSidebarContent = () => {
    sidebarContent.innerHTML = '';
    sidebarContent.innerHTML += `<button class="sidebar-button" onclick="window.location.href='index.html'"><i class="fas fa-home"></i> الصفحة الرئيسية</button>`;

    if (isUserLoggedIn()) {
      sidebarContent.innerHTML += `
        <div class="sidebar-user-info">
          <span>أهلاً ${getUserName()}</span>
        </div>
        <button class="sidebar-button" onclick="window.location.href='myaccount.html'"><i class="fas fa-user-circle"></i> حسابي</button>
        <button class="sidebar-button" onclick="window.location.href='myaccount.html'"><i class="fas fa-book-open"></i> كورساتي</button>
        <button class="sidebar-button" id="logoutButton"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
      `;
      document.getElementById("logoutButton").addEventListener("click", () => {
        firebaseLogout();
        sidebar.classList.remove("show");
      });
    } else {
      sidebarContent.innerHTML += `
        <button class="sidebar-button" id="registerButton"><i class="fas fa-user-plus"></i> تسجيل جديد</button>
        <button class="sidebar-button" id="loginButton"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
      `;
      document.getElementById("registerButton").addEventListener("click", () => window.location.href = "sign.html");
      document.getElementById("loginButton").addEventListener("click", () => window.location.href = "login.html");
    }
  };



  const updateCourseStatus = async (user) => {
    if (!freeCourseBtn || !paidCourseStatus) return;

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "userdata", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const status = userData?.courses?.course1?.status;
          if (status === 'active') {
            paidCourseStatus.innerHTML = `
              <div class="enrollment-status">
                <span class="status-badge"><i class="fas fa-check-circle"></i> أنت مشترك في هذا الكورس</span>
                <a href="yearscours1.html" class="enroll-btn enrolled">
                  <span class="btn-text"></span>
                  <i class="fas fa-arrow-left"></i>
                </a>
              </div>
            `;
            const coursePriceElement = document.getElementById("course-price");
            if (coursePriceElement) coursePriceElement.style.display = "none";
          } else {
            paidCourseStatus.innerHTML = `
              <a href="#" class="enroll-btn">
                <span class="btn-text">اشترك الآن</span>
                <i class="fas fa-arrow-left"></i>
              </a>
            `;
          }
        }
      } catch (err) {
        console.error("خطأ أثناء جلب بيانات المستخدم:", err);
      }
    } else {
      freeCourseBtn.innerHTML = '<span class="btn-text">يجب تسجيل الدخول أولاً</span><i class="fas fa-arrow-left"></i>';
      freeCourseBtn.href = '#';
      freeCourseBtn.classList.remove('enrolled');
      freeCourseBtn.addEventListener("click", () => window.location.href = "login.html");

      paidCourseStatus.innerHTML = `
        <a href="login.html" class="enroll-btn">
          <span class="btn-text">سجل الدخول للاشتراك</span>
          <i class="fas fa-arrow-left"></i>
        </a>
      `;
    }
  };

  const updateUI = () => {
    renderSidebarContent();
    renderBannerButtons();
    updateCourseStatus(auth.currentUser);
  };

  onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        const userDoc = await getDoc(doc(db, "userdata", user.uid));
        if (userDoc.exists()) {
          currentUserName = userDoc.data().username || "مستخدم";
        }
      } else {
        currentUserName = "زائر";
      }
    } catch {
      currentUserName = "زائر";
    }
    isFirebaseReady = true;
    updateUI();
  });

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.checked = true;
      if (sidebar) sidebar.classList.add('dark-mode');
    } else {
      body.classList.remove('dark-mode');
      themeToggle.checked = false;
      if (sidebar) sidebar.classList.remove('dark-mode');
    }
  };

  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  themeToggle.addEventListener("change", () => {
    const mode = themeToggle.checked ? 'dark' : 'light';
    applyTheme(mode);
    localStorage.setItem('theme', mode);
  });

  userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.add("show");
    updateUI();
  });

  closeSidebarButton.addEventListener("click", () => sidebar.classList.remove("show"));

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("show") && !sidebar.contains(e.target) && !userIcon.contains(e.target)) {
      sidebar.classList.remove("show");
    }
  });

  const updateCurrentDate = () => {
    const now = new Date();
    const options = {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      timeZone: 'Africa/Cairo'
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString('ar-EG', options);
    }
  };
  updateCurrentDate();

  window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.course-card');
    const windowHeight = window.innerHeight;
    cards.forEach(card => {
      if (card.getBoundingClientRect().top < windowHeight - 100) {
        card.style.opacity = '1';
      }
    });
  });
});
