/* =====================================================
   USER MODULE — Authentication & Session Management
   CBSE Component: User Management
   Responsibility: Login, Register, Session, Profile
   Testable Functions: validateEmail, validatePassword, login, register
   ===================================================== */

const UserModule = (function() {
    'use strict';

    const STORAGE_USERS = 'casuarina_users';
    const STORAGE_SESSION = 'casuarina_session';

    /**
     * Validates an email address format.
     * @param {string} email
     * @returns {boolean}
     * UNIT TEST TARGET
     */
    function validateEmail(email) {
        if (!email || typeof email !== 'string') return false;
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email.trim());
    }

    /**
     * Validates password strength.
     * Rules: at least 6 characters, contains a letter and a number.
     * @param {string} password
     * @returns {{valid: boolean, message: string}}
     * UNIT TEST TARGET
     */
    function validatePassword(password) {
        if (!password || typeof password !== 'string') {
            return { valid: false, message: 'Password is required' };
        }
        if (password.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            return { valid: false, message: 'Password must contain letters and numbers' };
        }
        return { valid: true, message: 'OK' };
    }

    /**
     * Retrieves all registered users.
     */
    function getAllUsers() {
        const users = localStorage.getItem(STORAGE_USERS);
        return users ? JSON.parse(users) : [];
    }

    /**
     * Registers a new user.
     * @returns {{success: boolean, message: string, user?: object}}
     * UNIT TEST TARGET
     */
    function register(name, email, password) {
        if (!name || name.trim().length < 2) {
            return { success: false, message: 'Name must be at least 2 characters' };
        }
        if (!validateEmail(email)) {
            return { success: false, message: 'Invalid email format' };
        }
        const pwCheck = validatePassword(password);
        if (!pwCheck.valid) {
            return { success: false, message: pwCheck.message };
        }
        const users = getAllUsers();
        if (users.find(u => u.email === email.toLowerCase())) {
            return { success: false, message: 'Email already registered' };
        }
        const newUser = {
            id: 'USR-' + Date.now(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password, // ⚠️ Plain text for academic demo only — production must hash with bcrypt
            createdAt: new Date().toISOString()
        };
        users.push(newUser);
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        return { success: true, message: 'Registration successful', user: newUser };
    }

    /**
     * Authenticates a user.
     * @returns {{success: boolean, message: string, user?: object}}
     * UNIT TEST TARGET
     */
    function login(email, password) {
        if (!validateEmail(email)) {
            return { success: false, message: 'Invalid email format' };
        }
        if (!password) {
            return { success: false, message: 'Password is required' };
        }
        const users = getAllUsers();
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }
        const session = { id: user.id, name: user.name, email: user.email, loggedInAt: Date.now() };
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
        return { success: true, message: 'Login successful', user: session };
    }

    /**
     * Signs in (or registers if new) a user via Google identity.
     * @param {{email:string, name?:string, picture?:string, sub?:string}} profile
     */
    function loginWithGoogle(profile) {
        if (!profile || !profile.email || !validateEmail(profile.email)) {
            return { success: false, message: 'Invalid Google account' };
        }
        const email = profile.email.toLowerCase().trim();
        const users = getAllUsers();
        let user = users.find(u => u.email === email);
        if (!user) {
            user = {
                id: 'USR-' + Date.now(),
                name: profile.name || email.split('@')[0],
                email: email,
                password: null,
                provider: 'google',
                googleSub: profile.sub || null,
                picture: profile.picture || null,
                createdAt: new Date().toISOString()
            };
            users.push(user);
            localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        } else if (!user.provider) {
            user.provider = 'google';
            user.googleSub = profile.sub || user.googleSub || null;
            user.picture = profile.picture || user.picture || null;
            localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        }
        const session = {
            id: user.id,
            name: user.name,
            email: user.email,
            provider: 'google',
            picture: user.picture || null,
            loggedInAt: Date.now()
        };
        localStorage.setItem(STORAGE_SESSION, JSON.stringify(session));
        return { success: true, message: 'Login successful', user: session };
    }

    function logout() {
        localStorage.removeItem(STORAGE_SESSION);
    }

    function getCurrentUser() {
        const session = localStorage.getItem(STORAGE_SESSION);
        return session ? JSON.parse(session) : null;
    }

    function isLoggedIn() {
        return getCurrentUser() !== null;
    }

    /* Public API */
    return {
        validateEmail,
        validatePassword,
        register,
        login,
        loginWithGoogle,
        logout,
        getCurrentUser,
        isLoggedIn
    };
})();

window.UserModule = UserModule;
