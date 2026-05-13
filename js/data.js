/* =====================================================
   DATA MODULE — Room Inventory & Constants
   CBSE Component: Data Layer
   Responsibility: Provides static seed data for the system
   ===================================================== */

const ROOMS_DATA = [
    {
        id: 'RM-DLX-001',
        name: 'Deluxe Room',
        type: 'deluxe',
        badge: 'Most Popular',
        description: 'A 28sqm sanctuary featuring contemporary design, plush queen bed, and city views.',
        size: '28 m²',
        capacity: 2,
        bed: 'Queen Bed',
        price: 280,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe'],
        available: 12
    },
    {
        id: 'RM-DLX-002',
        name: 'Deluxe Twin',
        type: 'deluxe',
        description: 'Spacious 30sqm twin room ideal for friends or business associates traveling together.',
        size: '30 m²',
        capacity: 2,
        bed: '2 Single Beds',
        price: 295,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV', 'Air Conditioning', 'Work Desk', 'Coffee Maker'],
        available: 8
    },
    {
        id: 'RM-PRM-001',
        name: 'Premier King',
        type: 'premier',
        badge: 'Best Value',
        description: 'Elevated comfort with a king-size bed, lounge area, and panoramic Meru township views.',
        size: '36 m²',
        capacity: 2,
        bed: 'King Bed',
        price: 380,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV 55"', 'Premium Toiletries', 'Bathtub', 'Lounge Area', 'Mini Bar'],
        available: 6
    },
    {
        id: 'RM-PRM-002',
        name: 'Premier Family',
        type: 'premier',
        description: 'A welcoming retreat for families, featuring two queen beds and ample living space.',
        size: '42 m²',
        capacity: 4,
        bed: '2 Queen Beds',
        price: 460,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV', 'Family Sofa', 'Mini Bar', 'Coffee Maker', 'Child Amenities'],
        available: 4
    },
    {
        id: 'RM-STE-001',
        name: 'Executive Suite',
        type: 'suite',
        badge: 'Luxury',
        description: 'A sophisticated suite featuring a separate living room, premium amenities, and exclusive lounge access.',
        size: '58 m²',
        capacity: 3,
        bed: 'King Bed + Sofa',
        price: 680,
        image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV', 'Living Room', 'Bathtub', 'Premium Bar', 'Lounge Access', 'Butler Service'],
        available: 3
    },
    {
        id: 'RM-STE-002',
        name: 'Casuarina Suite',
        type: 'suite',
        badge: 'Signature',
        description: 'Our signature suite — 75sqm of refined luxury with private balcony and panoramic vistas.',
        size: '75 m²',
        capacity: 4,
        bed: 'King Bed',
        price: 980,
        image: 'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=800&q=85',
        amenities: ['Free Wi-Fi', 'Smart TV 65"', 'Private Balcony', 'Jacuzzi', 'Living & Dining', 'Premium Bar', 'Butler Service'],
        available: 2
    }
];

const SERVICE_TAX_RATE = 0.06; // 6% Malaysian SST
const TOURISM_TAX = 10; // RM10 per night for non-Malaysians (we apply flat for simulation)

/* Export to global scope for non-module usage */
window.ROOMS_DATA = ROOMS_DATA;
window.SERVICE_TAX_RATE = SERVICE_TAX_RATE;
window.TOURISM_TAX = TOURISM_TAX;
