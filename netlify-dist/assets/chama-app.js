import {
    STORAGE_KEYS,
    buildTrustScores,
    formatKES,
    getStoredDashboardData,
    getStoredQueue,
    saveDashboardData,
    saveQueue
} from "./chama-data.js";
import {
    hydrateIcons,
    renderActivityList,
    renderChatBubble,
    renderMemberCards,
    renderMemberProfile,
    renderOfflineQueue,
    renderSummaryCards,
    renderTipsPreview,
    renderTrustSummary
} from "./chama-components.js";

const dashboardData = getStoredDashboardData();
let offlineQueue = getStoredQueue();
let isOnline = navigator.onLine;

function createOfflineManager() {
    const indicator = document.getElementById("offline-indicator");
    const queueCount = document.getElementById("offline-queue-count");
    const queueCopy = document.getElementById("queue-status-copy");
    const queuePanelCopy = document.getElementById("queue-status-copy-panel");

    function refreshStatus() {
        queueCount.textContent = `${offlineQueue.length} queued`;
        queuePanelCopy.textContent = offlineQueue.length
            ? `${offlineQueue.length} action${offlineQueue.length === 1 ? "" : "s"} stored locally.`
            : "All actions are up to date.";

        if (isOnline) {
            indicator.classList.add("hidden");
            queueCopy.textContent = offlineQueue.length
                ? `${offlineQueue.length} action${offlineQueue.length === 1 ? "" : "s"} ready to sync.`
                : "All actions are up to date.";
            return;
        }

        indicator.classList.remove("hidden");
        queueCopy.textContent = offlineQueue.length
            ? `${offlineQueue.length} action${offlineQueue.length === 1 ? "" : "s"} saved on this phone and waiting for internet.`
            : "Offline mode is on. New actions will queue safely.";

        queuePanelCopy.textContent = offlineQueue.length
            ? `${offlineQueue.length} action${offlineQueue.length === 1 ? "" : "s"} will sync automatically when internet returns.`
            : "Offline mode is on. New actions will queue safely.";

        renderDashboard();
    }

    function enqueue(action) {
        offlineQueue.unshift({
            ...action,
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            queuedAt: new Date().toISOString()
        });
        saveQueue(offlineQueue);
        refreshStatus();
        renderDashboard();
    }

    function sync() {
        if (!isOnline || offlineQueue.length === 0) {
            return;
        }

        const synced = [...offlineQueue];
        synced.forEach((action) => {
            if (action.type === "contribution") {
                dashboardData.totals.contributions += action.amount;
                dashboardData.totals.availableBalance += action.amount;
                dashboardData.activity.unshift({
                    id: Date.now() + Math.random(),
                    type: "contribution",
                    memberId: "sarah",
                    title: `Offline contribution synced: KES ${action.amount.toLocaleString("en-KE")}`,
                    time: "Just now"
                });
            }

            if (action.type === "loan-request") {
                dashboardData.totals.activeLoans += action.amount;
                dashboardData.totals.availableBalance -= action.amount;
                dashboardData.activity.unshift({
                    id: Date.now() + Math.random(),
                    type: "loan",
                    memberId: "mary",
                    title: `Offline loan request synced: KES ${action.amount.toLocaleString("en-KE")}`,
                    time: "Just now"
                });
            }
        });

        saveDashboardData(dashboardData);
        offlineQueue = [];
        saveQueue(offlineQueue);
        refreshStatus();
        renderDashboard();
        showToast(`Synced ${synced.length} queued action${synced.length === 1 ? "" : "s"}.`, "success");
    }

    window.addEventListener("online", () => {
        isOnline = true;
        refreshStatus();
        sync();
    });

    window.addEventListener("offline", () => {
        isOnline = false;
        refreshStatus();
        showToast("Offline mode is on. Actions will queue safely.", "info");
    });

    refreshStatus();

    return {
        enqueue,
        refreshStatus,
        sync
    };
}

function getChatReply(message) {
    const lower = message.toLowerCase();

    if (lower.includes("balance")) {
        return `Your available balance is ${formatKES(dashboardData.totals.availableBalance)}.\n\nTotal contributions: ${formatKES(dashboardData.totals.contributions)}\nActive loans: ${formatKES(dashboardData.totals.activeLoans)}`;
    }

    if (lower.includes("loan")) {
        return "There are 3 active loans right now. Mary is paying well, John is on track, and Peter needs follow-up this week.";
    }

    if (lower.includes("member") || lower.includes("trust")) {
        return "Trusted members: 2\nModerate members: 1\nRisky members: 1\n\nOpen a member card to see reputation score and loan reliability score.";
    }

    if (lower.includes("remind")) {
        return "Reminder ready. A payment follow-up notice has been prepared and shown on screen.";
    }

    return "You can ask about balance, loan status, member trust, or reminders.";
}

