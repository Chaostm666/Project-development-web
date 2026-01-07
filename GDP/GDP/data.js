// Modèles de données
const DataModels = {
    Product: {
        id: 0,
        name: '',
        category: '',
        price: 0,
        quantity: 0,
        minStock: 0,
        warehouse: '',
        description: '',
        supplierId: null,
        createdAt: new Date().toISOString().split('T')[0]
    },
    
    Supplier: {
        id: 0,
        name: '',
        contact: '',
        phone: '',
        email: '',
        address: '',
        productsSupplied: []
    },
    
    Client: {
        id: 0,
        name: '',
        phone: '',
        email: '',
        address: '',
        orders: 0,
        totalSpent: 0
    },
    
    Order: {
        id: 0,
        clientId: null,
        clientName: '',
        date: new Date().toISOString().split('T')[0],
        products: [],
        total: 0,
        status: 'pending', // pending, processing, completed, cancelled
        notes: ''
    },
    
    Category: {
        id: 0,
        name: '',
        description: '',
        productCount: 0
    },
    
    Warehouse: {
        id: 0,
        name: '',
        address: '',
        capacity: 0,
        currentStock: 0,
        manager: '',
        phone: ''
    }
};

// Données initiales
let appData = {
    products: [
        { id: 1, name: "Ordinateur Portable", category: "Électronique", price: 799.99, quantity: 15, minStock: 10, warehouse: "Entrepôt Central", description: "Ordinateur portable 15 pouces", supplierId: 1, createdAt: "2023-10-01" },
        { id: 2, name: "Smartphone", category: "Électronique", price: 499.99, quantity: 25, minStock: 20, warehouse: "Entrepôt Central", description: "Smartphone dernière génération", supplierId: 1, createdAt: "2023-10-05" },
        { id: 3, name: "Chaise de Bureau", category: "Mobilier", price: 129.99, quantity: 8, minStock: 15, warehouse: "Entrepôt Est", description: "Chaise ergonomique", supplierId: 2, createdAt: "2023-10-10" },
        { id: 4, name: "Table", category: "Mobilier", price: 299.99, quantity: 5, minStock: 10, warehouse: "Entrepôt Est", description: "Table de conférence", supplierId: 2, createdAt: "2023-10-12" },
        { id: 5, name: "Cafetière", category: "Électroménager", price: 89.99, quantity: 12, minStock: 10, warehouse: "Entrepôt Ouest", description: "Cafetière programmable", supplierId: 3, createdAt: "2023-10-15" }
    ],
    
    suppliers: [
        { id: 1, name: "TechSolutions", contact: "Jean Dupont", phone: "01 23 45 67 89", email: "contact@techsolutions.com", address: "123 Rue de Paris, 75001 Paris", productsSupplied: ["Ordinateur Portable", "Smartphone"] },
        { id: 2, name: "MobilierPro", contact: "Marie Martin", phone: "02 34 56 78 90", email: "info@mobilierpro.fr", address: "456 Avenue des Champs, 69000 Lyon", productsSupplied: ["Chaise de Bureau", "Table"] },
        { id: 3, name: "ElectroHouse", contact: "Pierre Leroy", phone: "03 45 67 89 01", email: "ventes@electrohouse.com", address: "789 Boulevard Maritime, 13000 Marseille", productsSupplied: ["Cafetière"] }
    ],
    
    clients: [
        { id: 1, name: "Entreprise ABC", phone: "04 56 78 90 12", email: "contact@abc-entreprise.fr", address: "123 Rue des Entreprises, 75002 Paris", orders: 5, totalSpent: 3500.50 },
        { id: 2, name: "Société XYZ", phone: "05 67 89 01 23", email: "info@xyz-societe.com", address: "456 Avenue du Commerce, 69001 Lyon", orders: 3, totalSpent: 1200.75 },
        { id: 3, name: "SARL 123", phone: "06 78 90 12 34", email: "contact@sarl123.fr", address: "789 Boulevard Industriel, 13001 Marseille", orders: 7, totalSpent: 4200.25 }
    ],
    
    orders: [
        { id: 1001, clientId: 1, clientName: "Entreprise ABC", date: "2023-10-15", products: [
            { id: 1, name: "Ordinateur Portable", quantity: 1, price: 799.99 },
            { id: 2, name: "Smartphone", quantity: 1, price: 499.99 }
        ], total: 1299.98, status: "completed", notes: "Livraison express demandée" },
        { id: 1002, clientId: 2, clientName: "Société XYZ", date: "2023-10-18", products: [
            { id: 3, name: "Chaise de Bureau", quantity: 2, price: 129.99 },
            { id: 4, name: "Table", quantity: 1, price: 299.99 }
        ], total: 429.98, status: "processing", notes: "" },
        { id: 1003, clientId: 3, clientName: "SARL 123", date: "2023-10-20", products: [
            { id: 5, name: "Cafetière", quantity: 3, price: 89.99 },
            { id: 2, name: "Smartphone", quantity: 1, price: 499.99 }
        ], total: 769.96, status: "pending", notes: "À livrer avant le 25 octobre" }
    ],
    
    categories: [
        { id: 1, name: "Électronique", description: "Appareils électroniques", productCount: 2 },
        { id: 2, name: "Mobilier", description: "Meubles de bureau", productCount: 2 },
        { id: 3, name: "Électroménager", description: "Appareils électroménagers", productCount: 1 },
        { id: 4, name: "Fournitures", description: "Fournitures de bureau", productCount: 0 }
    ],
    
    warehouses: [
        { id: 1, name: "Entrepôt Central", address: "123 Rue Principale, 75000 Paris", capacity: 1000, currentStock: 40, manager: "Paul Durand", phone: "01 23 45 67 89" },
        { id: 2, name: "Entrepôt Est", address: "456 Avenue de l'Est, 67000 Strasbourg", capacity: 800, currentStock: 13, manager: "Sophie Martin", phone: "03 45 67 89 01" },
        { id: 3, name: "Entrepôt Ouest", address: "789 Boulevard de l'Ouest, 33000 Bordeaux", capacity: 600, currentStock: 12, manager: "Luc Petit", phone: "05 67 89 01 23" }
    ]
};

