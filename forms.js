// Gestion des formulaires
const Forms = {
    config: {
        product: {
            title: 'Produit', fields: [
                { id: 'name', label: 'Nom', type: 'text', required: true },
                { id: 'category', label: 'Catégorie', type: 'select', options: 'categories', required: true },
                { id: 'price', label: 'Prix (€)', type: 'number', required: true, step: '0.01' },
                { id: 'supplierId', label: 'Fournisseur', type: 'select', options: 'suppliers' },
                { id: 'quantity', label: 'Quantité', type: 'number', required: true },
                { id: 'minStock', label: 'Seuil Min', type: 'number', required: true },
                { id: 'warehouse', label: 'Entrepôt', type: 'select', options: 'warehouses', required: true },
                { id: 'description', label: 'Description', type: 'textarea' }
            ]
        },
        supplier: {
            title: 'Fournisseur', fields: [
                { id: 'name', label: 'Nom', type: 'text', required: true },
                { id: 'contact', label: 'Contact', type: 'text', required: true },
                { id: 'phone', label: 'Téléphone', type: 'tel', required: true },
                { id: 'email', label: 'Email', type: 'email', required: true },
                { id: 'address', label: 'Adresse', type: 'textarea' }
            ]
        },
        client: {
            title: 'Client', fields: [
                { id: 'name', label: 'Nom/Entreprise', type: 'text', required: true },
                { id: 'phone', label: 'Téléphone', type: 'tel', required: true },
                { id: 'email', label: 'Email', type: 'email', required: true },
                { id: 'address', label: 'Adresse', type: 'textarea' }
            ]
        },
        category: {
            title: 'Catégorie', fields: [
                { id: 'name', label: 'Nom', type: 'text', required: true },
                { id: 'description', label: 'Description', type: 'textarea' }
            ]
        },
        warehouse: {
            title: 'Entrepôt', fields: [
                { id: 'name', label: 'Nom', type: 'text', required: true },
                { id: 'manager', label: 'Gérant', type: 'text', required: true },
                { id: 'capacity', label: 'Capacité', type: 'number', required: true },
                { id: 'address', label: 'Adresse', type: 'textarea' }
            ]
        }
    },

    openForm: (type, id = null) => {
        if (type === 'order') return Forms.openOrderForm(id);
        const isEdit = id !== null, config = Forms.config[type], item = isEdit ? DataManager.getById(type + 's', id) : {};
        const html = `
            <div class="modal active" id="form-modal">
                <div class="modal-content">
                    <div class="modal-header"><h3>${isEdit ? 'Modifier' : 'Ajouter'} ${config.title}</h3><button class="close-btn">&times;</button></div>
                    <div class="modal-body"><form id="generic-form">
                        ${config.fields.map(f => `
                            <div class="form-group">
                                <label>${f.label}${f.required ? ' *' : ''}</label>
                                ${f.type === 'select' ? `
                                    <select id="f-${f.id}" class="form-control" ${f.required ? 'required' : ''}>
                                        <option value="">Sélectionner...</option>
                                        ${DataManager.getAll(f.options).map(o => `<option value="${o.id || o.name}" ${item[f.id] == (o.id || o.name) ? 'selected' : ''}>${o.name}</option>`).join('')}
                                    </select>` : f.type === 'textarea' ? `
                                    <textarea id="f-${f.id}" class="form-control" rows="3">${item[f.id] || ''}</textarea>` : `
                                    <input type="${f.type}" id="f-${f.id}" class="form-control" value="${item[f.id] || ''}" ${f.required ? 'required' : ''} ${f.step ? `step="${f.step}"` : ''}>`}
                            </div>`).join('')}
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="Forms.closeModal('form-modal')">Annuler</button>
                            <button type="submit" class="btn btn-primary">${isEdit ? 'Mettre à jour' : 'Créer'}</button>
                        </div>
                    </form></div>
                </div>
            </div>`;
        Forms.openModal(html, 'form-modal');
        document.getElementById('generic-form').onsubmit = (e) => {
            e.preventDefault();
            const data = {};
            config.fields.forEach(f => {
                const val = document.getElementById(`f-${f.id}`).value;
                data[f.id] = f.type === 'number' ? parseFloat(val) : val;
            });
            if (isEdit) DataManager.update(type + 's', id, data);
            else DataManager.add(type + 's', data);
            App.saveData();
            Utils.showNotification('Enregistré avec succès', 'success');
            Forms.closeModal('form-modal');
            UI.loadSection(document.querySelector('.content-section.active')?.id);
        };
    },

    openOrderForm: (id = null) => {
        const isEdit = id !== null, order = isEdit ? DataManager.getById('orders', id) : { products: [] };
        Forms.currentOrderProducts = [...order.products];
        const html = `
            <div class="modal active" id="order-modal">
                <div class="modal-content">
                    <div class="modal-header"><h3>${isEdit ? 'Modifier' : 'Nouvelle'} Commande</h3><button class="close-btn">&times;</button></div>
                    <div class="modal-body"><form id="order-form">
                        <div class="form-row">
                            <div class="form-group"><label>Client *</label>
                                <select id="o-client" class="form-control" required>
                                    <option value="">Sélectionner...</option>
                                    ${DataManager.getAll('clients').map(c => `<option value="${c.id}" ${order.clientId == c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="form-group"><label>Date *</label><input type="date" id="o-date" class="form-control" required value="${order.date || new Date().toISOString().split('T')[0]}"></div>
                        </div>
                        <div class="form-section"><h4>Produits</h4><div id="order-products-list">${Forms.renderOrderProducts()}</div>
                            <div class="form-row">
                                <select id="p-select" class="form-control"><option value="">Ajouter un produit...</option>${DataManager.getAll('products').map(p => `<option value="${p.id}">${p.name} (${Utils.formatCurrency(p.price)})</option>`).join('')}</select>
                                <input type="number" id="p-qty" class="form-control" value="1" min="1" style="width: 80px">
                                <button type="button" class="btn btn-primary" onclick="Forms.addItem()">+</button>
                            </div>
                        </div>
                        <div class="form-group"><label>Statut</label>
                            <select id="o-status" class="form-control">
                                ${['pending', 'processing', 'completed', 'cancelled'].map(s => `<option value="${s}" ${order.status === s ? 'selected' : ''}>${s}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-actions">
                            <div id="o-total" class="h3">Total: ${Utils.formatCurrency(order.total || 0)}</div>
                            <button type="button" class="btn btn-secondary" onclick="Forms.closeModal('order-modal')">Annuler</button>
                            <button type="submit" class="btn btn-primary">Enregistrer</button>
                        </div>
                    </form></div>
                </div>
            </div>`;
        Forms.openModal(html, 'order-modal');
        document.getElementById('order-form').onsubmit = (e) => {
            e.preventDefault();
            if (Forms.currentOrderProducts.length === 0) return Utils.showNotification('Ajoutez des produits!', 'warning');
            const client = DataManager.getById('clients', parseInt(document.getElementById('o-client').value));
            const data = {
                clientId: client.id, clientName: client.name, date: document.getElementById('o-date').value,
                products: Forms.currentOrderProducts, total: Forms.currentOrderProducts.reduce((s, p) => s + (p.price * p.quantity), 0),
                status: document.getElementById('o-status').value
            };
            if (isEdit) DataManager.update('orders', id, data);
            else DataManager.add('orders', data);
            App.saveData();
            Forms.closeModal('order-modal');
            UI.loadSection('orders');
        };
    },

    addItem: () => {
        const id = parseInt(document.getElementById('p-select').value), qty = parseInt(document.getElementById('p-qty').value);
        if (!id) return;
        const p = DataManager.getById('products', id);
        const existing = Forms.currentOrderProducts.find(x => x.id === id);
        if (existing) existing.quantity += qty;
        else Forms.currentOrderProducts.push({ id: p.id, name: p.name, price: p.price, quantity: qty });
        document.getElementById('order-products-list').innerHTML = Forms.renderOrderProducts();
        document.getElementById('o-total').textContent = `Total: ${Utils.formatCurrency(Forms.currentOrderProducts.reduce((s, x) => s + (x.price * x.quantity), 0))}`;
    },

    renderOrderProducts: () => Forms.currentOrderProducts.map((p, i) => `
        <div class="order-product-item">
            <span>${p.name} (x${p.quantity})</span>
            <span>${Utils.formatCurrency(p.price * p.quantity)}</span>
            <button type="button" class="btn btn-sm btn-danger" onclick="Forms.currentOrderProducts.splice(${i}, 1); Forms.updateOrderDisplay();">&times;</button>
        </div>`).join('') || '<p>Aucun produit</p>',

    updateOrderDisplay: () => {
        document.getElementById('order-products-list').innerHTML = Forms.renderOrderProducts();
        document.getElementById('o-total').textContent = `Total: ${Utils.formatCurrency(Forms.currentOrderProducts.reduce((s, x) => s + (x.price * x.quantity), 0))}`;
    },

    openRestockForm: (product) => {
        const html = `
            <div class="modal active" id="restock-modal">
                <div class="modal-content">
                    <div class="modal-header"><h3>Réapprovisionner: ${product.name}</h3><button class="close-btn">&times;</button></div>
                    <div class="modal-body"><form id="restock-form">
                        <div class="form-group"><label>Quantité à commander</label><input type="number" id="r-qty" class="form-control" value="${Math.max(1, product.minStock - product.quantity)}" min="1"></div>
                        <div class="form-actions"><button type="submit" class="btn btn-primary">Commander</button></div>
                    </form></div>
                </div>
            </div>`;
        Forms.openModal(html, 'restock-modal');
        document.getElementById('restock-form').onsubmit = (e) => {
            e.preventDefault();
            DataManager.update('products', product.id, { quantity: product.quantity + parseInt(document.getElementById('r-qty').value) });
            App.saveData();
            Utils.showNotification('Réapprovisionné!', 'success');
            Forms.closeModal('restock-modal');
            UI.loadSection('dashboard');
        };
    },

    openModal: (html, id) => {
        UI.elements.modalsContainer.innerHTML = html;
        const modal = document.getElementById(id);
        modal.querySelector('.close-btn').onclick = () => Forms.closeModal(id);
        modal.onclick = (e) => { if (e.target === modal) Forms.closeModal(id) };
    },

    closeModal: (id) => { const m = document.getElementById(id); if (m) m.remove(); }
};