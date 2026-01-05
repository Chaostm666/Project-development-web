// Application principale
const App = {
    // Initialiser l'application
    init: () => {
        console.log('Initialisation de l\'application de gestion de stock...');

        // Initialiser l'authentification
        if (window.Auth) {
            Auth.init();
        }

        // Initialiser les modules
        App.initModules();

        // Configurer les événements globaux
        App.setupGlobalEvents();

        // Charger les données (si nécessaire)
        App.loadData();

        // Initialiser l'interface
        UI.init();

        // Initialiser la navigation
        Navigation.init();

        console.log('Application prête !');
    },

    // Initialiser les modules
    initModules: () => {
        // Vérifier que tous les modules sont disponibles
        const modules = [DataManager, Utils, UI, Forms, Navigation];
        modules.forEach(module => {
            if (!module) {
                console.error('Module manquant:', module);
                throw new Error('Un module requis est manquant');
            }
        });

        console.log('Tous les modules sont chargés');
    },

    // Configurer les événements globaux
    setupGlobalEvents: () => {
        // Prévenir la fermeture accidentelle avec des données non sauvegardées
        window.addEventListener('beforeunload', (e) => {
            // Vous pourriez vérifier s'il y a des données non sauvegardées ici
            // e.preventDefault();
            // e.returnValue = '';
        });

        // Gestion des erreurs globales
        window.addEventListener('error', (e) => {
            console.error('Erreur globale:', e.error);
            Utils.showNotification('Une erreur est survenue', 'error');
        });

        // Gestion des promesses non attrapées
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesse non attrapée:', e.reason);
            Utils.showNotification('Une erreur asynchrone est survenue', 'error');
        });

        // Raccourcis clavier
        document.addEventListener('keydown', (e) => {
            // Ctrl+S pour sauvegarder
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                App.handleSave();
            }

            // Échap pour fermer les modales
            if (e.key === 'Escape') {
                Forms.closeAllModals();
            }

            // Ctrl+F pour rechercher
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                App.handleSearch();
            }
        });
    },

    // Charger les données
    loadData: () => {
        // Vérifier s'il y a des données sauvegardées dans le localStorage
        const savedData = localStorage.getItem('gestion-stock-data');

        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                // Fusionner avec les données par défaut
                Object.keys(parsedData).forEach(key => {
                    if (appData[key]) {
                        appData[key] = parsedData[key];
                    }
                });
                console.log('Données chargées depuis le localStorage');
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            }
        } else {
            console.log('Utilisation des données par défaut');
        }
    },

    // Sauvegarder les données
    saveData: () => {
        try {
            localStorage.setItem('gestion-stock-data', JSON.stringify(appData));
            console.log('Données sauvegardées dans le localStorage');
            return true;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données:', error);
            return false;
        }
    },

    // Exporter toutes les données
    exportAllData: () => {
        const filename = `gestion-stock-backup-${new Date().toISOString().split('T')[0]}.json`;
        Utils.exportToJSON(appData, filename);
        Utils.showNotification('Sauvegarde complète exportée', 'success');
    },

    // Importer toutes les données
    importAllData: (file) => {
        Utils.confirmAction('Êtes-vous sûr de vouloir remplacer toutes les données ? Cette action est irréversible.')
            .then(confirmed => {
                if (confirmed) {
                    Utils.importFromJSON(file)
                        .then(data => {
                            // Valider la structure des données
                            const requiredKeys = ['products', 'suppliers', 'clients', 'orders', 'categories', 'warehouses'];
                            const isValid = requiredKeys.every(key => Array.isArray(data[key]));

                            if (isValid) {
                                // Remplacer les données
                                Object.keys(data).forEach(key => {
                                    appData[key] = data[key];
                                });

                                // Sauvegarder
                                App.saveData();

                                // Rafraîchir l'interface
                                Navigation.refreshCurrentSection();

                                Utils.showNotification('Toutes les données ont été importées', 'success');
                            } else {
                                Utils.showNotification('Format de données invalide', 'error');
                            }
                        })
                        .catch(error => {
                            Utils.showNotification(`Erreur d'import: ${error.message}`, 'error');
                        });
                }
            });
    },

    // Gérer la sauvegarde
    handleSave: () => {
        if (App.saveData()) {
            Utils.showNotification('Données sauvegardées', 'success');
        } else {
            Utils.showNotification('Erreur lors de la sauvegarde', 'error');
        }
    },

    // Gérer la recherche
    handleSearch: () => {
        const currentSection = Navigation.getCurrentSection();
        const searchInputId = `${currentSection.slice(0, -1)}-search`;
        const searchInput = document.getElementById(searchInputId);

        if (searchInput) {
            searchInput.focus();
            searchInput.select();
        } else {
            // Ouvrir une boîte de dialogue de recherche globale
            App.openGlobalSearch();
        }
    },

    // Ouvrir la recherche globale
    openGlobalSearch: () => {
        const modalContent = `
            <div class="modal active" id="global-search-modal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>Recherche globale</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="text" id="global-search-input" class="form-control" 
                                   placeholder="Rechercher dans tous les éléments...">
                        </div>
                        <div id="global-search-results" class="search-results">
                            <!-- Résultats de recherche -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'global-search-modal');

        // Configurer la recherche
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) {
            searchInput.focus();

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                App.performGlobalSearch(query);
            });
        }
    },

    // Effectuer une recherche globale
    performGlobalSearch: (query) => {
        const resultsContainer = document.getElementById('global-search-results');
        if (!resultsContainer || !query) {
            resultsContainer.innerHTML = '<p class="text-center">Entrez un terme de recherche</p>';
            return;
        }

        // Rechercher dans tous les types de données
        const searchTypes = ['products', 'suppliers', 'clients', 'orders'];
        let allResults = [];

        searchTypes.forEach(type => {
            const results = DataManager.search(type, query, ['name', 'description', 'email', 'phone']);
            results.forEach(item => {
                allResults.push({
                    type: type,
                    item: item,
                    score: App.calculateSearchScore(item, query)
                });
            });
        });

        // Trier par score
        allResults.sort((a, b) => b.score - a.score);

        // Afficher les résultats
        if (allResults.length === 0) {
            resultsContainer.innerHTML = '<p class="text-center">Aucun résultat trouvé</p>';
            return;
        }

        const resultsHtml = allResults.slice(0, 10).map(result => {
            const typeNames = {
                'products': 'Produit',
                'suppliers': 'Fournisseur',
                'clients': 'Client',
                'orders': 'Commande'
            };

            return `
                <div class="search-result-item" data-type="${result.type}" data-id="${result.item.id}">
                    <div class="search-result-type">${typeNames[result.type]}</div>
                    <div class="search-result-title">${result.item.name || result.item.clientName || 'Sans nom'}</div>
                    <div class="search-result-details">
                        ${result.type === 'products' ? `Stock: ${result.item.quantity}` : ''}
                        ${result.type === 'orders' ? `Total: ${Utils.formatCurrency(result.item.total)}` : ''}
                        ${result.type === 'suppliers' || result.type === 'clients' ? `Contact: ${result.item.email}` : ''}
                    </div>
                </div>
            `;
        }).join('');

        resultsContainer.innerHTML = resultsHtml;

        // Configurer les événements de clic sur les résultats
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = parseInt(item.dataset.id);

                // Naviguer vers la section appropriée
                Navigation.navigateTo(type === 'orders' ? 'orders' : `${type}`);

                // Fermer la modale
                Forms.closeModal('global-search-modal');

                // Surligner l'élément (dans une vraie application)
                setTimeout(() => {
                    Utils.showNotification(`Élément #${id} sélectionné`, 'info');
                }, 300);
            });
        });
    },

    // Calculer le score de recherche
    calculateSearchScore: (item, query) => {
        let score = 0;
        const lowerQuery = query.toLowerCase();

        // Rechercher dans différents champs avec des poids différents
        const fields = [
            { field: 'name', weight: 10 },
            { field: 'description', weight: 5 },
            { field: 'email', weight: 3 },
            { field: 'phone', weight: 3 },
            { field: 'clientName', weight: 10 },
            { field: 'category', weight: 7 }
        ];

        fields.forEach(({ field, weight }) => {
            if (item[field] && item[field].toString().toLowerCase().includes(lowerQuery)) {
                score += weight;
            }
        });

        return score;
    },

    // Réinitialiser l'application
    resetApp: () => {
        Utils.confirmAction('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')
            .then(confirmed => {
                if (confirmed) {
                    // Réinitialiser les données
                    Object.keys(appData).forEach(key => {
                        appData[key] = [];
                    });

                    // Supprimer du localStorage
                    localStorage.removeItem('gestion-stock-data');

                    // Recharger l'application
                    location.reload();
                }
            });
    },

    // Obtenir les statistiques de l'application
    getAppStats: () => {
        const stats = DataManager.getStats();

        return {
            ...stats,
            lastSave: localStorage.getItem('gestion-stock-last-save') || 'Jamais',
            appVersion: '1.0.0',
            totalDataSize: JSON.stringify(appData).length
        };
    },

    // Afficher les informations sur l'application
    showAbout: () => {
        const stats = App.getAppStats();

        const modalContent = `
            <div class="modal active" id="about-modal">
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h3>À propos</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="about-content">
                            <h4>Système de Gestion de Stock</h4>
                            <p>Version: ${stats.appVersion}</p>
                            <p>Développé avec HTML, CSS et JavaScript</p>
                            
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value">${stats.products}</div>
                                    <div class="stat-label">Produits</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${stats.suppliers}</div>
                                    <div class="stat-label">Fournisseurs</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${stats.clients}</div>
                                    <div class="stat-label">Clients</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${stats.orders}</div>
                                    <div class="stat-label">Commandes</div>
                                </div>
                            </div>
                            
                            <div class="app-actions">
                                <button class="btn btn-primary" id="export-all-btn">
                                    <i class="fas fa-download"></i> Exporter toutes les données
                                </button>
                                <button class="btn btn-secondary" id="import-all-btn">
                                    <i class="fas fa-upload"></i> Importer des données
                                </button>
                                <button class="btn btn-danger" id="reset-app-btn">
                                    <i class="fas fa-trash"></i> Réinitialiser
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'about-modal');

        // Configurer les boutons
        document.getElementById('export-all-btn')?.addEventListener('click', () => {
            App.exportAllData();
            Forms.closeModal('about-modal');
        });

        document.getElementById('import-all-btn')?.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';

            input.addEventListener('change', (e) => {
                if (e.target.files[0]) {
                    App.importAllData(e.target.files[0]);
                    Forms.closeModal('about-modal');
                }
            });

            input.click();
        });

        document.getElementById('reset-app-btn')?.addEventListener('click', () => {
            Forms.closeModal('about-modal');
            setTimeout(() => {
                App.resetApp();
            }, 300);
        });
    }
};

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', App.init);

// Exposer certaines fonctionnalités globalement pour le débogage
window.App = App;
window.DataManager = DataManager;
window.Utils = Utils;