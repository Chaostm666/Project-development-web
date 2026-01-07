const Navigation = {
    init: () => {
        window.onpopstate = (e) => Navigation.navigateTo(e.state?.section || 'dashboard', false);
        document.querySelectorAll('.nav-item').forEach(i => i.onclick = () => Navigation.navigateTo(i.dataset.target));
    },
    navigateTo: (id, history = true) => {
        UI.loadSection(id);
        if (history) window.history.pushState({ section: id }, '', `#${id}`);
    }
};