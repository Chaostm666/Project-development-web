// Gestion des formulaires
const Forms = {
    // Ouvrir le formulaire de produit
    openProductForm: (productId = null) => {
        const isEdit = productId !== null;
        const product = isEdit ? DataManager.getById('products', productId) : null;

        const modalContent = `
            <div class="modal active" id="product-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier le produit' : 'Ajouter un nouveau produit'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="product-form">
                            <div class="form-section">
                                <h4>Informations de base</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-name">Nom du produit *</label>
                                        <input type="text" id="product-name" class="form-control" required 
                                               value="${product?.name || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="product-category">Catégorie *</label>
                                        <select id="product-category" class="form-control" required>
                                            <option value="">Sélectionner une catégorie</option>
                                            ${Forms.generateCategoryOptions(product?.category)}
                                        </select>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-price">Prix (€) *</label>
                                        <input type="number" id="product-price" class="form-control" 
                                               step="0.01" min="0" required value="${product?.price || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="product-supplier">Fournisseur</label>
                                        <select id="product-supplier" class="form-control">
                                            <option value="">Sélectionner un fournisseur</option>
                                            ${Forms.generateSupplierOptions(product?.supplierId)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Gestion du stock</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-quantity">Quantité en stock *</label>
                                        <input type="number" id="product-quantity" class="form-control" 
                                               min="0" required value="${product?.quantity || '0'}">
                                    </div>
                                    <div class="form-group">
                                        <label for="product-min-stock">Seuil minimum *</label>
                                        <input type="number" id="product-min-stock" class="form-control" 
                                               min="0" required value="${product?.minStock || '0'}">
                                        <small class="form-help">Alerte quand le stock descend en dessous de ce seuil</small>
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="product-warehouse">Entrepôt *</label>
                                        <select id="product-warehouse" class="form-control" required>
                                            <option value="">Sélectionner un entrepôt</option>
                                            ${Forms.generateWarehouseOptions(product?.warehouse)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Description</h4>
                                <div class="form-group">
                                    <label for="product-description">Description du produit</label>
                                    <textarea id="product-description" class="form-control" rows="4">${product?.description || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-product-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer le produit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'product-form-modal');

        // Configurer les événements du formulaire
        const form = document.getElementById('product-form');
        form.addEventListener('submit', (e) => Forms.handleProductSubmit(e, productId));

        // Bouton d'annulation
        document.getElementById('cancel-product-btn')?.addEventListener('click', () => {
            Forms.closeModal('product-form-modal');
        });
    },

    // Ouvrir le formulaire de fournisseur
    openSupplierForm: (supplierId = null) => {
        const isEdit = supplierId !== null;
        const supplier = isEdit ? DataManager.getById('suppliers', supplierId) : null;

        const modalContent = `
            <div class="modal active" id="supplier-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier le fournisseur' : 'Ajouter un nouveau fournisseur'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="supplier-form">
                            <div class="form-section">
                                <h4>Informations de l'entreprise</h4>
                                <div class="form-group">
                                    <label for="supplier-name">Nom du fournisseur *</label>
                                    <input type="text" id="supplier-name" class="form-control" required 
                                           value="${supplier?.name || ''}">
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Contact</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="supplier-contact">Personne de contact *</label>
                                        <input type="text" id="supplier-contact" class="form-control" required 
                                               value="${supplier?.contact || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="supplier-phone">Téléphone *</label>
                                        <input type="tel" id="supplier-phone" class="form-control" required 
                                               value="${supplier?.phone || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="supplier-email">Email *</label>
                                    <input type="email" id="supplier-email" class="form-control" required 
                                           value="${supplier?.email || ''}">
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Adresse</h4>
                                <div class="form-group">
                                    <label for="supplier-address">Adresse complète</label>
                                    <textarea id="supplier-address" class="form-control" rows="3">${supplier?.address || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-supplier-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer le fournisseur'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'supplier-form-modal');

        // Configurer les événements du formulaire
        const form = document.getElementById('supplier-form');
        form.addEventListener('submit', (e) => Forms.handleSupplierSubmit(e, supplierId));

        // Bouton d'annulation
        document.getElementById('cancel-supplier-btn')?.addEventListener('click', () => {
            Forms.closeModal('supplier-form-modal');
        });
    },

    // Ouvrir le formulaire de client
    openClientForm: (clientId = null) => {
        const isEdit = clientId !== null;
        const client = isEdit ? DataManager.getById('clients', clientId) : null;

        const modalContent = `
            <div class="modal active" id="client-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier le client' : 'Ajouter un nouveau client'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="client-form">
                            <div class="form-section">
                                <h4>Informations du client</h4>
                                <div class="form-group">
                                    <label for="client-name">Nom / Entreprise *</label>
                                    <input type="text" id="client-name" class="form-control" required 
                                           value="${client?.name || ''}">
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Coordonnées</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="client-phone">Téléphone *</label>
                                        <input type="tel" id="client-phone" class="form-control" required 
                                               value="${client?.phone || ''}">
                                    </div>
                                    <div class="form-group">
                                        <label for="client-email">Email *</label>
                                        <input type="email" id="client-email" class="form-control" required 
                                               value="${client?.email || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="client-address">Adresse</label>
                                    <textarea id="client-address" class="form-control" rows="3">${client?.address || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-client-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer le client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'client-form-modal');

        // Configurer les événements du formulaire
        const form = document.getElementById('client-form');
        form.addEventListener('submit', (e) => Forms.handleClientSubmit(e, clientId));

        // Bouton d'annulation
        document.getElementById('cancel-client-btn')?.addEventListener('click', () => {
            Forms.closeModal('client-form-modal');
        });
    },

    // Ouvrir le formulaire de commande
    openOrderForm: (orderId = null) => {
        const isEdit = orderId !== null;
        const order = isEdit ? DataManager.getById('orders', orderId) : null;

        const modalContent = `
            <div class="modal active" id="order-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier la commande' : 'Nouvelle commande'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="order-form">
                            <div class="form-section">
                                <h4>Informations de la commande</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="order-client">Client *</label>
                                        <select id="order-client" class="form-control" required>
                                            <option value="">Sélectionner un client</option>
                                            ${Forms.generateClientOptions(order?.clientId)}
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="order-date">Date *</label>
                                        <input type="date" id="order-date" class="form-control" required 
                                               value="${order?.date || new Date().toISOString().split('T')[0]}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Produits de la commande</h4>
                                <div class="order-products-container" id="order-products-container">
                                    ${isEdit ? Forms.generateOrderProducts(order.products) : ''}
                                </div>
                                <div class="form-row">
                                    <div class="form-group" style="flex: 2;">
                                        <label for="product-select">Ajouter un produit</label>
                                        <select id="product-select" class="form-control">
                                            <option value="">Sélectionner un produit</option>
                                            ${Forms.generateProductOptions()}
                                        </select>
                                    </div>
                                    <div class="form-group" style="flex: 1;">
                                        <label for="product-quantity-order">Quantité</label>
                                        <input type="number" id="product-quantity-order" class="form-control" 
                                               min="1" value="1">
                                    </div>
                                    <div class="form-group" style="flex: 1; display: flex; align-items: flex-end;">
                                        <button type="button" class="btn btn-primary" id="add-product-to-order">
                                            <i class="fas fa-plus"></i> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="form-section">
                                <h4>Détails de la commande</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label for="order-status">Statut</label>
                                        <select id="order-status" class="form-control">
                                            <option value="pending" ${order?.status === 'pending' ? 'selected' : ''}>En attente</option>
                                            <option value="processing" ${order?.status === 'processing' ? 'selected' : ''}>En cours</option>
                                            <option value="completed" ${order?.status === 'completed' ? 'selected' : ''}>Terminée</option>
                                            <option value="cancelled" ${order?.status === 'cancelled' ? 'selected' : ''}>Annulée</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label for="order-total-display">Total</label>
                                        <div id="order-total-display" class="form-control" style="background-color: #f8f9fa;">
                                            ${isEdit ? Utils.formatCurrency(order.total) : '0,00 €'}
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="order-notes">Notes</label>
                                    <textarea id="order-notes" class="form-control" rows="3">${order?.notes || ''}</textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-order-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer la commande'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'order-form-modal');

        // Initialiser les produits de commande
        if (isEdit) {
            Forms.currentOrderProducts = order.products.map(p => ({ ...p }));
        } else {
            Forms.currentOrderProducts = [];
        }
        Forms.updateOrderTotal();

        // Configurer les événements du formulaire
        const form = document.getElementById('order-form');
        form.addEventListener('submit', (e) => Forms.handleOrderSubmit(e, orderId));

        // Bouton d'ajout de produit
        document.getElementById('add-product-to-order')?.addEventListener('click', Forms.addProductToOrder);

        // Bouton d'annulation
        document.getElementById('cancel-order-btn')?.addEventListener('click', () => {
            Forms.closeModal('order-form-modal');
        });
    },

    // Ouvrir le formulaire de réapprovisionnement
    openRestockForm: (product) => {
        const modalContent = `
            <div class="modal active" id="restock-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Réapprovisionner le produit</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="restock-form">
                            <div class="form-section">
                                <h4>Produit: ${product.name}</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Stock actuel</label>
                                        <div class="form-control" style="background-color: #f8f9fa;">
                                            ${product.quantity} unités
                                        </div>
                                    </div>
                                    <div class="form-group">
                                        <label>Seuil minimum</label>
                                        <div class="form-control" style="background-color: #f8f9fa;">
                                            ${product.minStock} unités
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="restock-quantity">Quantité à commander *</label>
                                    <input type="number" id="restock-quantity" class="form-control" 
                                           min="1" required value="${Math.max(1, product.minStock - product.quantity)}">
                                    <small class="form-help">Quantité recommandée: ${Math.max(1, product.minStock - product.quantity)} unités</small>
                                </div>
                                <div class="form-group">
                                    <label for="restock-supplier">Fournisseur</label>
                                    <select id="restock-supplier" class="form-control">
                                        <option value="">Sélectionner un fournisseur</option>
                                        ${Forms.generateSupplierOptions(product.supplierId)}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="restock-notes">Notes</label>
                                    <textarea id="restock-notes" class="form-control" rows="3" 
                                              placeholder="Informations supplémentaires sur la commande..."></textarea>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-restock-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    <i class="fas fa-boxes"></i> Commander
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'restock-form-modal');

        // Configurer les événements du formulaire
        const form = document.getElementById('restock-form');
        form.addEventListener('submit', (e) => Forms.handleRestockSubmit(e, product.id));

        // Bouton d'annulation
        document.getElementById('cancel-restock-btn')?.addEventListener('click', () => {
            Forms.closeModal('restock-form-modal');
        });
    },

    // Ouvrir un formulaire d'édition
    openEditForm: (type, id) => {
        switch (type) {
            case 'product':
                Forms.openProductForm(id);
                break;
            case 'supplier':
                Forms.openSupplierForm(id);
                break;
            case 'client':
                Forms.openClientForm(id);
                break;
            case 'order':
                Forms.openOrderForm(id);
                break;
            case 'category':
                Forms.openCategoryForm(id);
                break;
            case 'warehouse':
                Forms.openWarehouseForm(id);
                break;
        }
    },

    // Variables pour la gestion des produits de commande
    currentOrderProducts: [],

    // Ajouter un produit à une commande
    addProductToOrder: () => {
        const productSelect = document.getElementById('product-select');
        const quantityInput = document.getElementById('product-quantity-order');

        const productId = parseInt(productSelect.value);
        const quantity = parseInt(quantityInput.value);

        if (!productId || !quantity || quantity < 1) {
            Utils.showNotification('Veuillez sélectionner un produit et entrer une quantité valide', 'warning');
            return;
        }

        // Récupérer les informations du produit
        const product = DataManager.getById('products', productId);
        if (!product) {
            Utils.showNotification('Produit non trouvé', 'error');
            return;
        }

        // Vérifier si le produit est déjà dans la commande
        const existingIndex = Forms.currentOrderProducts.findIndex(p => p.id === productId);

        if (existingIndex !== -1) {
            // Mettre à jour la quantité
            Forms.currentOrderProducts[existingIndex].quantity += quantity;
        } else {
            // Ajouter le produit
            Forms.currentOrderProducts.push({
                id: productId,
                name: product.name,
                price: product.price,
                quantity: quantity
            });
        }

        // Mettre à jour l'affichage
        Forms.updateOrderProductsDisplay();
        Forms.updateOrderTotal();

        // Réinitialiser les champs
        productSelect.value = '';
        quantityInput.value = '1';
    },

    // Mettre à jour l'affichage des produits de commande
    updateOrderProductsDisplay: () => {
        const container = document.getElementById('order-products-container');
        if (!container) return;

        container.innerHTML = Forms.generateOrderProducts(Forms.currentOrderProducts);

        // Ajouter des événements pour les boutons de suppression
        container.querySelectorAll('.remove-product-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('button').dataset.productId);
                Forms.removeProductFromOrder(productId);
            });
        });
    },

    // Générer l'affichage des produits de commande
    generateOrderProducts: (products) => {
        if (!products || products.length === 0) {
            return '<div class="empty-order">Aucun produit ajouté à la commande</div>';
        }

        return products.map(product => `
            <div class="order-product-item">
                <div class="order-product-info">
                    <strong>${product.name}</strong>
                    <div class="product-details">
                        <span>${Utils.formatCurrency(product.price)} x ${product.quantity} = ${Utils.formatCurrency(product.price * product.quantity)}</span>
                    </div>
                </div>
                <div class="order-product-actions">
                    <button type="button" class="action-btn delete-btn remove-product-btn" data-product-id="${product.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    },

    // Supprimer un produit d'une commande
    removeProductFromOrder: (productId) => {
        const index = Forms.currentOrderProducts.findIndex(p => p.id === productId);
        if (index !== -1) {
            Forms.currentOrderProducts.splice(index, 1);
            Forms.updateOrderProductsDisplay();
            Forms.updateOrderTotal();
        }
    },

    // Mettre à jour le total de la commande
    updateOrderTotal: () => {
        const total = Forms.currentOrderProducts.reduce((sum, product) =>
            sum + (product.price * product.quantity), 0);

        const totalDisplay = document.getElementById('order-total-display');
        if (totalDisplay) {
            totalDisplay.textContent = Utils.formatCurrency(total);
        }
    },

    // Gérer la soumission du formulaire produit
    handleProductSubmit: async (e, productId) => {
        e.preventDefault();

        const form = e.target;
        const isEdit = productId !== null;

        // Validation
        const name = document.getElementById('product-name').value.trim();
        const price = parseFloat(document.getElementById('product-price').value);
        const quantity = parseInt(document.getElementById('product-quantity').value);
        const minStock = parseInt(document.getElementById('product-min-stock').value);

        if (!name || price < 0 || quantity < 0 || minStock < 0) {
            Utils.showNotification('Veuillez remplir tous les champs obligatoires avec des valeurs valides', 'error');
            return;
        }

        // Préparer les données
        const productData = {
            name: name,
            category: document.getElementById('product-category').value,
            price: price,
            quantity: quantity,
            minStock: minStock,
            warehouse: document.getElementById('product-warehouse').value,
            description: document.getElementById('product-description').value.trim(),
            supplierId: document.getElementById('product-supplier').value ?
                parseInt(document.getElementById('product-supplier').value) : null
        };

        try {
            if (isEdit) {
                // Mettre à jour le produit
                DataManager.update('products', productId, productData);
                App.saveData(); // Persist data
                Utils.showNotification('Produit mis à jour avec succès', 'success');
            } else {
                // Ajouter un nouveau produit
                DataManager.add('products', productData);
                App.saveData(); // Persist data
                Utils.showNotification('Produit ajouté avec succès', 'success');
            }

            // Fermer la modale
            Forms.closeModal('product-form-modal');

            // Recharger la section actuelle
            const currentSection = document.querySelector('.content-section.active')?.id;
            if (currentSection) {
                UI.loadSection(currentSection);
            }

        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement du produit', 'error');
            console.error(error);
        }
    },

    // Gérer la soumission du formulaire fournisseur
    handleSupplierSubmit: async (e, supplierId) => {
        e.preventDefault();

        const isEdit = supplierId !== null;

        // Validation
        const name = document.getElementById('supplier-name').value.trim();
        const contact = document.getElementById('supplier-contact').value.trim();
        const phone = document.getElementById('supplier-phone').value.trim();
        const email = document.getElementById('supplier-email').value.trim();

        if (!name || !contact || !phone || !email) {
            Utils.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }

        // Préparer les données
        const supplierData = {
            name: name,
            contact: contact,
            phone: phone,
            email: email,
            address: document.getElementById('supplier-address').value.trim()
        };

        try {
            if (isEdit) {
                // Mettre à jour le fournisseur
                DataManager.update('suppliers', supplierId, supplierData);
                App.saveData(); // Persist data
                Utils.showNotification('Fournisseur mis à jour avec succès', 'success');
            } else {
                // Ajouter un nouveau fournisseur
                DataManager.add('suppliers', supplierData);
                App.saveData(); // Persist data
                Utils.showNotification('Fournisseur ajouté avec succès', 'success');
            }

            // Fermer la modale
            Forms.closeModal('supplier-form-modal');

            // Recharger la section actuelle
            const currentSection = document.querySelector('.content-section.active')?.id;
            if (currentSection) {
                UI.loadSection(currentSection);
            }

        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement du fournisseur', 'error');
            console.error(error);
        }
    },

    // Gérer la soumission du formulaire client
    handleClientSubmit: async (e, clientId) => {
        e.preventDefault();

        const isEdit = clientId !== null;

        // Validation
        const name = document.getElementById('client-name').value.trim();
        const phone = document.getElementById('client-phone').value.trim();
        const email = document.getElementById('client-email').value.trim();

        if (!name || !phone || !email) {
            Utils.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        if (!Utils.validateEmail(email)) {
            Utils.showNotification('Veuillez entrer une adresse email valide', 'error');
            return;
        }

        // Préparer les données
        const clientData = {
            name: name,
            phone: phone,
            email: email,
            address: document.getElementById('client-address').value.trim()
        };

        try {
            if (isEdit) {
                // Mettre à jour le client
                DataManager.update('clients', clientId, clientData);
                App.saveData(); // Persist data
                Utils.showNotification('Client mis à jour avec succès', 'success');
            } else {
                // Ajouter un nouveau client
                DataManager.add('clients', clientData);
                App.saveData(); // Persist data
                Utils.showNotification('Client ajouté avec succès', 'success');
            }

            // Fermer la modale
            Forms.closeModal('client-form-modal');

            // Recharger la section actuelle
            const currentSection = document.querySelector('.content-section.active')?.id;
            if (currentSection) {
                UI.loadSection(currentSection);
            }

        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement du client', 'error');
            console.error(error);
        }
    },

    // Gérer la soumission du formulaire commande
    handleOrderSubmit: async (e, orderId) => {
        e.preventDefault();

        const isEdit = orderId !== null;

        // Validation
        const clientId = document.getElementById('order-client').value;
        const date = document.getElementById('order-date').value;

        if (!clientId || !date) {
            Utils.showNotification('Veuillez sélectionner un client et une date', 'error');
            return;
        }

        if (Forms.currentOrderProducts.length === 0) {
            Utils.showNotification('Veuillez ajouter au moins un produit à la commande', 'error');
            return;
        }

        // Récupérer le nom du client
        const client = DataManager.getById('clients', parseInt(clientId));
        if (!client) {
            Utils.showNotification('Client non trouvé', 'error');
            return;
        }

        // Calculer le total
        const total = Forms.currentOrderProducts.reduce((sum, product) =>
            sum + (product.price * product.quantity), 0);

        // Préparer les données
        const orderData = {
            clientId: parseInt(clientId),
            clientName: client.name,
            date: date,
            products: Forms.currentOrderProducts.map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity
            })),
            total: total,
            status: document.getElementById('order-status').value,
            notes: document.getElementById('order-notes').value.trim()
        };

        try {
            if (isEdit) {
                // Mettre à jour la commande
                DataManager.update('orders', orderId, orderData);
                App.saveData(); // Persist data
                Utils.showNotification('Commande mise à jour avec succès', 'success');
            } else {
                // Ajouter une nouvelle commande
                DataManager.add('orders', orderData);

                // Mettre à jour le nombre de commandes du client
                const client = DataManager.getById('clients', orderData.clientId);
                if (client) {
                    DataManager.update('clients', client.id, {
                        orders: (client.orders || 0) + 1,
                        totalSpent: (client.totalSpent || 0) + orderData.total
                    });
                }

                App.saveData(); // Persist data
                Utils.showNotification('Commande créée avec succès', 'success');
            }

            // Fermer la modale
            Forms.closeModal('order-form-modal');

            // Réinitialiser les produits de commande
            Forms.currentOrderProducts = [];

            // Recharger la section actuelle
            const currentSection = document.querySelector('.content-section.active')?.id;
            if (currentSection) {
                UI.loadSection(currentSection);
            }

        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement de la commande', 'error');
            console.error(error);
        }
    },

    // Gérer la soumission du formulaire de réapprovisionnement
    handleRestockSubmit: async (e, productId) => {
        e.preventDefault();

        const quantity = parseInt(document.getElementById('restock-quantity').value);
        const supplierId = document.getElementById('restock-supplier').value;
        const notes = document.getElementById('restock-notes').value.trim();

        if (!quantity || quantity < 1) {
            Utils.showNotification('Veuillez entrer une quantité valide', 'error');
            return;
        }

        // Mettre à jour le stock du produit
        const product = DataManager.getById('products', productId);
        if (product) {
            const newQuantity = product.quantity + quantity;
            DataManager.update('products', productId, { quantity: newQuantity });
            App.saveData(); // Persist data

            Utils.showNotification(`Stock mis à jour: ${newQuantity} unités disponibles`, 'success');

            // Ici, vous pourriez créer une commande d'approvisionnement
            if (supplierId) {
                console.log('Créer une commande d\'approvisionnement pour le fournisseur:', supplierId);
            }
        }

        // Fermer la modale
        Forms.closeModal('restock-form-modal');

        // Recharger la section actuelle
        const currentSection = document.querySelector('.content-section.active')?.id;
        if (currentSection) {
            UI.loadSection(currentSection);
        }
    },

    // Générer les options pour les sélecteurs
    generateCategoryOptions: (selectedValue = '') => {
        const categories = DataManager.getAll('categories');
        return categories.map(category => `
            <option value="${category.name}" ${category.name === selectedValue ? 'selected' : ''}>
                ${category.name}
            </option>
        `).join('');
    },

    generateSupplierOptions: (selectedId = null) => {
        const suppliers = DataManager.getAll('suppliers');
        return suppliers.map(supplier => `
            <option value="${supplier.id}" ${supplier.id === selectedId ? 'selected' : ''}>
                ${supplier.name}
            </option>
        `).join('');
    },

    generateWarehouseOptions: (selectedValue = '') => {
        const warehouses = DataManager.getAll('warehouses');
        return warehouses.map(warehouse => `
            <option value="${warehouse.name}" ${warehouse.name === selectedValue ? 'selected' : ''}>
                ${warehouse.name}
            </option>
        `).join('');
    },

    generateClientOptions: (selectedId = null) => {
        const clients = DataManager.getAll('clients');
        return clients.map(client => `
            <option value="${client.id}" ${client.id === selectedId ? 'selected' : ''}>
                ${client.name}
            </option>
        `).join('');
    },

    generateProductOptions: () => {
        const products = DataManager.getAll('products');
        return products.map(product => `
            <option value="${product.id}">
                ${product.name} (${Utils.formatCurrency(product.price)})
            </option>
        `).join('');
    },

    // Ouvrir le formulaire de catégorie
    openCategoryForm: (categoryId = null) => {
        const isEdit = categoryId !== null;
        const category = isEdit ? DataManager.getById('categories', categoryId) : null;

        const modalContent = `
            <div class="modal active" id="category-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="category-form">
                            <div class="form-group">
                                <label for="category-name">Nom de la catégorie *</label>
                                <input type="text" id="category-name" class="form-control" required 
                                       value="${category?.name || ''}">
                            </div>
                            <div class="form-group">
                                <label for="category-description">Description</label>
                                <textarea id="category-description" class="form-control" rows="3">${category?.description || ''}</textarea>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-category-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer la catégorie'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'category-form-modal');

        const form = document.getElementById('category-form');
        form.addEventListener('submit', (e) => Forms.handleCategorySubmit(e, categoryId));

        document.getElementById('cancel-category-btn')?.addEventListener('click', () => {
            Forms.closeModal('category-form-modal');
        });
    },

    // Gérer la soumission du formulaire catégorie
    handleCategorySubmit: async (e, categoryId) => {
        e.preventDefault();
        const isEdit = categoryId !== null;
        const name = document.getElementById('category-name').value.trim();
        const description = document.getElementById('category-description').value.trim();

        if (!name) {
            Utils.showNotification('Le nom de la catégorie est obligatoire', 'error');
            return;
        }

        const categoryData = { name, description };

        try {
            if (isEdit) {
                DataManager.update('categories', categoryId, categoryData);
                Utils.showNotification('Catégorie mise à jour', 'success');
            } else {
                categoryData.productCount = 0;
                DataManager.add('categories', categoryData);
                Utils.showNotification('Catégorie créée', 'success');
            }
            App.saveData();
            Forms.closeModal('category-form-modal');
            UI.loadSection('categories');
        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    },

    // Ouvrir le formulaire d'entrepôt
    openWarehouseForm: (warehouseId = null) => {
        const isEdit = warehouseId !== null;
        const warehouse = isEdit ? DataManager.getById('warehouses', warehouseId) : null;

        const modalContent = `
            <div class="modal active" id="warehouse-form-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${isEdit ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="warehouse-form">
                            <div class="form-group">
                                <label for="warehouse-name">Nom de l'entrepôt *</label>
                                <input type="text" id="warehouse-name" class="form-control" required 
                                       value="${warehouse?.name || ''}">
                            </div>
                            <div class="form-group">
                                <label for="warehouse-address">Adresse</label>
                                <input type="text" id="warehouse-address" class="form-control" 
                                       value="${warehouse?.address || ''}">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="warehouse-capacity">Capacité totale *</label>
                                    <input type="number" id="warehouse-capacity" class="form-control" required 
                                           min="1" value="${warehouse?.capacity || ''}">
                                </div>
                                <div class="form-group">
                                    <label for="warehouse-manager">Gestionnaire</label>
                                    <input type="text" id="warehouse-manager" class="form-control" 
                                           value="${warehouse?.manager || ''}">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn btn-secondary" id="cancel-warehouse-btn">Annuler</button>
                                <button type="submit" class="btn btn-primary">
                                    ${isEdit ? 'Mettre à jour' : 'Créer l\'entrepôt'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        Forms.openModal(modalContent, 'warehouse-form-modal');

        const form = document.getElementById('warehouse-form');
        form.addEventListener('submit', (e) => Forms.handleWarehouseSubmit(e, warehouseId));

        document.getElementById('cancel-warehouse-btn')?.addEventListener('click', () => {
            Forms.closeModal('warehouse-form-modal');
        });
    },

    // Gérer la soumission du formulaire entrepôt
    handleWarehouseSubmit: async (e, warehouseId) => {
        e.preventDefault();
        const isEdit = warehouseId !== null;
        const name = document.getElementById('warehouse-name').value.trim();
        const address = document.getElementById('warehouse-address').value.trim();
        const capacity = parseInt(document.getElementById('warehouse-capacity').value);
        const manager = document.getElementById('warehouse-manager').value.trim();

        if (!name || isNaN(capacity)) {
            Utils.showNotification('Veuillez remplir les champs obligatoires', 'error');
            return;
        }

        const warehouseData = { name, address, capacity, manager };

        try {
            if (isEdit) {
                DataManager.update('warehouses', warehouseId, warehouseData);
                Utils.showNotification('Entrepôt mis à jour', 'success');
            } else {
                warehouseData.currentStock = 0;
                DataManager.add('warehouses', warehouseData);
                Utils.showNotification('Entrepôt créé', 'success');
            }
            App.saveData();
            Forms.closeModal('warehouse-form-modal');
            UI.loadSection('warehouses');
        } catch (error) {
            Utils.showNotification('Erreur lors de l\'enregistrement', 'error');
        }
    },

    // Ouvrir une modale
    openModal: (content, modalId) => {
        // Fermer toute modale existante
        Forms.closeAllModals();

        // Ajouter la nouvelle modale
        const modalsContainer = document.getElementById('modals-container');
        if (modalsContainer) {
            modalsContainer.innerHTML = content;
        } else {
            // Créer le conteneur s'il n'existe pas
            const container = document.createElement('div');
            container.id = 'modals-container';
            container.innerHTML = content;
            document.body.appendChild(container);
        }

        // Configurer le bouton de fermeture
        const modal = document.getElementById(modalId);
        if (modal) {
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    Forms.closeModal(modalId);
                });
            }

            // Fermer en cliquant à l'extérieur
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    Forms.closeModal(modalId);
                }
            });
        }
    },

    // Fermer une modale
    closeModal: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }

        // Nettoyer les produits de commande
        if (modalId === 'order-form-modal') {
            Forms.currentOrderProducts = [];
        }
    },

    // Fermer toutes les modales
    closeAllModals: () => {
        const modalsContainer = document.getElementById('modals-container');
        if (modalsContainer) {
            modalsContainer.innerHTML = '';
        }
        Forms.currentOrderProducts = [];
    }
};