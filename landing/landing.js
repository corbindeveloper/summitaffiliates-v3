/* landing.js — all page behavior for landing/sbs.html
   Sections:
   1. Formlets embed configuration
   2. FAQ accordion
   3. Document lifecycle carousel
   4. Hero photo rotation
*/

/* ============================================================
   1. FORMLETS CONFIGURATION
   Paste the public Formlets EMBED URL between the quotes below. Do not paste iframe markup here.
   Example shape only: https://your-form-provider.example/your-embed-path
   Leave blank to show the clearly labeled placeholder. No information is collected until configured.
   The real Formlets page must permit iframe embedding. If it needs more vertical room,
   edit the .assessment-frame height in landing.css and its mobile rules.
   ============================================================ */
const FORMLETS_EMBED_URL =
  "https://formlets.com/forms/rSpkfg3JGrtlKug6/?iframe=true&nofocus=y";

// Points the assessment iframe at the configured Formlets URL and enables
// auto-resizing when the Formlets iframeResizer script is present.
if (FORMLETS_EMBED_URL.trim()) {
  const iframe = document.getElementById("formlets-frame");
  iframe.removeAttribute("srcdoc");
  iframe.src = FORMLETS_EMBED_URL.trim();
  iframe.title = "Summit free assessment form";
  if (window.iFrameResize) {
    iFrameResize({ log: false }, "#formlets-frame");
  }
}

/* ============================================================
   2. FAQ ACCORDION: open one answer at a time
   ============================================================ */
const faqButtons = Array.from(document.querySelectorAll(".faq-toggle"));

// Sets a FAQ button's expanded state, toggles its answer panel, and
// swaps the +/- indicator.
function setFAQState(button, expanded) {
  button.setAttribute("aria-expanded", String(expanded));
  document.getElementById(button.getAttribute("aria-controls")).hidden =
    !expanded;
  button.querySelector("span").textContent = expanded ? "−" : "+";
}

faqButtons.forEach((button, index) => {
  // Click toggles this answer open and closes all others.
  button.addEventListener("click", () => {
    const shouldOpen = button.getAttribute("aria-expanded") !== "true";
    faqButtons.forEach((other) => setFAQState(other, false));
    setFAQState(button, shouldOpen);
  });
  // Arrow keys, Home, and End move between FAQ buttons (roving focus).
  button.addEventListener("keydown", (event) => {
    let target;
    if (event.key === "ArrowDown") target = (index + 1) % faqButtons.length;
    if (event.key === "ArrowUp")
      target = (index - 1 + faqButtons.length) % faqButtons.length;
    if (event.key === "Home") target = 0;
    if (event.key === "End") target = faqButtons.length - 1;
    if (target !== undefined) {
      event.preventDefault();
      faqButtons[target].focus();
    }
  });
});

/* ============================================================
   3. DOCUMENT LIFECYCLE CAROUSEL
   Standalone carousel: no dependencies, no global navigation overrides.
   ============================================================ */
