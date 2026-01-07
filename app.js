const App = {
    init: () => {
        if (window.Auth) Auth.init();
        else App.start();
    },
    start: () => {
        if (App.started) return;
        App.started = true;
        App.loadData();
        UI.init();
        Navigation.init();
        document.onkeydown = (e) => {
            if (e.key === 'Escape') document.querySelectorAll('.modal').forEach(m => m.remove());
            if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); App.saveData(); Utils.showNotification('Sauvegardé!'); }
        };
    },
    loadData: () => {
        const saved = localStorage.getItem('gdp_data');
        if (saved) DataManager.data = JSON.parse(saved);
    },
    saveData: () => {
        localStorage.setItem('gdp_data', JSON.stringify(DataManager.data));
    }
};
document.addEventListener('DOMContentLoaded', App.init);
window.App = App; window.DataManager = DataManager; window.Utils = Utils;