function showToast(message, type = "info") {
    const region = document.getElementById("toast-region");
    const tone = {
        success: "bg-emerald-600",
        info: "bg-ink",
        warning: "bg-amber-600"
    }[type] ?? "bg-ink";

    const toast = document.createElement("div");
    toast.className = `${tone} rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-soft`;
    toast.textContent = message;
    region.appendChild(toast);

    window.setTimeout(() => {
        toast.remove();
    }, 2600);
}

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function renderDashboard() {
    document.getElementById("summary-grid").innerHTML = renderSummaryCards(dashboardData.totals);
    document.getElementById("activity-list").innerHTML = renderActivityList(dashboardData.activity.slice(0, 4), dashboardData.members);
    document.getElementById("member-summary").innerHTML = renderMemberCards(dashboardData.members);
    document.getElementById("trust-summary-card").innerHTML = renderTrustSummary(dashboardData.members);
    document.getElementById("offline-queue-list").innerHTML = renderOfflineQueue(offlineQueue);
    document.getElementById("tips-preview").innerHTML = renderTipsPreview();
    hydrateIcons();
}

function openMemberProfile(memberId) {
    const member = dashboardData.members.find((entry) => entry.id === memberId);
    if (!member) {
        return;
    }

    document.getElementById("member-profile-content").innerHTML = renderMemberProfile(member);
    openModal("member-modal");
}

function initMemberTriggers() {
    document.addEventListener("click", (event) => {
        const trigger = event.target.closest(".member-trigger");
        if (trigger) {
            openMemberProfile(trigger.dataset.memberId);
        }
    });
}

function createTrustScore(member) {
    return buildTrustScores(member);
}

function createChatUI() {
    const feed = document.getElementById("chat-feed");
    const input = document.getElementById("chat-input");

    function addMessage(message, type = "bot") {
        feed.insertAdjacentHTML("beforeend", renderChatBubble(message, type));
        feed.scrollTop = feed.scrollHeight;
    }

    function send(message, type = "user") {
        addMessage(message, type);
        window.setTimeout(() => {
            addMessage(getChatReply(message), "bot");
        }, 420);
    }

    addMessage("Hello. I can help with balances, trust scores, loans, and reminders.");

    document.getElementById("chat-balance").addEventListener("click", () => {
        send("Check balance");
    });

    document.getElementById("chat-reminder").addEventListener("click", () => {
        send("Send reminder");
        showToast("Reminder simulation sent.", "warning");
    });

    document.getElementById("chat-send").addEventListener("click", () => {
        const value = input.value.trim();
        if (!value) {
            return;
        }
        send(value);
        input.value = "";
    });

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            document.getElementById("chat-send").click();
        }
    });
}

function initQuickActions(offlineManager) {
    // Quick actions mimic low-bandwidth use: save instantly when online,
    // otherwise queue safely in localStorage for later sync.
    document.getElementById("record-contribution").addEventListener("click", () => {
        const action = { type: "contribution", amount: 2000 };

        if (!isOnline) {
            offlineManager.enqueue(action);
            showToast("Contribution saved offline. It will sync when internet returns.", "warning");
            return;
        }

        dashboardData.totals.contributions += action.amount;
        dashboardData.totals.availableBalance += action.amount;
        dashboardData.activity.unshift({
            id: Date.now(),
            type: "contribution",
            memberId: "sarah",
            title: "Contribution recorded: KES 2,000",
            time: "Just now"
        });
        saveDashboardData(dashboardData);
        renderDashboard();
        showToast("Contribution recorded.", "success");
    });

    document.getElementById("request-loan").addEventListener("click", () => {
        const action = { type: "loan-request", amount: 15000 };

        if (!isOnline) {
            offlineManager.enqueue(action);
            showToast("Loan request saved offline. It will sync when internet returns.", "warning");
            return;
        }

        dashboardData.totals.activeLoans += action.amount;
        dashboardData.totals.availableBalance -= action.amount;
        dashboardData.activity.unshift({
            id: Date.now(),
            type: "loan",
            memberId: "mary",
            title: "Loan request submitted: KES 15,000",
            time: "Just now"
        });
        saveDashboardData(dashboardData);
        renderDashboard();
        showToast("Loan request submitted.", "success");
    });
}

function initModalEvents() {
    document.querySelectorAll("[data-close-modal]").forEach((node) => {
        node.addEventListener("click", () => {
            closeModal(node.dataset.closeModal);
        });
    });
}

function initHeaderActions() {
    document.getElementById("open-chat").addEventListener("click", () => openModal("chat-modal"));
    document.getElementById("open-chat-activity").addEventListener("click", () => openModal("chat-modal"));
    document.getElementById("sync-now").addEventListener("click", () => {
        if (!isOnline) {
            showToast("You are offline. Sync will start when internet returns.", "warning");
            return;
        }

        if (!offlineQueue.length) {
            showToast("Nothing to sync right now.", "info");
            return;
        }

        window.ChamaOS.offlineSync();
    });
}

function init() {
    const offlineManager = createOfflineManager();

    renderDashboard();
    initModalEvents();
    initHeaderActions();
    initMemberTriggers();
    initQuickActions(offlineManager);
    createChatUI();
    hydrateIcons();

    // Expose lightweight helpers for manual demoing in the browser console.
    window.ChamaOS = {
        storageKeys: STORAGE_KEYS,
        createTrustScore,
        offlineSync: () => offlineManager.sync()
    };
}

init();
