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
    // Override card template on homepage: change "Book Now" to "See Detail"
    // and navigate to the rooms listing page rather than booking directly.
    const originalCreateRoomCard = RoomModule.createRoomCard;
    RoomModule.createRoomCard = function (room) {
        return originalCreateRoomCard(room)
            .replace(/Book Now/g, 'See More')
            .replace(/window\.location\.href='[^']*\?roomId=[^']*'/g, "window.location.href='pages/rooms.html'");
    };
    const rooms = RoomModule.getAllRooms();
    RoomModule.renderRooms('roomsContainer', rooms, 3);

    // ---------- Quick Search Form ----------
    const searchForm = document.getElementById('quickSearchForm');
    if (searchForm) {
        // Format dates in local time to avoid UTC drift when run near midnight.
        const toLocalISO = (d) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        };
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
            const checkInEl = document.getElementById('checkIn');
            const checkOutEl = document.getElementById('checkOut');
            checkInEl.value = toLocalISO(tomorrow);
            checkOutEl.value = toLocalISO(dayAfter);
            checkInEl.dataset.iso = checkInEl.value;
            checkOutEl.dataset.iso = checkOutEl.value;
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

    // Sign-in modal and button handling lives in js/auth-ui.js
});

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
