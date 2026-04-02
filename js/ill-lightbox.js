/**
 * Shared full-screen lightbox (same UI across Illustration / Photography / Projects).
 *
 * Usage:
 *   const lbCtrl = window.IllLightbox.create({
 *     ariaLabel: 'Full size image',
 *     itemsLength: items.length,
 *     onRender: (ctx) => { ctx.imgEl.src = '...'; ctx.imgEl.alt = '...'; },
 *   });
 *
 *   root.appendChild(lbCtrl.lb);
 *   lbCtrl.open(index);
 */
(function () {
  function normalizeIndex(i, n) {
    if (!n) return 0;
    return ((i % n) + n) % n;
  }

  function buildMarkup() {
    const lb = document.createElement("div");
    lb.className = "ill-lightbox";
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.innerHTML =
      '<div class="ill-lightbox-backdrop" aria-hidden="true"></div>' +
      '<button type="button" class="ill-lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="ill-lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<div class="ill-lightbox-frame"><img class="ill-lightbox-img" src="" alt=""></div>' +
      '<button type="button" class="ill-lightbox-next" aria-label="Next image">&#8250;</button>';
    return lb;
  }

  function create(cfg) {
    const itemsLength = cfg && typeof cfg.itemsLength === "number" ? cfg.itemsLength : 0;
    const ariaLabel = (cfg && cfg.ariaLabel) || "Full size image";
    const onRender = (cfg && cfg.onRender) || function () {};

    const lb = buildMarkup();
    lb.setAttribute("aria-label", ariaLabel);

    const imgEl = lb.querySelector(".ill-lightbox-img");
    const btnClose = lb.querySelector(".ill-lightbox-close");
    const btnPrev = lb.querySelector(".ill-lightbox-prev");
    const btnNext = lb.querySelector(".ill-lightbox-next");
    const frame = lb.querySelector(".ill-lightbox-frame");
    const backdrop = lb.querySelector(".ill-lightbox-backdrop");

    let current = 0;

    function render() {
      onRender({ imgEl: imgEl, index: current });
    }

    function open(index) {
      current = normalizeIndex(index, itemsLength);
      render();
      lb.hidden = false;
      lb.setAttribute("aria-hidden", "false");
      document.documentElement.classList.add("ill-lightbox-open");
    }

    function close() {
      lb.hidden = true;
      lb.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("ill-lightbox-open");
    }

    function step(delta) {
      current = normalizeIndex(current + delta, itemsLength);
      render();
    }

    btnClose.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
    if (backdrop) {
      backdrop.addEventListener("click", close);
    }
    btnPrev.addEventListener("click", function (e) {
      e.stopPropagation();
      step(-1);
    });
    btnNext.addEventListener("click", function (e) {
      e.stopPropagation();
      step(1);
    });
    if (frame) {
      frame.addEventListener("click", function (e) {
        e.stopPropagation();
      });
    }

    // Keep keyboard behavior consistent with the previous implementations.
    document.addEventListener("keydown", function onKey(e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });

    return { lb: lb, open: open };
  }

  window.IllLightbox = {
    create: create,
  };
})();

