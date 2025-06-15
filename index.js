// استيراد حزم Firebase المطلوبة
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// استيراد onAuthStateChanged و signOut من Firebase Auth لتتبع حالة المستخدم وتسجيل الخروج
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// استيراد Firestore Functions لقراءة بيانات المستخدم
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// إعدادات Firebase الخاصة بتطبيقك (تأكد من مطابقتها لتلك الموجودة في signup.js و login.js)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E", // تأكد من صحة هذا المفتاح
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebasestorage.app",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
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
     */
    function renderSidebarContent() {
        sidebarContent.innerHTML = ''; // مسح أي محتوى سابق في الشريط الجانبي
        // أزرار ثابتة تظهر دائمًا
        sidebarContent.innerHTML += `<button class="sidebar-button" onclick="window.location.href='index.html'"><i class="fas fa-home"></i> الصفحة الرئيسية</button>`;
        sidebarContent.innerHTML += `<button class="sidebar-button" onclick="window.location.href='my_courses.html'"><i class="fas fa-book"></i> كورساتي</button>`; // إضافة رابط كورساتي
        sidebarContent.innerHTML += `<button class="sidebar-button" onclick="window.location.href='faq.html'"><i class="fas fa-question-circle"></i> الأسئلة الشائعة</button>`; // إضافة رابط الأسئلة الشائعة

        if (isUserLoggedIn()) {
            const userName = getUserName();
            sidebarContent.innerHTML += `
                <div class="sidebar-user-info">
                    <span>أهلاً ${userName}</span>
                </div>
                <button class="sidebar-button" onclick="window.location.href='student_forum.html'"><i class="fas fa-users"></i> منتدى الطلبة</button>
                <button class="sidebar-button" onclick="window.location.href='my_account.html'"><i class="fas fa-user-circle"></i> حسابي</button>
                <button class="sidebar-button" id="logoutButton"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            `;
            // إضافة معالج الحدث لزر تسجيل الخروج
            const logoutBtn = document.getElementById('logoutButton');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    firebaseLogout(); // استدعاء دالة تسجيل الخروج من Firebase
                    sidebar.classList.remove('show'); // إغلاق الشريط الجانبي
                });
            }
        } else {
            // إذا لم يكن المستخدم مسجلاً للدخول، اعرض أزرار التسجيل/تسجيل الدخول
            sidebarContent.innerHTML += `
                <button class="sidebar-button" id="registerButton"><i class="fas fa-user-plus"></i> تسجيل جديد</button>
                <button class="sidebar-button" id="loginButtonSidebar"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
            `;
            // إضافة معالجات الأحداث لهذه الأزرار
            const registerBtn = document.getElementById('registerButton');
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    window.location.href = 'createaccount.html'; // توجيه لصفحة إنشاء حساب (تأكد من اسم الملف الصحيح)
                });
            }
            // ملاحظة: تغيير ID لزر تسجيل الدخول في الشريط الجانبي لتجنب التضارب مع زر تسجيل الدخول في البانر إذا كان له نفس ID
            const loginBtnSidebar = document.getElementById('loginButtonSidebar');
            if (loginBtnSidebar) {
                loginBtnSidebar.addEventListener('click', () => {
                    window.location.href = 'login.html'; // توجيه لصفحة تسجيل الدخول
                });
            }
        }
    }

    /**
     * تعرض أزرار البانر الرئيسية بناءً على حالة تسجيل الدخول.
     */
    function renderBannerButtons() {
        bannerButtonsContainer.innerHTML = ''; // مسح أي محتوى سابق
        if (isUserLoggedIn()) {
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='my_subscriptions.html'">اشتراكاتي</button>`;
        } else {
            // أزرار البانر عندما لا يكون المستخدم مسجلاً للدخول
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='createaccount.html'">انضم إلينا</button>`; // توجيه لصفحة إنشاء حساب (تأكد من اسم الملف الصحيح)
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='login.html'">تسجيل الدخول</button>`;
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
    // هذا المستمع سيتكفل بالتعامل مع جلسات تسجيل الدخول المحفوظة محليًا
    // التي تم إعدادها في login.js تلقائيًا.
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // المستخدم مسجل الدخول حالياً
            console.log("المستخدم مسجل الدخول:", user.uid);
            try {
                // محاولة جلب بيانات المستخدم من Firestore باستخدام UID الخاص به
                // ✅ يتم الجلب من مجموعة "userdata" كما هو متوقع
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
    if (userIcon) { // التأكد من وجود العنصر قبل إضافة المستمع
        userIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // منع انتشار الحدث لأعلى في DOM
            sidebar.classList.toggle('show'); // تبديل فئة 'show' لإظهار/إخفاء الشريط الجانبي
            if (sidebar.classList.contains('show')) {
                // إذا كان الشريط الجانبي سيظهر، تأكد من تحديثه بأحدث حالة تسجيل دخول
                if (isFirebaseReady) {
                   updateUI(); // تحديث فوري للشريط الجانبي
                }
            }
        });
    } else {
        console.error("العنصر ذو الـ ID 'userIcon' غير موجود في HTML.");
    }

    // معالج حدث النقر على زر إغلاق الشريط الجانبي
    if (closeSidebarBtn) { // التأكد من وجود العنصر
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('show'); // إخفاء الشريط الجانبي
        });
    } else {
        console.error("العنصر ذو الـ ID 'closeSidebarButton' غير موجود في HTML.");
    }

    // إغلاق الشريط الجانبي عند النقر خارج الشريط أو أيقونة المستخدم
    document.addEventListener('click', (event) => {
        // التحقق مما إذا كان النقر خارج الشريط الجانبي وأيقونة المستخدم
        if (sidebar && userIcon && !sidebar.contains(event.target) && !userIcon.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });

    // منع إغلاق الشريط الجانبي عند النقر داخل الشريط نفسه
    if (sidebar) { // التأكد من وجود العنصر
        sidebar.addEventListener('click', (event) => {
            event.stopPropagation(); // منع انتشار الحدث وإغلاق الشريط
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
                entry.target.classList.add('animate'); // إضافة كلاس 'animate' لتفعيل الحركة
                observer.unobserve(entry.target); // إيقاف المراقبة بعد تفعيل الحركة مرة واحدة
            }
        });
    }, { threshold: 0.1 }); // تفعيل الحركة عندما يكون 10% من العنصر مرئياً

    // مراقبة جميع العناصر التي تحتاج إلى أنيميشن
    animateElements.forEach(element => {
        observer.observe(element);
    });

});
