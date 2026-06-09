(function () {
  const scene = document.querySelector(".ispy__scene");
  if (!scene) return;

  const panel = scene.querySelector(".ispy__panel") || scene;
  const itemEls = [...panel.querySelectorAll(".ispy-item")];
  const STORAGE_KEY = "portfolio-ispy-positions";
  const DRAG_THRESHOLD = 5;
  const THROW_MIN_SPEED = 0.35;
  const RESTITUTION = 0.82;
  const WALL_RESTITUTION = 0.78;
  const FRICTION = 0.992;
  const STOP_SPEED = 0.12;

  function getItemId(el, index) {
    if (el.dataset.ispyId) return el.dataset.ispyId;
    const match = [...el.classList].find((c) => c.startsWith("ispy-item--"));
    return match ? match.replace("ispy-item--", "") : String(index);
  }

  function loadPositions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function savePositions(positions) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
    } catch {
      /* ignore */
    }
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  const saved = loadPositions();
  const bodies = itemEls.map((el, index) => {
    const id = getItemId(el, index);
    el.dataset.ispyId = id;
    return {
      el,
      id,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      w: 0,
      h: 0,
      dragging: false,
      samples: [],
    };
  });

  function sceneBounds() {
    return { width: panel.clientWidth, height: panel.clientHeight };
  }

  function measure(body) {
    body.w = body.el.offsetWidth;
    body.h = body.el.offsetHeight;
  }

  function applyTransform(body) {
    const rot = body.el.style.getPropertyValue("--rot") || "0deg";
    body.el.style.left = `${body.x}px`;
    body.el.style.top = `${body.y}px`;
    body.el.style.right = "auto";
    body.el.style.bottom = "auto";
    body.el.style.transform = `rotate(${rot})`;
  }

  function syncFromDom(body) {
    const panelRect = panel.getBoundingClientRect();
    const rect = body.el.getBoundingClientRect();
    body.x = rect.left - panelRect.left;
    body.y = rect.top - panelRect.top;
    measure(body);
  }

  function initPositions() {
    bodies.forEach((body) => {
      const pos = saved[body.id];
      if (pos && typeof pos.left === "number" && typeof pos.top === "number") {
        measure(body);
        const bounds = sceneBounds();
        body.x = clamp(pos.left, 0, Math.max(0, bounds.width - body.w));
        body.y = clamp(pos.top, 0, Math.max(0, bounds.height - body.h));
        applyTransform(body);
      } else {
        syncFromDom(body);
        applyTransform(body);
      }
    });
  }

  function persistPositions() {
    const positions = {};
    bodies.forEach((body) => {
      positions[body.id] = { left: body.x, top: body.y };
    });
    savePositions(positions);
  }

  function radius(body) {
    return Math.max(body.w, body.h) * 0.46;
  }

  function bounceWalls(body, bounds) {
    if (body.x <= 0) {
      body.x = 0;
      body.vx = Math.abs(body.vx) * WALL_RESTITUTION;
    } else if (body.x + body.w >= bounds.width) {
      body.x = Math.max(0, bounds.width - body.w);
      body.vx = -Math.abs(body.vx) * WALL_RESTITUTION;
    }

    if (body.y <= 0) {
      body.y = 0;
      body.vy = Math.abs(body.vy) * WALL_RESTITUTION;
    } else if (body.y + body.h >= bounds.height) {
      body.y = Math.max(0, bounds.height - body.h);
      body.vy = -Math.abs(body.vy) * WALL_RESTITUTION;
    }
  }

  function resolvePair(a, b) {
    const ax = a.x + a.w / 2;
    const ay = a.y + a.h / 2;
    const bx = b.x + b.w / 2;
    const by = b.y + b.h / 2;
    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.hypot(dx, dy) || 0.001;
    const minDist = radius(a) + radius(b);

    if (dist >= minDist) return;

    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist;

    a.x -= (nx * overlap) / 2;
    a.y -= (ny * overlap) / 2;
    b.x += (nx * overlap) / 2;
    b.y += (ny * overlap) / 2;

    const dvx = b.vx - a.vx;
    const dvy = b.vy - a.vy;
    const relVel = dvx * nx + dvy * ny;
    if (relVel > 0) return;

    const impulse = (-(1 + RESTITUTION) * relVel) / 2;
    a.vx -= impulse * nx;
    a.vy -= impulse * ny;
    b.vx += impulse * nx;
    b.vy += impulse * ny;
  }

  function anyMoving() {
    return bodies.some(
      (b) =>
        b.dragging ||
        Math.hypot(b.vx, b.vy) > STOP_SPEED
    );
  }

  let rafId = null;
  let lastSave = 0;

  function tick() {
    const bounds = sceneBounds();

    bodies.forEach(measure);

    bodies.forEach((body) => {
      if (body.dragging) return;

      body.x += body.vx;
      body.y += body.vy;
      body.vx *= FRICTION;
      body.vy *= FRICTION;

      if (Math.abs(body.vx) < STOP_SPEED) body.vx = 0;
      if (Math.abs(body.vy) < STOP_SPEED) body.vy = 0;
    });

    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        if (bodies[i].dragging && bodies[j].dragging) continue;
        resolvePair(bodies[i], bodies[j]);
      }
    }

    bodies.forEach((body) => {
      if (body.dragging) return;
      bounceWalls(body, bounds);
      applyTransform(body);
    });

    if (anyMoving()) {
      scene.classList.add("ispy__scene--active");
      rafId = requestAnimationFrame(tick);
    } else {
      scene.classList.remove("ispy__scene--active");
      rafId = null;
      persistPositions();
      lastSave = performance.now();
    }
  }

  function wakePhysics() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function throwVelocity(body) {
    const samples = body.samples;
    if (samples.length < 2) return { vx: 0, vy: 0 };

    const last = samples[samples.length - 1];
    let first = samples[0];
    for (let i = samples.length - 2; i >= 0; i--) {
      if (last.t - samples[i].t >= 50) {
        first = samples[i];
        break;
      }
    }

    const dt = (last.t - first.t) / 1000;
    if (dt <= 0) return { vx: 0, vy: 0 };

    const vx = ((last.x - first.x) / dt) * 0.045;
    const vy = ((last.y - first.y) / dt) * 0.045;
    const speed = Math.hypot(vx, vy);

    if (speed < THROW_MIN_SPEED) return { vx: 0, vy: 0 };
    const cap = 28;
    if (speed > cap) {
      return { vx: (vx / speed) * cap, vy: (vy / speed) * cap };
    }
    return { vx, vy };
  }

  bodies.forEach((body) => {
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartBodyX = 0;
    let dragStartBodyY = 0;
    let moved = false;

    body.el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;

      body.dragging = true;
      moved = false;
      body.samples = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
      body.vx = 0;
      body.vy = 0;

      body.el.setPointerCapture(e.pointerId);
      body.el.classList.add("is-dragging");

      dragStartX = e.clientX;
      dragStartY = e.clientY;
      dragStartBodyX = body.x;
      dragStartBodyY = body.y;

      e.preventDefault();
    });

    body.el.addEventListener("pointermove", (e) => {
      if (!body.dragging) return;

      const now = performance.now();
      body.samples.push({ x: e.clientX, y: e.clientY, t: now });
      if (body.samples.length > 12) body.samples.shift();

      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD) moved = true;

      const bounds = sceneBounds();
      body.x = clamp(dragStartBodyX + dx, 0, Math.max(0, bounds.width - body.w));
      body.y = clamp(dragStartBodyY + dy, 0, Math.max(0, bounds.height - body.h));
      applyTransform(body);
    });

    const endDrag = (e) => {
      if (!body.dragging) return;
      body.dragging = false;
      body.el.classList.remove("is-dragging");
      if (body.el.hasPointerCapture(e.pointerId)) {
        body.el.releasePointerCapture(e.pointerId);
      }

      const { vx, vy } = throwVelocity(body);
      body.vx = vx;
      body.vy = vy;
      body.samples = [];

      if (moved || Math.hypot(vx, vy) > THROW_MIN_SPEED) {
        persistPositions();
        body.el.addEventListener(
          "click",
          (ev) => {
            ev.preventDefault();
            ev.stopImmediatePropagation();
          },
          { capture: true, once: true }
        );
      }

      if (Math.hypot(vx, vy) > THROW_MIN_SPEED) {
        wakePhysics();
      }
    };

    body.el.addEventListener("pointerup", endDrag);
    body.el.addEventListener("pointercancel", endDrag);
  });

  initPositions();

  window.addEventListener("resize", () => {
    const bounds = sceneBounds();
    bodies.forEach((body) => {
      measure(body);
      body.x = clamp(body.x, 0, Math.max(0, bounds.width - body.w));
      body.y = clamp(body.y, 0, Math.max(0, bounds.height - body.h));
      applyTransform(body);
    });
    if (anyMoving()) wakePhysics();
  });
})();
