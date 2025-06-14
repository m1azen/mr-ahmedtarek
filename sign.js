// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E",
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
    // Form elements (Updated to correctly reference all elements by their IDs)
    const signupForm = document.getElementById('signupForm');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const gradeSelect = document.getElementById('grade');
    const governorateSelect = document.getElementById('governorate');
    const studentIdInput = document.getElementById('studentId'); // Corrected ID
    const parentPhoneInput = document.getElementById('parentPhone'); // Corrected ID
    const signupButton = document.getElementById('signupButton');
    let loadingSpinner = document.getElementById('loadingSpinner'); // Use 'let' as its reference might be updated
    const generalMessageDiv = document.getElementById('generalMessage'); // Corrected ID
    const supportContactDiv = document.getElementById('supportContact'); // Corrected ID

    // Error message elements for each input (Corrected to match HTML IDs)
    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const gradeError = document.getElementById('gradeError');
    const governorateError = document.getElementById('governorateError');
    const studentIdError = document.getElementById('studentIdError');
    const parentPhoneError = document.getElementById('parentPhoneError');

    // Instructions Modal elements
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeModalButton = instructionsModal.querySelector('.close-button');


    // Function to display specific error message for an input field
    function displayInputError(element, message) {
        element.textContent = message;
        element.style.display = message ? 'block' : 'none'; // Show if message exists, hide otherwise
    }

    // Function to display general status messages (success/error/loading)
    function displayGeneralMessage(message, type) {
        generalMessageDiv.textContent = message;
        generalMessageDiv.className = `status-message ${type}`; // Apply 'success' or 'error' class for styling
        generalMessageDiv.style.display = 'block';
    }

    // Function to clear all previously displayed messages
    function clearMessages() {
        generalMessageDiv.style.display = 'none';
        supportContactDiv.style.display = 'none'; // Hide support contact by default
        // Clear all specific input error messages
        displayInputError(usernameError, '');
        displayInputError(emailError, '');
        displayInputError(passwordError, '');
        displayInputError(confirmPasswordError, '');
        displayInputError(gradeError, '');
        displayInputError(governorateError, '');
        displayInputError(studentIdError, '');
        displayInputError(parentPhoneError, '');
    }

    // Function to control loading state (button disabled, spinner visibility)
    function setLoading(isLoading) {
        signupButton.disabled = isLoading; // Disable button when loading
        loadingSpinner.style.display = isLoading ? 'inline-block' : 'none'; // Show/hide spinner

        if (isLoading) {
            signupButton.textContent = 'جارٍ إنشاء الحساب...'; // Change button text
        } else {
            // Restore original button text and re-attach spinner (important after textContent change)
            signupButton.innerHTML = `إنشاء الحساب <span class="spinner" id="loadingSpinner" style="display: none;"></span>`;
            // Re-get reference to spinner element as innerHTML reset it
            loadingSpinner = document.getElementById('loadingSpinner');
        }
    }

    // =====================================
    // Instructions Modal Logic
    // This modal appears on page load to present terms/instructions
    // =====================================

    // Show the instructions modal when the page initially loads
    instructionsModal.classList.add('show'); // Use class for CSS transitions/visibility
    signupForm.style.display = 'none'; // Keep the signup form hidden until instructions are accepted

    // Event listener for the "Accept Instructions" button within the modal
    acceptInstructionsButton.addEventListener('click', () => {
        instructionsModal.classList.remove('show'); // Hide the modal
        signupForm.style.display = 'block'; // Show the signup form
        signupForm.style.display = 'flex'; // Ensure form takes correct display property after being shown
        signupForm.style.flexDirection = 'column'; // Maintain flex direction for proper layout
    });

    // Event listener for the modal's close button (top-left 'X')
    if (closeModalButton) { // Check if the close button exists in the HTML
        closeModalButton.addEventListener('click', () => {
            // If user attempts to close the modal without accepting, it reappears
            instructionsModal.classList.add('show');
        });
    }

    // Event listener for clicks outside the modal content (on the backdrop)
    instructionsModal.addEventListener('click', (event) => {
        // If the click occurred directly on the modal backdrop (not on modal-content)
        if (event.target === instructionsModal) {
            instructionsModal.classList.add('show'); // Re-show the modal if backdrop clicked
        }
    });

    // =====================================
    // Form Submission and Firebase Integration
    // This section handles user registration, validation, and data saving
    // =====================================

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent the default form submission (page reload)

        clearMessages(); // Clear any existing messages or errors

        // Get sanitized (trimmed) values from all input fields
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const grade = gradeSelect.value;
        const governorate = governorateSelect.value;
        const studentId = studentIdInput.value.trim();
        const parentPhone = parentPhoneInput.value.trim();

        let isValid = true; // Flag to track overall form validation status

        // --- Client-side Validation Checks ---
        // 1. Username validation
        if (!username) {
            displayInputError(usernameError, 'الرجاء إدخال اسم المستخدم الكامل.');
            isValid = false;
        }

        // 2. Email validation
        if (!email) {
            displayInputError(emailError, 'الرجاء إدخال البريد الإلكتروني.');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Basic email regex
            displayInputError(emailError, 'الرجاء إدخال بريد إلكتروني صالح.');
            isValid = false;
        }

        // 3. Password validation
        if (!password) {
            displayInputError(passwordError, 'الرجاء إدخال كلمة المرور.');
            isValid = false;
        } else if (password.length < 6) {
            displayInputError(passwordError, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل.');
            isValid = false;
        } else if (!/[0-9]/.test(password) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
            // Check for at least one number and one special character (expanded set)
            displayInputError(passwordError, 'كلمة المرور يجب أن تحتوي على أرقام ورموز.');
            isValid = false;
        }

        // 4. Confirm Password validation
        if (!confirmPassword) {
            displayInputError(confirmPasswordError, 'الرجاء تأكيد كلمة المرور.');
            isValid = false;
        } else if (password !== confirmPassword) {
            displayInputError(confirmPasswordError, 'كلمتا المرور غير متطابقتين.');
            isValid = false;
        }

        // 5. Grade selection validation
        if (!grade) { // If default empty option is still selected
            displayInputError(gradeError, 'الرجاء اختيار الصف الدراسي.');
            isValid = false;
        }

        // 6. Governorate selection validation
        if (!governorate) { // If default empty option is still selected
            displayInputError(governorateError, 'الرجاء اختيار المحافظة.');
            isValid = false;
        }

        // 7. Student ID validation (digits only)
        if (!studentId) {
            displayInputError(studentIdError, 'الرجاء إدخال رقم الطالب.');
            isValid = false;
        } else if (!/^\d+$/.test(studentId)) { // Ensures only digits
            displayInputError(studentIdError, 'رقم الطالب يجب أن يحتوي على أرقام فقط.');
            isValid = false;
        }

        // 8. Parent Phone validation (basic Egyptian format)
        if (!parentPhone) {
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم ولي الأمر.');
            isValid = false;
        } else if (!/^01[0-2,5]\d{8}$/.test(parentPhone)) { // Egyptian phone numbers start with 010, 011, 012, 015 and are 11 digits
            displayInputError(parentPhoneError, 'الرجاء إدخال رقم هاتف ولي أمر مصري صحيح (11 رقم يبدأ بـ 01).');
            isValid = false;
        }

        // If any client-side validation failed, stop the process
        if (!isValid) {
            displayGeneralMessage('الرجاء تصحيح الأخطاء في النموذج لإكمال التسجيل.', 'error');
            return;
        }

        setLoading(true); // Show loading spinner and disable button

        try {
            // Firebase Authentication: Create user with Email and Password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Prepare initial data for Firestore (Exams and Courses progress)
            const initialExams = {};
            for (let i = 1; i <= 10; i++) {
                initialExams[`exam${i}`] = {
                    score: 0,
                    date: null,
                    status: "pending", // e.g., "pending", "completed", "failed"
                    questionsAnswered: 0,
                    correctAnswers: 0
                };
            }

            const initialCourses = {};
            for (let i = 1; i <= 10; i++) {
                initialCourses[`course${i}`] = {
                    progress: "0%",
                    status: "locked", // e.g., "locked", "unlocked", "completed"
                    lastAccessed: null,
                    totalLessons: 5, // Example: number of lessons in this course
                    completedLessons: 0
                };
            }

            // Save all user data to Firestore under the "userdata" collection
            // The document ID will be the Firebase User UID for easy retrieval
            await setDoc(doc(db, "userdata", user.uid), { // Collection name is "userdata" as requested
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId,
                parentPhone: parentPhone,
                createdAt: new Date(), // Timestamp of account creation
                lastLogin: new Date(), // Set initial login time
                userRole: "student", // Assign a default role
                isActive: true, // Account status
                profilePicUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png", // Default profile picture URL
                exams: initialExams, // Initial exams progress/status
                courses: initialCourses // Initial courses progress/status
            });

            setLoading(false); // Hide loading spinner and enable button

            // Display success message to the user with their chosen username
            const successMessageText = `🎉 تم إنشاء الحساب بنجاح! أنت الآن يا ${username} بقيت ضمن كتيّبة القائد. سيتم توجيهك للصفحة الرئيسية...`;
            displayGeneralMessage(successMessageText, 'success');

            // Redirect to index.html after a delay with a success message parameter
            setTimeout(() => {
                const encodedUsername = encodeURIComponent(username); // Encode username for URL safety
                window.location.href = `index.html?signupSuccess=true&message=${encodedUsername}`;
            }, 4000); // Redirect after 4 seconds to allow user to read the message

        } catch (error) {
            setLoading(false); // Hide loading spinner and enable button

            let errorMessage = "حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.";
            // Handle specific Firebase authentication errors with user-friendly messages
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
                    // This error means email/password sign-in is not enabled in Firebase project settings
                    errorMessage = '🚫 تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم.';
                    break;
                default:
                    // Generic error message for unhandled errors
                    errorMessage = `❌ خطأ غير معروف: ${error.message}.`;
                    break;
            }
            displayGeneralMessage(errorMessage, 'error'); // Display the error message
            supportContactDiv.style.display = 'block'; // Show the support contact link
            console.error("Firebase Auth Error:", error); // Log the full error for debugging
        }
    });
});
