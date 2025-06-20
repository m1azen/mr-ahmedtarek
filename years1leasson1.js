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

// 🌀 إخفاء شاشة التحميل
function hideLoadingOverlay() {
  const loadingOverlay = document.getElementById("loadingOverlay");
  if (loadingOverlay) {
    loadingOverlay.style.opacity = '0';
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 500);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const closeSidebarButton = document.getElementById("closeSidebarButton");
  const userIcon = document.getElementById("userIcon");
  const sidebarContent = document.getElementById("sidebarContent");
  const bannerButtonsContainer = document.getElementById("bannerButtons");
  const themeToggle = document.getElementById("theme-toggle");
  const body = document.body;

  const isUserLoggedIn = () => auth.currentUser !== null;
  const getUserName = () => currentUserName;

  const firebaseLogout = async () => {
    try {
      await signOut(auth);
      console.log("تم تسجيل الخروج بنجاح");
    } catch (error) {
      console.error("خطأ في تسجيل الخروج:", error);
    }
  };

  const renderSidebarContent = () => {
    sidebarContent.innerHTML = '';
    sidebarContent.innerHTML += `<button class="sidebar-button"><i class="fas fa-home"></i> الصفحة الرئيسية</button>`;

    if (isUserLoggedIn()) {
      sidebarContent.innerHTML += `
        <div class="sidebar-user-info">
          <span>أهلاً ${getUserName()}</span>
        </div>
sidebarContent.innerHTML += `
  <div class="sidebar-user-info">
    <span>أهلاً ${getUserName()}</span>
  </div>

  <button class="sidebar-button" onclick="window.location.href='myaccount.html'">
    <i class="fas fa-user-circle"></i> حسابي
  </button>
  <button class="sidebar-button" onclick="window.location.href='mycourses.html'">
    <i class="fas fa-book-open"></i> كورساتي
  </button>
  <button class="sidebar-button" id="logoutButton">
    <i class="fas fa-sign-out-alt"></i> تسجيل خروج
  </button>
`;
setTimeout(() => {
  const myCoursesBtn = document.getElementById("myCoursesBtn");
  if (myCoursesBtn) {
    myCoursesBtn.addEventListener("click", async () => {
      const user = auth.currentUser;
      if (!user) {
        alert("يرجى تسجيل الدخول أولاً.");
        window.location.href = "login.html";
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "userdata", user.uid));
        if (userDoc.exists()) {
          const grade = userDoc.data()?.grade;
          switch (grade) {
            case "first-secondary":
              window.location.href = "years1.html";
              break;
            case "second-secondary":
              window.location.href = "years2.html";
              break;
            case "third-secondary":
              window.location.href = "years3.html";
              break;
            default:
              alert("الصف الدراسي غير محدد.");
              break;
          }
        } else {
          alert("لا يوجد بيانات لهذا المستخدم.");
        }
      } catch (error) {
        console.error("خطأ أثناء جلب البيانات:", error);
        alert("حدث خطأ أثناء التوجيه.");
      }
    });
  }
}, 0);


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
      });

      document.getElementById("loginButton").addEventListener("click", () => {
        window.location.href = "login.html";
      });
    }
  };

  const renderBannerButtons = () => {
    if (!bannerButtonsContainer) return;
    bannerButtonsContainer.innerHTML = '';
  };

  const updateUI = () => {
    renderSidebarContent();
    renderBannerButtons();
  };

  // ✅ التحقق من المستخدم وتفعيل الكورس
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("يجب تسجيل الدخول أولاً.");
      window.location.href = "login.html";
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, "userdata", user.uid));
      if (userDoc.exists()) {
        const status = userDoc.data()?.courses?.course1?.status;
        currentUserName = userDoc.data().username || "مستخدم";

        if (status !== 'active') {
          alert("أنت غير مشترك في هذا الكورس.");
          window.location.href = "index.html";
          return;
        }

      } else {
        alert("لا توجد بيانات لهذا المستخدم.");
        window.location.href = "index.html";
        return;
      }

    } catch (err) {
      console.error("خطأ أثناء التحقق من الكورس:", err);
      alert("حدث خطأ غير متوقع.");
      window.location.href = "index.html";
      return;
    }

    // ✅ بعد التحقق بنجاح
    isFirebaseReady = true;
    updateUI();
    hideLoadingOverlay(); // ⬅️ أخفي شاشة التحميل بعد التحقق
  });

  // الوضع الداكن
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      body.classList.add('dark-mode');
      if (themeToggle) themeToggle.checked = true;
    } else {
      body.classList.remove('dark-mode');
      if (themeToggle) themeToggle.checked = false;
    }
  };

  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    applyTheme('dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      const mode = themeToggle.checked ? 'dark' : 'light';
      applyTheme(mode);
      localStorage.setItem('theme', mode);
    });
  }

  if (userIcon) {
    userIcon.addEventListener("click", () => {
      sidebar.classList.add("show");
      sidebarContent.innerHTML = '';
      updateUI();
    });
  }

  if (closeSidebarButton) {
    closeSidebarButton.addEventListener("click", () => {
      sidebar.classList.remove("show");
    });
  }

  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !userIcon.contains(e.target) && sidebar.classList.contains("show")) {
      sidebar.classList.remove("show");
    }
  });
});
