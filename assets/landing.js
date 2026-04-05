const revealNodes = document.querySelectorAll("[data-reveal]");

revealNodes.forEach((node) => {
    const delay = node.getAttribute("data-delay");
    if (delay) {
        node.style.setProperty("--reveal-delay", `${delay}ms`);
    }
});

if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px"
    });

    revealNodes.forEach((node) => observer.observe(node));
} else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
}

const toggleButton = document.querySelector("[data-mobile-toggle]");
const mobileNav = document.getElementById("mobile-nav");
const mobileLinks = mobileNav ? mobileNav.querySelectorAll("a") : [];

function setMobileMenu(open) {
    if (!toggleButton || !mobileNav) {
        return;
    }

    toggleButton.setAttribute("aria-expanded", String(open));
    mobileNav.classList.toggle("is-open", open);
}

if (toggleButton && mobileNav) {
    toggleButton.addEventListener("click", () => {
        const isOpen = toggleButton.getAttribute("aria-expanded") === "true";
        setMobileMenu(!isOpen);
    });

    mobileLinks.forEach((link) => {
        link.addEventListener("click", () => setMobileMenu(false));
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth >= 768) {
            setMobileMenu(false);
        }
    });
}
