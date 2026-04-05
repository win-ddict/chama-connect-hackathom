export function createOfflineManager(config) {
    const { storageKey, indicator, onToast, onSync } = config;
    let queue = loadQueue();

    function loadQueue() {
        try {
            return JSON.parse(localStorage.getItem(storageKey) || '[]');
        } catch {
            return [];
        }
    }

    function saveQueue() {
        localStorage.setItem(storageKey, JSON.stringify(queue));
    }

    function updateIndicator() {
        if (navigator.onLine) {
            indicator.classList.add('hidden');
            indicator.textContent = 'Offline Mode';
            return;
        }

        indicator.classList.remove('hidden');
        indicator.textContent = `Offline Mode • ${queue.length} queued`;
    }

    function syncQueue() {
        if (!navigator.onLine || queue.length === 0) {
            updateIndicator();
            return;
        }

        const actions = [...queue];
        queue = [];
        saveQueue();
        updateIndicator();

        if (typeof onSync === 'function') {
            onSync(actions);
        }
    }

    function handleAction(action) {
        if (navigator.onLine) {
            return false;
        }

        queue.push({
            ...action,
            queuedAt: new Date().toISOString()
        });
        saveQueue();
        updateIndicator();

        if (typeof onToast === 'function') {
            onToast(`${action.type} saved offline and will sync later.`, 'info');
        }

        return true;
    }

    window.addEventListener('offline', updateIndicator);
    window.addEventListener('online', () => {
        updateIndicator();
        syncQueue();
    });

    updateIndicator();

    return {
        handleAction,
        syncQueue
    };
}
