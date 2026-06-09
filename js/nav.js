(function () {
  const PROJECTS = [
    { label: "Webzine", href: "webzine.html" },
    { label: "Artist Pamphlets", href: "pamphlets.html" },
    { label: "Collectors Edition", href: "collectors.html" },
    { label: "Poptart Typology", href: "poptart.html" },
    { label: "Top 10 Catalogue", href: "top10.html" },
  ];

  const dropdown = document.querySelector(".pill-dropdown");
  if (!dropdown) return;

  const toggle = dropdown.querySelector(".pill-dropdown__toggle");
  const menu = dropdown.querySelector(".pill-dropdown__menu");
  if (!toggle || !menu) return;

  const currentPage = location.pathname.split("/").pop() || "index.html";

  menu.innerHTML = PROJECTS.map(
    (project) => `
      <li role="none">
        <a
          role="menuitem"
          href="${project.href}"
          ${currentPage === project.href ? 'aria-current="page"' : ""}
        >${project.label}</a>
      </li>
    `
  ).join("");

  if (PROJECTS.some((p) => p.href === currentPage)) {
    toggle.classList.add("is-active");
  }

  function openMenu() {
    dropdown.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    menu.hidden = false;
  }

  function closeMenu() {
    dropdown.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    menu.hidden = true;
  }

  function isOpen() {
    return dropdown.classList.contains("is-open");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isOpen()) closeMenu();
    else openMenu();
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeMenu();
  });
})();
