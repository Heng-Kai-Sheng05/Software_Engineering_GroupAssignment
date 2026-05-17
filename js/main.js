/* =====================================================
   MAIN — Application Orchestrator (Homepage)
   CBSE Component: UI Controller
   Responsibility: Wire up homepage UI events to modules
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ---------- Navbar scroll effect ----------
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    // ---------- Render rooms preview (CBSE: reuse Room Module) ----------
    const rooms = RoomModule.getAllRooms();
    RoomModule.renderRooms('roomsContainer', rooms, 3);

    // ---------- Quick Search Form ----------
    const searchForm = document.getElementById('quickSearchForm');
    if (searchForm) {
        // Set default dates: today + 1 day
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const dayAfter = new Date(today);
        dayAfter.setDate(today.getDate() + 2);

        function persistSearchCriteria() {
            const adults = parseInt(document.getElementById('adults').value, 10) || 1;
            const children = parseInt(document.getElementById('children').value, 10) || 0;
            const checkInEl = document.getElementById('checkIn');
            const checkOutEl = document.getElementById('checkOut');
            sessionStorage.setItem('searchCriteria', JSON.stringify({
                checkIn: checkInEl.dataset.iso || checkInEl.value,
                checkOut: checkOutEl.dataset.iso || checkOutEl.value,
                adults,
                children,
                guests: String(adults + children)
            }));
        }

        const saved = sessionStorage.getItem('searchCriteria');
        if (saved) {
            const criteria = JSON.parse(saved);
            if (criteria.checkIn) document.getElementById('checkIn').value = criteria.checkIn;
            if (criteria.checkOut) document.getElementById('checkOut').value = criteria.checkOut;
            if (criteria.adults != null) document.getElementById('adults').value = criteria.adults;
            if (criteria.children != null) document.getElementById('children').value = criteria.children;
        } else {
            document.getElementById('checkIn').value = tomorrow.toISOString().split('T')[0];
            document.getElementById('checkOut').value = dayAfter.toISOString().split('T')[0];
            persistSearchCriteria();
        }

        ['checkIn', 'checkOut', 'adults', 'children'].forEach(id => {
            document.getElementById(id).addEventListener('change', persistSearchCriteria);
        });

        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            persistSearchCriteria();
            const criteria = JSON.parse(sessionStorage.getItem('searchCriteria'));
            const dateCheck = RoomModule.validateDates(criteria.checkIn, criteria.checkOut);
            if (!dateCheck.valid) {
                showToast(dateCheck.message, 'error');
                return;
            }
            window.location.href = 'pages/rooms.html';
        });
    }

    // ---------- Login Modal ----------
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');
    const loginForm = document.getElementById('loginForm');

    if (loginBtn) {
        // Update button text based on session
        updateAuthUI();

        loginBtn.addEventListener('click', () => {
            if (UserModule.isLoggedIn()) {
                if (confirm('Sign out of your account?')) {
                    UserModule.logout();
                    showToast('Signed out successfully', 'success');
                    updateAuthUI();
                }
            } else {
                loginModal.classList.add('active');
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => loginModal.classList.remove('active'));
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.classList.remove('active');
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const result = UserModule.login(email, password);
            if (result.success) {
                showToast(`Welcome back, ${result.user.name}!`, 'success');
                loginModal.classList.remove('active');
                updateAuthUI();
            } else {
                // If user not found, offer auto-registration
                if (result.message === 'User not found') {
                    const reg = UserModule.register(email.split('@')[0], email, password);
                    if (reg.success) {
                        UserModule.login(email, password);
                        showToast(`Account created — Welcome, ${reg.user.name}!`, 'success');
                        loginModal.classList.remove('active');
                        updateAuthUI();
                        return;
                    }
                }
                showToast(result.message, 'error');
            }
        });
    }

    // ---------- Switch to Register ----------
    const switchToRegister = document.getElementById('switchToRegister');
    if (switchToRegister) {
        switchToRegister.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Just enter any email + password (6+ chars with letters & numbers) to auto-create an account', 'success');
        });
    }
});

/**
 * Updates auth UI based on current session.
 */
function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    if (!loginBtn) return;
    const user = UserModule.getCurrentUser();
    loginBtn.textContent = user ? `Hi, ${user.name.split(' ')[0]}` : 'Sign In';
}

/**
 * Toast notification - reusable UI component.
 */
function showToast(message, type = 'info') {
    // Remove existing
    document.querySelectorAll('.toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

window.showToast = showToast;
window.updateAuthUI = updateAuthUI;
