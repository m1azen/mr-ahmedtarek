document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('closeSidebarButton');
    const userIcon = document.getElementById('userIcon');
    const sidebarContent = document.getElementById('sidebarContent');
    const bannerButtonsContainer = document.getElementById('bannerButtons');

    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.checked = (savedTheme === 'dark-mode');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light-mode');
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark-mode');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light-mode');
        }
    });

    function isUserLoggedIn() {
        return localStorage.getItem('loggedIn') === 'true';
    }

    function getUserName() {
        return localStorage.getItem('userName') || "زائر";
    }

    function simulateLogin() {
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('userName', 'أحمد');
        updateUI();
    }

    function simulateLogout() {
        localStorage.setItem('loggedIn', 'false');
        localStorage.removeItem('userName');
        updateUI();
    }

    function renderSidebarContent() {
        sidebarContent.innerHTML = '';
        sidebarContent.innerHTML += `<button class="sidebar-button"><i class="fas fa-home"></i> الصفحة الرئيسية</button>`;

        if (isUserLoggedIn()) {
            const userName = getUserName();
            sidebarContent.innerHTML += `
                <div class="sidebar-user-info">
                    <span>أهلاً ${userName}</span>
                </div>
                <button class="sidebar-button"><i class="fas fa-users"></i> منتدى الطلبة</button>
                <button class="sidebar-button"><i class="fas fa-user-circle"></i> حسابي</button>
                <button class="sidebar-button"><i class="fas fa-book-open"></i> كورساتي</button>
                <button class="sidebar-button" id="logoutButton"><i class="fas fa-sign-out-alt"></i> تسجيل خروج</button>
            `;
            document.getElementById('logoutButton').addEventListener('click', () => {
                simulateLogout();
                sidebar.classList.remove('show');
            });
        } else {
            sidebarContent.innerHTML += `
                <button class="sidebar-button" id="registerButton"><i class="fas fa-user-plus"></i> تسجيل جديد</button>
                <button class="sidebar-button" id="loginButton"><i class="fas fa-sign-in-alt"></i> تسجيل دخول</button>
            `;
            document.getElementById('registerButton').addEventListener('click', () => {
                window.location.href = 'sign.html'; // توجيه إلى صفحة إنشاء حساب
            });
            document.getElementById('loginButton').addEventListener('click', () => {
                window.location.href = 'login.html'; // توجيه إلى صفحة تسجيل الدخول
            });
        }
    }

    function renderBannerButtons() {
        bannerButtonsContainer.innerHTML = '';
        if (isUserLoggedIn()) {
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='my_subscriptions.html'">اشتراكاتي</button>`;
        } else {
            bannerButtonsContainer.innerHTML += `<button onclick="window.location.href='join_us.html'">انضم إلينا</button>`;
        }
    }

    function updateUI() {
        renderSidebarContent();
        renderBannerButtons();
    }

    userIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        sidebar.classList.toggle('show');
        if (sidebar.classList.contains('show')) {
            updateUI();
        }
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('show');
    });

    document.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !userIcon.contains(event.target)) {
            sidebar.classList.remove('show');
        }
    });

    sidebar.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    const animateElements = document.querySelectorAll('.feature-box, .chem-text, .chem-img, .card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    animateElements.forEach(element => {
        observer.observe(element);
    });

    updateUI();
});
