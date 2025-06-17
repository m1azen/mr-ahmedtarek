// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (Please ensure this is correct and secure)
// قم بتحديث هذا الكائن إذا تغيرت إعدادات Firebase الخاصة بك
const firebaseConfig = {
    apiKey: "AIzaSyCV_AIVs3JAeVnIkGTievQdKO_RKVTMNtk", // تأكد من أن هذا المفتاح صحيح
    authDomain: "mrahmedtarek-ffdac.firebaseapp.com",
    projectId: "mrahmedtarek-ffdac",
    storageBucket: "mrahmedtarek-ffdac.firebasestorage.app",
    messagingSenderId: "660123002704",
    appId: "1:660123002704:web:15b96f9d407042df412e55",
    measurementId: "G-98B9X9J60E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // خدمة Firebase Authentication
const db = getFirestore(app); // خدمة Firebase Firestore

document.addEventListener('DOMContentLoaded', () => {
    // جلب عناصر النموذج والمودال ورسائل الحالة من HTML
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const gradeSelect = document.getElementById('grade');
    const governorateSelect = document.getElementById('governorate');
    const studentIdInput = document.getElementById('studentId');
    const parentPhoneInput = document.getElementById('parentPhone');
    const signupButton = document.getElementById('signupButton');
    let loadingSpinner = document.getElementById('loadingSpinner'); // يستخدم 'let' لأن مرجعيته قد تتغير
    const generalMessageDiv = document.getElementById('generalMessage'); // لعرض رسائل النجاح/الخطأ العامة
    const supportContactDiv = document.getElementById('supportContact'); // لرابط الدعم

    // عناصر رسائل الخطأ الخاصة بكل حقل إدخال
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const gradeError = document.getElementById('gradeError');
    const governorateError = document.getElementById('governorateError');
    const studentIdError = document.getElementById('studentIdError');
    const parentPhoneError = document.getElementById('parentPhoneError');

    // عناصر المودال (نافذة التعليمات المنبثقة)
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeModalButton = instructionsModal.querySelector('.close-button'); // زر إغلاق المودال


    /**
     * تعرض رسالة خطأ محددة لحقل إدخال معين.
     * @param {HTMLElement} element العنصر الذي سيعرض رسالة الخطأ (مثل div#usernameError).
     * @param {string} message نص رسالة الخطأ.
     */
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none'; // إظهار إذا كانت هناك رسالة، إخفاء بخلاف ذلك
    }

    /**
     * تعرض رسالة حالة عامة (نجاح، خطأ، تحميل).
     * @param {string} message نص الرسالة.
     * @param {'success'|'error'|''} type نوع الرسالة لتطبيق التنسيق المناسب.
     */
    function displayGeneralMessage(message, type) {
        generalMessageDiv.textContent = message;
        generalMessageDiv.className = `status-message ${type}`; // تطبيق كلاس 'success' أو 'error' للتصميم
        generalMessageDiv.style.display = 'block'; // التأكد من أن الرسالة مرئية
    }

    /**
     * تمسح جميع رسائل الحالة والأخطاء التي تم عرضها مسبقًا.
     */
    function clearMessages() {
        generalMessageDiv.style.display = 'none';
        supportContactDiv.style.display = 'none'; // إخفاء رابط الدعم افتراضيًا
        // مسح جميع رسائل الخطأ الخاصة بالحقول
        displayInputError(usernameError, '');
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
        displayInputError(confirmPasswordError, '');
        displayInputError(gradeError, '');
        displayInputError(governorateError, '');
        displayInputError(studentIdError, '');
        displayInputError(parentPhoneError, '');
    }

    /**
     * تتحكم في حالة التحميل (تعطيل الزر، إظهار/إخفاء السبينر).
     * @param {boolean} isLoading إذا كانت True، يتم تفعيل وضع التحميل.
     */
    function setLoading(isLoading) {
        signupButton.disabled = isLoading; // تعطيل الزر أثناء التحميل
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none'; // إظهار/إخفاء السبينر

        if (isLoading) {
            signupButton.textContent = 'جارٍ إنشاء الحساب...'; // تغيير نص الزر
            signupButton.appendChild(loadingSpinner); // إعادة إضافة السبينر بعد تغيير textContent
        } else {
            // استعادة نص الزر الأصلي وإعادة جلب مرجعية السبينر (مهم بعد تغيير innerHTML)
            // (تعديل: التأكد من وجود السبينر في HTML أولاً)
            signupButton.innerHTML = `إنشاء الحساب <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            loadingSpinner = document.getElementById('loadingSpinner'); // إعادة جلب المرجعية
        }
    }

    // =====================================
    // منطق نافذة التعليمات المنبثقة (المودال)
    // =====================================

    // إظهار المودال عند تحميل الصفحة لأول مرة
    instructionsModal.classList.add('show'); // إضافة الكلاس 'show' لتفعيل ظهور المودال عبر CSS
    signupForm.classList.add('hidden-form'); // إخفاء نموذج التسجيل باستخدام الكلاس 'hidden-form'

    // معالج حدث النقر لزر "أوافق وأبدأ التسجيل" داخل المودال
    acceptInstructionsButton.addEventListener('click', () => {
        instructionsModal.classList.remove('show'); // إخفاء المودال
        signupForm.classList.remove('hidden-form'); // إظهار نموذج التسجيل بإزالة الكلاس 'hidden-form'
    });

    // معالج حدث النقر لزر الإغلاق (X) في المودال
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            // إذا حاول المستخدم إغلاق المودال دون الموافقة، يعاد إظهاره
            instructionsModal.classList.add('show');
        });
    }

    // معالج حدث النقر خارج محتوى المودال (على الخلفية الشفافة)
    instructionsModal.addEventListener('click', (event) => {
        // إذا حدث النقر مباشرة على خلفية المودال (وليس على محتوى المودال)
        if (event.target === instructionsModal) {
            instructionsModal.classList.add('show'); // إعادة إظهار المودال
        }
    });

    // =====================================
    // معالجة إرسال النموذج وتكامل Firebase
    // =====================================

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج (إعادة تحميل الصفحة)

        clearMessages(); // مسح أي رسائل أو أخطاء سابقة

        // جلب القيم من جميع حقول الإدخال وإزالة المسافات البيضاء الزائدة
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const grade = gradeSelect.value;
        const governorate = governorateSelect.value;
        const studentId = studentIdInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        let isValid = true; // علامة لتتبع حالة التحقق الكلية للنموذج

        // --- التحقق من صحة البيانات من جانب العميل (Client-side Validation) ---
        // 1. التحقق من اسم المستخدم
        if (!username) {
            displayInputError(usernameError, 'الرجاء إدخال اسم المستخدم الكامل.');
            isValid = false;
        }

        // 2. التحقق من البريد الإلكتروني
        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // تحقق أساسي من صيغة البريد الإلكتروني
            displayInputError(emailError, 'الرجاء إدخال بريد إلكتروني صالح.');
            isValid = false;
        }

        // 3. التحقق من كلمة المرور
        if (!password) {
            displayInputError(passwordError, 'الرجاء إدخال كلمة المرور.');
            isValid = false;
        } else if (password.length < 6) {
            displayInputError(passwordError, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
            isValid = false;
        } else if (!/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
            // التحقق من وجود رقم واحد على الأقل ورمز خاص واحد على الأقل
            displayInputError(passwordError, 'كلمة المرور يجب أن تحتوي على أرقام ورموز.');
            isValid = false;
        }

        // 4. التحقق من تأكيد كلمة المرور
        if (!confirmPassword) {
            displayInputError(confirmPasswordError, 'الرجاء تأكيد كلمة المرور.');
            isValid = false;
        } else if (password !== confirmPassword) {
            displayInputError(confirmPasswordError, 'كلمتا المرور غير متطابقتين.');
            isValid = false;
        }

        // 5. التحقق من اختيار الصف الدراسي
        if (!grade) { // إذا كان الخيار الافتراضي الفارغ لا يزال محدداً
            displayInputError(gradeError, 'الرجاء اختيار الصف الدراسي.');
            isValid = false;
        }

        // 6. التحقق من اختيار المحافظة
        if (!governorate) { // إذا كان الخيار الافتراضي الفارغ لا يزال محدداً
            displayInputError(governorateError, 'الرجاء اختيار المحافظة.');
            isValid = false;
        }

        // 7. التحقق من رقم الطالب (أرقام فقط)
        if (!studentId) {
            displayInputError(studentIdError, 'الرجاء إدخال رقم الطالب.');
            isValid = false;
        } else if (!/^\d+$/.test(studentId)) { // التأكد من أنها أرقام فقط
            displayInputError(studentIdError, 'رقم الطالب يجب أن يحتوي على أرقام فقط.');
            isValid = false;
        }

        // 8. التحقق من رقم هاتف ولي الأمر (صيغة مصرية أساسية)
        if (!parentPhone) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم ولي الأمر.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(parentPhone)) { // أرقام الهواتف المصرية تبدأ بـ 010, 011, 012, 015 وتتكون من 11 رقمًا
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم هاتف ولي أمر مصري صحيح (11 رقم يبدأ بـ 01).');
            isValid = false;
        }

        // إذا فشل أي تحقق من جانب العميل، يتم إيقاف العملية
        if (!isValid) {
            displayGeneralMessage('الرجاء تصحيح الأخطاء في النموذج لإكمال التسجيل.', 'error');
            return;
        }

        setLoading(true); // إظهار سبينر التحميل وتعطيل الزر

        try {
            // Firebase Authentication: إنشاء مستخدم بالبريد الإلكتروني وكلمة المرور
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // إعداد البيانات الأولية لـ Firestore (تقدم الامتحانات والدورات)
            // يمكن توسيع هذا الهيكل حسب الحاجة لمنصتك
            const initialExams = {};
            for (let i = 1; i <= 10; i++) { // مثال: تهيئة لـ 10 امتحانات
                initialExams[`exam${i}`] = {
                    score: 0,
                    date: null,
                    status: "pending", // أمثلة: "pending", "completed", "failed"
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }

           const initialCourses = {
    course1: {
        name: "اشتراك الترم كامل - أولى ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course2: {
        name: "اشتراك أول شهر - أولى ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course3: {
        name: "اشتراك تاني شهر - أولى ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course4: {
        name: "اشتراك الترم كامل - تانية ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course5: {
        name: "اشتراك أول شهر - تانية ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course6: {
        name: "اشتراك تاني شهر - تانية ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course7: {
        name: "اشتراك تالت شهر - تانية ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course8: {
        name: "اشتراك الترم كامل - تالتة ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course9: {
        name: "اشتراك أول شهر - تالتة ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    },
    course10: {
        name: "اشتراك تاني شهر - تالتة ثانوي",
        score: 0,
        date: null,
        status: "inactive",
        questionsAnswered: 0,
        correctAnswers: 0
    }
};

            // حفظ جميع بيانات المستخدم في Firestore ضمن مجموعة "userdata"
            // معرف المستند سيكون هو User UID لسهولة الاسترجاع
            await setDoc(doc(db, "userdata", user.uid), { // اسم المجموعة هو "userdata" كما هو مطلوب
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId,
                parentPhone: parentPhone,
                createdAt: new Date(), // تاريخ إنشاء الحساب
                lastLogin: new Date(), // تعيين وقت تسجيل الدخول الأولي
                userRole: "student", // تعيين دور افتراضي
                isActive: true, // حالة الحساب
                profilePicUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png", // رابط صورة الملف الشخصي الافتراضية
                exams: initialExams, // تقدم/حالة الامتحانات الأولية
                courses: initialCourses // تقدم/حالة الدورات الأولية
            });

            setLoading(false); // إخفاء سبينر التحميل وتمكين الزر

            // عرض رسالة نجاح للمستخدم باسم المستخدم الذي اختاره
            const successMessageText = `🎉 تم إنشاء الحساب بنجاح! أنت الآن يا ${username} بقيت ضمن كتيّبة القائد. سيتم توجيهك للصفحة الرئيسية...`;
            displayGeneralMessage(successMessageText, 'success');

            // إعادة التوجيه إلى index.html بعد تأخير مع معامل رسالة نجاح في الرابط
            setTimeout(() => {
                const encodedUsername = encodeURIComponent(username); // ترميز اسم المستخدم لأمان الرابط
                window.location.href = `index.html?signupSuccess=true&message=${encodedUsername}`; // إعادة التوجيه
            }, 4000); // إعادة التوجيه بعد 4 ثوانٍ للسماح للمستخدم بقراءة الرسالة

        } catch (error) {
            setLoading(false); // إخفاء سبينر التحميل وتمكين الزر

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
            // معالجة أخطاء Firebase authentication المحددة برسائل سهلة للمستخدم
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '⚠️ هذا البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.';
                    displayInputError(emailError, errorMessage);
                    break;
                case 'auth/weak-password':
                    errorMessage = '🔒 كلمة المرور ضعيفة جداً. الرجاء استخدام كلمة مرور أقوى (أرقام وحروف ورموز).';
                    displayInputError(passwordError, errorMessage);
                    break;
                case 'auth/invalid-email':
                    errorMessage = '✉️ صيغة البريد الإلكتروني غير صالحة. الرجاء التحقق من البريد المدخل.';
                    displayInputError(emailError, errorMessage);
                    break;
                case 'auth/operation-not-allowed':
                    // هذا الخطأ يعني أن تسجيل الدخول بالبريد الإلكتروني/كلمة المرور غير مفعل في إعدادات مشروع Firebase
                    errorMessage = '🚫 تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم.';
                    break;
                default:
                    // رسالة خطأ عامة للأخطاء غير المعالجة
                    errorMessage = `❌ خطأ غير معروف: ${error.message}.`;
                    break;
            }
            displayGeneralMessage(errorMessage, 'error'); // عرض رسالة الخطأ
            supportContactDiv.style.display = 'block'; // إظهار رابط الدعم الفني
            console.error("Firebase Auth Error:", error); // تسجيل الخطأ الكامل للتصحيح
        }
    });
});
