# Hotel Quest — Online Reservation System

**Course:** BCS2073 Software Engineering  
**Project:** Developing and Validating Software System via GitFlow  
**Institution:** Quest International University (QIU)  
**Academic Year:** 2026 / April

---

## 📂 Project Structure (CBSE Architecture)

```
casuarina-hotel/
├── index.html              # Main landing page
├── css/
│   └── style.css           # All styles (design tokens, components, responsive)
├── js/
│   ├── data.js             # Data Layer — Room inventory & constants
│   ├── user-module.js      # CBSE Component: User Management
│   ├── room-module.js      # CBSE Component: Room Search & Display
│   ├── booking-module.js   # CBSE Component: Reservation & Payment
│   └── main.js             # UI Controller / Orchestrator
└── pages/
    ├── rooms.html          # Browse all rooms
    ├── search.html         # Search with filters
    ├── booking.html        # Reservation form + payment
    ├── confirmation.html   # Booking success page
    └── my-bookings.html    # Manage existing bookings
```

---

## 🚀 How to Run

1. Open `index.html` in any modern browser (Chrome, Edge, Firefox).
2. No server or build step needed — pure HTML/CSS/JavaScript.
3. Data is persisted in `localStorage` (simulates database for academic demo).

---

## 🧩 CBSE Components (for Report Section: System Design — 15 marks)

| Component | File | Responsibility | Reusability |
|-----------|------|----------------|-------------|
| **UserModule** | `user-module.js` | Authentication, session, validation | ✅ Pluggable into any system |
| **RoomModule** | `room-module.js` | Room search, filter, availability | ✅ Could feed any frontend |
| **BookingModule** | `booking-module.js` | Reservation CRUD, payment | ✅ Replaceable payment backend |
| **Navigation** | `index.html` (nav) | Reusable across all pages | ✅ Copied to every page |
| **Room Card** | `room-module.js: createRoomCard()` | Reusable UI component | ✅ Used in home/search/rooms |
| **Modal** | `index.html + style.css` | Reusable dialog | ✅ Can host any content |

---

## ♻️ Software Reuse (for Report Section: Software Reuse — 15 marks)

### External Libraries / Frameworks Reused:
1. **Google Fonts API** — Cormorant Garamond + Manrope typography
2. **Unsplash CDN** — Free hotel imagery (no need to host images)
3. **Browser Web Storage API** — `localStorage` / `sessionStorage`
4. **CSS Custom Properties** — Design token system

### Future Reuse Candidates (mention in report):
- **Stripe / iPay88 SDK** — replace `BookingModule.processPayment()` mock
- **Mailgun / SendGrid API** — replace email confirmation simulation
- **Google Calendar API** — sync bookings to user calendar
- **FullCalendar.js library** — interactive availability calendar

### Reuse Benefits (document these in your report):
| Benefit | Explanation |
|---------|-------------|
| Efficiency | Saves ~200+ hours of development by using fonts/images/APIs |
| Maintainability | Modular CBSE structure — change one module without breaking others |
| Cost Reduction | Free CDNs and open APIs eliminate hosting/licensing fees |
| Quality | Battle-tested libraries (Google Fonts, Unsplash) ensure reliability |

---

## 🧪 Testable Functions (for Report Section: Testing — 30 marks)

These functions are **pure / deterministic** — perfect for unit testing:

### user-module.js
- `validateEmail(email)` → boolean
- `validatePassword(password)` → {valid, message}
- `register(name, email, password)` → {success, message, user?}
- `login(email, password)` → {success, message, user?}

### room-module.js
- `getRoomById(roomId)` → Room | null
- `searchRooms(criteria)` → Room[]
- `validateDates(checkIn, checkOut)` → {valid, message, nights?}
- `checkAvailability(roomId, in, out)` → {available, reason}

### booking-module.js
- `calculateTotal(price, nights, guests)` → {subtotal, tax, total}
- `validateBookingData(data)` → {valid, errors}
- `createBooking(data)` → {success, booking?}
- `cancelBooking(id)` → {success, message}
- `processPayment(amount, method, card?)` → {success, transactionId?}

**Recommended test framework:** Jest, Mocha, or simple `console.assert()` based suite.

---

## 🌿 GitFlow Strategy (for Report Section: Implementation — 10 marks)

Suggested branch division for 4-member team:

| Branch | Member Responsible | Module |
|--------|-------------------|--------|
| `feature/user-auth` | Member 1 | `user-module.js` + login UI |
| `feature/room-search` | Member 2 | `room-module.js` + search/rooms pages |
| `feature/booking` | Member 3 | `booking-module.js` + booking/confirmation pages |
| `feature/payment-ui` | Member 4 | Payment UI + my-bookings page |

**Merge flow:**  
`feature/*` → `develop` → `release/v1.0` → `main` (+ tag)

---

## 🔄 DevOps Lifecycle Mapping (for Collaboration section)

| Stage | Activity in This Project |
|-------|--------------------------|
| **Plan** | Requirements analysis based on Casuarina case study |
| **Code** | Modular CBSE implementation in feature branches |
| **Build** | Static asset bundling (no build tool needed for vanilla JS) |
| **Test** | Unit tests on modules; integration tests on booking flow |
| **Release** | Merge to `release/v1.0`; tag `v1.0.0` |
| **Deploy** | Host on GitHub Pages / Netlify (free static hosting) |
| **Operate** | Monitor user feedback; localStorage persistence |
| **Monitor** | Browser console logging; could integrate Sentry |

---

## ⚠️ Notes for Academic Submission

1. **Plaintext passwords** are used here for demo simplicity. In production: use `bcrypt`/`argon2`.
2. **localStorage** simulates a database — replace with MySQL/MongoDB for production.
3. **Payment is mocked** — `processPayment()` always returns success. Integrate Stripe/iPay88 for real use.
4. All API endpoints (email, calendar, etc.) are **simulated** for academic scope.

---

© 2026 Hotel Quest — Academic Project for BCS2073 Software Engineering, QIU.
