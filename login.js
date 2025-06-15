// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (استخدم نفس بيانات Firebase Config الخاصة بك)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E",
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebasestorage.app",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Firebase Authentication service
const db = getFirestore(app); // Firebase Firestore service

// عند تحميل محتوى DOM بالكامل
document.addEventListener('DOMContentLoaded', () => {
    // جلب عناصر نموذج تسجيل الدخول
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email'); // تم التعديل ليصبح 'email'
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const loginButton = document.getElementById('loginButton');
    let loadingSpinner = document.getElementById('loadingSpinner');

    // جلب عناصر رسائل الخطأ لكل حقل إدخال
    const emailError = document.getElementById('emailError'); // تم التعديل ليصبح 'emailError'
    const passwordError = document.getElementById('passwordError');

    // جلب عناصر نافذة الرسائل العامة المنبثقة (General Message Modal)
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');

    // =====================================
    // Functions for UI Control (وظائف التحكم في واجهة المستخدم)
    // =====================================

    /**
     * تعرض رسالة خطأ محددة أسفل حقل إدخال معين.
     * @param {HTMLElement} element - عنصر الـ div الخاص برسالة الخطأ (مثل emailError).
     * @param {string} message - الرسالة التي سيتم عرضها.
     */
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    /**
     * تعرض رسالة عامة (نجاح أو خطأ) في نافذة منبثقة.
     * @param {string} title - عنوان الرسالة.
     * @param {string} message - نص الرسالة المفصل.
     * @param {string} type - نوع الرسالة ("success" أو "error") لتطبيق التنسيقات.
     * @param {boolean} showSupport - هل يجب عرض رابط الدعم الفني؟
     */
    function showMessageModal(title, message, type, showSupport = false) {
        messageTitle.textContent = title;
        messageText.textContent = message;
        messageModal.className = 'modal'; // إعادة ضبط الفئات
        if (type) {
            messageModal.classList.add(type); // إضافة فئة "success" أو "error"
        }
        messageSupportLink.style.display = showSupport ? 'inline-block' : 'none';
        messageModal.classList.add('show');
    }

    /**
     * تقوم بإخفاء نافذة الرسائل العامة ومسح رسائل الأخطاء الخاصة بالحقول.
     */
    function clearMessages() {
        messageModal.classList.remove('show');
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
    }

    /**
     * تتحكم في حالة التحميل لزر تسجيل الدخول (تعطيل/تفعيل، إظهار/إخفاء السبينر).
     * @param {boolean} isLoading - true لإظهار حالة التحميل، false لإخفائها.
     */
    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';

        if (isLoading) {
            loginButton.textContent = 'جارٍ تسجيل الدخول...';
        } else {
            loginButton.innerHTML = `تسجيل الدخول <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            loadingSpinner = document.getElementById('loadingSpinner'); // إعادة جلب مرجع السبينر
        }
    }

    // مستمع لحدث النقر على زر "حسناً" في نافذة الرسائل العامة لإغلاقها
    messageOkButton.addEventListener('click', () => {
        clearMessages();
    });

    // =====================================
    // Check for signup success message from previous page
    // (التحقق من رسالة نجاح التسجيل من الصفحة السابقة)
    // =====================================
    const urlParams = new URLSearchParams(window.location.search);
    const signupSuccess = urlParams.get('signupSuccess');
    const usernameFromSignup = urlParams.get('username');

    if (signupSuccess === 'true' && usernameFromSignup) {
        showMessageModal(
            'مرحباً بك!',
            `تهانينا، ${decodeURIComponent(usernameFromSignup)}! تم إنشاء حسابك بنجاح. يمكنك تسجيل الدخول الآن.`,
            'success',
            false
        );
        // إزالة البارامترات من الـ URL لتجنب ظهور الرسالة مرة أخرى عند تحديث الصفحة
        history.replaceState(null, '', window.location.pathname);
    }


    // =====================================
    // Login Form Submission and Firebase Integration
    // (تقديم نموذج تسجيل الدخول وتكامل Firebase)
    // =====================================

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج

        clearMessages(); // مسح أي رسائل أو أخطاء سابقة

        // جلب القيم من حقول الإدخال
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const rememberMe = rememberMeCheckbox.checked;

        let isValid = true; // علامة لتتبع حالة التحقق من صحة النموذج

        // --- Client-side Validation Checks ---
        // 1. التحقق من البريد الإلكتروني
        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            displayInputError(emailError, 'الرجاء إدخال بريد إلكتروني صالح.');
            isValid = false;
        }

        // 2. التحقق من كلمة المرور
        if (!password) {
            displayInputError(passwordError, 'الرجاء إدخال كلمة المرور.');
            isValid = false;
        }

        // إذا فشل أي تحقق، أوقف العملية
        if (!isValid) {
            showMessageModal('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج لإكمال تسجيل الدخول.', 'error');
            return;
        }

        setLoading(true); // إظهار السبينر وتعطيل الزر

        try {
            // تحديد استمرارية تسجيل الدخول (Persistence)
            // إذا كانت "تذكرني" مفعلة، فسيتم الحفاظ على الجلسة محليًا (لمدة طويلة)
            // وإلا، فسيتم الحفاظ عليها لجلسة المتصفح فقط (حتى إغلاق المتصفح)
            await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

            // Firebase Authentication: تسجيل دخول المستخدم بالبريد الإلكتروني وكلمة المرور
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // تحديث وقت آخر تسجيل دخول في Firestore
            const userDocRef = doc(db, "userdata", user.uid);
            await updateDoc(userDocRef, {
                lastLogin: new Date()
            });

            // جلب اسم المستخدم من Firestore لعرضه في رسالة الترحيب
            const userDocSnap = await getDoc(userDocRef);
            let username = "طالبنا العزيز"; // قيمة افتراضية
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                username = userData.username || username; // استخدام الاسم المخزن أو الافتراضي
            }
            
            setLoading(false); // إخفاء السبينر وتفعيل الزر

            // عرض رسالة نجاح تسجيل الدخول
            const successMessageTitle = 'تم تسجيل الدخول بنجاح! ✅';
            const successMessageText = `أهلاً بك مرة أخرى يا ${username}! سيتم توجيهك للصفحة الرئيسية الآن.`;
            showMessageModal(successMessageTitle, successMessageText, 'success');

            // إعادة توجيه إلى الصفحة الرئيسية بعد تأخير
            setTimeout(() => {
                window.location.href = `index.html?loginSuccess=true&username=${encodeURIComponent(username)}`;
            }, 3000); // 3 ثوانٍ قبل إعادة التوجيه

        } catch (error) {
            setLoading(false); // إخفاء السبينر وتفعيل الزر

            let errorMessage = "حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.";
            let errorTitle = "خطأ في تسجيل الدخول ❌";
            let showSupport = true; // افتراضياً، أظهر رابط الدعم عند حدوث خطأ

            // التعامل مع أخطاء Firebase Authentication المحددة
            switch (error.code) {
                case 'auth/invalid-email':
                case 'auth/user-not-found':
                    errorMessage = '⚠️ البريد الإلكتروني غير موجود أو غير صحيح. الرجاء التحقق من البريد.';
                    displayInputError(emailError, errorMessage);
                    showSupport = false;
                    break;
                case 'auth/wrong-password':
                case 'auth/invalid-credential': // يشمل حالات مثل "wrong-password" أو عدم تطابق الاعتمادات
                    errorMessage = '🔒 كلمة المرور غير صحيحة. الرجاء التحقق من كلمة المرور وإعادة المحاولة.';
                    displayInputError(passwordError, errorMessage);
                    showSupport = false;
                    break;
                case 'auth/user-disabled':
                    errorMessage = '⛔ تم تعطيل هذا الحساب. يرجى الاتصال بالدعم الفني.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '🚫 تم حظر الوصول مؤقتًا بسبب محاولات تسجيل دخول كثيرة فاشلة. حاول مرة أخرى لاحقًا.';
                    break;
                default:
                    errorMessage = `خطأ غير معروف: ${error.message}. يرجى الاتصال بالدعم الفني.`;
                    break;
            }
            showMessageModal(errorTitle, errorMessage, 'error', showSupport);
            console.error("Firebase Auth Error:", error);
        }
    });

    // =====================================
    // Check Authentication State on Load (التحقق من حالة المصادقة عند التحميل)
    // =====================================
    // This will run when the page loads and detect if a user is already signed in.
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in. You might want to redirect them to the main app page immediately
            // or perform some UI updates. For this example, we'll just log it.
            console.log("User already signed in:", user.email);
            // Optionally redirect after a short delay
            // setTimeout(() => {
            //     window.location.href = 'index.html'; // Or your dashboard page
            // }, 1000);
        } else {
            // No user is signed in.
            console.log("No user signed in.");
        }
    });
});