(() => {
  const roots = document.querySelectorAll(
    ".sta-lifecycle:not([data-sta-initialized])",
  );
  roots.forEach((root, instance) => {
    root.dataset.staInitialized = "true";
    const panels = Array.from(root.querySelectorAll(".sta-lc-panel"));
    const tabs = Array.from(root.querySelectorAll(".sta-lc-tab"));
    const books = Array.from(root.querySelectorAll(".sta-lc-book"));
    const shelf = root.querySelector(".sta-lc-shelf");
    const view = root.querySelector(".sta-lc-view");
    const next = root.querySelector(".sta-lc-next");
    const previous = root.querySelector(".sta-lc-prev");
    const peek = root.querySelector(".sta-lc-peek");
    const play = root.querySelector(".sta-lc-play");
    const fill = root.querySelector(".sta-lc-time-fill");
    const counter = root.querySelector(".sta-lc-counter");
    const announcement = root.querySelector(".sta-lc-announcement");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const small = window.matchMedia("(max-width: 540px)");
    const count = panels.length;
    if (count !== 4 || tabs.length !== count || books.length !== count) return;
    const duration = Math.max(6000, Number(root.dataset.interval) || 16000);
    let active = 0,
      playing = root.dataset.autoplay === "true" && !reduced.matches;
    let hovered = false,
      focused = false,
      inView = true,
      elapsed = 0,
      lastTime = 0,
      raf = 0;
    let changeVersion = 0,
      suppressClickUntil = 0;
    const prefix = "sta-lc-" + Date.now().toString(36) + "-" + instance;
    panels.forEach((panel, i) => {
      panel.id = prefix + "-panel-" + i;
      panel.setAttribute("aria-labelledby", prefix + "-tab-" + i);
      tabs[i].id = prefix + "-tab-" + i;
      tabs[i].setAttribute("aria-controls", panel.id);
    });

    // Positions each document card in the paper stack: slot 0 is the front
    // card, higher slots sit offset up/right behind it.
    function layoutBooks() {
      const slots = [
        { x: 0, y: 0, angle: 0, scale: 1, z: 5, opacity: 1 },
        { x: 15, y: -8, angle: 1, scale: 0.985, z: 4, opacity: 0.95 },
        { x: 30, y: -15, angle: 1.8, scale: 0.97, z: 3, opacity: 0.92 },
        { x: 42, y: -22, angle: 2.2, scale: 0.955, z: 2, opacity: 0.88 },
      ];
      books.forEach((book, i) => {
        const slot = (i - active + count) % count,
          position = slots[slot];
        book.dataset.slot = String(slot);
        book.style.setProperty("--sta-x", position.x + "px");
        book.style.setProperty("--sta-y", position.y + "px");
        book.style.setProperty("--sta-angle", position.angle + "deg");
        book.style.setProperty("--sta-scale", String(position.scale));
        book.style.setProperty("--sta-z", String(position.z));
        book.style.setProperty("--sta-opacity", String(position.opacity));
        book.setAttribute("aria-pressed", String(i === active));
      });
    }

    // Updates the stage counter, "up next" preview, and next-button label.
    function renderLabels() {
      const upcoming = (active + 1) % count;
      counter.textContent =
        "Stage " +
        String(active + 1).padStart(2, "0") +
        " of " +
        String(count).padStart(2, "0");
      peek.textContent =
        String(upcoming + 1).padStart(2, "0") +
        " · " +
        panels[upcoming].dataset.short +
        " →";
      next.textContent =
        (active === count - 1 ? "Restart: " : "Next: ") +
        panels[upcoming].dataset.short +
        " →";
      root.querySelector(".sta-lc-next-preview>span").textContent =
        active === count - 1 ? "Full circle" : "Up next";
    }

    // Syncs the play/pause button's label, icon, and pressed state, then
    // restarts or stops the progress clock to match.
    function refreshPlay() {
      play.setAttribute("aria-pressed", String(playing));
      play.querySelector(".sta-lc-play-label").textContent = playing
        ? "Pause tour"
        : "Play tour";
      play.querySelector(".sta-lc-play-icon").textContent = playing ? "Ⅱ" : "▶";
      syncClock();
    }

    // Switches the carousel to a stage: runs the panel transition, reorders
    // the paper stack, updates labels, and optionally stops autoplay.
    function go(index, direction = 1, manual = true) {
      const target = (index + count) % count;
      if (manual) {
        playing = false;
        refreshPlay();
      }
      if (target === active) return;
      const version = ++changeVersion;
      const old = panels[active],
        incoming = panels[target];
      panels.forEach((panel) =>
        panel.classList.remove(
          "is-exiting-forward",
          "is-exiting-backward",
          "is-entering-backward",
        ),
      );
      old.classList.add(
        direction < 0 ? "is-exiting-backward" : "is-exiting-forward",
      );
      incoming.classList.remove("is-active");
      if (direction < 0) incoming.classList.add("is-entering-backward");
      void incoming.offsetWidth;
      active = target;
      panels.forEach((panel, i) => {
        panel.classList.toggle("is-active", i === active);
        panel.setAttribute("aria-hidden", String(i !== active));
        panel.inert = i !== active;
        tabs[i].setAttribute("aria-selected", String(i === active));
        tabs[i].tabIndex = i === active ? 0 : -1;
      });
      incoming.classList.remove("is-entering-backward");
      layoutBooks();
      renderLabels();
      elapsed = 0;
      fill.style.transform = "scaleX(0)";
      if (manual)
        announcement.textContent =
          "Stage " +
          (active + 1) +
          " of " +
          count +
          ": " +
          panels[active].dataset.title;
      window.setTimeout(() => {
        if (version === changeVersion)
          panels.forEach((panel) =>
            panel.classList.remove("is-exiting-forward", "is-exiting-backward"),
          );
      }, 750);
    }

    // Whether autoplay may currently advance (playing, not hovered/focused,
    // tab visible, carousel on screen).
    function allowed() {
      return playing && !hovered && !focused && !document.hidden && inView;
    }

    // Starts or stops the requestAnimationFrame clock based on allowed().
    function syncClock() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      lastTime = 0;
      if (allowed()) raf = requestAnimationFrame(tick);
    }

    // Advances the progress bar each frame and moves to the next stage when
    // the elapsed time reaches the configured duration.
    function tick(time) {
      raf = 0;
      if (!allowed()) return;
      if (lastTime) elapsed += Math.min(time - lastTime, 100);
      lastTime = time;
      if (elapsed >= duration) go(active + 1, 1, false);
      fill.style.transform = "scaleX(" + Math.min(elapsed / duration, 1) + ")";
      raf = requestAnimationFrame(tick);
    }

    tabs.forEach((tab, i) => {
      // Clicking a stage tab jumps to that stage.
      tab.addEventListener("click", () => go(i, i < active ? -1 : 1));
      // Arrow keys, Home, and End navigate between stage tabs.
      tab.addEventListener("keydown", (event) => {
        let target;
        if (event.key === "ArrowRight") target = (i + 1) % count;
        if (event.key === "ArrowLeft") target = (i - 1 + count) % count;
        if (event.key === "Home") target = 0;
        if (event.key === "End") target = count - 1;
        if (target !== undefined) {
          event.preventDefault();
          go(target, target < i ? -1 : 1);
          tabs[target].focus();
        }
      });
    });

    // Clicking a paper card jumps to that card's stage (unless the click is
    // the tail end of a swipe).
    books.forEach((book, i) =>
      book.addEventListener("click", () => {
        if (performance.now() >= suppressClickUntil)
          go(i, (i - active + count) % count === 3 ? -1 : 1);
      }),
    );

    next.addEventListener("click", () => go(active + 1, 1));
    previous.addEventListener("click", () => go(active - 1, -1));
    peek.addEventListener("click", () => go(active + 1, 1));

    // Play/pause toggle for the guided tour.
    play.addEventListener("click", () => {
      playing = !playing;
      refreshPlay();
    });

    // Pause autoplay while the pointer is over the carousel (not touch).
    view.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") {
        hovered = true;
        syncClock();
      }
    });
    view.addEventListener("pointerleave", () => {
      hovered = false;
      syncClock();
    });

    // Pause autoplay while keyboard focus is inside the carousel.
    view.addEventListener("focusin", () => {
      focused = true;
      syncClock();
    });
    view.addEventListener("focusout", () =>
      setTimeout(() => {
        focused = view.contains(document.activeElement);
        syncClock();
      }, 0),
    );

    // Touch swipe: horizontal drags past a threshold change stage and
    // suppress the synthetic click that follows.
    let startX = 0,
      startY = 0,
      touchActive = false;
    shelf.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "touch") {
        startX = event.clientX;
        startY = event.clientY;
        touchActive = true;
      }
    });
    shelf.addEventListener("pointerup", (event) => {
      if (!touchActive) return;
      touchActive = false;
      const dx = event.clientX - startX,
        dy = event.clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.35) {
        suppressClickUntil = performance.now() + 500;
        go(active + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
      }
    });
    shelf.addEventListener("pointercancel", () => {
      touchActive = false;
    });

    document.addEventListener("visibilitychange", syncClock);

    // Pause the tour while the carousel is scrolled out of view.
    if ("IntersectionObserver" in window)
      new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
          syncClock();
        },
        { threshold: 0.12 },
      ).observe(root);

    // Re-layout the paper stack when crossing the mobile breakpoint, and
    // stop the tour if the user enables reduced motion.
    small.addEventListener("change", layoutBooks);
    reduced.addEventListener("change", () => {
      if (reduced.matches) {
        playing = false;
        refreshPlay();
      }
    });

    panels.forEach((panel, i) => {
      panel.setAttribute("aria-hidden", String(i !== 0));
      panel.inert = i !== 0;
    });
    layoutBooks();
    renderLabels();
    root.classList.add("is-ready");
    refreshPlay();
  });
})();

/* ============================================================
   4. HERO PHOTO ROTATION
   Crossfades through the hero images every 6 seconds. Pauses on
   hover/focus and when the tab is hidden; disabled entirely under
   prefers-reduced-motion.
   ============================================================ */
(function () {
  var figure = document.querySelector(".hero-photo");
  if (!figure) return;
  var imgs = Array.prototype.slice.call(figure.querySelectorAll("img"));
  if (imgs.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var index = 0;
  var timer = null;

  // Fades out the current slide and fades in the next one.
  function showNext() {
    imgs[index].classList.remove("is-active");
    index = (index + 1) % imgs.length;
    imgs[index].classList.add("is-active");
  }

  // Starts the rotation interval if it isn't already running.
  function start() {
    if (!timer) timer = setInterval(showNext, 6000);
  }

  // Stops the rotation interval if it is running.
  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  figure.addEventListener("mouseenter", stop);
  figure.addEventListener("mouseleave", start);
  figure.addEventListener("focusin", stop);
  figure.addEventListener("focusout", start);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stop();
    else start();
  });
  start();
})();
