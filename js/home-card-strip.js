(function () {
  function parseGapPx(track) {
    var g = getComputedStyle(track).gap;
    if (g && g.endsWith("px")) return parseFloat(g);
    return 12;
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function centerOffset(viewport, items, index, gap) {
    var vw = viewport.clientWidth;
    var widths = items.map(function (el) {
      return el.getBoundingClientRect().width;
    });
    if (widths.some(function (w) { return w < 1; })) return null;

    var left = 0;
    for (var j = 0; j < index; j++) {
      left += widths[j] + gap;
    }
    var itemCenter = left + widths[index] / 2;
    var viewportCenter = vw / 2;
    return viewportCenter - itemCenter;
  }

  function init(root) {
    var viewport = root.querySelector(".home-card-strip-viewport");
    var track = root.querySelector(".home-card-strip-track");
    var items = Array.prototype.slice.call(track.querySelectorAll(".home-card-slide"));
    var prevBtn = root.querySelector(".home-card-strip-prev");
    var nextBtn = root.querySelector(".home-card-strip-next");
    if (!viewport || !track || items.length === 0) return;

    var index = 0;
    var start = root.getAttribute("data-start-index");
    if (start && !isNaN(parseInt(start, 10))) index = parseInt(start, 10);

    function apply() {
      var gap = parseGapPx(track);
      var tx = centerOffset(viewport, items, index, gap);
      if (tx === null) return;
      track.style.transform = "translateX(" + tx + "px)";
    }

    function normalize(i) {
      var n = items.length;
      return ((i % n) + n) % n;
    }

    function setIndex(i) {
      index = normalize(i);
      apply();
    }

    if (prevBtn) prevBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setIndex(index - 1);
    });
    if (nextBtn) nextBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      setIndex(index + 1);
    });

    window.addEventListener("resize", debounce(apply, 120));

    // Wait for images so widths are stable before the initial snap.
    var promises = items.map(function (item) {
      var imgs = item.querySelectorAll("img");
      if (!imgs || !imgs.length) return Promise.resolve();
      var inner = Array.prototype.slice.call(imgs).map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
      return Promise.all(inner);
    });

    Promise.all(promises).then(function () {
      apply();
      requestAnimationFrame(apply);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice
      .call(document.querySelectorAll(".home-card-strip-carousel"))
      .forEach(init);
  });
})();

