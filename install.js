let deferredInstallPrompt = null;
const INSTALL_RELOAD_KEY = "chamaconnect_install_reload_done";
const SERVICE_WORKER_RESET_KEY = "chamaconnect_sw_reset_version";
const SERVICE_WORKER_RESET_VERSION = "20260406-password-toggle-showcase";
let promptReady = false;

function isIosDevice() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isAndroidDevice() {
    return /android/i.test(window.navigator.userAgent);
}

function isEdgeBrowser() {
    return /edg/i.test(window.navigator.userAgent);
}

function isChromeBrowser() {
    return /chrome|chromium/i.test(window.navigator.userAgent) && !isEdgeBrowser() && !/opr|opera/i.test(window.navigator.userAgent);
}

function isFirefoxBrowser() {
    return /firefox/i.test(window.navigator.userAgent);
}

function isSafariBrowser() {
    return /safari/i.test(window.navigator.userAgent) && !isChromeBrowser() && !isEdgeBrowser();
}

function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function getInstallFallbackMessage() {
    if (isIosDevice()) {
        return "On iPhone, tap Share and then Add to Home Screen.";
    }

    if (isEdgeBrowser()) {
        return "If the prompt does not open, use Edge menu (...) and choose Apps, then Install this site as an app.";
    }

    if (isChromeBrowser() && isAndroidDevice()) {
        return "If the prompt does not open, use Chrome menu (...) and choose Add to Home screen or Install app.";
    }

    if (isChromeBrowser()) {
        return "If the prompt does not open, use Chrome menu (...) and choose Install ChamaConnect.";
    }

    if (isSafariBrowser()) {
        return "Safari may not show this install prompt here. Use Share then Add to Dock/Home Screen, or open the site in Chrome.";
    }

    if (isFirefoxBrowser()) {
        return "Firefox does not reliably support this web-app install prompt. Open the site in Chrome or Edge.";
    }

    return "This browser is not exposing the install prompt. Try Chrome or Edge for app installation.";
}

function setInstallFeedback(message) {
    const feedback = document.getElementById("install-app-feedback");
    if (!feedback) {
        return;
    }

    feedback.textContent = message;
    feedback.classList.remove("hidden");
}

function clearInstallFeedback() {
    const feedback = document.getElementById("install-app-feedback");
    if (!feedback) {
        return;
    }

    feedback.textContent = "";
    feedback.classList.add("hidden");
}

function setInstallButtonLabel(label, disabled) {
    ["install-app-button", "install-app-button-mobile"].forEach((id) => {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        button.textContent = label;
        button.disabled = disabled;
    });
}

async function handleInstallClick() {
    if (isStandalone()) {
        setInstallFeedback("App is already installed.");
        setInstallButtonLabel("Installed", true);
        return;
    }

    if (isIosDevice()) {
        setInstallFeedback(getInstallFallbackMessage());
        return;
    }

    if (!deferredInstallPrompt) {
        setInstallFeedback(getInstallFallbackMessage());
        return;
    }

    setInstallButtonLabel("Installing...", true);
    await deferredInstallPrompt.prompt();
    const choice = await deferredInstallPrompt.userChoice;

    if (choice.outcome === "accepted") {
        setInstallFeedback("Installed successfully.");
        setInstallButtonLabel("Installed", true);
    } else {
        setInstallFeedback("Install was cancelled.");
        setInstallButtonLabel("Install App", false);
    }

    deferredInstallPrompt = null;
}

function registerInstallButtons() {
    ["install-app-button", "install-app-button-mobile"].forEach((id) => {
        const button = document.getElementById(id);
        if (!button) {
            return;
        }

        button.addEventListener("click", handleInstallClick);
    });
}

function registerInstallPrompt() {
    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredInstallPrompt = event;
        promptReady = true;
        clearInstallFeedback();
    });

    window.addEventListener("appinstalled", () => {
        deferredInstallPrompt = null;
        promptReady = false;
        setInstallFeedback("Installed successfully.");
        setInstallButtonLabel("Installed", true);
    });
}

function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) {
        return;
    }

    window.addEventListener("load", () => {
        const shouldResetServiceWorker = window.localStorage.getItem(SERVICE_WORKER_RESET_KEY) !== SERVICE_WORKER_RESET_VERSION;

        const registerWorker = () => navigator.serviceWorker.register("./service-worker.js?v=20260406e").then((registration) => {
            registration.update().catch(() => {});

            if (!navigator.serviceWorker.controller) {
                const hasReloaded = window.sessionStorage.getItem(INSTALL_RELOAD_KEY) === "true";

                if (!hasReloaded) {
                    window.sessionStorage.setItem(INSTALL_RELOAD_KEY, "true");

                    navigator.serviceWorker.addEventListener("controllerchange", () => {
                        window.location.reload();
                    }, { once: true });

                    if (registration.waiting) {
                        window.location.reload();
                    }
                }
            }
        });

        if (shouldResetServiceWorker) {
            Promise.all([
                navigator.serviceWorker.getRegistrations().then((registrations) => Promise.all(
                    registrations.map((registration) => registration.unregister())
                )),
                "caches" in window
                    ? caches.keys().then((keys) => Promise.all(
                        keys
                            .filter((key) => key.startsWith("chamaconnect-shell"))
                            .map((key) => caches.delete(key))
                    ))
                    : Promise.resolve()
            ]).then(() => {
                window.localStorage.setItem(SERVICE_WORKER_RESET_KEY, SERVICE_WORKER_RESET_VERSION);
                window.location.reload();
            }).catch(() => {
                window.localStorage.setItem(SERVICE_WORKER_RESET_KEY, SERVICE_WORKER_RESET_VERSION);
                registerWorker().catch(() => {
                    setInstallFeedback("Install support could not start on this browser.");
                });
            });
            return;
        }

        registerWorker().catch(() => {
            setInstallFeedback("Install support could not start on this browser.");
        });
    });
}

document.addEventListener("DOMContentLoaded", () => {
    registerInstallButtons();
    registerServiceWorker();

    if (isStandalone()) {
        setInstallButtonLabel("Installed", true);
        setInstallFeedback("App is already installed.");
    } else if (promptReady) {
        clearInstallFeedback();
    }
});

registerInstallPrompt();
