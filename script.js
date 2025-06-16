// استيراد مكتبات Firebase المطلوبة
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDh59dAoiUy1p8F4301kUjwzl9VT0nF2-E",
    authDomain: "ahmed-tarek-7beb4.firebaseapp.com",
    projectId: "ahmed-tarek-7beb4",
    storageBucket: "ahmed-tarek-7beb4.firebasestorage.app",
    messagingSenderId: "873531954018",
    appId: "1:873531954018:web:0f3f29cb2d0232826b923b",
    measurementId: "G-FZRCD5N87Z"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// التحكم في عرض الأقسام بناءً على الأزرار
document.querySelectorAll(".sidebar button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".content-section").forEach(section => section.classList.add("hidden"));
        document.getElementById(button.id.replace("-btn", "")).classList.remove("hidden");

        document.querySelectorAll(".sidebar button").forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
    });
});

// التأكد من تحميل بيانات المستخدم عند تسجيل الدخول
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDoc = await getDoc(doc(db, "userdata", user.uid));

        if (userDoc.exists()) {
            document.getElementById("user-name").textContent = `الاسم: ${userDoc.data().name}`;
            document.getElementById("user-email").textContent = `البريد الإلكتروني: ${userDoc.data().email}`;

            // حساب نسبة الدرجات وعرضها
            const examScore = userDoc.data().examScore || 0;
            const assignmentScore = userDoc.data().assignmentScore || 0;

            document.getElementById("exam-score").textContent = `نسبة درجات الامتحان: ${examScore}%`;
            document.getElementById("assignment-score").textContent = `نسبة درجات الواجب: ${assignmentScore}%`;

            // تحديث الدائرة المتحركة بناءً على النسب
            document.getElementById("exam-circle").style.setProperty("--percentage", `${examScore}%`);
            document.getElementById("assignment-circle").style.setProperty("--percentage", `${assignmentScore}%`);

            // إضافة رسالة تحفيزية
            let motivationMessage = "حافظ على الاجتهاد!";
            if (examScore > 90) motivationMessage = "أنت رائع، استمر على هذا الأداء!";
            else if (examScore > 75) motivationMessage = "نتائج رائعة، واصل التقدم!";
            else if (examScore > 50) motivationMessage = "جيد جدًا، استمر في التحسين!";
            else motivationMessage = "لا تقلق، لديك فرصة للتحسن، تابع الدراسة!";
            
            document.getElementById("motivation-message").textContent = motivationMessage;
        }
    }
});

// تحميل بيانات الاشتراكات
async function loadSubscriptions() {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "userdata", user.uid));
    if (userDoc.exists() && userDoc.data().courses) {
        document.getElementById("active-courses").textContent = userDoc.data().courses.length;
    }
}

document.getElementById("subscriptions-btn").addEventListener("click", loadSubscriptions);

// تحميل بيانات الواجبات
async function loadAssignments() {
    const assignmentsTable = document.getElementById("assignments-table").querySelector("tbody");
    assignmentsTable.innerHTML = ""; // تفريغ الجدول قبل إعادة ملئه

    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, "userdata", user.uid));
    if (userDoc.exists() && userDoc.data().assignments) {
        userDoc.data().assignments.forEach(assignment => {
            const row = `<tr>
                <td>${assignment.name}</td>
                <td>${assignment.grade}</td>
                <td>${assignment.dueDate}</td>
            </tr>`;
            assignmentsTable.innerHTML += row;
        });
    }
}

document.getElementById("assignments-btn").addEventListener("click", loadAssignments);

// تحميل الواجبات إلى ملف Excel
document.getElementById("download-excel").addEventListener("click", () => {
    alert("سيتم تحميل ملف Excel قريبًا، جاري التطوير! 🎉");
});
