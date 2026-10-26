(() => {
  const root = document.documentElement;
  const header = document.querySelector("[data-header]");
  const progress = document.querySelector(".scroll-progress span");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const year = document.querySelector("[data-year]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem("gb-theme");
  } catch {
    // Keep the system preference when storage is unavailable.
  }
  const initialTheme = storedTheme || "dark";

  function setTheme(theme) {
    root.dataset.theme = theme;
    const isLight = theme === "light";
    themeToggle.setAttribute("aria-pressed", String(isLight));
    themeToggle.setAttribute("aria-label", `Switch to ${isLight ? "dark" : "light"} theme`);
    document.querySelector('meta[name="theme-color"]').setAttribute("content", isLight ? "#f3f6fa" : "#08111f");
  }

  setTheme(initialTheme);

  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    try {
      localStorage.setItem("gb-theme", nextTheme);
    } catch {
      // The visual toggle still works for the current page view.
    }
  });

  if (year) year.textContent = String(new Date().getFullYear());

  function updateScrollState() {
    const scrollTop = window.scrollY;
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const percentage = scrollable > 0 ? Math.min((scrollTop / scrollable) * 100, 100) : 0;
    progress.style.setProperty("--scroll-progress", `${percentage}%`);
    header.classList.toggle("is-scrolled", scrollTop > 24);
  }

  updateScrollState();
  window.addEventListener("scroll", updateScrollState, { passive: true });

  const revealItems = document.querySelectorAll(".reveal");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" },
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
      revealObserver.observe(item);
    });
  }

  const navLinks = [...document.querySelectorAll('.desktop-nav a[href^="#"]')];
  const observedSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

  if ("IntersectionObserver" in window && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const activeEntry = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!activeEntry) return;
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${activeEntry.target.id}`;
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      },
      { rootMargin: "-35% 0px -55%", threshold: [0, 0.25, 0.6] },
    );

    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  document.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => link.closest("details").removeAttribute("open"));
  });
})();
