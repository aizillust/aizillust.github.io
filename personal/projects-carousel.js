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

    // Shared lightbox: click a thumbnail to open, and use prev/next/ESC to navigate.
    var lbCtrl = window.IllLightbox.create({
      ariaLabel: "Full size image",
      itemsLength: imgs.length,
      onRender: function (ctx) {
        var im = imgs[ctx.index];
        ctx.imgEl.src = lightboxSrc(im);
        ctx.imgEl.alt = im.alt || "";
      },
    });
    root.appendChild(lbCtrl.lb);
    imgs.forEach(function (im, index) {
      im.addEventListener("click", function () {
        lbCtrl.open(index);
      });
      im.setAttribute("tabindex", "0");
      im.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lbCtrl.open(index);
        }
      });
    });

    waitImages().then(function () {
      apply();
      requestAnimationFrame(apply);
    });
  }

  document.querySelectorAll(".project-strip-carousel").forEach(initCarousel);
})();
