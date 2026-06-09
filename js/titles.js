/**
 * Portfolio title rotator
 * 1. Drop PNGs in assets/images/
 * 2. Add filenames to PORTFOLIO_TITLES below
 */
const PORTFOLIO_TITLES = [
  "assets/images/portfolio-01.png",
  "assets/images/portpages3.png",
];

const ROTATE_MS = 1800;

function buildSlide(src, i) {
  const slide = document.createElement("div");
  slide.className = "title-slide";
  if (i === 0) slide.classList.add("is-active");

  const frame = document.createElement("div");
  frame.className = "title-slide__frame";

  const img = document.createElement("img");
  img.src = src;
  img.alt = "Portfolio — Mia Winchester";
  img.width = 3300;
  img.height = 1849;
  img.decoding = "async";
  if (i === 0) {
    img.loading = "eager";
    img.fetchPriority = "high";
  } else {
    img.loading = "lazy";
  }

  frame.appendChild(img);
  slide.appendChild(frame);
  return slide;
}

function initTitleRotator() {
  const root = document.getElementById("title-rotator");
  if (!root || PORTFOLIO_TITLES.length === 0) return;

  let slides = [...root.querySelectorAll(".title-slide")];

  if (slides.length === 0) {
    PORTFOLIO_TITLES.forEach((src, i) => {
      root.appendChild(buildSlide(src, i));
    });
    slides = [...root.querySelectorAll(".title-slide")];
  } else {
    const firstImg = slides[0]?.querySelector("img");
    if (firstImg && PORTFOLIO_TITLES[0]) {
      firstImg.src = PORTFOLIO_TITLES[0];
    }
  }

  if (PORTFOLIO_TITLES.length > 1 && slides.length === 1) {
    PORTFOLIO_TITLES.slice(1).forEach((src, i) => {
      root.appendChild(buildSlide(src, i + 1));
    });
    slides = [...root.querySelectorAll(".title-slide")];
  }

  if (slides.length <= 1) return;

  let current = 0;

  function goTo(index) {
    slides[current].classList.remove("is-active");
    slides[index].classList.add("is-active");
    current = index;
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  PORTFOLIO_TITLES.slice(1).forEach((src) => {
    const img = new Image();
    img.src = src;
  });

  setInterval(next, ROTATE_MS);
}

document.addEventListener("DOMContentLoaded", initTitleRotator);
