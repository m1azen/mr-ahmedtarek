// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// استيراد setPersistence و browserLocalPersistence لتمكين الحفظ التلقائي لتسجيل الدخول
import { getAuth, signInWithEmailAndPassword, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (يجب أن تكون هذه البيانات هي نفسها في ملف signup.js)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E", // تأكد من أن هذا المفتاح صحيح
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebasestorage.app",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // خدمة المصادقة من Firebase
const db = getFirestore(app); // خدمة Firestore من Firebase

document.addEventListener('DOMContentLoaded', () => {
    // عناصر النموذج (Form elements)
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email'); // Changed from phoneNumberInput to emailInput as per HTML
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    let loadingSpinner = document.getElementById('loadingSpinner');

    // عناصر رسائل الخطأ لكل حقل إدخال
    const emailError = document.getElementById('emailError'); // Changed from phoneNumberError to emailError
    const passwordError = document.getElementById('passwordError');

    // عناصر نافذة الرسائل العامة (من ملف login.html)
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');

    // دالة لعرض رسائل خطأ محددة لحقل إدخال
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    // دالة لمسح جميع رسائل الخطأ الداخلية
    function clearInlineErrors() {
        displayInputError(emailError, ''); // Changed from phoneNumberError
        displayInputError(passwordError, '');
    }

    // دالة لعرض نافذة الرسائل العامة
    function showMessageModal(title, text, isError = false) {
        messageTitle.textContent = title;
        messageText.textContent = text;
        if (isError) {
            messageTitle.style.color = '#e74c3c'; // لون أحمر للخطأ
            messageSupportLink.style.display = 'inline-block'; // إظهار رابط الدعم في حالة الخطأ
        } else {
            messageTitle.style.color = '#2ecc71'; // لون أخضر للنجاح
            messageSupportLink.style.display = 'none'; // إخفاء رابط الدعم في حالة النجاح
        }
        messageModal.classList.add('show'); // إضافة الكلاس 'show' لتفعيل انتقال CSS
    }

    // دالة لإخفاء نافذة الرسائل العامة
    function hideMessageModal() {
        messageModal.classList.remove('show');
    }

    // دالة لإظهار/إخفاء حالة التحميل على الزر
    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';
        loginButton.textContent = isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول';
        if (!isLoading) {
            // إعادة عرض محتوى الزر لضمان وجود السبينر بعد تغيير textContent
            loginButton.innerHTML = `تسجيل الدخول <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            // إعادة الحصول على مرجع السبينر بعد تغيير innerHTML
            loadingSpinner = document.getElementById('loadingSpinner');
        }
    }

    // التعامل مع النقر على زر "حسناً" في نافذة الرسائل العامة
    messageOkButton.addEventListener('click', () => {
        hideMessageModal();
        if (messageTitle.textContent.includes('نجاح')) { // التحقق مما إذا كانت رسالة نجاح
            window.location.href = 'index.html?loginSuccess=true'; // إعادة التوجيه إلى الصفحة الرئيسية مع علامة نجاح
        }
    });

    // =====================================
    // ✅ ضبط مدة بقاء جلسة تسجيل الدخول تلقائياً
    // هذا الجزء هو الإضافة الجديدة لتمكين "تذكرني" تلقائياً
    // =====================================
    // يتم تعيين مدة البقاء إلى "local" مما يعني أن جلسة المستخدم
    // ستبقى حتى بعد إغلاق المتصفح (مثل ميزة "تذكرني" الدائمة).
    // هذا السطر يجب أن يتم تنفيذه مرة واحدة في بداية التطبيق.
    // يجب أن يحدث هذا قبل محاولة تسجيل الدخول.
    setPersistence(auth, browserLocalPersistence)
        .then(() => {
            console.log("Firebase Auth persistence set to LOCAL.");
        })
        .catch((error) => {
            console.error("Error setting persistence:", error);
        });


    // منطق إرسال النموذج
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج
        clearInlineErrors(); // مسح رسائل الخطأ السابقة
        setLoading(true); // إظهار حالة التحميل

        const email = emailInput.value.trim(); // Changed from phoneNumberInput to emailInput
        const password = passwordInput.value;

        let isValid = true;

        // التحقق من صحة حقول جانب العميل (Client-side validation)
        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Basic email regex validation
            displayInputError(emailError, 'الرجاء إدخال بريد إلكتروني صالح.');
            isValid = false;
        }
        if (!password) {
            displayInputError(passwordError, 'الرجاء إدخال كلمة المرور.');
            isValid = false;
        } else if (password.length < 6) {
            displayInputError(passwordError, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
            isValid = false;
        }

        if (!isValid) {
            setLoading(false);
            showMessageModal('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج لإكمال تسجيل الدخول.', true);
            return;
        }

        try {
            // تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // بعد تسجيل الدخول بنجاح، جلب اسم المستخدم من Firestore
            // ✅ تم التأكد من أن اسم المجموعة هو "userdata"
            const userDocRef = doc(db, "userdata", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            let username = user.email; // الافتراضي هو البريد الإلكتروني
            if (userDocSnap.exists()) {
                username = userDocSnap.data().username || user.email; // استخدام اسم المستخدم من Firestore إن وجد
            } else {
                console.warn("User data not found in 'userdata' collection for UID:", user.uid);
            }

            setLoading(false);
            showMessageModal('تم تسجيل الدخول بنجاح! 🎉', `أهلاً بك مرة أخرى يا ${username} في منصة القائد.`, false);

            // إعادة التوجيه ستتم بعد نقر المستخدم على زر "حسناً" في النافذة المنبثقة.

        } catch (error) {
            setLoading(false); // إخفاء حالة التحميل
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.";
            switch (error.code) {
                case 'auth/invalid-credential': // يشمل 'auth/user-not-found' و 'auth/wrong-password' في الإصدارات الحديثة
                    errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة. الرجاء التحقق والمحاولة مرة أخرى.';
                    displayInputError(emailError, errorMessage); // عرض الخطأ تحت حقل البريد الإلكتروني
                    displayInputError(passwordError, ''); // مسح خطأ كلمة المرور القديم
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'تم حظر الوصول مؤقتاً بسبب محاولات تسجيل دخول كثيرة. الرجاء المحاولة لاحقاً.';
                    break;
                default:
                    errorMessage = `حدث خطأ غير معروف: ${error.message}`;
                    break;
            }
            showMessageModal('خطأ في تسجيل الدخول ❌', errorMessage, true); // عرض الخطأ في النافذة المنبثقة العامة
            console.error("Firebase Login Error:", error);
        }
    });
});
