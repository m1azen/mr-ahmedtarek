// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// عند تحميل محتوى DOM بالكامل، ابدأ بتنفيذ السكريبت
document.addEventListener('DOMContentLoaded', () => {
    // جلب عناصر نموذج التسجيل بواسطة الـ ID الخاص بها
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
    // استخدم 'let' لأننا سنحتاج لإعادة جلب هذا العنصر بعد تغيير innerHTML للزر
    let loadingSpinner = document.getElementById('loadingSpinner');

    // جلب عناصر رسائل الخطأ لكل حقل إدخال
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const gradeError = document.getElementById('gradeError');
    const governorateError = document.getElementById('governorateError');
    const studentIdError = document.getElementById('studentIdError');
    const parentPhoneError = document.getElementById('parentPhoneError');

    // جلب عناصر نافذة التعليمات المنبثقة (Instructions Modal)
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeModalButton = instructionsModal.querySelector('.close-button'); // زر الإغلاق (X) داخل مودال التعليمات

    // جلب عناصر نافذة الرسائل العامة المنبثقة (General Message Modal) الجديدة
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');


    // =====================================
    // Functions for UI Control (الوظائف الخاصة بالتحكم في واجهة المستخدم)
    // =====================================

    /**
     * تعرض رسالة خطأ محددة أسفل حقل إدخال معين.
     * @param {HTMLElement} element - عنصر الـ div الخاص برسالة الخطأ (مثل usernameError).
     * @param {string} message - الرسالة التي سيتم عرضها.
     */
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none'; // أظهر الرسالة إذا كان هناك محتوى، وإلا قم بإخفائها
    }

    /**
     * تعرض رسالة عامة (نجاح أو خطأ) في نافذة منبثقة.
     * @param {string} title - عنوان الرسالة (مثال: "نجاح!", "خطأ!").
     * @param {string} message - نص الرسالة المفصل.
     * @param {string} type - نوع الرسالة ("success" أو "error") لتطبيق التنسيقات المناسبة.
     * @param {boolean} showSupport - هل يجب عرض رابط الدعم الفني؟ (صحيح للخطأ، خطأ للنجاح).
     */
    function showMessageModal(title, message, type, showSupport = false) {
        messageTitle.textContent = title;
        messageText.textContent = message;
        // إزالة أي فئات سابقة ثم إضافة الفئة الجديدة لتغيير الألوان/الرموز حسب نوع الرسالة
        messageModal.className = 'modal'; // إعادة ضبط الفئات
        if (type) {
            messageModal.classList.add(type); // إضافة فئة "success" أو "error"
        }
        messageSupportLink.style.display = showSupport ? 'inline-block' : 'none'; // إظهار أو إخفاء رابط الدعم
        messageModal.classList.add('show'); // إظهار المودال (نافذة الرسالة)
    }

    /**
     * تقوم بإخفاء جميع رسائل الأخطاء الخاصة بالحقول والرسائل العامة.
     */
    function clearMessages() {
        messageModal.classList.remove('show'); // إخفاء نافذة الرسالة العامة
        // مسح جميع رسائل الأخطاء الخاصة بحقول الإدخال
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
     * تتحكم في حالة التحميل لزر التسجيل (تعطيل/تفعيل، إظهار/إخفاء السبينر).
     * @param {boolean} isLoading - true لإظهار حالة التحميل، false لإخفائها.
     */
    function setLoading(isLoading) {
        signupButton.disabled = isLoading; // تعطيل الزر عند التحميل
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none'; // إظهار/إخفاء السبينر

        if (isLoading) {
            signupButton.textContent = 'جارٍ إنشاء الحساب...'; // تغيير نص الزر
        } else {
            // استعادة النص الأصلي للزر وإعادة جلب السبينر (مهم جداً بعد تغيير innerHTML)
            signupButton.innerHTML = `إنشاء الحساب <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            loadingSpinner = document.getElementById('loadingSpinner'); // إعادة جلب مرجع السبينر
        }
    }

    // =====================================
    // Instructions Modal Logic (منطق نافذة التعليمات)
    // هذا المودال يظهر عند تحميل الصفحة لعرض الشروط/التعليمات للمستخدم
    // =====================================

    // عند تحميل الصفحة، أظهر مودال التعليمات
    instructionsModal.classList.add('show');
    signupForm.style.display = 'none'; // إخفاء نموذج التسجيل حتى يتم قبول التعليمات

    // مستمع لحدث النقر على زر "أوافق وأبدأ التسجيل" داخل مودال التعليمات
    acceptInstructionsButton.addEventListener('click', () => {
        instructionsModal.classList.remove('show'); // إخفاء مودال التعليمات
        signupForm.style.display = 'block'; // إظهار نموذج التسجيل
        signupForm.style.display = 'flex'; // لضمان تطبيق خاصية flex CSS بشكل صحيح
        signupForm.style.flexDirection = 'column'; // للحفاظ على ترتيب العناصر العمودي
    });

    // مستمع لحدث النقر على زر الإغلاق (X) في مودال التعليمات
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            // إذا حاول المستخدم إغلاق المودال دون الموافقة، أعد إظهاره
            instructionsModal.classList.add('show');
            showMessageModal('تحذير', 'يجب الموافقة على التعليمات للمتابعة.', 'error');
        });
    }

    // مستمع لحدث النقر خارج محتوى المودال (على الخلفية الشفافة)
    instructionsModal.addEventListener('click', (event) => {
        if (event.target === instructionsModal) {
            // إذا تم النقر على الخلفية مباشرة، أعد إظهار المودال
            instructionsModal.classList.add('show');
            showMessageModal('تحذير', 'يجب الموافقة على التعليمات للمتابعة.', 'error');
        }
    });

    // مستمع لحدث النقر على زر "حسناً" في نافذة الرسائل العامة لإغلاقها
    messageOkButton.addEventListener('click', () => {
        clearMessages(); // إخفاء نافذة الرسالة العامة
    });


    // =====================================
    // Form Submission and Firebase Integration (تقديم النموذج وتكامل Firebase)
    // هذا الجزء يتعامل مع تسجيل المستخدم والتحقق من البيانات وحفظها
    // =====================================

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // منع الإرسال الافتراضي للنموذج (الذي يؤدي إلى إعادة تحميل الصفحة)

        clearMessages(); // مسح أي رسائل أو أخطاء سابقة

        // جلب القيم من جميع حقول الإدخال وإزالة المسافات الزائدة
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const grade = gradeSelect.value;
        const governorate = governorateSelect.value;
        const studentId = studentIdInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        let isValid = true; // علامة لتتبع حالة التحقق من صحة النموذج بشكل عام

        // --- Client-side Validation Checks (تحقق من صحة البيانات من جانب العميل) ---
        // 1. التحقق من اسم المستخدم
        if (!username) {
            displayInputError(usernameError, 'الرجاء إدخال اسم المستخدم الكامل.');
            isValid = false;
        }

        // 2. التحقق من البريد الإلكتروني
        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // تعبير نمطي للتحقق الأساسي من صحة البريد الإلكتروني
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
            displayInputError(passwordError, 'كلمة المرور يجب أن تحتوي على أرقام ورموز خاصة (مثل !@#$).');
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
        if (!grade) {
            displayInputError(gradeError, 'الرجاء اختيار الصف الدراسي.');
            isValid = false;
        }

        // 6. التحقق من اختيار المحافظة
        if (!governorate) {
            displayInputError(governorateError, 'الرجاء اختيار المحافظة.');
            isValid = false;
        }

        // 7. التحقق من رقم الطالب (أرقام فقط)
        if (!studentId) {
            displayInputError(studentIdError, 'الرجاء إدخال رقم الطالب.');
            isValid = false;
        } else if (!/^\d+$/.test(studentId)) { // التأكد من أن المدخل أرقام فقط
            displayInputError(studentIdError, 'رقم الطالب يجب أن يحتوي على أرقام فقط.');
            isValid = false;
        }

        // 8. التحقق من رقم ولي الأمر (تنسيق مصري أساسي)
        if (!parentPhone) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم ولي الأمر.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(parentPhone)) { // أرقام الهواتف المصرية تبدأ بـ 010, 011, 012, 015 وتتكون من 11 رقم
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم هاتف ولي أمر مصري صحيح (11 رقم يبدأ بـ 01).');
            isValid = false;
        }

        // إذا فشل أي تحقق من جانب العميل، أوقف العملية وأظهر رسالة عامة
        if (!isValid) {
            showMessageModal('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج لإكمال التسجيل.', 'error');
            return;
        }

        setLoading(true); // إظهار السبينر وتعطيل الزر

        try {
            // Firebase Authentication: إنشاء مستخدم جديد باستخدام البريد الإلكتروني وكلمة المرور
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // NEW: تفعيل خاصية الحفاظ على تسجيل الدخول (Persistence) باستخدام التخزين المحلي للمتصفح
            // هذا يعني أن المستخدم سيبقى مسجلاً للدخول حتى لو أغلق المتصفح أو أعاد تشغيل الجهاز، إلى أن يقوم بتسجيل الخروج يدوياً.
            await setPersistence(auth, browserLocalPersistence);

            // تحضير البيانات الأولية لـ Firestore (بيانات الامتحانات وتقدم الدورات)
            const initialExams = {};
            for (let i = 1; i <= 10; i++) { // يمكن تعديل العدد 10 ليتناسب مع عدد الامتحانات الفعلي
                initialExams[`exam${i}`] = {
                    score: 0,
                    date: null,
                    status: "pending", // أمثلة: "pending", "completed", "failed"
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }

            const initialCourses = {};
            for (let i = 1; i <= 10; i++) { // يمكن تعديل العدد 10 ليتناسب مع عدد الدورات الفعلي
                initialCourses[`course${i}`] = {
                    progress: "0%",
                    status: "locked", // أمثلة: "locked", "unlocked", "completed"
                    lastAccessed: null,
                    totalLessons: 5, // مثال: عدد الدروس في هذه الدورة
                    completedLessons: 0
                };
            }

            // حفظ جميع بيانات المستخدم في Firestore ضمن مجموعة "userdata"
            // سيتم استخدام الـ UID الخاص بمستخدم Firebase كمعرف للمستند لسهولة الاسترجاع
            await setDoc(doc(db, "userdata", user.uid), { // اسم المجموعة هو "userdata" كما هو مطلوب
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId,
                parentPhone: parentPhone,
                createdAt: new Date(), // تاريخ ووقت إنشاء الحساب
                lastLogin: new Date(), // تعيين وقت تسجيل الدخول الأولي
                userRole: "student", // تعيين دور افتراضي للمستخدم
                isActive: true, // حالة الحساب
                profilePicUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png", // رابط افتراضي لصورة الملف الشخصي
                exams: initialExams, // التقدم/الحالة الأولية للامتحانات
                courses: initialCourses // التقدم/الحالة الأولية للدورات
            });

            setLoading(false); // إخفاء السبينر وتفعيل الزر

            // عرض رسالة نجاح للمستخدم تتضمن اسم المستخدم الذي اختاره
            const successMessageTitle = 'تم إنشاء الحساب بنجاح! 🎉';
            const successMessageText = `أهلاً بك يا ${username} في منصة القائد التعليمية. سيتم توجيهك للصفحة الرئيسية الآن.`;
            showMessageModal(successMessageTitle, successMessageText, 'success');

            // إعادة توجيه المستخدم إلى الصفحة الرئيسية بعد تأخير، مع تمرير رسالة نجاح في الـ URL
            setTimeout(() => {
                const encodedUsername = encodeURIComponent(username); // ترميز اسم المستخدم ليكون آمناً في الـ URL
                window.location.href = `index.html?signupSuccess=true&username=${encodedUsername}`;
            }, 3000); // إعادة التوجيه بعد 3 ثوانٍ للسماح للمستخدم بقراءة الرسالة

        } catch (error) {
            setLoading(false); // إخفاء السبينر وتفعيل الزر

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
            let errorTitle = "خطأ في التسجيل ❌";
            let showSupport = true; // افتراضياً، أظهر رابط الدعم عند حدوث خطأ

            // التعامل مع أخطاء Firebase Authentication المحددة برسائل سهلة للمستخدم
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '⚠️ هذا البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.';
                    displayInputError(emailError, errorMessage); // أظهر الخطأ أسفل حقل البريد
                    showSupport = false; // لا حاجة للدعم في هذه الحالة
                    break;
                case 'auth/weak-password':
                    errorMessage = '🔒 كلمة المرور ضعيفة جداً. الرجاء استخدام كلمة مرور أقوى (أرقام وحروف ورموز خاصة).';
                    displayInputError(passwordError, errorMessage); // أظهر الخطأ أسفل حقل كلمة المرور
                    showSupport = false; // لا حاجة للدعم في هذه الحالة
                    break;
                case 'auth/invalid-email':
                    errorMessage = '✉️ صيغة البريد الإلكتروني غير صالحة. الرجاء التحقق من البريد المدخل.';
                    displayInputError(emailError, errorMessage); // أظهر الخطأ أسفل حقل البريد
                    showSupport = false; // لا حاجة للدعم في هذه الحالة
                    break;
                case 'auth/operation-not-allowed':
                    // هذا الخطأ يعني أن تسجيل الدخول بالبريد الإلكتروني/كلمة المرور غير مفعل في إعدادات مشروع Firebase
                    errorMessage = '🚫 تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم الفني للمساعدة.';
                    break;
                default:
                    // رسالة خطأ عامة للأخطاء غير المعالجة
                    errorMessage = `خطأ غير معروف: ${error.message}. يرجى محاولة التسجيل مرة أخرى أو الاتصال بالدعم الفني.`;
                    break;
            }
            showMessageModal(errorTitle, errorMessage, 'error', showSupport); // عرض رسالة الخطأ في المودال
            console.error("Firebase Auth Error:", error); // تسجيل الخطأ الكامل في الكونسول لتصحيح الأخطاء
        }
    });
});
