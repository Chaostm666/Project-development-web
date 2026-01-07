const Auth = {
    isAuthenticated: false,
    init: () => {
        const session = localStorage.getItem('gdp_session');
        if (session === 'auth') { Auth.isAuthenticated = true; Auth.showApp(); }
        else Auth.showLogin();
        document.getElementById('login-form').onsubmit = Auth.handleLogin;
        document.getElementById('logout-btn').onclick = Auth.handleLogout;
    },
    handleLogin: (e) => {
        e.preventDefault();
        const u = document.getElementById('username').value, p = document.getElementById('password').value;
        if (u === 'admin' && p === 'admin') {
            Auth.isAuthenticated = true;
            localStorage.setItem('gdp_session', 'auth');
            Auth.showApp();
            Utils.showNotification('Bienvenue!', 'success');
        } else {
            document.getElementById('login-error').style.display = 'flex';
            document.getElementById('password').value = '';
        }
    },
    handleLogout: () => {
        localStorage.removeItem('gdp_session');
        location.reload();
    },
    showApp: () => {
        ['main', 'sidebar', 'dashboard', 'modals'].forEach(s => {
            if (!document.getElementById(s + '-css')) {
                const l = document.createElement('link');
                l.rel = 'stylesheet'; l.href = s + '.css'; l.id = s + '-css';
                document.head.appendChild(l);
            }
        });
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('main-app-container').style.display = 'flex';
        document.querySelectorAll('link[href="login.css"]').forEach(l => l.remove());
        if (window.App) App.start();
    },
    showLogin: () => {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('main-app-container').style.display = 'none';
        if (!document.querySelector('link[href="login.css"]')) {
            const l = document.createElement('link');
            l.rel = 'stylesheet'; l.href = 'login.css';
            document.head.appendChild(l);
        }
    }
};
window.Auth = Auth;
