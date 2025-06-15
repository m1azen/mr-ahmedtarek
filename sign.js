// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (Please ensure this is correct and secure)
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
const auth = getAuth(app); // Firebase Authentication service
const db = getFirestore(app); // Firebase Firestore service

document.addEventListener('DOMContentLoaded', () => {
    // Form elements
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

    // Error message elements for each input (still used for inline validation feedback)
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const gradeError = document.getElementById('gradeError');
    const governorateError = document.getElementById('governorateError');
    const studentIdError = document.getElementById('studentIdError');
    const parentPhoneError = document.getElementById('parentPhoneError');

    // Modals and their elements
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeModalButton = instructionsModal.querySelector('.close-button'); // Close button for instructions modal

    const messageModal = document.getElementById('messageModal'); // The new general message modal
    const messageTitle = document.getElementById('messageTitle');
    const messageText = document.getElementById('messageText');
    const messageOkButton = document.getElementById('messageOkButton');
    const messageSupportLink = document.getElementById('messageSupportLink');

    // Function to display specific error message for an input
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none';
    }

    // Function to show the general message modal
    function showMessageModal(title, text, isError = false) {
        messageTitle.textContent = title;
        messageText.textContent = text;
        if (isError) {
            messageSupportLink.style.display = 'inline-block'; // Show support link for errors
            messageTitle.style.color = '#e74c3c'; // Red title for error
        } else {
            messageSupportLink.style.display = 'none'; // Hide support link for success
            messageTitle.style.color = '#2ecc71'; // Green title for success
        }
        messageModal.classList.add('show'); // Use 'show' class for CSS transition
    }

    // Function to hide the general message modal
    function hideMessageModal() {
        messageModal.classList.remove('show');
    }

    // Function to hide all inline error messages
    function clearInlineErrors() {
        displayInputError(usernameError, '');
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
        displayInputError(confirmPasswordError, '');
        displayInputError(gradeError, '');
        displayInputError(governorateError, '');
        displayInputError(studentIdError, '');
        displayInputError(parentPhoneError, '');
    }

    // Function to show/hide loading state on button
    function setLoading(isLoading) {
        signupButton.disabled = isLoading;
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none';

        if (isLoading) {
            signupButton.textContent = 'جارٍ إنشاء الحساب...';
            // Re-add the spinner after textContent change
            signupButton.appendChild(loadingSpinner);
        } else {
            // Restore original button content
            signupButton.innerHTML = `إنشاء الحساب <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            // Re-get reference to spinner after innerHTML change
            loadingSpinner = document.getElementById('loadingSpinner');
        }
    }

    // =====================================
    // Instructions Modal Logic
    // =====================================

    // Show instructions modal on page load
    instructionsModal.classList.add('show');
    signupForm.classList.add('hidden-form'); // Hide form using the CSS class

    // Handle acceptance of instructions
    acceptInstructionsButton.addEventListener('click', () => {
        instructionsModal.classList.remove('show');
        signupForm.classList.remove('hidden-form'); // Show form
        clearInlineErrors(); // Clear any pre-existing errors
    });

    // Close button for the instructions modal (re-shows modal if closed without accepting)
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            instructionsModal.classList.add('show');
        });
    }

    // Prevent instructions modal from closing if clicked outside content
    instructionsModal.addEventListener('click', (event) => {
        if (event.target === instructionsModal) {
            instructionsModal.classList.add('show');
        }
    });

    // Handle "Okay" button click on the general message modal
    messageOkButton.addEventListener('click', () => {
        hideMessageModal();
        // If it was a success, redirect after the user clicks "Okay"
        // This ensures the user sees the success message and interacts with it.
        if (messageTitle.textContent.includes('نجاح')) { // Check title for "نجاح"
            // You can add a small delay here if needed, but clicking "Okay" implies readiness to proceed.
            window.location.href = `index.html?signupSuccess=true&message=${encodeURIComponent(usernameInput.value.trim())}`;
        }
    });


    // =====================================
    // Form Submission and Firebase Logic
    // =====================================

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        clearInlineErrors(); // Clear previous inline error messages

        // Get trimmed values from inputs
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const grade = gradeSelect.value;
        const governorate = governorateSelect.value;
        const studentId = studentIdInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        let isValid = true;

        // Client-side validation for all fields
        if (!username) {
            displayInputError(usernameError, 'الرجاء إدخال اسم المستخدم الكامل.');
            isValid = false;
        }
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
        } else if (!/[0-9]/.test(password)) { // Only check for at least one number, no symbols required now
            displayInputError(passwordError, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل.');
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
        } else if (!/^\d+$/.test(studentId)) { // Only digits allowed
             displayInputError(studentIdError, 'رقم الطالب يجب أن يحتوي على أرقام فقط.');
             isValid = false;
        }
        if (!parentPhone) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم ولي الأمر.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(parentPhone)) { // Basic Egyptian phone number validation (010, 011, 012, 015)
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم هاتف ولي أمر مصري صحيح (11 رقم يبدأ بـ 01).');
            isValid = false;
        }


        if (!isValid) {
            showMessageModal('خطأ في البيانات', 'الرجاء تصحيح الأخطاء في النموذج لإكمال التسجيل.', true);
            return; // Stop if validation fails
        }

        setLoading(true); // Show loading spinner and disable button

        try {
            // 1. Create user with Email and Password in Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Prepare initial data for Firestore (10 exams and 10 courses)
            const initialExams = {};
            for (let i = 1; i <= 10; i++) {
                initialExams[`exam${i}`] = {
                    score: 0,
                    date: null,
                    status: "pending", // "pending", "completed", "failed"
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }

            const initialCourses = {};
            for (let i = 1; i <= 10; i++) {
                initialCourses[`course${i}`] = {
                    progress: "0%",
                    status: "inactive", // Set to "inactive" as requested
                    lastAccessed: null,
                    totalLessons: 5, // Example
                    completedLessons: 0
                };
            }

            // 3. Save ALL user data to Firestore under "userdata" collection
            await setDoc(doc(db, "userdata", user.uid), { // Collection name "userdata"
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId,
                parentPhone: parentPhone,
                createdAt: new Date(), // Timestamp of creation
                lastLogin: new Date(), // Initial login time
                userRole: "student", // Example role
                isActive: true, // User account status
                profilePicUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png", // Default profile picture
                exams: initialExams, // Initial exams progress
                courses: initialCourses // Initial courses progress
            });

            setLoading(false); // Hide loading spinner

            // Show success message in the general message modal
            showMessageModal('تم إنشاء الحساب بنجاح! 🎉', `أنت الآن يا ${username} بقيت ضمن كتيّبة القائد.`, false);

            // Redirection will happen after user clicks "Okay" on the message modal.
            // No direct setTimeout redirect here.

        } catch (error) {
            setLoading(false); // Hide loading spinner

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
            let errorTitle = "خطأ في إنشاء الحساب ❌";
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل. الرجاء تسجيل الدخول أو استخدام بريد إلكتروني آخر.';
                    displayInputError(emailError, errorMessage); // Also show inline error
                    break;
                case 'auth/weak-password':
                    errorMessage = 'كلمة المرور ضعيفة جداً. الرجاء استخدام كلمة مرور أقوى (أحرف وأرقام).';
                    displayInputError(passwordError, errorMessage); // Also show inline error
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'صيغة البريد الإلكتروني غير صالحة. الرجاء التحقق من البريد المدخل.';
                    displayInputError(emailError, errorMessage); // Also show inline error
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = 'تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم.';
                    break;
                default:
                    errorMessage = `حدث خطأ غير معروف: ${error.message}.`;
                    break;
            }
            showMessageModal(errorTitle, errorMessage, true); // Show error in general message modal
            console.error("Firebase Auth Error:", error);
        }
    });
});
