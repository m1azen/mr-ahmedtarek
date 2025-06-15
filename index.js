// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (يجب أن تكون هي نفسها في sign.js و login.js)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E",
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebasestorage.app",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication service
const db = getFirestore(app); // Firebase Firestore service

let currentUserName = "زائر"; // متغير لتخزين اسم المستخدم الحالي
let isFirebaseReady = false; // flag to indicate firebase is initialized and auth state is checked.

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarButton');
    const userIcon = document.getElementById('userIcon');
    const sidebarContent = document.getElementById('sidebarContent');
    const bannerButtonsContainer = document.getElementById('bannerButtons');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.checked = (savedTheme === 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    /**
     * تتحقق مما إذا كان المستخدم مسجلاً للدخول عبر Firebase Authentication.
     * @returns {boolean} True إذا كان المستخدم مسجلاً للدخول، False بخلاف ذلك.
     */
    function isUserLoggedIn() {
        return auth.currentUser !== null;
    }

    /**
     * تحصل على اسم المستخدم الحالي.
     * @returns {string} اسم المستخدم إذا كان مسجلاً للدخول، وإلا "زائر".
     */
    function getUserName() {
        return currentUserName;
    }

    /**
     * تقوم بتسجيل خروج المستخدم من Firebase.
     */
    async function firebaseLogout() {
        try {
            await signOut(auth); // تسجيل الخروج من Firebase Auth
            console.log("User signed out from Firebase.");
            // onAuthStateChanged سيتولى تحديث الواجهة
        } catch (error) {
            console.error("Error signing out:", error);
            alert("حدث خطأ أثناء تسجيل الخروج. الرجاء المحاولة مرة أخرى."); // استخدام alert مؤقتًا، يفضل مودال مخصص
        }
    }

    /**
     * تعرض محتوى الشريط الجانبي بناءً على حالة تسجيل الدخول.
     */
    function renderSidebarContent() {
        sidebarContent.innerHTML = ''; // مسح المحتوى الحالي
        sidebarContent.innerHTML += `<button class="sidebar-button"><i class="fas fa-home"></i> الصفحة الرئيسية</button>`;

        if (isUserLoggedIn()) {
            const userName = getUserName();
            sidebarContent.innerHTML += `
                <div class="sidebar-user-info">
                    <span>أهلاً ${userName}</span>
                </div>
                <button class="sidebar-button"><i class="fas fa-users"></i> منتدى الطلبة</button>
                <button class="sidebar-button"><i class="fas fa-user-circle"></i> حسابي</button>
                <button class="sidebar-button"><i class="fas fa-book-open"></i> كورساتي</button>
                <button class="sidebar-button" id="logoutButton"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            `;
            const logoutBtn = document.getElementById('logoutButton');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    firebaseLogout();
                    sidebar.classList.remove('show'); // إغلاق الشريط الجانبي بعد تسجيل الخروج
                });
            }
        } else {
            sidebarContent.innerHTML += `
                <button class="sidebar-button" id="registerButton"><i class="fas fa-user-plus"></i> تسجيل جديد</button>
                <button class="sidebar-button" id="loginButton"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
            `;
            const registerBtn = document.getElementById('registerButton');
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    window.location.href = 'sign.html'; // توجيه إلى صفحة إنشاء حساب
                });
            }
            const loginBtn = document.getElementById('loginButton');
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    window.location.href = 'login.html'; // توجيه إلى صفحة تسجيل الدخول
                });
            }
        }
    }

    /**
     * تعرض أزرار البانر بناءً على حالة تسجيل الدخول.
     */
    function renderBannerButtons() {
        bannerButtonsContainer.innerHTML = ''; // مسح المحتوى الحالي
        if (isUserLoggedIn()) {
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='my_subscriptions.html'">اشتراكاتي</button>`;
        } else {
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='join_us.html'">انضم إلينا</button>`;
        }
    }

    /**
     * تقوم بتحديث جميع عناصر الواجهة التي تعتمد على حالة تسجيل الدخول.
     */
    function updateUI() {
        renderSidebarContent();
        renderBannerButtons();
    }

    // =====================================
    // Firebase Authentication State Listener
    // =====================================
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // المستخدم مسجل الدخول
            try {
                const userDocRef = doc(db, "userdata", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    currentUserName = userDocSnap.data().username || "مستخدم"; // تحديث اسم المستخدم من Firestore
                } else {
                    console.warn("User data not found in Firestore for UID:", user.uid);
                    currentUserName = "مستخدم"; // اسم افتراضي إذا لم يتم العثور على البيانات
                }
            } catch (error) {
                console.error("Error fetching user data from Firestore:", error);
                currentUserName = "مستخدم"; // اسم افتراضي في حالة الخطأ
            }
        } else {
            // المستخدم غير مسجل الدخول
            currentUserName = "زائر";
        }
        isFirebaseReady = true; // الإشارة إلى أن Firebase قد أكملت التحقق الأولي للحالة
        updateUI(); // تحديث الواجهة بعد تحديد حالة تسجيل الدخول واسم المستخدم
    });

    // =====================================
    // Sidebar and Animation Logic (Existing code)
    // =====================================
    userIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebar.classList.toggle('show');
        if (sidebar.classList.contains('show')) {
            // إذا كان الشريط الجانبي سيظهر، تأكد من تحديثه
            // هذا لضمان عرض حالة تسجيل الدخول الصحيحة فورًا
            if (isFirebaseReady) { // تحديث فقط إذا كانت حالة Firebase جاهزة
               updateUI();
            }
        }
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !userIcon.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });

    sidebar.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    const animateElements = document.querySelectorAll('.feature-box, .chem-text, .chem-img, .card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Initial UI update. This might show "زائر" briefly until Firebase loads,
    // then onAuthStateChanged will trigger another update.
    // Ensure this is called ONLY after Firebase is initialized in the DOmContentLoaded
    // and ideally after the onAuthStateChanged listener has done its first check.
    // We use the `isFirebaseReady` flag to ensure `updateUI()` is called only once
    // when Firebase Auth state is initially known.
    // No need to call `updateUI()` here anymore, as `onAuthStateChanged` will handle the initial render.
});
