(function syncNavHeight() {
  const bar = document.querySelector("body.page-home .pill-bar, body.case-page .pill-bar");
  if (!bar) return;
  const apply = () => {
    document.documentElement.style.setProperty("--home-nav-height", `${bar.offsetHeight}px`);
  };
  apply();
  window.addEventListener("resize", apply);
  if (document.fonts?.ready) document.fonts.ready.then(apply);
})();

const navPills = document.querySelectorAll(".pill-bar .pill[href]");

/* Home: cover only until Contact is opened */
if (document.body.classList.contains("page-home")) {
  const homeLink = document.querySelector('.pill-bar .pill[href="#home"]');
  const contactLink = document.querySelector('.pill-bar .pill[href="#contact"]');
  const aboutSection = document.getElementById("about");
  const contactSection = document.getElementById("contact");

  function setHomeNavActive(which) {
    navPills.forEach((link) => {
      const href = link.getAttribute("href");
      if (which === "home") link.classList.toggle("is-active", href === "#home");
      if (which === "contact") link.classList.toggle("is-active", href === "#contact");
    });
  }

  function openContactView(scrollTarget = "about") {
    document.body.classList.add("show-contact");
    if (scrollTarget === "about") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const target = document.getElementById(scrollTarget) || aboutSection;
      requestAnimationFrame(() => {
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
    setHomeNavActive("contact");
  }

  function openCoverOnly() {
    document.body.classList.remove("show-contact");
    document.getElementById("home")?.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", "#home");
    setHomeNavActive("home");
  }

  contactLink?.addEventListener("click", (e) => {
    e.preventDefault();
    openContactView("about");
    history.replaceState(null, "", "#contact");
  });

  homeLink?.addEventListener("click", (e) => {
    if (document.body.classList.contains("show-contact")) {
      e.preventDefault();
      openCoverOnly();
    }
  });

  const hash = location.hash.replace("#", "");
  if (hash === "contact" || hash === "about") {
    document.body.classList.add("show-contact");
    setHomeNavActive("contact");
    requestAnimationFrame(() => {
      if (hash === "about") {
        window.scrollTo({ top: 0, behavior: "auto" });
      } else {
        contactSection?.scrollIntoView({ block: "start" });
      }
    });
  } else {
    setHomeNavActive("home");
  }
}

const form = document.querySelector(".contact__form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector(".btn-submit");
    const original = btn.textContent;
    btn.textContent = "Sent";
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      form.reset();
    }, 2500);
  });
}

const sections = document.querySelectorAll("main > section[id]");
if (
  sections.length &&
  navPills.length &&
  "IntersectionObserver" in window &&
  !document.body.classList.contains("page-home")
) {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navPills.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
          });
        }
      });
    },
    { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
  );
  sections.forEach((s) => obs.observe(s));
}
