const Utils = {
    formatDate: (d) => new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'short', day: 'numeric' }),
    formatCurrency: (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n),
    validateEmail: (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
    showNotification: (msg, type = 'info') => {
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.innerHTML = `<span>${msg}</span><button onclick="this.parentElement.remove()">&times;</button>`;
        Object.assign(n.style, { position: 'fixed', top: '20px', right: '20px', padding: '15px', borderRadius: '8px', background: type === 'success' ? '#10b881' : '#f59e0b', color: '#fff', zIndex: 10000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' });
        document.body.appendChild(n);
        setTimeout(() => n.remove(), 3000);
    },
    confirmAction: (msg) => new Promise(res => {
        const m = document.createElement('div');
        m.className = 'modal active';
        m.innerHTML = `<div class="modal-content" style="max-width:400px"><div class="modal-body"><p>${msg}</p><div class="form-actions"><button id="c-no" class="btn btn-secondary">Non</button><button id="c-yes" class="btn btn-primary">Oui</button></div></div></div>`;
        document.getElementById('modals-container').appendChild(m);
        const done = (v) => { m.remove(); res(v); };
        document.getElementById('c-no').onclick = () => done(false);
        document.getElementById('c-yes').onclick = () => done(true);
    })
};