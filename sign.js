// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Optional: If you want analytics, uncomment the next line
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// Your web app's Firebase configuration (provided by user)
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E",
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebaseapp.com",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Get Firebase Authentication service
const db = getFirestore(app); // Get Firebase Firestore service
// Optional: If you want analytics, uncomment the next line
// const analytics = getAnalytics(app);

document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    // const governorateSelect = document.getElementById('governorate'); // No longer needed for populating
    
    // For the modal (instructions pop-up)
    const instructionsModal = document.getElementById('instructionsModal');
    const acceptInstructionsButton = document.getElementById('acceptInstructions');
    const closeButton = instructionsModal.querySelector('.close-button');

    // List of 27 Egyptian Governorates (moved to HTML directly)
    // const governorates = [...]; 
    // This array and the population logic are now removed from JS

    // Function to display messages within the form
    function displayMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `form-message ${type}`; // Add type for styling (success/error)
        messageDiv.style.display = 'block'; // Make sure it's visible
    }

    // Function to show the instructions modal and hide the form
    function showInstructionsModal() {
        signupForm.style.display = 'none'; // Hide the sign-up form
        instructionsModal.style.display = 'flex'; // Show the instructions modal
    }

    // Function to hide the instructions modal and show the form
    function hideInstructionsModal() {
        instructionsModal.style.display = 'none'; // Hide the instructions modal
        signupForm.style.display = 'flex'; // Show the sign-up form
        signupForm.style.flexDirection = 'column'; // Ensure correct flex direction for the form
    }

    // Show the instructions modal when the page loads
    showInstructionsModal();

    // Handle acceptance of instructions
    acceptInstructionsButton.addEventListener('click', () => {
        hideInstructionsModal();
    });

    // Close button for the modal
    // If user tries to close the modal without accepting, it will reappear.
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            showInstructionsModal(); // Re-show the modal if closed without accepting
        });
    }

    // Handle form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Clear previous messages
        displayMessage('', '');
        messageDiv.style.display = 'none'; // Hide message div initially

        const username = signupForm.username.value;
        const email = signupForm.email.value;
        const password = signupForm.password.value;
        const confirmPassword = signupForm['confirm-password'].value;
        const grade = signupForm.grade.value;
        const governorate = signupForm.governorate.value;
        const studentId = signupForm['student-id'].value; // Now required
        const parentPhone = signupForm['parent-phone'].value;

        // Client-side validation
        if (password !== confirmPassword) {
            displayMessage('كلمة المرور وتأكيدها غير متطابقين!', 'error');
            return;
        }

        if (password.length < 6) {
            displayMessage('يجب أن تكون كلمة المرور 6 أحرف على الأقل.', 'error');
            return;
        }

        // Check if all required fields are filled (including the select elements)
        if (!username || !email || !password || !confirmPassword || !grade || grade === '' || !governorate || governorate === '' || !studentId || !parentPhone) {
            displayMessage('يرجى ملء جميع الحقول المطلوبة.', 'error');
            return;
        }

        displayMessage('جارٍ إنشاء الحساب...', ''); // Show loading message

        try {
            // 1. Create user with Email and Password using Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Prepare initial data for Firestore (10 exams and 10 courses)
            const initialExams = {};
            for (let i = 1; i <= 10; i++) {
                initialExams[`exam${i}`] = { score: 0, date: null, status: "pending" };
            }

            const initialCourses = {};
            for (let i = 1; i <= 10; i++) {
                initialCourses[`course${i}`] = { progress: "0%", status: "locked" };
            }

            // 3. Save user data to Cloud Firestore
            // The document ID for user data will be the Firebase User UID
            await setDoc(doc(db, "users", user.uid), {
                username: username,
                email: email,
                grade: grade,
                governorate: governorate,
                studentId: studentId, // Storing required student ID
                parentPhone: parentPhone,
                exams: initialExams, // Map containing 10 exams
                courses: initialCourses // Map containing 10 courses
            });

            // If successful, redirect to index.html with a success message in URL parameters
            window.location.href = `index.html?signupSuccess=true&message=${encodeURIComponent('تم إنشاء حسابك بنجاح! يمكنك الآن تسجيل الدخول.')}`;

        } catch (error) {
            console.error("Error creating user or saving data:", error);
            let errorMessage = 'حدث خطأ أثناء إنشاء الحساب. الرجاء المحاولة مرة أخرى.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'صيغة البريد الإلكتروني غير صحيحة.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'كلمة المرور ضعيفة جدًا (يجب أن تكون 6 أحرف على الأقل).';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'تم تعطيل التسجيل بالبريد الإلكتروني/كلمة المرور. يرجى الاتصال بالدعم.';
            }
            displayMessage(errorMessage, 'error');
        }
    });
});
