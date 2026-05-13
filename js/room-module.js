/* =====================================================
   ROOM MODULE — Room Search, Display, Availability
   CBSE Component: Room Management
   Responsibility: Render room cards, filter, check availability
   Testable Functions: searchRooms, checkAvailability, getRoomById
   ===================================================== */

const RoomModule = (function() {
    'use strict';

    /**
     * Returns a room by its ID.
     * UNIT TEST TARGET
     */
    function getRoomById(roomId) {
        return ROOMS_DATA.find(r => r.id === roomId) || null;
    }

    /**
     * Searches rooms based on criteria.
     * @param {Object} criteria { roomType, guests, checkIn, checkOut }
     * @returns {Array} filtered rooms
     * UNIT TEST TARGET — core business logic
     */
    function searchRooms(criteria = {}) {
        let results = [...ROOMS_DATA];
        if (criteria.roomType && criteria.roomType !== 'all') {
            results = results.filter(r => r.type === criteria.roomType);
        }
        if (criteria.guests) {
            const guests = parseInt(criteria.guests);
            results = results.filter(r => r.capacity >= guests);
        }
        // Filter only rooms with availability > 0
        results = results.filter(r => r.available > 0);
        return results;
    }

    /**
     * Checks availability for a specific room for given dates.
     * UNIT TEST TARGET
     */
    function checkAvailability(roomId, checkIn, checkOut) {
        const room = getRoomById(roomId);
        if (!room) {
            return { available: false, reason: 'Room not found' };
        }
        if (room.available <= 0) {
            return { available: false, reason: 'No rooms left for this type' };
        }
        const validDates = validateDates(checkIn, checkOut);
        if (!validDates.valid) {
            return { available: false, reason: validDates.message };
        }
        return { available: true, reason: 'Available', nights: validDates.nights };
    }

    /**
     * Validates check-in / check-out dates.
     * UNIT TEST TARGET
     */
    function validateDates(checkIn, checkOut) {
        if (!checkIn || !checkOut) {
            return { valid: false, message: 'Both check-in and check-out dates are required' };
        }
        const ci = new Date(checkIn);
        const co = new Date(checkOut);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (isNaN(ci.getTime()) || isNaN(co.getTime())) {
            return { valid: false, message: 'Invalid date format' };
        }
        if (ci < today) {
            return { valid: false, message: 'Check-in date cannot be in the past' };
        }
        if (co <= ci) {
            return { valid: false, message: 'Check-out must be after check-in' };
        }
        const nights = Math.ceil((co - ci) / (1000 * 60 * 60 * 24));
        if (nights > 30) {
            return { valid: false, message: 'Maximum stay is 30 nights' };
        }
        return { valid: true, message: 'Valid', nights: nights };
    }

    /**
     * Renders a room card (reusable UI component).
     */
    function createRoomCard(room) {
        const badgeHTML = room.badge ? `<span class="room-badge">${room.badge}</span>` : '';
        return `
            <div class="room-card" onclick="window.location.href='pages/booking.html?roomId=${room.id}'">
                <div class="room-image" style="background-image: url('${room.image}')">
                    ${badgeHTML}
                </div>
                <div class="room-info">
                    <h3>${room.name}</h3>
                    <p class="room-desc">${room.description}</p>
                    <div class="room-meta">
                        <span>📐 ${room.size}</span>
                        <span>👤 ${room.capacity} Guests</span>
                        <span>🛏️ ${room.bed}</span>
                    </div>
                    <div class="room-footer">
                        <div class="room-price">
                            <strong>RM ${room.price}</strong>
                            <span>per night</span>
                        </div>
                        <button class="btn-book" onclick="event.stopPropagation(); window.location.href='pages/booking.html?roomId=${room.id}'">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Renders rooms into a container, with optional preview limit.
     */
    function renderRooms(containerId, rooms, limit = null) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const data = limit ? rooms.slice(0, limit) : rooms;
        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <h3>No rooms match your criteria</h3>
                    <p>Try adjusting your search filters.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = data.map(createRoomCard).join('');
    }

    /**
     * Returns all rooms (full inventory).
     */
    function getAllRooms() {
        return [...ROOMS_DATA];
    }

    return {
        getRoomById,
        getAllRooms,
        searchRooms,
        checkAvailability,
        validateDates,
        renderRooms,
        createRoomCard
    };
})();

window.RoomModule = RoomModule;
