(() => {
  document.documentElement.classList.add("js");

  const filterButtons = [...document.querySelectorAll(".filter")];
  const projectCards = [...document.querySelectorAll(".project-card")];
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#nav-links");
  const navAnchors = [...document.querySelectorAll(".nav-links a[href^='#']")];

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const categories = card.dataset.categories.split(" ");
        card.hidden = filter !== "all" && !categories.includes(filter);
      });
    });
  });

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";
    navToggle.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("is-open", open);
  });

  navLinks?.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      navLinks.classList.remove("is-open");
      navToggle?.setAttribute("aria-expanded", "false");
    }
  });

  const navSections = navAnchors
    .map((anchor) => ({ anchor, section: document.querySelector(anchor.getAttribute("href")) }))
    .filter(({ section }) => section);

  let scrollFrame;
  const updateActiveNav = () => {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight ?? 0;
    const marker = window.scrollY + headerHeight + 120;
    let active = null;

    navSections.forEach((item) => {
      if (item.section.offsetTop <= marker) active = item;
    });

    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      active = navSections.at(-1);
    }

    navSections.forEach(({ anchor }) => {
      const current = active?.anchor === anchor;
      anchor.classList.toggle("is-active", current);
      if (current) anchor.setAttribute("aria-current", "location");
      else anchor.removeAttribute("aria-current");
    });
  };

  window.addEventListener("scroll", () => {
    if (scrollFrame) return;
    scrollFrame = requestAnimationFrame(() => {
      updateActiveNav();
      scrollFrame = null;
    });
  }, { passive: true });
  window.addEventListener("resize", updateActiveNav);
  updateActiveNav();

  const revealItems = [...document.querySelectorAll(".reveal, .project-card")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -24px" });
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  document.querySelectorAll("[data-scroll-top]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      history.replaceState(null, "", `${location.pathname}${location.search}`);
      updateActiveNav();
    });
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
