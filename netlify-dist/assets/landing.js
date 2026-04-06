const revealNodes = document.querySelectorAll("[data-reveal]");
const isSmallScreen = window.matchMedia("(max-width: 1024px)").matches;

revealNodes.forEach((node) => {
    const delay = node.getAttribute("data-delay");
    if (delay) {
        node.style.setProperty("--reveal-delay", `${delay}ms`);
    }
});

if (isSmallScreen) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
} else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px"
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

const marqueeTrack = document.querySelector(".partner-marquee");
const marqueeShell = document.querySelector(".marquee-fade");

if (marqueeTrack && marqueeShell) {
    const pauseMarquee = () => {
        marqueeTrack.style.animationPlayState = "paused";
    };

    const resumeMarquee = () => {
        marqueeTrack.style.animationPlayState = "running";
    };

    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach((eventName) => {
        marqueeShell.addEventListener(eventName, pauseMarquee, { passive: true });
    });

    ["mouseleave", "focusout", "touchend", "touchcancel", "pointerup", "pointercancel"].forEach((eventName) => {
        marqueeShell.addEventListener(eventName, resumeMarquee, { passive: true });
    });
}

const showcaseSection = document.getElementById("showcase");
const showcaseSlides = Array.from(document.querySelectorAll("[data-showcase-slide]"));
const showcaseCopies = Array.from(document.querySelectorAll("[data-showcase-copy]"));
const showcaseButtons = Array.from(document.querySelectorAll("[data-showcase-target]"));
const showcasePrev = document.querySelector("[data-showcase-prev]");
const showcaseNext = document.querySelector("[data-showcase-next]");

if (showcaseSection && showcaseSlides.length && showcaseCopies.length && showcaseButtons.length) {
    const slideIds = showcaseSlides.map((slide) => slide.dataset.showcaseSlide);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeId = (showcaseSlides.find((slide) => slide.classList.contains("is-active")) || showcaseSlides[0]).dataset.showcaseSlide;
    let showcaseInterval = null;

    function setActiveShowcase(nextId) {
        activeId = slideIds.includes(nextId) ? nextId : slideIds[0];

        showcaseSlides.forEach((slide) => {
            const isActive = slide.dataset.showcaseSlide === activeId;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
        });

        showcaseCopies.forEach((copy) => {
            const isActive = copy.dataset.showcaseCopy === activeId;
            copy.classList.toggle("is-active", isActive);
            copy.setAttribute("aria-hidden", String(!isActive));
        });

        showcaseButtons.forEach((button) => {
            const isActive = button.dataset.showcaseTarget === activeId;
            button.classList.toggle("is-active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function advanceShowcase(step) {
        const currentIndex = Math.max(0, slideIds.indexOf(activeId));
        const nextIndex = (currentIndex + step + slideIds.length) % slideIds.length;
        setActiveShowcase(slideIds[nextIndex]);
    }

    function stopShowcaseAutoplay() {
        if (showcaseInterval) {
            window.clearInterval(showcaseInterval);
            showcaseInterval = null;
        }
    }

    function startShowcaseAutoplay() {
        stopShowcaseAutoplay();

        if (prefersReducedMotion) {
            return;
        }

        showcaseInterval = window.setInterval(() => {
            advanceShowcase(1);
        }, 6500);
    }

    showcaseButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const nextId = button.dataset.showcaseTarget;
            setActiveShowcase(nextId);

            if (button.closest(".partner-strip")) {
                showcaseSection.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start"
                });
            }
        });
    });

    if (showcasePrev) {
        showcasePrev.addEventListener("click", () => advanceShowcase(-1));
    }

    if (showcaseNext) {
        showcaseNext.addEventListener("click", () => advanceShowcase(1));
    }

    ["mouseenter", "focusin", "touchstart", "pointerdown"].forEach((eventName) => {
        showcaseSection.addEventListener(eventName, stopShowcaseAutoplay, { passive: true });
    });

    ["mouseleave", "focusout", "touchend", "touchcancel", "pointerup", "pointercancel"].forEach((eventName) => {
        showcaseSection.addEventListener(eventName, startShowcaseAutoplay, { passive: true });
    });

    setActiveShowcase(activeId);
    startShowcaseAutoplay();
}
