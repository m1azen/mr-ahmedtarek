// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCV_AIVs3JAeVnIkGTievQdKO_RKVTMNtk",
  authDomain: "mrahmedtarek-ffdac.firebaseapp.com",
  projectId: "mrahmedtarek-ffdac",
  storageBucket: "mrahmedtarek-ffdac.appspot.com",
  messagingSenderId: "660123002704",
  appId: "1:660123002704:web:15b96f9d407042df412e55",
  measurementId: "G-98B9X9J60E"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('loginButton');
    let loadingSpinner = document.getElementById('loadingSpinner');

    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');

    const messageModal = document.getElementById('messageModal');
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');

    function displayInputError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    function clearInlineErrors() {
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
    }

    function showMessageModal(title, text, isError = false) {
        messageTitle.textContent = title;
        messageText.textContent = text;
        messageTitle.style.color = isError ? '#e74c3c' : '#2ecc71';
        messageSupportLink.style.display = isError ? 'inline-block' : 'none';
        messageModal.classList.add('show');
    }

    function hideMessageModal() {
        messageModal.classList.remove('show');
    }

    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';
        loginButton.textContent = isLoading ? 'جارٍ تسجيل الدخول...' : 'تسجيل الدخول';
        if (!isLoading) {
            loginButton.innerHTML = `تسجيل الدخول <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            loadingSpinner = document.getElementById('loadingSpinner');
        }
    }

    messageOkButton.addEventListener('click', () => {
        hideMessageModal();
        if (messageTitle.textContent.includes('نجاح')) {
            window.location.href = 'index.html?loginSuccess=true';
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearInlineErrors();
        setLoading(true);

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        let isValid = true;

        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
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
            await signInWithEmailAndPassword(auth, email, password);
            setLoading(false);
            showMessageModal('تم تسجيل الدخول بنجاح! 🎉', 'أهلاً بك مرة أخرى في منصة القائد.');
        } catch (error) {
            setLoading(false);
            let errorMessage = "حدث خطأ أثناء تسجيل الدخول.";
            if (error.code === 'auth/invalid-credential') {
                errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'تم حظر المحاولة مؤقتًا. حاول لاحقًا.';
            } else {
                errorMessage = `خطأ غير معروف: ${error.message}`;
            }
            showMessageModal('خطأ في تسجيل الدخول ❌', errorMessage, true);
        }
    });
});
