// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (يجب أن تكون هذه البيانات هي نفسها في ملف signup.js)
const firebaseConfig = {
  apiKey: "AIzaSyCV_AIVs3JAeVnIkGTievQdKO_RKVTMNtk",
  authDomain: "mrahmedtarek-ffdac.firebaseapp.com",
  projectId: "mrahmedtarek-ffdac",
  storageBucket: "mrahmedtarek-ffdac.firebasestorage.app",
  messagingSenderId: "660123002704",
  appId: "1:660123002704:web:15b96f9d407042df412e55",
  measurementId: "G-98B9X9J60E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // خدمة المصادقة من Firebase
const db = getFirestore(app); // خدمة Firestore من Firebase

document.addEventListener('DOMContentLoaded', () => {
    // عناصر النموذج (Form elements)
    const loginForm = document.getElementById('loginForm');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    let loadingSpinner = document.getElementById('loadingSpinner'); // استخدام 'let' لأنه قد يتم تحديث مرجعه

    // عناصر رسائل الخطأ لكل حقل إدخال
    const phoneNumberError = document.getElementById('phoneNumberError');
    const passwordError = document.getElementById('passwordError');

    // عناصر نافذة الرسائل العامة (من ملف login.html)
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink'); // هذا الرابط سيكون ديناميكيًا بناءً على نوع الرسالة

    // دالة لعرض رسائل خطأ محددة لحقل إدخال
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    // دالة لمسح جميع رسائل الخطأ الداخلية
    function clearInlineErrors() {
        displayInputError(phoneNumberError, '');
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

    // منطق إرسال النموذج
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج
        clearInlineErrors(); // مسح رسائل الخطأ السابقة
        setLoading(true); // إظهار حالة التحميل

        const phoneNumber = phoneNumberInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        // التحقق من صحة حقول جانب العميل (Client-side validation)
        if (!phoneNumber) {
            displayInputError(phoneNumberError, 'الرجاء إدخال رقم الهاتف.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(phoneNumber)) { // التحقق من رقم هاتف مصري (11 رقم يبدأ بـ 01)
            displayInputError(phoneNumberError, 'الرجاء إدخال رقم هاتف مصري صحيح (11 رقم يبدأ بـ 01).');
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
            // 1. الاستعلام من Firestore للعثور على البريد الإلكتروني المرتبط برقم الهاتف
            const usersRef = collection(db, "userdata"); // اسم المجموعة في Firestore
            // هام: استعلامات Firestore على الحقول بخلاف المعرف (ID) تتطلب فهرسة.
            // إذا تلقيت خطأ "The query requires an index..."، ستحتاج لإنشائه
            // في Firebase Console -> Firestore Database -> Indexes.
            const q = query(usersRef, where("parentPhone", "==", phoneNumber));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setLoading(false);
                showMessageModal('خطأ في تسجيل الدخول 🔒', 'لا يوجد حساب مرتبط برقم الهاتف هذا. الرجاء التحقق من الرقم أو إنشاء حساب جديد.', true);
                return;
            }

            // بافتراض أن أرقام الهواتف فريدة وسيتم العثور على مستخدم واحد فقط
            const userData = querySnapshot.docs[0].data();
            const emailToLogin = userData.email; // الحصول على البريد الإلكتروني من بيانات المستخدم

            // 2. تسجيل الدخول باستخدام البريد الإلكتروني المسترجع وكلمة المرور المقدمة
            await signInWithEmailAndPassword(auth, emailToLogin, password);

            setLoading(false);
            showMessageModal('تم تسجيل الدخول بنجاح! 🎉', 'أهلاً بك مرة أخرى في منصة القائد.', false);

            // إعادة التوجيه ستتم بعد نقر المستخدم على زر "حسناً" في النافذة المنبثقة.

        } catch (error) {
            setLoading(false); // إخفاء حالة التحميل
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول. الرجاء المحاولة مرة أخرى.";
            switch (error.code) {
                case 'auth/invalid-credential': // يشمل 'auth/user-not-found' و 'auth/wrong-password' في الإصدارات الحديثة
                    errorMessage = 'رقم الهاتف أو كلمة المرور غير صحيحة. الرجاء التحقق والمحاولة مرة أخرى.';
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
