const DataManager = {
    data: JSON.parse(localStorage.getItem('gdp_data')) || {
        products: [{ id: 1, name: "Ordinateur Portable", category: "Électronique", price: 799.99, quantity: 15, minStock: 10, warehouse: "Entrepôt Central", description: "Ordinateur portable 15 pouces", supplierId: 1, createdAt: "2023-10-01" }],
        suppliers: [{ id: 1, name: "TechSolutions", contact: "Jean Dupont", phone: "01 23 45 67 89", email: "contact@techsolutions.com", address: "123 Rue de Paris" }],
        clients: [{ id: 1, name: "Entreprise ABC", phone: "04 56 78 90 12", email: "contact@abc-entreprise.fr", address: "123 Rue des Entreprises", orders: 5, totalSpent: 3500.50 }],
        orders: [{ id: 1001, clientId: 1, clientName: "Entreprise ABC", date: "2023-10-15", products: [{ id: 1, name: "Ordinateur Portable", quantity: 1, price: 799.99 }], total: 1299.98, status: "completed" }],
        categories: [{ id: 1, name: "Électronique", description: "Appareils électroniques", productCount: 1 }],
        warehouses: [{ id: 1, name: "Entrepôt Central", address: "Paris", capacity: 1000, currentStock: 15, manager: "Paul Durand", phone: "01 23" }]
    },
    getAll: (t) => DataManager.data[t] || [],
    getById: (t, id) => DataManager.getAll(t).find(x => x.id === id),
    add: (t, item) => {
        item.id = (DataManager.data[t].reduce((m, x) => Math.max(m, x.id), 0) || 0) + 1;
        DataManager.data[t].push(item);
        return item;
    },
    update: (t, id, up) => {
        const i = DataManager.data[t].findIndex(x => x.id === id);
        if (i !== -1) DataManager.data[t][i] = { ...DataManager.data[t][i], ...up };
    },
    delete: (t, id) => {
        const i = DataManager.data[t].findIndex(x => x.id === id);
        return i !== -1 ? DataManager.data[t].splice(i, 1) : null;
    },
    getStats: () => ({
        products: DataManager.data.products.length,
        suppliers: DataManager.data.suppliers.length,
        clients: DataManager.data.clients.length,
        orders: DataManager.data.orders.length,
        categories: DataManager.data.categories.length,
        warehouses: DataManager.data.warehouses.length,
        lowStockProducts: DataManager.data.products.filter(p => p.quantity <= p.minStock).length
    }),
    search: (t, q, fields) => {
        if (!q) return DataManager.getAll(t);
        const lq = q.toLowerCase();
        return DataManager.getAll(t).filter(x => fields.some(f => x[f]?.toString().toLowerCase().includes(lq)));
    }
};