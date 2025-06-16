// عند تحميل الصفحة بالكامل
document.addEventListener("DOMContentLoaded", () => {
    const userDataBtn = document.getElementById("user-data-btn");
    const subscriptionsBtn = document.getElementById("subscriptions-btn");
    const assignmentsBtn = document.getElementById("assignments-btn");

    const userDataSection = document.getElementById("user-data");
    const subscriptionsSection = document.getElementById("subscriptions");
    const assignmentsSection = document.getElementById("assignments");

    // إخفاء جميع الأقسام وعرض القسم الافتراضي
    function showSection(section) {
        document.querySelectorAll(".content-section").forEach(div => div.classList.add("hidden"));
        section.classList.remove("hidden");
    }

    userDataBtn.addEventListener("click", () => showSection(userDataSection));
    subscriptionsBtn.addEventListener("click", () => showSection(subscriptionsSection));
    assignmentsBtn.addEventListener("click", () => showSection(assignmentsSection));

    // افتراضيًا، عرض بيانات المستخدم عند الدخول
    showSection(userDataSection);

    // جلب بيانات المستخدم من Firebase
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, "userdata", user.uid));

            if (userDoc.exists()) {
                document.getElementById("user-name").textContent = `الاسم: ${userDoc.data().name}`;
                document.getElementById("user-email").textContent = `البريد الإلكتروني: ${userDoc.data().email}`;
                
                // حساب نسبة الدرجات
                const examScore = userDoc.data().examScore || 0;
                const assignmentScore = userDoc.data().assignmentScore || 0;

                document.getElementById("exam-score").textContent = `نسبة درجات الامتحان: ${examScore}%`;
                document.getElementById("assignment-score").textContent = `نسبة درجات الواجب: ${assignmentScore}%`;

                // تغيير الدائرة المتحركة بناءً على النسبة
                document.querySelector(".progress-circle").style.setProperty("--percentage", `${examScore}%`);

                // رسالة التحفيز
                let motivationMessage = "حافظ على الاستمرار في التقدم!";
                if (examScore > 90) motivationMessage = "رائع جدًا! أنت تتفوق بشكل مذهل!";
                else if (examScore > 75) motivationMessage = "أداء ممتاز، استمر في التفوق!";
                else if (examScore > 50) motivationMessage = "أنت تبلي بلاءً حسنًا، استمر في التحسن!";
                else motivationMessage = "لا تقلق، فقط تابع الدراسة وستصل للمستوى الذي تريده!";
                
                document.getElementById("motivation-message").textContent = motivationMessage;
            }
        }
    });

    // تحميل بيانات الواجبات من Firebase
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

    assignmentsBtn.addEventListener("click", loadAssignments);

    // تحميل بيانات الاشتراكات
    async function loadSubscriptions() {
        const user = auth.currentUser;
        if (!user) return;

        const userDoc = await getDoc(doc(db, "userdata", user.uid));
        if (userDoc.exists() && userDoc.data().courses) {
            document.getElementById("active-courses").textContent = userDoc.data().courses.length;
        }
    }

    subscriptionsBtn.addEventListener("click", loadSubscriptions);

    // تحميل الواجبات إلى ملف Excel
    document.getElementById("download-excel").addEventListener("click", () => {
        alert("سيتم تحميل ملف Excel قريبًا، جاري التطوير! 🎉");
    });
});
