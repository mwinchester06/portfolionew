(function () {
  const slider = document.querySelector(".poptart-slider");
  if (!slider) return;

  const tabs = [...slider.querySelectorAll(".poptart-slider__tab")];
  const slides = [...slider.querySelectorAll(".poptart-slider__slide")];
  const countEl = slider.querySelector(".poptart-slider__count");
  const prevBtn = slider.querySelector('[data-dir="prev"]');
  const nextBtn = slider.querySelector('[data-dir="next"]');
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
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      showSlide(Number(tab.dataset.index));
    });
  });

  prevBtn?.addEventListener("click", () => showSlide(index - 1));
  nextBtn?.addEventListener("click", () => showSlide(index + 1));

  slider.querySelector(".poptart-slider__viewport")?.addEventListener("click", (e) => {
    if (e.target.closest(".poptart-slider__tab, .poptart-slider__arrow")) return;
    showSlide(index + 1);
  });
})();
