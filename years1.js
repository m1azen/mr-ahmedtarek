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

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserName = "زائر";
let isFirebaseReady = false;

document.addEventListener("DOMContentLoaded", () => {
  // عناصر واجهة المستخدم
  const sidebar = document.getElementById("sidebar");
  const closeSidebarButton = document.getElementById("closeSidebarButton");
  const userIcon = document.getElementById("userIcon");
  const sidebarContent = document.getElementById("sidebarContent");
  const bannerButtonsContainer = document.getElementById("bannerButtons");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;
  const freeCourseBtn = document.getElementById('free-course-btn');
  const paidCourseStatus = document.getElementById('paid-course-status');
  
  // تعريف الدوال المساعدة
  const isUserLoggedIn = () => auth.currentUser !== null;
  const getUserName = () => currentUserName;

  // دالة تسجيل الخروج
  const firebaseLogout = async () => {
    try {
      await signOut(auth);
      console.log("تم تسجيل الخروج بنجاح");
      // تحديث الواجهة بعد تسجيل الخروج
      updateUI();
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  // دالة عرض محتوى القائمة الجانبية
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

      document.getElementById("registerButton").addEventListener("click", () => {
        window.location.href = "sign.html";
        sidebar.classList.remove("show");
      });

      document.getElementById("loginButton").addEventListener("click", () => {
        window.location.href = "login.html";
        sidebar.classList.remove("show");
      });
    }
  };

  // دالة تحديث أزرار البانر العلوي
  const renderBannerButtons = () => {
    if (!bannerButtonsContainer) return;
    bannerButtonsContainer.innerHTML = '';

    if (isUserLoggedIn()) {
      bannerButtonsContainer.innerHTML += `
        <button onclick="window.location.href='منتدى الطلبة.html'">منتدى الطلبة</button>
        <button onclick="window.location.href='حسابي.html'">حسابي</button>
      `;
    }
  };

const updateCourseStatus = async (user) => {
  if (!freeCourseBtn || !paidCourseStatus) return;

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "userdata", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();

        if (userData.course1 && userData.course1.status === 'active') {
          // ✅ المستخدم مشترك في الكورس
          paidCourseStatus.innerHTML = `
            <div class="enrollment-status">
              <span class="status-badge"><i class="fas fa-check-circle"></i> أنت مشترك في هذا الكورس</span>
              <a href="coursyears1.html" class="enroll-btn enrolled">
                <span class="btn-text">الدخول إلى الكورس</span>
                <i class="fas fa-arrow-left"></i>
              </a>
            </div>
          `;

          // إخفاء السعر لو موجود
          const coursePriceElement = document.getElementById("course-price");
          if (coursePriceElement) {
            coursePriceElement.style.display = "none";
          }

        } else {
          // ❌ مش مشترك - عرض زر اشتراك
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
    // 🚫 المستخدم غير مسجل الدخول
    freeCourseBtn.innerHTML = '<span class="btn-text">يجب تسجيل الدخول أولاً</span><i class="fas fa-arrow-left"></i>';
    freeCourseBtn.href = '#';
    freeCourseBtn.classList.remove('enrolled');

    paidCourseStatus.innerHTML = `
      <a href="login.html" class="enroll-btn">
        <span class="btn-text">سجل الدخول للاشتراك</span>
        <i class="fas fa-arrow-left"></i>
      </a>
    `;
  }
};

      } catch (err) {
        console.error("خطأ أثناء جلب بيانات الكورس:", err);
        paidCourseStatus.innerHTML = `
          <a href="#" class="enroll-btn">
            <span class="btn-text">اشترك الآن</span>
            <i class="fas fa-arrow-left"></i>
          </a>
        `;
      }
    } else {
      // المستخدم غير مسجل الدخول
      freeCourseBtn.innerHTML = '<span class="btn-text">يجب تسجيل دخول أولاً</span><i class="fas fa-arrow-left"></i>';
      freeCourseBtn.href = '#';
      freeCourseBtn.classList.remove('enrolled');
      
      paidCourseStatus.innerHTML = `
        <a href="#" class="enroll-btn">
          <span class="btn-text">يجب تسجيل دخول أولاً</span>
          <i class="fas fa-arrow-left"></i>
        </a>
      `;
    }
  };

  // دالة تحديث واجهة المستخدم بالكامل
  const updateUI = () => {
    renderSidebarContent();
    renderBannerButtons();
    updateCourseStatus(auth.currentUser);
  };

  // مراقبة حالة المصادقة
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "userdata", user.uid));
        if (userDoc.exists()) {
          currentUserName = userDoc.data().username || "مستخدم";
          console.log("اسم المستخدم:", currentUserName);
        } else {
          currentUserName = "مستخدم";
          console.warn("لا يوجد بيانات لهذا المستخدم.");
        }
      } catch (err) {
        currentUserName = "مستخدم";
        console.error("خطأ أثناء جلب البيانات:", err);
      }
    } else {
      currentUserName = "زائر";
      console.log("المستخدم غير مسجل الدخول");
    }
    isFirebaseReady = true;
    updateUI();
  });

  // دالة تطبيق الوضع الداكن
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.checked = true;
      // إضافة أنماط للقائمة الجانبية في الوضع الداكن
      if (sidebar) {
        sidebar.classList.add('dark-mode');
      }
    } else {
      body.classList.remove('dark-mode');
      themeToggle.checked = false;
      // إزالة أنماط القائمة الجانبية في الوضع الداكن
      if (sidebar) {
        sidebar.classList.remove('dark-mode');
      }
    }
  };

  // التحقق من إعدادات الوضع الداكن
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  // تبديل الوضع الداكن
  themeToggle.addEventListener("change", () => {
    const mode = themeToggle.checked ? 'dark' : 'light';
    applyTheme(mode);
    localStorage.setItem('theme', mode);
  });

  // فتح القائمة الجانبية
  userIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    sidebar.classList.add("show");
    updateUI();
  });

  // إغلاق القائمة الجانبية
  closeSidebarButton.addEventListener("click", () => {
    sidebar.classList.remove("show");
  });

  // إغلاق القائمة عند النقر خارجها
  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("show") && 
        !sidebar.contains(e.target) && 
        !userIcon.contains(e.target)) {
      sidebar.classList.remove("show");
    }
  });

  // عرض التاريخ الحالي
  const updateCurrentDate = () => {
    const now = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Africa/Cairo'
    };
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
      dateElement.textContent = now.toLocaleDateString('ar-EG', options);
    }
  };
  
  updateCurrentDate();

  // تأثيرات عند التمرير للكروت
  window.addEventListener('scroll', function() {
    const cards = document.querySelectorAll('.course-card');
    const windowHeight = window.innerHeight;
    
    cards.forEach(card => {
      const cardPosition = card.getBoundingClientRect().top;
      if (cardPosition < windowHeight - 100) {
        card.style.opacity = '1';
      }
    });
  });
});
