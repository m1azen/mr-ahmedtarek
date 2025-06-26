// استيراد حزم Firebase المطلوبة
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// استيراد onAuthStateChanged و signOut من Firebase Auth لتتبع حالة المستخدم وتسجيل الخروج
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// استيراد Firestore Functions لقراءة بيانات المستخدم
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بتطبيقك (تأكد من مطابقتها لتلك الموجودة في sign.js و login.js)
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
const auth = getAuth(app); // خدمة مصادقة Firebase
const db = getFirestore(app); // خدمة Firestore Firebase

let currentUserName = "زائر"; // متغير لتخزين اسم المستخدم الحالي، "زائر" كقيمة افتراضية
let isFirebaseReady = false; // علامة للإشارة إلى أن Firebase قد أكملت التحقق الأولي لحالة المصادقة

// عند تحميل محتوى DOM بالكامل
document.addEventListener('DOMContentLoaded', () => {
    // جلب العناصر الأساسية من HTML
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarButton');
    const userIcon = document.getElementById('userIcon');
    const sidebarContent = document.getElementById('sidebarContent');
    const bannerButtonsContainer = document.getElementById('bannerButtons');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // =====================================
    // منطق تبديل الوضع (فاتح/داكن)
    // =====================================
    // تحميل تفضيل الوضع من التخزين المحلي
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.checked = (savedTheme === 'dark-mode');
    } else {
        // تعيين الوضع الافتراضي إذا لم يكن هناك تفضيل محفوظ
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
        themeToggle.checked = false; // تأكد من أن مفتاح التبديل يعكس الوضع الفاتح
    }

    // معالج حدث لتغيير الوضع عند تبديل المفتاح
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
     * تتحقق مما إذا كان المستخدم مسجلاً للدخول حالياً عبر Firebase Authentication.
     * @returns {boolean} True إذا كان هناك مستخدم مسجل الدخول، False بخلاف ذلك.
     */
    function isUserLoggedIn() {
        return auth.currentUser !== null;
    }

    /**
     * تحصل على اسم المستخدم الحالي (من متغير currentUserName).
     * @returns {string} اسم المستخدم إذا كان مسجلاً للدخول، وإلا "زائر".
     */
    function getUserName() {
        return currentUserName;
    }

    /**
     * تقوم بتسجيل خروج المستخدم من Firebase.
     * وتعتمد على onAuthStateChanged لتحديث الواجهة.
     */
    async function firebaseLogout() {
        try {
            await signOut(auth); // تنفيذ عملية تسجيل الخروج من Firebase Auth
            console.log("تم تسجيل خروج المستخدم بنجاح من Firebase.");
            // onAuthStateChanged listener سيتكفل بتحديث الواجهة بشكل تلقائي
        } catch (error) {
            console.error("خطأ أثناء تسجيل الخروج من Firebase:", error);
            // هنا يمكنك عرض رسالة خطأ أنيقة للمستخدم بدلاً من alert()
            alert("حدث خطأ أثناء تسجيل الخروج. الرجاء المحاولة مرة أخرى.");
        }
    }

    /**
     * تعرض محتوى الشريط الجانبي (Sidebar) بناءً على حالة تسجيل الدخول.
     * ✅ تم إعادة هيكلة هذه الدالة بالكامل لترتيب العناصر بشكل صحيح.
     */
    function renderSidebarContent() {
        sidebarContent.innerHTML = ''; // مسح أي محتوى سابق في الشريط الجانبي

        // 1. زر "الصفحة الرئيسية" - يظهر دائمًا كأول عنصر
        const homeButton = document.createElement('button');
        homeButton.className = 'sidebar-button';
        homeButton.innerHTML = `<i class="fas fa-home"></i> الصفحة الرئيسية`;
        homeButton.addEventListener('click', () => {
            window.location.href = 'index.html';
            sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
        });
        sidebarContent.appendChild(homeButton);

        if (isUserLoggedIn()) {
            const userName = getUserName();

            // 2. رسالة ترحيب للمستخدم - تظهر بعد "الصفحة الرئيسية" مباشرةً إذا كان مسجلاً دخوله
            const userInfoDiv = document.createElement('div');
            userInfoDiv.className = 'sidebar-user-info';
            userInfoDiv.innerHTML = `<span>أهلاً ${userName}</span>`;
            sidebarContent.appendChild(userInfoDiv);
            
            // 3. زر "كورساتي" - للمستخدمين المسجلين دخوله
            const coursesSidebarButton = document.createElement('button');
            coursesSidebarButton.className = 'sidebar-button';
            coursesSidebarButton.innerHTML = `<i class="fas fa-book-open"></i> كورساتي`;
            coursesSidebarButton.addEventListener('click', () => {
                window.location.href = 'my_courses.html';
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(coursesSidebarButton);

            // 4. زر "منتدى الطلبة" - للمستخدمين المسجلين دخوله
            const forumButton = document.createElement('button');
            forumButton.className = 'sidebar-button';
            forumButton.innerHTML = `<i class="fas fa-users"></i> منتدى الطلبة`;
            forumButton.addEventListener('click', () => {
                window.location.href = 'student_forum.html';
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(forumButton);

            // 5. زر "حسابي" - للمستخدمين المسجلين دخوله
            const accountButton = document.createElement('button');
            accountButton.className = 'sidebar-button';
            accountButton.innerHTML = `<i class="fas fa-user-circle"></i> حسابي`;
            accountButton.addEventListener('click', () => {
                window.location.href = 'myaccount.html';
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(accountButton);

            // 6. زر "تسجيل خروج" - للمستخدمين المسجلين دخوله
            const logoutButton = document.createElement('button');
            logoutButton.className = 'sidebar-button';
            logoutButton.id = 'logoutButton'; 
            logoutButton.innerHTML = `<i class="fas fa-sign-out-alt"></i> تسجيل خروج`;
            logoutButton.addEventListener('click', () => {
                firebaseLogout();
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(logoutButton);

        } else {
            // إذا لم يكن المستخدم مسجلاً للدخول، اعرض أزرار التسجيل/تسجيل الدخول (بعد زر الرئيسية)
            
            // 2. زر "تسجيل جديد"
            const registerButton = document.createElement('button');
            registerButton.className = 'sidebar-button';
            registerButton.id = 'registerButton';
            registerButton.innerHTML = `<i class="fas fa-user-plus"></i> تسجيل جديد`;
            registerButton.addEventListener('click', () => {
                window.location.href = 'sign.html';
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(registerButton);

            // 3. زر "تسجيل دخول"
            const loginButton = document.createElement('button');
            loginButton.className = 'sidebar-button';
            loginButton.id = 'loginButtonSidebar'; 
            loginButton.innerHTML = `<i class="fas fa-sign-in-alt"></i> تسجيل دخول`;
            loginButton.addEventListener('click', () => {
                window.location.href = 'login.html';
                sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
            });
            sidebarContent.appendChild(loginButton);
        }
    }

    /**
     * تعرض أزرار البانر الرئيسية بناءً على حالة تسجيل الدخول.
     */
    function renderBannerButtons() {
        bannerButtonsContainer.innerHTML = ''; // مسح أي محتوى سابق
        if (isUserLoggedIn()) {
            // زر "اشتراكاتي" - للمستخدمين المسجلين دخوله
            const subscriptionsButton = document.createElement('button');
            subscriptionsButton.textContent = '  اشتراكاتي';
            subscriptionsButton.onclick = () => window.location.href = 'my_subscriptions.html';
            bannerButtonsContainer.appendChild(subscriptionsButton);
        } else {
            // زر "انضم إلينا" - لغير المسجلين
            const joinUsButton = document.createElement('button');
            joinUsButton.textContent = 'انضم إلينا';
            joinUsButton.onclick = () => window.location.href = 'sign.html';
            bannerButtonsContainer.appendChild(joinUsButton);

            // زر "تسجيل الدخول" - لغير المسجلين
            const loginBannerButton = document.createElement('button');
            loginBannerButton.textContent = 'تسجيل الدخول';
            loginBannerButton.onclick = () => window.location.href = 'login.html';
            bannerButtonsContainer.appendChild(loginBannerButton);
        }
    }

    /**
     * الدالة الرئيسية لتحديث الواجهة بأكملها.
     * يتم استدعاؤها بعد تغيير حالة مصادقة Firebase أو عند الحاجة لتحديث الواجهة.
     */
    function updateUI() {
        renderSidebarContent();
        renderBannerButtons();
    }

    // =====================================
    // مستمع حالة مصادقة Firebase (Firebase Authentication State Listener)
    // هذا هو الجزء الأهم الذي يربط حالة تسجيل الدخول بواجهة المستخدم.
    // =====================================
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // المستخدم مسجل الدخول حالياً
            console.log("المستخدم مسجل الدخول:", user.uid);
            try {
                // محاولة جلب بيانات المستخدم من Firestore باستخدام UID الخاص به
                const userDocRef = doc(db, "userdata", user.uid);
                const userDocSnap = await getDoc(userDocRef);

                if (userDocSnap.exists()) {
                    // إذا وجدت بيانات المستخدم في Firestore، استخدم اسم المستخدم الخاص به
                    currentUserName = userDocSnap.data().username || "مستخدم";
                    console.log("تم جلب اسم المستخدم من Firestore:", currentUserName);
                } else {
                    // إذا لم يتم العثور على بيانات المستخدم في Firestore، قم بتسجيل تحذير واستخدم اسم افتراضي
                    console.warn("لم يتم العثور على بيانات المستخدم في Firestore لـ UID:", user.uid);
                    currentUserName = "مستخدم";
                }
            } catch (error) {
                console.error("خطأ أثناء جلب بيانات المستخدم من Firestore:", error);
                currentUserName = "مستخدم"; // استخدام اسم افتراضي في حالة الخطأ
            }
        } else {
            // المستخدم غير مسجل الدخول
            console.log("المستخدم غير مسجل الدخول.");
            currentUserName = "زائر";
        }
        isFirebaseReady = true; // الإشارة إلى أن Firebase قد أكملت التحقق الأولي للحالة
        updateUI(); // تحديث الواجهة بعد تحديد حالة تسجيل الدخول واسم المستخدم
    });

    // =====================================
    // منطق الشريط الجانبي والأنيميشن
    // =====================================
    // معالج حدث النقر على أيقونة المستخدم لتبديل الشريط الجانبي
    if (userIcon) {
        userIcon.addEventListener('click', (event) => {
            event.stopPropagation();
            sidebar.classList.toggle('open'); // تم التعديل هنا: 'show' إلى 'open'
            if (sidebar.classList.contains('open')) { // تم التعديل هنا: 'show' إلى 'open'
                if (isFirebaseReady) {
                    updateUI();
                }
            }
        });
    } else {
        console.error("العنصر ذو الـ ID 'userIcon' غير موجود في HTML.");
    }

    // معالج حدث النقر على زر إغلاق الشريط الجانبي
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
        });
    } else {
        console.error("العنصر ذو الـ ID 'closeSidebarButton' غير موجود في HTML.");
    }

    // إغلاق الشريط الجانبي عند النقر خارج الشريط أو أيقونة المستخدم
    document.addEventListener('click', (event) => {
        if (sidebar && userIcon && !sidebar.contains(event.target) && !userIcon.contains(event.target)) {
            sidebar.classList.remove('open'); // تم التعديل هنا: 'show' إلى 'open'
        }
    });

    // منع إغلاق الشريط الجانبي عند النقر داخل الشريط نفسه
    if (sidebar) {
        sidebar.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    } else {
            console.error("العنصر ذو الـ ID 'sidebar' غير موجود في HTML.");
    }

    // =====================================
    // منطق أنيميشن العناصر عند التمرير
    // =====================================
    const animateElements = document.querySelectorAll('.feature-box, .chem-text, .chem-img, .card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    // مراقبة جميع العناصر التي تحتاج إلى أنيميشن
    animateElements.forEach(element => {
        observer.observe(element);
    });

    // إضافة: ضبط margin-top لـ main-content-banner بناءً على ارتفاع الهيدر
    const headerBanner = document.querySelector('.header-banner');
    const mainContentBanner = document.querySelector('.main-content-banner');
    if (headerBanner && mainContentBanner) {
        const headerHeight = headerBanner.offsetHeight;
        mainContentBanner.style.marginTop = `${headerHeight}px`;
    }
});
