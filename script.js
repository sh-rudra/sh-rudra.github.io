(() => {
  const grid = document.querySelector("#project-grid");
  const filterButtons = [...document.querySelectorAll(".filter")];
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#nav-links");

  const categoryFor = (project) => {
    const text = [project.title, ...project.tags, ...project.stack].join(" ").toLowerCase();
    const categories = [];
    if (/nlp|text|transformer|sentiment|language/.test(text)) categories.push("nlp");
    if (/vision|opencv|drowsiness|proctoring/.test(text)) categories.push("vision");
    if (/signal|ecg|eeg|audio|time-series|speech/.test(text)) categories.push("signal");
    if (/mern|full-stack|mongodb|rest api/.test(text)) categories.push("full-stack");
    return categories;
  };

  const make = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  };

  const caseRow = (label, content) => {
    const row = make("div", "case-row");
    row.append(make("h4", "", label));
    if (Array.isArray(content)) {
      const list = make("ul");
      content.forEach((item) => list.append(make("li", "", item)));
      row.append(list);
    } else {
      row.append(make("p", "", content));
    }
    return row;
  };

  const render = (projects, filter = "all") => {
    const fragment = document.createDocumentFragment();
    projects.forEach((project, index) => {
      const categories = categoryFor(project);
      if (filter !== "all" && !categories.includes(filter)) return;

      const card = make("article", "project-card");
      card.dataset.categories = categories.join(" ");
      card.append(make("p", "project-index", String(index + 1).padStart(2, "0")));
      card.append(make("h3", "", project.title));
      card.append(caseRow("What it solves", project.problem));
      card.append(caseRow("Method", project.approach[0]));
      if (!project.result.startsWith("Evaluation results")) card.append(caseRow("Outcome", project.result));
      card.append(caseRow("Stack", project.stack.join(" · ")));

      const tags = make("ul", "tags");
      tags.setAttribute("aria-label", "Project tags");
      project.tags.forEach((tag) => tags.append(make("li", "", tag)));
      card.append(tags);

      if (project.repo && project.repo !== "TODO") {
        const link = make("a", "project-link", "View repository ↗");
        link.href = project.repo;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(link);
      }
      fragment.append(card);
    });

    grid.replaceChildren(fragment);
    if (!grid.children.length) grid.append(make("p", "notice", "No projects in this category yet."));
  };

  fetch("projects.json")
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      render(projects);
      filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
          filterButtons.forEach((item) => {
            const active = item === button;
            item.classList.toggle("is-active", active);
            item.setAttribute("aria-pressed", String(active));
          });
          render(projects, button.dataset.filter);
        });
      });
    })
    .catch(() => {
      grid.replaceChildren(make("p", "notice", "Projects could not be loaded. Serve this folder with a local web server and try again."));
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

  document.querySelectorAll("[data-scroll-top]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      history.replaceState(null, "", `${location.pathname}${location.search}`);
    });
  });

  document.querySelector("#year").textContent = new Date().getFullYear();
})();
