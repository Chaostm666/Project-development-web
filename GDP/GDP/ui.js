// Gestion de l'interface utilisateur
const UI = {
    // Éléments DOM
    elements: {
        contentSections: document.getElementById('content-sections'),
        modalsContainer: document.getElementById('modals-container'),
        pageTitle: document.querySelector('.page-title h1'),
        pageDescription: document.querySelector('.page-title p')
    },

    // Templates
    templates: {
        // Template pour les cartes de statistiques
        statCard: (icon, value, label, type, sectionId) => `
            <div class="card clickable-card" data-section="${sectionId}">
                <div class="card-header">
                    <div>
                        <div class="card-value">${value}</div>
                        <div class="card-label">${label}</div>
                    </div>
                    <div class="card-icon ${type}">
                        <i class="fas fa-${icon}"></i>
                    </div>
                </div>
            </div>
        `,

        // Template pour les lignes de table
        tableRow: (item, type) => {
            switch (type) {
                case 'products':
                    return `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.category}</td>
                            <td>${Utils.formatCurrency(item.price)}</td>
                            <td>
                                <span class="${item.quantity <= item.minStock ? 'badge badge-warning' : 'badge badge-success'}">
                                    ${item.quantity}
                                </span>
                            </td>
                            <td>${item.warehouse}</td>
                            <td class="action-buttons">
                                <button class="action-btn edit-btn" data-id="${item.id}" data-type="product">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" data-id="${item.id}" data-type="product">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="action-btn view-btn" data-id="${item.id}" data-type="product">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;

                case 'suppliers':
                    return `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.contact}</td>
                            <td>${item.phone}</td>
                            <td>${item.email}</td>
                            <td class="action-buttons">
                                <button class="action-btn edit-btn" data-id="${item.id}" data-type="supplier">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" data-id="${item.id}" data-type="supplier">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;

                case 'clients':
                    return `
                        <tr>
                            <td>${item.id}</td>
                            <td>${item.name}</td>
                            <td>${item.phone}</td>
                            <td>${item.email}</td>
                            <td>${item.orders}</td>
                            <td class="action-buttons">
                                <button class="action-btn edit-btn" data-id="${item.id}" data-type="client">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" data-id="${item.id}" data-type="client">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `;

                case 'orders':
                    const statusBadge = {
                        'pending': 'badge-warning',
                        'processing': 'badge-info',
                        'completed': 'badge-success',
                        'cancelled': 'badge-danger'
                    }[item.status] || 'badge-secondary';

                    const statusText = {
                        'pending': 'En attente',
                        'processing': 'En cours',
                        'completed': 'Terminée',
                        'cancelled': 'Annulée'
                    }[item.status] || item.status;

                    return `
                        <tr>
                            <td>#${item.id}</td>
                            <td>${item.clientName}</td>
                            <td>${Utils.formatDate(item.date)}</td>
                            <td>${item.products.map(p => p.name).join(', ')}</td>
                            <td>${Utils.formatCurrency(item.total)}</td>
                            <td><span class="badge ${statusBadge}">${statusText}</span></td>
                            <td class="action-buttons">
                                <button class="action-btn edit-btn" data-id="${item.id}" data-type="order">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="action-btn delete-btn" data-id="${item.id}" data-type="order">
                                    <i class="fas fa-trash"></i>
                                </button>
                                <button class="action-btn view-btn" data-id="${item.id}" data-type="order">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        </tr>
                    `;

                default:
                    return '';
            }
        }
    },

    // Initialiser l'UI
    init: () => {
        // Charger le dashboard par défaut
        UI.loadSection('dashboard');

        // Configurer les événements globaux
        UI.setupGlobalEvents();

        // Gestion du toggle sidebar pour mobile
        UI.setupSidebarToggle();
    },

    // Toggle Sidebar Mobile
    setupSidebarToggle: () => {
        document.addEventListener('click', (e) => {
            const toggle = e.target.closest('#sidebar-toggle');
            const sidebar = document.querySelector('.sidebar');
            const navItem = e.target.closest('.nav-item');

            if (toggle) {
                sidebar.classList.toggle('mobile-open');
            } else if (navItem || !e.target.closest('.sidebar')) {
                sidebar.classList.remove('mobile-open');
            }
        });
    },

    // Charger une section
    loadSection: async (sectionId) => {
        try {
            // Mettre à jour le titre de la page
            UI.updatePageTitle(sectionId);

            // Charger le contenu de la section
            const content = await UI.getSectionContent(sectionId);
            UI.elements.contentSections.innerHTML = content;

            // Activer la section
            const newSection = document.getElementById(sectionId);
            if (newSection) {
                newSection.classList.add('active');
            }

            // Initialiser la section
            UI.initSection(sectionId);

            // Mettre à jour le menu actif
            UI.updateActiveNav(sectionId);

        } catch (error) {
            console.error('Erreur lors du chargement de la section:', error);
            UI.elements.contentSections.innerHTML = `
                <div class="error-message">
                    <h2>Erreur de chargement</h2>
                    <p>Impossible de charger la section demandée.</p>
                </div>
            `;
        }
    },

    // Obtenir le contenu d'une section
    getSectionContent: async (sectionId) => {
        // Pour une vraie application, vous pourriez charger depuis un fichier HTML
        // return fetch(`pages/${sectionId}.html`).then(r => r.text());

        // Pour cette démo, nous générons le contenu dynamiquement
        return UI.generateSectionContent(sectionId);
    },

    // Générer le contenu d'une section
    generateSectionContent: (sectionId) => {
        switch (sectionId) {
            case 'dashboard':
                return UI.generateDashboard();
            case 'products':
                return UI.generateProductsSection();
            case 'suppliers':
                return UI.generateSuppliersSection();
            case 'clients':
                return UI.generateClientsSection();
            case 'orders':
                return UI.generateOrdersSection();
            case 'categories':
                return UI.generateCategoriesSection();
            case 'warehouses':
                return UI.generateWarehousesSection();
            default:
                return '<div class="section-not-found">Section non trouvée</div>';
        }
    },

    // Générer le dashboard
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
                    <button class="quick-action-btn" data-action="add-product">
                        <i class="fas fa-plus"></i>
                        <span>Nouveau produit</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-order">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Nouvelle commande</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-supplier">
                        <i class="fas fa-truck"></i>
                        <span>Nouveau fournisseur</span>
                    </button>
                    <button class="quick-action-btn" data-action="add-client">
                        <i class="fas fa-user-plus"></i>
                        <span>Nouveau client</span>
                    </button>
                </div>

                <div class="charts-section">
                    <div class="card chart-card">
                        <div class="card-header">
                            <h3>Distribution du Stock</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="stockDistributionChart"></canvas>
                        </div>
                    </div>
                    <div class="card chart-card">
                        <div class="card-header">
                            <h3>Tendances des Commandes</h3>
                        </div>
                        <div class="chart-container">
                            <canvas id="orderTrendsChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h3>Produits à faible stock</h3>
                        <button class="btn btn-warning" id="restock-btn">
                            <i class="fas fa-boxes"></i> Commander du stock
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Stock actuel</th>
                                    <th>Seuil minimum</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="low-stock-table-body">
                                ${UI.generateLowStockRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div class="table-container">
                    <div class="table-header">
                        <h3>Commandes récentes</h3>
                        <a href="#" class="btn btn-primary" data-section="orders">
                            <i class="fas fa-list"></i> Voir toutes
                        </a>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Statut</th>
                                </tr>
                            </thead>
                            <tbody id="recent-orders-body">
                                ${UI.generateRecentOrdersRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    // Générer la section produits
    generateProductsSection: () => {
        return `
            <section id="products" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Liste des Produits</h3>
                        <div class="header-actions">
                            <div class="search-box">
                                <input type="text" id="product-search" placeholder="Rechercher un produit..." class="form-control">
                            </div>
                            <button class="btn btn-primary" id="add-product-btn">
                                <i class="fas fa-plus"></i> 
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Catégorie</th>
                                    <th>Prix</th>
                                    <th>Stock</th>
                                    <th>Entrepôt</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="products-table-body">
                                ${UI.generateTableRows('products')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    // Générer les lignes de produits à faible stock
    generateLowStockRows: () => {
        const lowStockProducts = DataManager.getAll('products').filter(p => p.quantity <= p.minStock);

        return lowStockProducts.map(product => {
            const status = product.quantity === 0 ? 'Rupture' :
                product.quantity < product.minStock / 2 ? 'Critique' : 'Faible';
            const badgeClass = product.quantity === 0 ? 'badge-danger' :
                product.quantity < product.minStock / 2 ? 'badge-danger' : 'badge-warning';

            return `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.minStock}</td>
                    <td><span class="badge ${badgeClass}">${status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" data-id="${product.id}" data-action="restock-product">
                            <i class="fas fa-boxes"></i> Réapprovisionner
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="6" class="text-center">Aucun produit en stock faible</td></tr>';
    },

    // Générer les lignes de commandes récentes
    generateRecentOrdersRows: () => {
        const recentOrders = DataManager.getAll('orders')
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        return recentOrders.map(order => {
            const statusBadge = {
                'pending': 'badge-warning',
                'processing': 'badge-info',
                'completed': 'badge-success',
                'cancelled': 'badge-danger'
            }[order.status] || 'badge-secondary';

            const statusText = {
                'pending': 'En attente',
                'processing': 'En cours',
                'completed': 'Terminée',
                'cancelled': 'Annulée'
            }[order.status] || order.status;

            return `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.clientName}</td>
                    <td>${Utils.formatDate(order.date)}</td>
                    <td>${Utils.formatCurrency(order.total)}</td>
                    <td><span class="badge ${statusBadge}">${statusText}</span></td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" class="text-center">Aucune commande récente</td></tr>';
    },

    // Générer les lignes d'un tableau
    generateTableRows: (dataType) => {
        const items = DataManager.getAll(dataType);
        return items.map(item => UI.templates.tableRow(item, dataType)).join('') ||
            `<tr><td colspan="7" class="text-center">Aucun élément trouvé</td></tr>`;
    },

    // Initialiser une section
    initSection: (sectionId) => {
        // Initialiser les événements spécifiques à la section
        switch (sectionId) {
            case 'dashboard':
                UI.initDashboard();
                break;
            case 'products':
                UI.initProductsSection();
                break;
            case 'suppliers':
                UI.initSuppliersSection();
                break;
            case 'clients':
                UI.initClientsSection();
                break;
            case 'orders':
                UI.initOrdersSection();
                break;
        }

        // Initialiser les événements communs
        UI.initCommonEvents();
    },

    // Initialiser le dashboard
    initDashboard: () => {
        // Initialiser les graphiques
        UI.initCharts();

        // Événements des boutons d'action rapide
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                switch (action) {
                    case 'add-product':
                        Forms.openProductForm();
                        break;
                    case 'add-order':
                        Forms.openOrderForm();
                        break;
                    case 'add-supplier':
                        Forms.openSupplierForm();
                        break;
                    case 'add-client':
                        Forms.openClientForm();
                        break;
                }
            });
        });

        // Bouton de réapprovisionnement
        document.getElementById('restock-btn')?.addEventListener('click', () => {
            Utils.showNotification('Fonctionnalité de réapprovisionnement en développement', 'info');
        });
    },

    // Initialiser la section produits
    initProductsSection: () => {
        // Recherche de produits
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const filtered = DataManager.search('products', query, ['name', 'category', 'description']);
                UI.updateProductsTable(filtered);
            });
        }

        // Bouton d'ajout de produit
        document.getElementById('add-product-btn')?.addEventListener('click', () => {
            Forms.openProductForm();
        });
    },

    // Mettre à jour le tableau des produits
    updateProductsTable: (products) => {
        const tbody = document.getElementById('products-table-body');
        if (!tbody) return;

        tbody.innerHTML = products.map(product => UI.templates.tableRow(product, 'products')).join('') ||
            '<tr><td colspan="7" class="text-center">Aucun produit trouvé</td></tr>';
    },

    // Initialiser les graphiques
    initCharts: () => {
        const stockCtx = document.getElementById('stockDistributionChart')?.getContext('2d');
        const orderCtx = document.getElementById('orderTrendsChart')?.getContext('2d');

        if (!stockCtx || !orderCtx) return;

        const products = DataManager.getAll('products');
        const categories = [...new Set(products.map(p => p.category))];
        const stockData = categories.map(cat => {
            return products
                .filter(p => p.category === cat)
                .reduce((sum, p) => sum + p.quantity, 0);
        });

        // Chart.js Default Config for Glassmorphism
        Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
        Chart.defaults.font.family = "'Inter', sans-serif";

        new Chart(stockCtx, {
            type: 'doughnut',
            data: {
                labels: categories,
                datasets: [{
                    data: stockData,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(16, 185, 129, 0.8)'
                    ],
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        const orders = DataManager.getAll('orders');
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        const orderData = last7Days.map(date => {
            return orders.filter(o => o.date === date).length;
        });

        new Chart(orderCtx, {
            type: 'line',
            data: {
                labels: last7Days.map(d => Utils.formatDate(d)),
                datasets: [{
                    label: 'Commandes',
                    data: orderData,
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.2)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    },

    // Générer les autres sections (similaire à products)
    generateSuppliersSection: () => {
        return `
            <section id="suppliers" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Liste des Fournisseurs</h3>
                        <div class="header-actions">
                            <div class="search-box">
                                <input type="text" id="supplier-search" placeholder="Rechercher un fournisseur..." class="form-control">
                            </div>
                            <button class="btn btn-primary" id="add-supplier-btn">
                                <i class="fas fa-plus"></i> 
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Contact</th>
                                    <th>Téléphone</th>
                                    <th>Email</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="suppliers-table-body">
                                ${UI.generateTableRows('suppliers')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    generateClientsSection: () => {
        return `
            <section id="clients" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Liste des Clients</h3>
                        <div class="header-actions">
                            <div class="search-box">
                                <input type="text" id="client-search" placeholder="Rechercher un client..." class="form-control">
                            </div>
                            <button class="btn btn-primary" id="add-client-btn">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Téléphone</th>
                                    <th>Email</th>
                                    <th>Commandes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="clients-table-body">
                                ${UI.generateTableRows('clients')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    generateOrdersSection: () => {
        return `
            <section id="orders" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Commandes d'Achat</h3>
                        <div class="header-actions">
                            <div class="search-box">
                                <input type="text" id="order-search" placeholder="Rechercher une commande..." class="form-control">
                            </div>
                            <button class="btn btn-primary" id="add-order-btn">
                                <i class="fas fa-plus"></i> 
                            </button>
                        </div>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>N° Commande</th>
                                    <th>Client</th>
                                    <th>Date</th>
                                    <th>Produits</th>
                                    <th>Total</th>
                                    <th>Statut</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody id="orders-table-body">
                                ${UI.generateTableRows('orders')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    generateCategoriesSection: () => {
        const categories = DataManager.getAll('categories');

        return `
            <section id="categories" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Catégories de Produits</h3>
                        <button class="btn btn-primary" id="add-category-btn">
                            <i class="fas fa-plus"></i> 
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Description</th>
                                    <th>Produits</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${categories.map(category => `
                                    <tr>
                                        <td>${category.id}</td>
                                        <td>${category.name}</td>
                                        <td>${category.description}</td>
                                        <td>${category.productCount}</td>
                                        <td class="action-buttons">
                                            <button class="action-btn edit-btn" data-id="${category.id}" data-type="category">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="action-btn delete-btn" data-id="${category.id}" data-type="category">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    generateWarehousesSection: () => {
        const warehouses = DataManager.getAll('warehouses');

        return `
            <section id="warehouses" class="content-section">
                <div class="table-container">
                    <div class="table-header">
                        <h3>Entrepôts</h3>
                        <button class="btn btn-primary" id="add-warehouse-btn">
                            <i class="fas fa-plus"></i> 
                        </button>
                    </div>
                    <div class="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nom</th>
                                    <th>Adresse</th>
                                    <th>Capacité</th>
                                    <th>Stock actuel</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${warehouses.map(warehouse => {
            const usagePercentage = ((warehouse.currentStock / warehouse.capacity) * 100).toFixed(1);
            return `
                                        <tr>
                                            <td>${warehouse.id}</td>
                                            <td>${warehouse.name}</td>
                                            <td>${warehouse.address}</td>
                                            <td>${warehouse.capacity}</td>
                                            <td>
                                                <div class="progress-container">
                                                    <div class="progress-bar" style="width: ${usagePercentage}%"></div>
                                                    <span>${warehouse.currentStock} (${usagePercentage}%)</span>
                                                </div>
                                            </td>
                                            <td class="action-buttons">
                                                <button class="action-btn edit-btn" data-id="${warehouse.id}" data-type="warehouse">
                                                    <i class="fas fa-edit"></i>
                                                </button>
                                                <button class="action-btn delete-btn" data-id="${warehouse.id}" data-type="warehouse">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        `;
    },

    // Initialiser les autres sections (similaire à products)
    initSuppliersSection: () => {
        // Recherche de fournisseurs
        const searchInput = document.getElementById('supplier-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const filtered = DataManager.search('suppliers', query, ['name', 'contact', 'email']);
                UI.updateSuppliersTable(filtered);
            });
        }

        // Bouton d'ajout de fournisseur
        document.getElementById('add-supplier-btn')?.addEventListener('click', () => {
            Forms.openSupplierForm();
        });
    },

    initClientsSection: () => {
        // Recherche de clients
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const filtered = DataManager.search('clients', query, ['name', 'email']);
                UI.updateClientsTable(filtered);
            });
        }

        // Bouton d'ajout de client
        document.getElementById('add-client-btn')?.addEventListener('click', () => {
            Forms.openClientForm();
        });
    },

    initOrdersSection: () => {
        // Recherche de commandes
        const searchInput = document.getElementById('order-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value;
                const filtered = DataManager.search('orders', query, ['clientName', 'id']);
                UI.updateOrdersTable(filtered);
            });
        }

        // Bouton d'ajout de commande
        document.getElementById('add-order-btn')?.addEventListener('click', () => {
            Forms.openOrderForm();
        });
    },

    // Mettre à jour les autres tables (similaire à products)
    updateSuppliersTable: (suppliers) => {
        const tbody = document.getElementById('suppliers-table-body');
        if (!tbody) return;

        tbody.innerHTML = suppliers.map(supplier => UI.templates.tableRow(supplier, 'suppliers')).join('') ||
            '<tr><td colspan="6" class="text-center">Aucun fournisseur trouvé</td></tr>';
    },

    updateClientsTable: (clients) => {
        const tbody = document.getElementById('clients-table-body');
        if (!tbody) return;

        tbody.innerHTML = clients.map(client => UI.templates.tableRow(client, 'clients')).join('') ||
            '<tr><td colspan="6" class="text-center">Aucun client trouvé</td></tr>';
    },

    updateOrdersTable: (orders) => {
        const tbody = document.getElementById('orders-table-body');
        if (!tbody) return;

        tbody.innerHTML = orders.map(order => UI.templates.tableRow(order, 'orders')).join('') ||
            '<tr><td colspan="7" class="text-center">Aucune commande trouvée</td></tr>';
    },

    // Initialiser les événements communs
    initCommonEvents: () => {
        // Gestion des boutons d'action dans les tables
        document.addEventListener('click', (e) => {
            const target = e.target.closest('.action-btn') || e.target.closest('button[data-action]');

            if (!target) return;

            const action = target.classList.contains('edit-btn') ? 'edit' :
                target.classList.contains('delete-btn') ? 'delete' :
                    target.classList.contains('view-btn') ? 'view' :
                        target.dataset.action;

            const id = target.dataset.id ? parseInt(target.dataset.id) : null;
            const type = target.dataset.type || target.dataset.section;

            if (!action || !type) return;

            switch (action) {
                case 'edit':
                    Forms.openEditForm(type, id);
                    break;
                case 'delete':
                    UI.handleDelete(type, id);
                    break;
                case 'view':
                    UI.handleView(type, id);
                    break;
                case 'restock-product':
                    UI.handleRestockProduct(id);
                    break;
            }
        });

        // Liens internes
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-section]')) {
                e.preventDefault();
                const sectionId = e.target.dataset.section;
                Navigation.navigateTo(sectionId);
            }
        });
    },

    // Gérer la suppression
    handleDelete: async (type, id) => {
        const typeNames = {
            'product': 'produit',
            'supplier': 'fournisseur',
            'client': 'client',
            'order': 'commande',
            'category': 'catégorie',
            'warehouse': 'entrepôt'
        };

        const typeName = typeNames[type] || 'élément';

        const confirmed = await Utils.confirmAction(`Êtes-vous sûr de vouloir supprimer ce ${typeName} ?`);

        if (confirmed) {
            const deleted = DataManager.delete(type + 's', id);
            if (deleted) {
                App.saveData(); // Persist data
                Utils.showNotification(`${typeName.charAt(0).toUpperCase() + typeName.slice(1)} supprimé avec succès`, 'success');
                // Recharger la section actuelle
                const currentSection = document.querySelector('.content-section.active')?.id;
                if (currentSection) {
                    UI.loadSection(currentSection);
                }
            }
        }
    },

    // Gérer la visualisation
    handleView: (type, id) => {
        // Afficher une modale de détails pour les produits
        if (type === 'product') {
            const product = DataManager.getById('products', id);
            if (!product) {
                Utils.showNotification('Produit introuvable', 'error');
                return;
            }

            const modalContent = `
                <div class="modal active" id="view-product-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${product.name}</h3>
                            <button class="close-btn">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="product-details">
                                <p><strong>Catégorie:</strong> ${product.category || '—'}</p>
                                <p><strong>Prix:</strong> ${Utils.formatCurrency(product.price || 0)}</p>
                                <p><strong>Stock:</strong> ${product.quantity ?? 0}</p>
                                <p><strong>Entrepôt:</strong> ${product.warehouse || '—'}</p>
                                <div class="product-description">
                                    <h4>Description</h4>
                                    <p>${product.description ? Utils.escapeHtml ? Utils.escapeHtml(product.description) : product.description : 'Aucune description fournie.'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            Forms.openModal(modalContent, 'view-product-modal');
            return;
        }

        Utils.showNotification(`Visualisation de ${type} #${id} en développement`, 'info');
    },

    // Gérer le réapprovisionnement
    handleRestockProduct: (id) => {
        const product = DataManager.getById('products', id);
        if (product) {
            Forms.openRestockForm(product);
        }
    },

    // Mettre à jour le titre de la page
    updatePageTitle: (sectionId) => {
        const titles = {
            'dashboard': 'Tableau de Bord',
            'products': 'Produits',
            'suppliers': 'Fournisseurs',
            'clients': 'Clients',
            'orders': 'Commandes',
            'categories': 'Catégories',
            'warehouses': 'Entrepôts'
        };

        const descriptions = {
            'dashboard': 'Gestion de stock et inventaire',
            'products': 'Gestion des produits en stock',
            'suppliers': 'Gestion des fournisseurs',
            'clients': 'Gestion des clients',
            'orders': 'Gestion des commandes d\'achat',
            'categories': 'Gestion des catégories de produits',
            'warehouses': 'Gestion des entrepôts'
        };

        if (UI.elements.pageTitle) {
            UI.elements.pageTitle.textContent = titles[sectionId] || 'Système de Gestion de Stock';
        }

        if (UI.elements.pageDescription) {
            UI.elements.pageDescription.textContent = descriptions[sectionId] || '';
        }
    },

    // Mettre à jour le menu actif
    updateActiveNav: (sectionId) => {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.target === sectionId) {
                item.classList.add('active');
            }
        });
    },

    // Configurer les événements globaux
    setupGlobalEvents: () => {
        // Gestion du responsive
        window.addEventListener('resize', UI.handleResize);

        // Prévenir les actions par défaut
        document.addEventListener('contextmenu', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }
            e.preventDefault();
        });
    },

    // Gérer le redimensionnement
    handleResize: () => {
        // Vous pourriez ajuster des éléments UI en fonction de la taille de l'écran
        console.log('Window resized:', window.innerWidth);
    }
};