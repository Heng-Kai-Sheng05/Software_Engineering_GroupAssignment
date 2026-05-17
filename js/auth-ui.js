/* =====================================================
   AUTH UI — Shared Sign-In Modal & Google Identity
   CBSE Component: Cross-page Auth Controller
   Responsibility: Inject login modal, wire Google Sign-In,
                   keep Sign In button in sync across pages.
   ===================================================== */
(function () {
    'use strict';

    /* -------- Google OAuth Client ID --------
       Replace the placeholder below with your own Web client ID
       generated at https://console.cloud.google.com/apis/credentials
       (APIs & Services > Credentials > Create OAuth client ID > Web application).
       Add your site origin (e.g. http://localhost:5500) to "Authorized JavaScript origins".
       If left as the placeholder, the Google button shows a config notice and
       only email/password sign-in is available. */
    const GOOGLE_CLIENT_ID = '23625563317-bsa0330h53pk5u5sv7enf7glng4gopi3.apps.googleusercontent.com';

    const MODAL_TEMPLATE =
        '<div class="modal" id="authModal" aria-hidden="true">' +
            '<div class="modal-content auth-modal-content">' +
                '<button class="modal-close" id="authModalClose" aria-label="Close">&times;</button>' +
                '<h3>Welcome Back</h3>' +
                '<p class="modal-sub">Sign in to manage your reservations</p>' +
                '<div id="googleSignInBtn" class="google-signin-slot"></div>' +
                '<div id="googleSignInNotice" class="google-notice" style="display:none;"></div>' +
                '<div class="auth-divider"><span>or sign in with email</span></div>' +
                '<form id="authForm" novalidate>' +
                    '<div class="form-group">' +
                        '<label>Gmail Address</label>' +
                        '<input type="email" id="authEmail" required placeholder="you@gmail.com" autocomplete="email">' +
                    '</div>' +
                    '<div class="form-group">' +
                        '<label>Password</label>' +
                        '<input type="password" id="authPassword" required placeholder="At least 6 chars, letters & numbers" autocomplete="current-password">' +
                    '</div>' +
                    '<p id="authError" class="auth-error" style="display:none;"></p>' +
                    '<button type="submit" class="btn-primary btn-full">Sign In</button>' +
                    '<p class="modal-footer">New here? Just enter any Gmail + a password to create an account automatically.</p>' +
                '</form>' +
            '</div>' +
        '</div>';

    function injectModal() {
        if (document.getElementById('authModal')) return;
        const tmp = document.createElement('div');
        tmp.innerHTML = MODAL_TEMPLATE;
        document.body.appendChild(tmp.firstElementChild);
    }

    function parseJwt(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const json = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    }

    let googleScriptPromise = null;
    function loadGoogleScript() {
        if (window.google && window.google.accounts && window.google.accounts.id) {
            return Promise.resolve();
        }
        if (googleScriptPromise) return googleScriptPromise;
        googleScriptPromise = new Promise(function (resolve, reject) {
            const s = document.createElement('script');
            s.src = 'https://accounts.google.com/gsi/client';
            s.async = true;
            s.defer = true;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
        return googleScriptPromise;
    }

    function handleGoogleCredential(response) {
        if (!response || !response.credential) return;
        const data = parseJwt(response.credential);
        if (!data || !data.email) {
            showError('Could not read your Google account information.');
            return;
        }
        const result = UserModule.loginWithGoogle({
            email: data.email,
            name: data.name || data.given_name || data.email.split('@')[0],
            picture: data.picture,
            sub: data.sub
        });
        if (result.success) {
            closeModal();
            updateAuthUI();
            showToast('Welcome, ' + result.user.name + '!');
        } else {
            showError(result.message);
        }
    }

    let googleInitialised = false;
    function setupGoogleButton() {
        const slot = document.getElementById('googleSignInBtn');
        const notice = document.getElementById('googleSignInNotice');
        if (!slot) return;

        if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('YOUR_GOOGLE') === 0) {
            slot.style.display = 'none';
            if (notice) {
                notice.style.display = 'block';
                notice.innerHTML =
                    '<strong>Google Sign-In not configured.</strong> ' +
                    'Set <code>GOOGLE_CLIENT_ID</code> in <code>js/auth-ui.js</code> to enable it.';
            }
            return;
        }

        loadGoogleScript().then(function () {
            if (!window.google || !window.google.accounts || !window.google.accounts.id) return;
            if (!googleInitialised) {
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleGoogleCredential,
                    ux_mode: 'popup',
                    auto_select: false
                });
                googleInitialised = true;
            }
            slot.innerHTML = '';
            slot.style.display = '';
            if (notice) notice.style.display = 'none';
            google.accounts.id.renderButton(slot, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                logo_alignment: 'left',
                width: 320
            });
        }).catch(function () {
            slot.style.display = 'none';
            if (notice) {
                notice.style.display = 'block';
                notice.textContent = 'Could not load Google Sign-In. Please use email + password.';
            }
        });
    }

    function showToast(message, type) {
        type = type || 'success';
        document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
        const toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(function () {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
    }

    function showError(msg) {
        const el = document.getElementById('authError');
        if (!el) { alert(msg); return; }
        el.textContent = msg;
        el.style.display = 'block';
    }

    function openModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        setupGoogleButton();
        setTimeout(function () {
            const emailInp = document.getElementById('authEmail');
            if (emailInp) emailInp.focus();
        }, 50);
    }

    function closeModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        const errEl = document.getElementById('authError');
        if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
        const form = document.getElementById('authForm');
        if (form) form.reset();
    }

    function updateAuthUI() {
        const btn = document.getElementById('loginBtn');
        if (!btn) return;
        const user = UserModule.getCurrentUser();
        if (user) {
            const display = user.email ? user.email.split('@')[0] : (user.name || 'Account');
            btn.textContent = 'Hi, ' + display;
            btn.setAttribute('title', user.email || '');
        } else {
            btn.textContent = 'Sign In';
            btn.removeAttribute('title');
        }
    }

    function handleEmailSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        if (!UserModule.validateEmail(email)) {
            showError('Please enter a valid email address.');
            return;
        }
        let result = UserModule.login(email, password);
        if (!result.success && result.message === 'User not found') {
            const reg = UserModule.register(email.split('@')[0], email, password);
            if (reg.success) {
                result = UserModule.login(email, password);
            } else {
                showError(reg.message);
                return;
            }
        }
        if (result.success) {
            closeModal();
            updateAuthUI();
            showToast('Welcome, ' + result.user.name + '!');
        } else {
            showError(result.message);
        }
    }

    function handleLoginBtnClick() {
        if (UserModule.isLoggedIn()) {
            if (confirm('Sign out of your account?')) {
                UserModule.logout();
                if (window.google && window.google.accounts && window.google.accounts.id) {
                    try { google.accounts.id.disableAutoSelect(); } catch (e) {}
                }
                updateAuthUI();
                showToast('Signed out successfully');
            }
        } else {
            openModal();
        }
    }

    function init() {
        injectModal();
        updateAuthUI();

        const loginBtn = document.getElementById('loginBtn');
        if (loginBtn) loginBtn.addEventListener('click', handleLoginBtnClick);

        const modal = document.getElementById('authModal');
        const closeBtn = document.getElementById('authModalClose');
        const form = document.getElementById('authForm');

        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (modal) modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
        if (form) form.addEventListener('submit', handleEmailSubmit);

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.AuthUI = { update: updateAuthUI, open: openModal, close: closeModal };
})();
