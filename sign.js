// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  setPersistence, 
  browserLocalPersistence 
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// Your web app's Firebase configuration
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
const auth = getAuth(app);
const db = getFirestore(app);

// عند تحميل محتوى DOM بالكامل، ابدأ بتنفيذ السكريبت
document.addEventListener('DOMContentLoaded', () => {
    // جلب عناصر نموذج التسجيل
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
    let loadingSpinner = document.getElementById('loadingSpinner');

    // عناصر رسائل الخطأ
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const gradeError = document.getElementById('gradeError');
    const governorateError = document.getElementById('governorateError');
    const studentIdError = document.getElementById('studentIdError');
    const parentPhoneError = document.getElementById('parentPhoneError');

    // عناصر النوافذ المنبثقة
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeModalButton = instructionsModal.querySelector('.close-button');
    
    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');

    // =====================================
    // وظائف التحكم في الواجهة
    // =====================================
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    function showMessageModal(title, message, type, showSupport = false) {
        messageTitle.textContent = title;
        messageText.textContent = message;
        messageModal.className = 'modal';
        if (type) {
            messageModal.classList.add(type);
        }
        messageSupportLink.style.display = showSupport ? 'inline-block' : 'none';
        messageModal.classList.add('show');
    }

    function clearMessages() {
        messageModal.classList.remove('show');
        displayInputError(usernameError, '');
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
        displayInputError(confirmPasswordError, '');
        displayInputError(gradeError, '');
        displayInputError(governorateError, '');
        displayInputError(studentIdError, '');
        displayInputError(parentPhoneError, '');
    }

    function setLoading(isLoading) {
        signupButton.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';

        if (isLoading) {
            signupButton.textContent = 'جارٍ إنشاء الحساب...';
        } else {
            signupButton.innerHTML = `إنشاء الحساب <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            loadingSpinner = document.getElementById('loadingSpinner');
        }
    }

    // =====================================
    // منطق نافذة التعليمات
    // =====================================
    instructionsModal.classList.add('show');
    signupForm.style.display = 'none';

    acceptInstructionsButton.addEventListener('click', () => {
        instructionsModal.classList.remove('show');
        signupForm.style.display = 'block';
        signupForm.style.display = 'flex';
        signupForm.style.flexDirection = 'column';
    });

    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            instructionsModal.classList.add('show');
            showMessageModal('تحذير', 'يجب الموافقة على التعليمات للمتابعة.', 'error');
        });
    }

    instructionsModal.addEventListener('click', (event) => {
        if (event.target === instructionsModal) {
            instructionsModal.classList.add('show');
            showMessageModal('تحذير', 'يجب الموافقة على التعليمات للمتابعة.', 'error');
        }
    });

    messageOkButton.addEventListener('click', () => {
        clearMessages();
    });

    // =====================================
    // تقديم النموذج وتكامل Firebase
    // =====================================
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearMessages();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const grade = gradeSelect.value;
        const governorate = governorateSelect.value;
        const studentId = studentIdInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        let isValid = true;

        // التحقق من صحة البيانات
        if (!username) {
            displayInputError(usernameError, 'الرجاء إدخال اسم المستخدم الكامل.');
            isValid = false;
        }

        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            displayInputError(emailError, 'الرجاء إدخال بريد إلكتروني صالح.');
            isValid = false;
        }

        if (!password) {
            displayInputError(passwordError, 'الرجاء إدخال كلمة المرور.');
            isValid = false;
        } else if (password.length < 6) {
            displayInputError(passwordError, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
            isValid = false;
        } else if (!/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
            displayInputError(passwordError, 'كلمة المرور يجب أن تحتوي على أرقام ورموز خاصة (مثل !@#$).');
            isValid = false;
        }

        if (!confirmPassword) {
            displayInputError(confirmPasswordError, 'الرجاء تأكيد كلمة المرور.');
            isValid = false;
        } else if (password !== confirmPassword) {
            displayInputError(confirmPasswordError, 'كلمتا المرور غير متطابقتين.');
            isValid = false;
        }

        if (!grade) {
            displayInputError(gradeError, 'الرجاء اختيار الصف الدراسي.');
            isValid = false;
        }

        if (!governorate) {
            displayInputError(governorateError, 'الرجاء اختيار المحافظة.');
            isValid = false;
        }

        if (!studentId) {
            displayInputError(studentIdError, 'الرجاء إدخال رقم الطالب.');
            isValid = false;
        } else if (!/^\d+$/.test(studentId)) {
            displayInputError(studentIdError, 'رقم الطالب يجب أن يحتوي على أرقام فقط.');
            isValid = false;
        }

        if (!parentPhone) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم ولي الأمر.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(parentPhone)) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم هاتف ولي أمر مصري صحيح (11 رقم يبدأ بـ 01).');
            isValid = false;
        }

        if (!isValid) {
            showMessageModal('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج لإكمال التسجيل.', 'error');
            return;
        }

        setLoading(true);

        try {
            // إنشاء مستخدم في Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // تفعيل خاصية الحفاظ على تسجيل الدخول
            await setPersistence(auth, browserLocalPersistence);

            // تحضير البيانات الأولية
            const initialExams = {};
            for (let i = 1; i <= 10; i++) {
                initialExams[`exam${i}`] = {
                    score: 0,
                    date: null,
                    status: "inactive",
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }

            const initialCourses = {
                course1: { name: "اشتراك الترم كامل - أولى ثانوي", score: 0, date: null, status: "inactive" },
                course2: { name: "اشتراك أول شهر - أولى ثانوي", score: 0, date: null, status: "inactive" },
                course3: { name: "اشتراك تاني شهر - أولى ثانوي", score: 0, date: null, status: "inactive" },
                course4: { name: "اشتراك الترم كامل - تانية ثانوي", score: 0, date: null, status: "inactive" },
                course5: { name: "اشتراك أول شهر - تانية ثانوي", score: 0, date: null, status: "inactive" },
                course6: { name: "اشتراك تاني شهر - تانية ثانوي", score: 0, date: null, status: "inactive" },
                course7: { name: "اشتراك تالت شهر - تانية ثانوي", score: 0, date: null, status: "inactive" },
                course8: { name: "اشتراك الترم كامل - تالتة ثانوي", score: 0, date: null, status: "inactive" },
                course9: { name: "اشتراك أول شهر - تالتة ثانوي", score: 0, date: null, status: "inactive" },
                course10: { name: "اشتراك تاني شهر - تالتة ثانوي", score: 0, date: null, status: "inactive" }
            };

            // حفظ بيانات المستخدم في Firestore
            await setDoc(doc(db, "userdata", user.uid), {
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId,
                parentPhone: parentPhone,
                createdAt: new Date(),
                lastLogin: new Date(),
                userRole: "student",
                isActive: true,
                profilePicUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
                exams: initialExams,
                courses: initialCourses
            });

            setLoading(false);

            // عرض رسالة النجاح
            const successMessageTitle = 'تم إنشاء الحساب بنجاح! 🎉';
            const successMessageText = `أهلاً بك يا ${username} في منصة القائد التعليمية. سيتم توجيهك للصفحة الرئيسية الآن.`;
            showMessageModal(successMessageTitle, successMessageText, 'success');

            // إعادة التوجيه بعد 3 ثواني
            setTimeout(() => {
                const encodedUsername = encodeURIComponent(username);
                window.location.href = `index.html?signupSuccess=true&username=${encodedUsername}`;
            }, 3000);

        } catch (error) {
            setLoading(false);

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
            let errorTitle = "خطأ في التسجيل ❌";
            let showSupport = true;

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '⚠️ هذا البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.';
                    displayInputError(emailError, errorMessage);
                    showSupport = false;
                    break;
                case 'auth/weak-password':
                    errorMessage = '🔒 كلمة المرور ضعيفة جداً. الرجاء استخدام كلمة مرور أقوى (أرقام وحروف ورموز خاصة).';
                    displayInputError(passwordError, errorMessage);
                    showSupport = false;
                    break;
                case 'auth/invalid-email':
                    errorMessage = '✉️ صيغة البريد الإلكتروني غير صالحة. الرجاء التحقق من البريد المدخل.';
                    displayInputError(emailError, errorMessage);
                    showSupport = false;
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = '🚫 تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم الفني للمساعدة.';
                    break;
                default:
                    errorMessage = `خطأ غير معروف: ${error.message}. يرجى محاولة التسجيل مرة أخرى أو الاتصال بالدعم الفني.`;
                    break;
            }
            showMessageModal(errorTitle, errorMessage, 'error', showSupport);
            console.error("Firebase Auth Error:", error);
        }
    });
});
