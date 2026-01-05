// Gestion de la navigation
const Navigation = {
    // Initialiser la navigation
    init: () => {
        // Événements de navigation
        Navigation.setupNavEvents();

        // Gestion de l'historique
        Navigation.setupHistory();

        // Navigation initiale
        const initialSection = Navigation.getCurrentSection() || 'dashboard';
        Navigation.navigateTo(initialSection);
    },

    // Configurer les événements de navigation
    setupNavEvents: () => {
        // Navigation par le menu
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                e.preventDefault();
                const sectionId = navItem.dataset.target;
                if (sectionId) {
                    Navigation.navigateTo(sectionId);
                }
            }
        });

        // Navigation par les boutons et cartes (tout élément avec data-section)
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-section]');
            if (target && !target.closest('.nav-item')) { // Éviter conflit avec .nav-item si présent
                const sectionId = target.dataset.section;
                if (sectionId) {
                    Navigation.navigateTo(sectionId);
                }
            }
        });

        // Navigation par les liens
        document.addEventListener('click', (e) => {
            if (e.target.matches('a[data-section]') || e.target.closest('a[data-section]')) {
                const link = e.target.matches('a[data-section]') ? e.target : e.target.closest('a[data-section]');
                e.preventDefault();
                const sectionId = link.dataset.section;
                if (sectionId) {
                    Navigation.navigateTo(sectionId);
                }
            }
        });
    },

    // Configurer la gestion de l'historique
    setupHistory: () => {
        // Gérer les changements d'URL
        window.addEventListener('popstate', (e) => {
            const sectionId = Navigation.getSectionFromUrl();
            if (sectionId) {
                Navigation.loadSection(sectionId, false);
            }
        });
    },

    // Naviguer vers une section
    navigateTo: (sectionId, updateHistory = true) => {
        // Valider la section
        const validSections = ['dashboard', 'products', 'suppliers', 'clients', 'orders', 'categories', 'warehouses'];
        if (!validSections.includes(sectionId)) {
            sectionId = 'dashboard';
        }

        // Charger la section
        Navigation.loadSection(sectionId);

        // Mettre à jour l'historique
        if (updateHistory) {
            Navigation.updateHistory(sectionId);
        }
    },

    // Charger une section
    loadSection: (sectionId) => {
        // Charger via l'UI
        UI.loadSection(sectionId);

        // Mettre à jour l'URL dans la barre d'adresse (sans recharger la page)
        Navigation.updateUrl(sectionId);
    },

    // Mettre à jour l'historique
    updateHistory: (sectionId) => {
        const state = { section: sectionId };
        const title = Navigation.getSectionTitle(sectionId);
        const url = `#${sectionId}`;

        history.pushState(state, title, url);
    },

    // Mettre à jour l'URL
    updateUrl: (sectionId) => {
        const url = new URL(window.location);
        url.hash = sectionId;
        window.history.replaceState({ section: sectionId }, '', url);
    },

    // Obtenir la section actuelle depuis l'URL
    getCurrentSection: () => {
        return Navigation.getSectionFromUrl() || 'dashboard';
    },

    // Obtenir la section depuis l'URL
    getSectionFromUrl: () => {
        const hash = window.location.hash.replace('#', '');
        const validSections = ['dashboard', 'products', 'suppliers', 'clients', 'orders', 'categories', 'warehouses'];

        if (validSections.includes(hash)) {
            return hash;
        }

        return null;
    },

    // Obtenir le titre d'une section
    getSectionTitle: (sectionId) => {
        const titles = {
            'dashboard': 'Tableau de Bord - Gestion Stock',
            'products': 'Produits - Gestion Stock',
            'suppliers': 'Fournisseurs - Gestion Stock',
            'clients': 'Clients - Gestion Stock',
            'orders': 'Commandes - Gestion Stock',
            'categories': 'Catégories - Gestion Stock',
            'warehouses': 'Entrepôts - Gestion Stock'
        };

        return titles[sectionId] || 'Gestion Stock';
    },

    // Rediriger vers une section avec des paramètres
    redirectToSection: (sectionId, params = {}) => {
        Navigation.navigateTo(sectionId);

        // Traiter les paramètres après un court délai pour laisser le temps au DOM de se charger
        setTimeout(() => {
            Navigation.handleSectionParams(sectionId, params);
        }, 100);
    },

    // Gérer les paramètres de section
    handleSectionParams: (sectionId, params) => {
        switch (sectionId) {
            case 'products':
                if (params.search) {
                    const searchInput = document.getElementById('product-search');
                    if (searchInput) {
                        searchInput.value = params.search;
                        searchInput.dispatchEvent(new Event('input'));
                    }
                }
                break;

            case 'orders':
                if (params.status) {
                    // Filtrer par statut
                    const orders = DataManager.getAll('orders');
                    const filtered = orders.filter(order => order.status === params.status);
                    UI.updateOrdersTable(filtered);
                }
                break;
        }
    },

    // Rafraîchir la section actuelle
    refreshCurrentSection: () => {
        const currentSection = Navigation.getCurrentSection();
        Navigation.navigateTo(currentSection);
    },

    // Exporter les données de la section actuelle
    exportCurrentSection: () => {
        const currentSection = Navigation.getCurrentSection();
        const dataType = currentSection === 'categories' ? 'categories' :
            currentSection === 'warehouses' ? 'warehouses' :
                `${currentSection.slice(0, -1)}s`;

        const data = DataManager.getAll(dataType);
        const filename = `${currentSection}-${new Date().toISOString().split('T')[0]}.json`;

        Utils.exportToJSON(data, filename);
        Utils.showNotification(`Export de ${data.length} éléments terminé`, 'success');
    },

    // Importer des données dans la section actuelle
    importToCurrentSection: (file) => {
        const currentSection = Navigation.getCurrentSection();
        const dataType = currentSection === 'categories' ? 'categories' :
            currentSection === 'warehouses' ? 'warehouses' :
                `${currentSection.slice(0, -1)}s`;

        Utils.importFromJSON(file)
            .then(data => {
                if (Array.isArray(data)) {
                    // Ajouter les données importées
                    data.forEach(item => {
                        // Générer de nouveaux IDs pour éviter les conflits
                        delete item.id;
                        DataManager.add(dataType, item);
                    });

                    Utils.showNotification(`${data.length} éléments importés avec succès`, 'success');
                    Navigation.refreshCurrentSection();
                } else {
                    Utils.showNotification('Format de données invalide', 'error');
                }
            })
            .catch(error => {
                Utils.showNotification(`Erreur d'import: ${error.message}`, 'error');
            });
    }
};