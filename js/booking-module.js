/* =====================================================
   BOOKING MODULE — Reservation Management
   CBSE Component: Booking & Payment
   Responsibility: Create, modify, cancel bookings; payment simulation
   Testable Functions: calculateTotal, createBooking, cancelBooking, processPayment
   ===================================================== */

const BookingModule = (function() {
    'use strict';

    const STORAGE_KEY = 'casuarina_bookings';

    /**
     * Generates a unique booking ID.
     */
    function generateBookingId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `BK-${random}-${timestamp}`;
    }

    /**
     * Calculates the total price for a booking.
     * UNIT TEST TARGET — pricing logic is critical
     * @returns {{subtotal, tax, tourismTax, total, nights}}
     */
    function calculateTotal(roomPrice, nights, guests = 1) {
        if (typeof roomPrice !== 'number' || roomPrice <= 0) {
            return { error: 'Invalid room price' };
        }
        if (typeof nights !== 'number' || nights <= 0) {
            return { error: 'Invalid number of nights' };
        }
        const subtotal = roomPrice * nights;
        const tax = +(subtotal * SERVICE_TAX_RATE).toFixed(2);
        const tourismTax = TOURISM_TAX * nights;
        const total = +(subtotal + tax + tourismTax).toFixed(2);
        return {
            subtotal: +subtotal.toFixed(2),
            tax: tax,
            tourismTax: tourismTax,
            total: total,
            nights: nights
        };
    }

    /**
     * Retrieves all bookings from storage.
     */
    function getAllBookings() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    /**
     * Returns bookings for a specific user.
     */
    function getUserBookings(userId) {
        if (!userId) return [];
        return getAllBookings().filter(b => b.userId === userId);
    }

    /**
     * Validates booking input data.
     * UNIT TEST TARGET
     */
    function validateBookingData(data) {
        const errors = [];
        if (!data.roomId) errors.push('Room ID is required');
        if (!data.checkIn) errors.push('Check-in date is required');
        if (!data.checkOut) errors.push('Check-out date is required');
        if (!data.guestName || data.guestName.trim().length < 2) errors.push('Guest name is required');
        if (!data.guestEmail || !UserModule.validateEmail(data.guestEmail)) errors.push('Valid email is required');
        if (!data.guestPhone || data.guestPhone.length < 8) errors.push('Valid phone number is required');
        const dateCheck = RoomModule.validateDates(data.checkIn, data.checkOut);
        if (!dateCheck.valid) errors.push(dateCheck.message);
        return { valid: errors.length === 0, errors };
    }

    /**
     * Creates a new booking after validation.
     * UNIT TEST TARGET — core flow
     * @returns {{success: boolean, message, booking?}}
     */
    function createBooking(bookingData) {
        const validation = validateBookingData(bookingData);
        if (!validation.valid) {
            return { success: false, message: validation.errors.join('; ') };
        }
        const room = RoomModule.getRoomById(bookingData.roomId);
        if (!room) {
            return { success: false, message: 'Room not found' };
        }
        const availability = RoomModule.checkAvailability(
            bookingData.roomId,
            bookingData.checkIn,
            bookingData.checkOut
        );
        if (!availability.available) {
            return { success: false, message: availability.reason };
        }
        const pricing = calculateTotal(room.price, availability.nights, bookingData.guests || 1);
        if (pricing.error) {
            return { success: false, message: pricing.error };
        }
        const booking = {
            id: generateBookingId(),
            userId: bookingData.userId || 'GUEST',
            roomId: room.id,
            roomName: room.name,
            roomImage: room.image,
            checkIn: bookingData.checkIn,
            checkOut: bookingData.checkOut,
            nights: pricing.nights,
            guests: bookingData.guests || 1,
            adults: bookingData.adults ?? bookingData.guests ?? 1,
            children: bookingData.children ?? 0,
            guestName: bookingData.guestName.trim(),
            guestEmail: bookingData.guestEmail.toLowerCase().trim(),
            guestPhone: bookingData.guestPhone.trim(),
            specialRequests: bookingData.specialRequests || '',
            paymentMethod: bookingData.paymentMethod || 'credit_card',
            pricing: pricing,
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        const all = getAllBookings();
        all.push(booking);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return { success: true, message: 'Booking confirmed', booking: booking };
    }

    /**
     * Cancels an existing booking.
     * UNIT TEST TARGET
     */
    function cancelBooking(bookingId) {
        const all = getAllBookings();
        const index = all.findIndex(b => b.id === bookingId);
        if (index === -1) {
            return { success: false, message: 'Booking not found' };
        }
        if (all[index].status === 'cancelled') {
            return { success: false, message: 'Booking already cancelled' };
        }
        all[index].status = 'cancelled';
        all[index].cancelledAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return { success: true, message: 'Booking cancelled successfully', booking: all[index] };
    }

    /**
     * Modifies dates for an existing booking.
     */
    function modifyBooking(bookingId, newCheckIn, newCheckOut) {
        const all = getAllBookings();
        const index = all.findIndex(b => b.id === bookingId);
        if (index === -1) {
            return { success: false, message: 'Booking not found' };
        }
        if (all[index].status === 'cancelled') {
            return { success: false, message: 'Cannot modify a cancelled booking' };
        }
        const dateCheck = RoomModule.validateDates(newCheckIn, newCheckOut);
        if (!dateCheck.valid) {
            return { success: false, message: dateCheck.message };
        }
        const room = RoomModule.getRoomById(all[index].roomId);
        const pricing = calculateTotal(room.price, dateCheck.nights);
        all[index].checkIn = newCheckIn;
        all[index].checkOut = newCheckOut;
        all[index].nights = dateCheck.nights;
        all[index].pricing = pricing;
        all[index].modifiedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        return { success: true, message: 'Booking modified', booking: all[index] };
    }

    /**
     * Retrieves a single booking.
     */
    function getBookingById(bookingId) {
        return getAllBookings().find(b => b.id === bookingId) || null;
    }

    /**
     * Processes a (simulated) payment. In production, this would integrate with
     * a real payment gateway like Stripe / PayPal / iPay88.
     * UNIT TEST TARGET
     */
    function processPayment(amount, method, cardNumber = null) {
        if (typeof amount !== 'number' || amount <= 0) {
            return { success: false, message: 'Invalid amount' };
        }
        const validMethods = ['credit_card', 'fpx', 'ewallet'];
        if (!validMethods.includes(method)) {
            return { success: false, message: 'Invalid payment method' };
        }
        if (method === 'credit_card') {
            if (!cardNumber || cardNumber.replace(/\s/g, '').length < 13) {
                return { success: false, message: 'Invalid card number' };
            }
        }
        // Simulate processing - always succeeds in demo
        return {
            success: true,
            message: 'Payment processed successfully',
            transactionId: 'TXN-' + Date.now(),
            amount: amount,
            method: method,
            timestamp: new Date().toISOString()
        };
    }

    return {
        calculateTotal,
        validateBookingData,
        createBooking,
        cancelBooking,
        modifyBooking,
        getBookingById,
        getUserBookings,
        getAllBookings,
        processPayment,
        generateBookingId
    };
})();

window.BookingModule = BookingModule;
