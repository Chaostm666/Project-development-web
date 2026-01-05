// Module d'authentification
const Auth = {
    isAuthenticated: false,

    // Initialiser l'authentification
    init: () => {
        console.log('Initialisation du module d\'authentification...');

        // Vérifier si une session existe déjà
        const session = localStorage.getItem('delivex-session');
        if (session === 'authenticated') {
            Auth.isAuthenticated = true;
            Auth.showApp();
        } else {
            Auth.showLogin();
        }

        // Configurer les écouteurs d'événements
        Auth.setupEventListeners();
    },

    // Configurer les écouteurs d'événements
    setupEventListeners: () => {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', Auth.handleLogin);
        }

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', Auth.handleLogout);
        }
    },

    // Gérer la connexion
    handleLogin: (e) => {
        e.preventDefault();

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMsg = document.getElementById('login-error');

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        // Validation simple (admin/admin par défaut)
        if (username === 'admin' && password === 'admin') {
            console.log('Connexion réussie');
            Auth.isAuthenticated = true;
            localStorage.setItem('delivex-session', 'authenticated');
            errorMsg.style.display = 'none';
            Auth.showApp();

            // Notification de succès
            if (window.Utils) {
                Utils.showNotification('Connexion réussie ! Bienvenue, Administrateur.', 'success');
            }
        } else {
            console.warn('Échec de la connexion');
            errorMsg.style.display = 'flex';

            // Vider le champ mot de passe
            passwordInput.value = '';

            // Animation de secousse (gérée par CSS)
        }
    },

    // Gérer la déconnexion
    handleLogout: () => {
        console.log('Déconnexion de l\'utilisateur...');
        Auth.isAuthenticated = false;
        localStorage.removeItem('delivex-session');

        // Notification de déconnexion
        if (window.Utils) {
            Utils.showNotification('Vous avez été déconnecté.', 'info');
        }

        Auth.showLogin();
    },

    // Afficher l'application principale
    showApp: () => {
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app-container');

        // Load app stylesheets then show app
        Auth.loadAppStyles().then(() => {
            if (authScreen && mainApp) {
                authScreen.style.display = 'none';
                mainApp.style.display = 'flex';

                // Remove login stylesheet to avoid conflicts
                Auth.unloadLoginStyles();

                // S'assurer que le dashboard est chargé (si nécessaire)
                if (window.Navigation && !document.querySelector('.content-section.active')) {
                    Navigation.loadSection('dashboard');
                }
            }
        });
    },

    // Afficher l'écran de connexion
    showLogin: () => {
        const authScreen = document.getElementById('auth-screen');
        const mainApp = document.getElementById('main-app-container');

        // Unload app styles and ensure login stylesheet is present
        Auth.unloadAppStyles();
        Auth.loadLoginStyles();

        if (authScreen && mainApp) {
            authScreen.style.display = 'flex';
            mainApp.style.display = 'none';

            // Réinitialiser les champs
            document.getElementById('username').value = '';
            document.getElementById('password').value = '';
            document.getElementById('login-error').style.display = 'none';
        }
    }
};

// Stylesheet management
Auth.appStyleIds = ['main-css','sidebar-css','dashboard-css','modals-css'];

Auth.appStyles = [
    { id: 'main-css', href: 'main.css' },
    { id: 'sidebar-css', href: 'sidebar.css' },
    { id: 'dashboard-css', href: 'dashboard.css' },
    { id: 'modals-css', href: 'modals.css' }
];

Auth.loadStyle = (spec) => new Promise((resolve) => {
    if (document.getElementById(spec.id)) return resolve();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = spec.href;
    link.id = spec.id;
    link.onload = () => resolve();
    link.onerror = () => resolve();
    document.head.appendChild(link);
});

Auth.loadAppStyles = () => Promise.all(Auth.appStyles.map(s => Auth.loadStyle(s)));

Auth.unloadAppStyles = () => {
    Auth.appStyles.forEach(s => {
        const el = document.getElementById(s.id);
        if (el) el.remove();
    });
};

Auth.loadLoginStyles = () => {
    if (!document.getElementById('login-css')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'login.css';
        link.id = 'login-css';
        document.head.appendChild(link);
    }
};

Auth.unloadLoginStyles = () => {
    const el = document.getElementById('login-css');
    if (el) el.remove();
};
window.Auth = Auth;
