(function () {
  function initSlider(root, options) {
    const tabs = options.tabsSelector
      ? [...root.querySelectorAll(options.tabsSelector)]
      : [];
    const slides = [...root.querySelectorAll(options.slideSelector)];
    const countEl = root.querySelector(options.countSelector);
    const labelEl = options.labelSelector
      ? root.querySelector(options.labelSelector)
      : null;
    const prevBtn = root.querySelector('[data-dir="prev"]');
    const nextBtn = root.querySelector('[data-dir="next"]');
    const viewport = root.querySelector(options.viewportSelector);
    let index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
        tab.tabIndex = active ? 0 : -1;
      });

      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle("is-active", active);
        slide.hidden = !active;
      });

      if (countEl) {
        countEl.textContent = `${index + 1} / ${slides.length}`;
      }

      if (labelEl) {
        labelEl.textContent = slides[index]?.dataset.label || "";
      }
    }

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        showSlide(Number(tab.dataset.index));
      });
    });

    prevBtn?.addEventListener("click", () => showSlide(index - 1));
    nextBtn?.addEventListener("click", () => showSlide(index + 1));

    viewport?.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      showSlide(index + 1);
    });

    showSlide(0);
  }

  const mockups = document.querySelector(".collectors-mockups-slider");
  if (mockups) {
    initSlider(mockups, {
      slideSelector: ".collectors-mockups-slider__slide",
      countSelector: ".collectors-mockups-slider__count",
      viewportSelector: ".collectors-mockups-slider__viewport",
    });
  }

  const pages = document.querySelector(".collectors-pages-slider");
  if (pages) {
    initSlider(pages, {
      slideSelector: ".collectors-mockups-slider__slide",
      countSelector: ".collectors-mockups-slider__count",
      viewportSelector: ".collectors-mockups-slider__viewport",
    });
  }
})();
