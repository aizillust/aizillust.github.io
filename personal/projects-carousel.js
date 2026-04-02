/**
 * Horizontal strip carousels: uniform height, variable widths, active slide centered.
 * Click any slide to open the shared-pattern lightbox (same UI as Animation & Illustration gallery).
 * Optional: set data-full-src on an <img> to show a larger file in the lightbox while keeping a smaller src in the strip.
 */
(function () {
  function parseGapPx(track) {
    const g = getComputedStyle(track).gap;
    if (g && g.endsWith("px")) return parseFloat(g);
    return 8;
  }

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function centerOffset(viewport, imgs, index, gap) {
    const vw = viewport.clientWidth;
    const widths = imgs.map(function (img) {
      return img.getBoundingClientRect().width;
    });
    if (widths.some(function (w) {
      return w < 1;
    })) return null;

    var left = 0;
    for (var j = 0; j < index; j++) {
      left += widths[j] + gap;
    }
    var slideCenter = left + widths[index] / 2;
    var viewportCenter = vw / 2;
    return viewportCenter - slideCenter;
  }

  function lightboxSrc(im) {
    var full = im.getAttribute("data-full-src");
    return full && full.trim() ? full.trim() : im.src;
  }

  function setupStripLightbox(lb, imgs) {
    var imgEl = lb.querySelector(".ill-lightbox-img");
    var btnClose = lb.querySelector(".ill-lightbox-close");
    var btnPrev = lb.querySelector(".ill-lightbox-prev");
    var btnNext = lb.querySelector(".ill-lightbox-next");
    var backdrop = lb.querySelector(".ill-lightbox-backdrop");
    var frame = lb.querySelector(".ill-lightbox-frame");
    var current = 0;

    function normalize(i) {
      var n = imgs.length;
      if (n === 0) return 0;
      return ((i % n) + n) % n;
    }

    function render() {
      var im = imgs[current];
      imgEl.src = lightboxSrc(im);
      imgEl.alt = im.alt || "";
    }

    function open(index) {
      current = normalize(index);
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
      current = normalize(current + delta);
      render();
    }

    btnClose.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
    if (backdrop) backdrop.addEventListener("click", close);
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

    document.addEventListener("keydown", function onKey(e) {
      if (lb.hidden) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });

    imgs.forEach(function (im, index) {
      im.addEventListener("click", function () {
        open(index);
      });
      im.setAttribute("tabindex", "0");
      im.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(index);
        }
      });
    });
  }

  function initCarousel(root) {
    var viewport = root.querySelector(".project-strip-viewport");
    var track = root.querySelector(".project-strip-track");
    var imgs = Array.prototype.slice.call(track.querySelectorAll("img"));
    var prevBtn = root.querySelector(".project-strip-prev");
    var nextBtn = root.querySelector(".project-strip-next");
    if (!viewport || !track || imgs.length === 0) return;

    var index = 0;
    var start = root.getAttribute("data-start-index");
    if (start && !isNaN(parseInt(start, 10))) index = parseInt(start, 10);

    function apply() {
      var gap = parseGapPx(track);
      var tx = centerOffset(viewport, imgs, index, gap);
      if (tx === null) return;
      track.style.transform = "translateX(" + tx + "px)";
    }

    function setIndex(i) {
      var n = imgs.length;
      index = ((i % n) + n) % n;
      apply();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () {
      setIndex(index - 1);
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      setIndex(index + 1);
    });

    window.addEventListener("resize", debounce(apply, 120));

    function waitImages() {
      var pending = imgs.map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
      return Promise.all(pending);
    }

    var lb = document.createElement("div");
    lb.className = "ill-lightbox";
    lb.hidden = true;
    lb.setAttribute("aria-hidden", "true");
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", "Full size image");
    lb.innerHTML =
      '<div class="ill-lightbox-backdrop" aria-hidden="true"></div>' +
      '<button type="button" class="ill-lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="ill-lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<div class="ill-lightbox-frame"><img class="ill-lightbox-img" src="" alt=""></div>' +
      '<button type="button" class="ill-lightbox-next" aria-label="Next image">&#8250;</button>';
    root.appendChild(lb);
    setupStripLightbox(lb, imgs);

    waitImages().then(function () {
      apply();
      requestAnimationFrame(apply);
    });
  }

  document.querySelectorAll(".project-strip-carousel").forEach(initCarousel);
})();
