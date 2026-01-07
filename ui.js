// Gestion de l'interface utilisateur
const UI = {
    elements: {
        contentSections: document.getElementById('content-sections'),
        modalsContainer: document.getElementById('modals-container'),
        pageTitle: document.querySelector('.page-title h1'),
        pageDescription: document.querySelector('.page-title p')
    },

    templates: {
        statCard: (icon, value, label, type, sectionId) => `
            <div class="card clickable-card" data-section="${sectionId}">
                <div class="card-header">
                    <div>
                        <div class="card-value">${value}</div>
                        <div class="card-label">${label}</div>
                    </div>
                    <div class="card-icon ${type}"><i class="fas fa-${icon}"></i></div>
                </div>
            </div>
        `,

        tableRow: (item, type) => {
            const actions = (id, t) => `
                <td class="action-buttons">
                    <button class="action-btn edit-btn" data-id="${id}" data-type="${t}"><i class="fas fa-edit"></i></button>
                    <button class="action-btn view-btn" data-id="${id}" data-type="${t}"><i class="fas fa-eye"></i></button>
                    <button class="action-btn delete-btn" data-id="${id}" data-type="${t}"><i class="fas fa-trash"></i></button>
                </td>`;

            switch (type) {
                case 'products':
                    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.category}</td><td>${Utils.formatCurrency(item.price)}</td>
                            <td><span class="badge ${item.quantity <= item.minStock ? 'badge-warning' : 'badge-success'}">${item.quantity}</span></td>
                            <td>${item.warehouse}</td>${actions(item.id, 'product')}</tr>`;
                case 'suppliers':
                    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.contact}</td><td>${item.phone}</td><td>${item.email}</td>${actions(item.id, 'supplier')}</tr>`;
                case 'clients':
                    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.phone}</td><td>${item.email}</td><td>${item.orders}</td>${actions(item.id, 'client')}</tr>`;
                case 'orders':
                    const badges = { pending: 'badge-warning', processing: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };
                    const labels = { pending: 'En attente', processing: 'En cours', completed: 'Terminée', cancelled: 'Annulée' };
                    return `<tr><td>#${item.id}</td><td>${item.clientName}</td><td>${Utils.formatDate(item.date)}</td>
                            <td>${item.products.map(p => p.name).join(', ')}</td><td>${Utils.formatCurrency(item.total)}</td>
                            <td><span class="badge ${badges[item.status] || ''}">${labels[item.status] || item.status}</span></td>${actions(item.id, 'order')}</tr>`;
                case 'categories':
                    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.description}</td><td>${item.productCount}</td>${actions(item.id, 'category')}</tr>`;
                case 'warehouses':
                    return `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.manager}</td><td>${item.capacity}</td>
                            <td><span class="badge ${item.currentStock >= item.capacity ? 'badge-danger' : 'badge-success'}">${item.currentStock}/${item.capacity}</span></td>
                            ${actions(item.id, 'warehouse')}</tr>`;
                default: return '';
            }
        }
    },

    init: () => {
        UI.loadSection('dashboard');
        UI.setupGlobalEvents();
        UI.initCommonEvents();
        UI.setupSidebarToggle();
    },

    setupSidebarToggle: () => {
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('#sidebar-toggle'), sidebar = document.querySelector('.sidebar'), navItem = e.target.closest('.nav-item');
            if (toggle) sidebar.classList.toggle('mobile-open');
            else if (navItem || !e.target.closest('.sidebar')) sidebar.classList.remove('mobile-open');
        });
    },

    loadSection: async (sectionId) => {
        try {
            UI.updatePageTitle(sectionId);
            UI.elements.contentSections.innerHTML = UI.generateSectionContent(sectionId);
            const newSection = document.getElementById(sectionId);
            if (newSection) newSection.classList.add('active');
            UI.initSection(sectionId);
            UI.updateActiveNav(sectionId);
        } catch (error) {
            console.error('Error loading section:', error);
            UI.elements.contentSections.innerHTML = '<div class="error-message"><h2>Erreur de chargement</h2></div>';
        }
    },

    generateSectionContent: (sectionId) => {
        if (sectionId === 'dashboard') return UI.generateDashboard();
        const configs = {
            products: { title: 'Produits', type: 'products', search: 'un produit...', head: ['ID', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Entrepôt', 'Actions'] },
            suppliers: { title: 'Fournisseurs', type: 'suppliers', search: 'un fournisseur...', head: ['ID', 'Nom', 'Contact', 'Téléphone', 'Email', 'Actions'] },
            clients: { title: 'Clients', type: 'clients', search: 'un client...', head: ['ID', 'Nom', 'Téléphone', 'Email', 'Commandes', 'Actions'] },
            orders: { title: 'Commandes', type: 'orders', search: 'une commande...', head: ['N°', 'Client', 'Date', 'Produits', 'Total', 'Statut', 'Actions'] },
            categories: { title: 'Catégories', type: 'categories', head: ['ID', 'Nom', 'Description', 'Produits', 'Actions'] },
            warehouses: { title: 'Entrepôts', type: 'warehouses', head: ['ID', 'Nom', 'Gérant', 'Capacité', 'Stock', 'Actions'] }
        };
        return configs[sectionId] ? UI.renderGenericSection(configs[sectionId]) : '<div class="section-not-found">Section non trouvée</div>';
    },

    renderGenericSection: (c) => `
        <section id="${c.type}" class="content-section">
            <div class="table-container">
                <div class="table-header">
                    <h3>${c.title}</h3>
                    <div class="header-actions">
                        ${c.search ? `<div class="search-box"><input type="text" id="${c.type}-search" placeholder="Rechercher ${c.search}" class="form-control"></div>` : ''}
                        <button class="btn btn-primary" id="add-${c.type}-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
                <div class="table-responsive">
                    <table><thead><tr>${c.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
                    <tbody id="${c.type}-table-body">${UI.generateTableRows(c.type)}</tbody></table>
                </div>
            </div>
        </section>`,

    generateDashboard: () => {
        const stats = DataManager.getStats();
        return `
            <section id="dashboard" class="content-section active">
                <div class="dashboard-stats">
                    ${UI.templates.statCard('box', stats.products, 'Produits', 'product', 'products')}
                    ${UI.templates.statCard('truck', stats.suppliers, 'Fournisseurs', 'supplier', 'suppliers')}
                    ${UI.templates.statCard('users', stats.clients, 'Clients', 'client', 'clients')}
                    ${UI.templates.statCard('shopping-cart', stats.orders, 'Commandes', 'order', 'orders')}
                </div>
                <div class="quick-actions">
                    ${[['product', 'plus', 'Nouveau produit'], ['order', 'shopping-cart', 'Nouvelle commande'], ['supplier', 'truck', 'Nouveau fournisseur'], ['client', 'user-plus', 'Nouveau client']]
                .map(([t, i, l]) => `<button class="quick-action-btn" data-action="add-${t}"><i class="fas fa-${i}"></i><span>${l}</span></button>`).join('')}
                </div>
                <div class="charts-section">
                    ${['Stock Distribution', 'Tendances'].map((t, i) => `<div class="card chart-card"><div class="card-header"><h3>${t}</h3></div><div class="chart-container"><canvas id="${i === 0 ? 'stockChart' : 'orderChart'}"></canvas></div></div>`).join('')}
                </div>
                <div class="table-container">
                    <div class="table-header"><h3>Stock Faible</h3><button class="btn btn-warning" id="restock-btn"><i class="fas fa-boxes"></i> Commander</button></div>
                    <div class="table-responsive"><table><thead><tr><th>ID</th><th>Nom</th><th>Stock</th><th>Seuil</th><th>Statut</th><th>Actions</th></tr></thead>
                    <tbody id="low-stock-table-body">${UI.generateLowStockRows()}</tbody></table></div>
                </div>
            </section>`;
    },

    generateLowStockRows: () => DataManager.getAll('products').filter(p => p.quantity <= p.minStock).map(p => {
        const status = p.quantity === 0 ? 'Rupture' : p.quantity < p.minStock / 2 ? 'Critique' : 'Faible';
        return `<tr><td>${p.id}</td><td>${p.name}</td><td>${p.quantity}</td><td>${p.minStock}</td>
                <td><span class="badge ${p.quantity < p.minStock / 2 ? 'badge-danger' : 'badge-warning'}">${status}</span></td>
                <td><button class="btn btn-sm btn-primary restock-product-btn" data-id="${p.id}"><i class="fas fa-boxes"></i></button></td></tr>`;
    }).join('') || '<tr><td colspan="6" class="text-center">Aucun produit en stock faible</td></tr>',

    generateTableRows: (type) => DataManager.getAll(type).map(item => UI.templates.tableRow(item, type)).join('') || `<tr><td colspan="10" class="text-center">Aucun élément trouvé</td></tr>`,

    initSection: (id) => {
        if (id === 'dashboard') {
            UI.initCharts();
            document.querySelectorAll('.restock-product-btn').forEach(b => b.onclick = (e) => UI.handleRestockProduct(parseInt(e.currentTarget.dataset.id)));
            document.querySelectorAll('.quick-action-btn').forEach(b => b.onclick = (e) => Forms.openForm(e.currentTarget.dataset.action.replace('add-', '')));
            document.getElementById('restock-btn').onclick = () => {
                const count = DataManager.getAll('products').filter(p => p.quantity <= p.minStock).length;
                Utils.showNotification(count > 0 ? `Il y a ${count} produits en stock faible.` : 'Tout le stock est bon.', count > 0 ? 'warning' : 'success');
            };
        } else {
            const s = document.getElementById(`${id}-search`);
            if (s) s.oninput = (e) => {
                const fields = { products: ['name', 'category', 'warehouse'], suppliers: ['name', 'contact', 'email'], clients: ['name', 'email', 'phone'], orders: ['clientName', 'status'], categories: ['name'], warehouses: ['name', 'manager'] };
                const items = DataManager.search(id, e.target.value, fields[id] || ['name']);
                document.getElementById(`${id}-table-body`).innerHTML = items.map(p => UI.templates.tableRow(p, id)).join('');
            };
            const map = { products: 'product', suppliers: 'supplier', clients: 'client', orders: 'order', categories: 'category', warehouses: 'warehouse' };
            document.getElementById(`add-${id}-btn`).onclick = () => Forms.openForm(map[id]);
        }
    },

    updateTable: (type) => {
        const body = document.getElementById(`${type}-table-body`);
        if (body) body.innerHTML = UI.generateTableRows(type);
    },

    initCharts: () => {
        const sCtx = document.getElementById('stockChart')?.getContext('2d'), oCtx = document.getElementById('orderChart')?.getContext('2d');
        if (!sCtx || !oCtx) return;
        const products = DataManager.getAll('products'), categories = [...new Set(products.map(p => p.category))];
        const stockData = categories.map(c => products.filter(p => p.category === c).reduce((s, p) => s + p.quantity, 0));
        Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
        new Chart(sCtx, { type: 'doughnut', data: { labels: categories, datasets: [{ data: stockData, backgroundColor: ['#6366f1', '#a855f7', '#ec4899', '#f59e0b', '#10b881'], borderWidth: 0 }] } });
        const last7 = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]; }).reverse();
        new Chart(oCtx, { type: 'line', data: { labels: last7.map(d => Utils.formatDate(d)), datasets: [{ label: 'Commandes', data: last7.map(d => DataManager.getAll('orders').filter(o => o.date === d).length), fill: true, backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: '#6366f1', tension: 0.4 }] } });
    },

    initCommonEvents: () => {
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('.action-btn') || e.target.closest('button[data-action]');
            if (!btn) return;
            const action = btn.classList.contains('edit-btn') ? 'edit' : btn.classList.contains('delete-btn') ? 'delete' : btn.classList.contains('view-btn') ? 'view' : btn.dataset.action;
            const id = parseInt(btn.dataset.id), type = btn.dataset.type || btn.dataset.section;
            if (action === 'edit') Forms.openForm(type, id);
            else if (action === 'delete') UI.handleDelete(type, id);
            else if (action === 'view') UI.handleView(type, id);
            else if (action === 'restock-product') UI.handleRestockProduct(id);
        });
        document.addEventListener('click', (e) => {
            const s = e.target.closest('[data-section]');
            if (s && (e.target.tagName === 'A' || s.classList.contains('clickable-card'))) {
                e.preventDefault();
                Navigation.navigateTo(s.dataset.section);
            }
        });
    },

    handleDelete: async (type, id) => {
        if (await Utils.confirmAction(`Supprimer cet élément ?`)) {
            if (DataManager.delete(type + 's', id)) {
                App.saveData();
                Utils.showNotification('Supprimé avec succès', 'success');
                UI.loadSection(document.querySelector('.content-section.active')?.id);
            }
        }
    },

    handleView: (type, id) => {
        const item = DataManager.getById(type + 's', id);
        if (!item) return;

        let content = '';
        const title = item.name || item.clientName || `#${item.id}`;

        if (type === 'product') {
            content = `
                <div class="details-grid">
                    <div class="detail-item"><label>Prix:</label><span>${Utils.formatCurrency(item.price)}</span></div>
                    <div class="detail-item"><label>Stock:</label><span class="badge ${item.quantity <= item.minStock ? 'badge-warning' : 'badge-success'}">${item.quantity} unités</span></div>
                    <div class="detail-item"><label>Catégorie:</label><span>${item.category}</span></div>
                    <div class="detail-item"><label>Entrepôt:</label><span>${item.warehouse}</span></div>
                    <div class="detail-item full"><label>Description:</label><p>${item.description || 'Aucune description'}</p></div>
                </div>`;
        } else if (type === 'order') {
            content = `
                <div class="details-grid">
                    <div class="detail-item"><label>Client:</label><span>${item.clientName}</span></div>
                    <div class="detail-item"><label>Date:</label><span>${Utils.formatDate(item.date)}</span></div>
                    <div class="detail-item"><label>Total:</label><span class="h3">${Utils.formatCurrency(item.total)}</span></div>
                    <div class="detail-item"><label>Statut:</label><span class="badge badge-info">${item.status}</span></div>
                    <div class="detail-item full">
                        <label>Produits:</label>
                        <div class="details-list">
                            ${item.products.map(p => `<div>${p.name} x${p.quantity} (${Utils.formatCurrency(p.price * p.quantity)})</div>`).join('')}
                        </div>
                    </div>
                </div>`;
        } else {
            content = `<pre style="color:var(--text-main); font-size: 0.8rem; overflow:auto">${JSON.stringify(item, null, 2)}</pre>`;
        }

        const html = `
            <div class="modal active" id="details-modal">
                <div class="modal-content">
                    <div class="modal-header"><h3>Détails: ${title}</h3><button class="close-btn">&times;</button></div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer"><button class="btn btn-primary" onclick="UI.closeModal('details-modal')">Fermer</button></div>
                </div>
            </div>`;
        Forms.openModal(html, 'details-modal');
    },

    closeModal: (id) => document.getElementById(id)?.remove(),

    handleRestockProduct: (id) => Forms.openRestockForm(DataManager.getById('products', id)),
    updatePageTitle: (id) => { UI.elements.pageTitle.textContent = id.charAt(0).toUpperCase() + id.slice(1); },
    updateActiveNav: (id) => { document.querySelectorAll('.nav-item').forEach(i => i.classList.toggle('active', i.dataset.target === id)); },
    setupGlobalEvents: () => { window.onresize = () => UI.handleResize(); },
    handleResize: () => { if (window.innerWidth > 1024) document.querySelector('.sidebar').classList.remove('mobile-open'); }
};