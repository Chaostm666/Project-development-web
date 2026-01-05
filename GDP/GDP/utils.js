// Fonctions utilitaires
const Utils = {
    // Formater une date
    formatDate: (dateString, format = 'fr-FR') => {
        const date = new Date(dateString);
        return date.toLocaleDateString(format, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    // Formater un montant
    formatCurrency: (amount, currency = 'EUR', locale = 'fr-FR') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    // Générer un identifiant unique
    generateId: (prefix = '') => {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2);
    },
    
    // Valider un email
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Valider un numéro de téléphone
    validatePhone: (phone) => {
        const re = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return re.test(phone);
    },
    
    // Limiter la longueur du texte
    truncateText: (text, maxLength = 50) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },
    
    // Afficher une notification
    showNotification: (message, type = 'info', duration = 3000) => {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">&times;</button>
        `;
        
        // Ajouter au DOM
        document.body.appendChild(notification);
        
        // Style de la notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            backgroundColor: type === 'success' ? '#d4edda' : 
                           type === 'error' ? '#f8d7da' : 
                           type === 'warning' ? '#fff3cd' : '#d1ecf1',
            color: type === 'success' ? '#155724' : 
                   type === 'error' ? '#721c24' : 
                   type === 'warning' ? '#856404' : '#0c5460',
            border: `1px solid ${type === 'success' ? '#c3e6cb' : 
                               type === 'error' ? '#f5c6cb' : 
                               type === 'warning' ? '#ffeaa7' : '#bee5eb'}`,
            zIndex: '9999',
            minWidth: '300px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            animation: 'slideIn 0.3s ease-out'
        });
        
        // Animation
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);
        
        // Fermer la notification
        const closeBtn = notification.querySelector('.notification-close');
        const closeNotification = () => {
            notification.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        };
        
        closeBtn.addEventListener('click', closeNotification);
        
        // Fermer automatiquement après la durée spécifiée
        setTimeout(closeNotification, duration);
    },
    
    // Confirmer une action
    confirmAction: (message) => {
        return new Promise((resolve) => {
            // Créer la modale de confirmation
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 400px;">
                    <div class="modal-header">
                        <h3>Confirmation</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="cancel-btn">Annuler</button>
                        <button class="btn btn-danger" id="confirm-btn">Confirmer</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Gérer les événements
            const closeModal = () => {
                document.body.removeChild(modal);
            };
            
            modal.querySelector('.close-btn').addEventListener('click', () => {
                resolve(false);
                closeModal();
            });
            
            modal.querySelector('#cancel-btn').addEventListener('click', () => {
                resolve(false);
                closeModal();
            });
            
            modal.querySelector('#confirm-btn').addEventListener('click', () => {
                resolve(true);
                closeModal();
            });
            
            // Fermer en cliquant à l'extérieur
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    resolve(false);
                    closeModal();
                }
            });
        });
    },
    
    // Télécharger des données au format JSON
    exportToJSON: (data, filename = 'export.json') => {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Importer des données depuis un fichier JSON
    importFromJSON: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Fichier JSON invalide'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Erreur de lecture du fichier'));
            };
            
            reader.readAsText(file);
        });
    }
};