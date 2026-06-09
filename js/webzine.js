(function () {
  const belt = document.querySelector(".case__trinket-belt");
  const track = belt?.querySelector(".case__trinket-belt__track");
  const set = belt?.querySelector(".case__trinket-belt__set");

  function syncTrinketBelt() {
    if (!track || !set) return;
    const width = set.getBoundingClientRect().width;
    track.style.setProperty("--belt-shift", `${width}px`);
    track.style.setProperty("--belt-duration", "14s");
  }

  if (belt && track && set) {
    syncTrinketBelt();
    window.addEventListener("resize", syncTrinketBelt);
    belt.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", syncTrinketBelt, { once: true });
    });
    if (document.fonts?.ready) document.fonts.ready.then(syncTrinketBelt);
  }

  const player = document.querySelector("[data-vhs-player]");
  if (!player) return;

  const screen = player.querySelector(".case__vhs-screen");
  const frames = [...player.querySelectorAll(".case__vhs-frame")];
  const rewBtn = player.querySelector(".case__vhs-btn--rew");
  const ffBtn = player.querySelector(".case__vhs-btn--ff");

  if (!screen || !frames.length) return;

  let index = 0;
  let trackingTimer = 0;
  let isTracking = false;

  function showFrame(nextIndex) {
    index = nextIndex;
    frames.forEach((frame, n) => frame.classList.toggle("is-active", n === index));
  }

  function goTo(i) {
    const nextIndex = (i + frames.length) % frames.length;
    if (nextIndex === index || isTracking) return;

    isTracking = true;
    screen.classList.add("is-tracking");

    window.clearTimeout(trackingTimer);
    trackingTimer = window.setTimeout(() => {
      showFrame(nextIndex);
      window.setTimeout(() => {
        screen.classList.remove("is-tracking");
        isTracking = false;
      }, 280);
    }, 280);
  }

  rewBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(index - 1);
  });
  ffBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    goTo(index + 1);
  });

  screen.addEventListener("click", (e) => {
    if (e.target.closest(".case__vhs-btn")) return;
    const { left, width } = screen.getBoundingClientRect();
    const x = e.clientX - left;
    goTo(x < width / 2 ? index - 1 : index + 1);
  });

  player.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(index + 1);
    }
  });

  showFrame(0);
})();