// Fonctions de gestion des données
const DataManager = {
    // Récupérer toutes les données d'un type
    getAll: (dataType) => {
        return appData[dataType] || [];
    },
    
    // Récupérer un élément par ID
    getById: (dataType, id) => {
        const items = appData[dataType];
        return items ? items.find(item => item.id === id) : null;
    },
    
    // Ajouter un nouvel élément
    add: (dataType, item) => {
        if (!appData[dataType]) {
            appData[dataType] = [];
        }
        
        // Générer un nouvel ID
        const maxId = appData[dataType].reduce((max, item) => Math.max(max, item.id), 0);
        item.id = maxId + 1;
        
        // Ajouter la date de création si applicable
        if (dataType === 'products' && !item.createdAt) {
            item.createdAt = new Date().toISOString().split('T')[0];
        }
        
        appData[dataType].push(item);
        return item;
    },
        
    // Mettre à jour un élément
    update: (dataType, id, updates) => {
        const index = appData[dataType].findIndex(item => item.id === id);
        if (index !== -1) {
            appData[dataType][index] = { ...appData[dataType][index], ...updates };
            return appData[dataType][index];
        }
        return null;
    },
    
    // Supprimer un élément
    delete: (dataType, id) => {
        const index = appData[dataType].findIndex(item => item.id === id);
        if (index !== -1) {
            return appData[dataType].splice(index, 1)[0];
        }
        return null;
    },
    
    // Obtenir les statistiques
    getStats: () => {
        return {
            products: appData.products.length,
            suppliers: appData.suppliers.length,
            clients: appData.clients.length,
            orders: appData.orders.length,
            categories: appData.categories.length,
            warehouses: appData.warehouses.length,
            lowStockProducts: appData.products.filter(p => p.quantity <= p.minStock).length,
            totalInventoryValue: appData.products.reduce((sum, p) => sum + (p.price * p.quantity), 0),
            pendingOrders: appData.orders.filter(o => o.status === 'pending').length
        };
    },
    
    // Rechercher des éléments
    search: (dataType, query, fields = ['name']) => {
        const items = appData[dataType] || [];
        if (!query) return items;
        
        const lowerQuery = query.toLowerCase();
        return items.filter(item => 
            fields.some(field => 
                item[field] && item[field].toString().toLowerCase().includes(lowerQuery)
            )
        );
    },
    
    // Obtenir le prochain ID disponible
    getNextId: (dataType) => {
        const items = appData[dataType] || [];
        return items.length > 0 ? Math.max(...items.map(item => item.id)) + 1 : 1;
    }
};