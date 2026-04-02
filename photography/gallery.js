(function () {
  const categories = window.PHOTO_CATEGORIES;
  const discoveryCfg = window.PHOTO_DISCOVERY || {};
  if (!categories || !categories.length) return;

  // Expected file format:
  //   photography/<categoryKey>/<n>.<ext>
  const exts = Array.isArray(discoveryCfg.exts) && discoveryCfg.exts.length ? discoveryCfg.exts : ["jpg", "jpeg", "png", "webp"];
  const startIndex = typeof discoveryCfg.startIndex === "number" ? discoveryCfg.startIndex : 1;
  const maxIndex = typeof discoveryCfg.maxIndex === "number" ? discoveryCfg.maxIndex : 80;
  const consecutiveMissingStop =
    typeof discoveryCfg.consecutiveMissingStop === "number"
      ? discoveryCfg.consecutiveMissingStop
      : 6;
  const loadTimeoutMs = typeof discoveryCfg.loadTimeoutMs === "number" ? discoveryCfg.loadTimeoutMs : 900;

  function debounce(fn, ms) {
    let t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, ms);
    };
  }

  function imageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const timeout = window.setTimeout(() => {
        if (done) return;
        done = true;
        resolve(false);
      }, loadTimeoutMs);

      img.onload = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timeout);
        resolve(true);
      };
      img.onerror = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timeout);
        resolve(false);
      };
      img.src = src;
    });
  }

  function mediaPath(categoryKey, file) {
    // Runs from /photography/ page, so relative is correct.
    return "./" + categoryKey + "/" + file;
  }

  async function discoverItems(categoryKey, title) {
    const items = [];
    let missingStreak = 0;

    for (let n = startIndex; n <= maxIndex; n++) {
      let foundExt = null;
      const checks = exts.map(function (ext) {
        const src = mediaPath(categoryKey, String(n) + "." + ext);
        return imageExists(src).then(function (ok) {
          return ok ? ext : null;
        });
      });

      const results = await Promise.all(checks);
      foundExt = results.find(function (x) {
        return !!x;
      }) || null;

      if (foundExt) {
        items.push({
          file: String(n) + "." + foundExt,
          alt: title + " " + n,
        });
        missingStreak = 0;
      } else {
        missingStreak++;
        if (missingStreak >= consecutiveMissingStop) break;
      }
    }

    return items;
  }

  function buildMasonryGallery(root, items, categoryKey) {
    root.innerHTML = "";
    if (!items.length) return null;

    const wrap = document.createElement("div");
    wrap.className = "ill-masonry";
    const lbCtrl = window.IllLightbox.create({
      ariaLabel: "Full size photograph",
      itemsLength: items.length,
      onRender: function (ctx) {
        const item = items[ctx.index];
        ctx.imgEl.src = mediaPath(categoryKey, item.file);
        ctx.imgEl.alt = item.alt || "";
      },
    });
    const { open } = lbCtrl;

    items.forEach((item, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "ill-tile-btn";
      btn.setAttribute("aria-label", "View larger: " + (item.alt || "photograph"));

      const im = document.createElement("img");
      im.src = mediaPath(categoryKey, item.file);
      im.alt = item.alt || "";
      im.loading = index < 4 ? "eager" : "lazy";
      btn.appendChild(im);

      btn.addEventListener("click", () => open(index));
      wrap.appendChild(btn);
    });

    root.appendChild(wrap);
    root.appendChild(lbCtrl.lb);
    return { open };
  }

  function initStripCarousel(stripEl, items, categoryKey, openAtIndex) {
    if (!stripEl || !items.length) return;

    const viewport = stripEl.querySelector(".project-strip-viewport");
    const track = stripEl.querySelector(".project-strip-track");
    const prevBtn = stripEl.querySelector(".project-strip-prev");
    const nextBtn = stripEl.querySelector(".project-strip-next");
    if (!viewport || !track) return;

    track.innerHTML = "";
    const imgs = [];

    items.forEach((item, index) => {
      const img = document.createElement("img");
      img.src = mediaPath(categoryKey, item.file);
      img.alt = item.alt || "";
      img.loading = index < 3 ? "eager" : "lazy";
      img.addEventListener("click", function () {
        openAtIndex(index);
      });
      imgs.push(img);
      track.appendChild(img);
    });

    let index = 0;
    const start = stripEl.getAttribute("data-start-index");
    if (start && !isNaN(parseInt(start, 10))) index = parseInt(start, 10);

    function parseGapPx() {
      const g = getComputedStyle(track).gap;
      if (g && g.endsWith("px")) return parseFloat(g);
      return 8;
    }

    function centerOffset() {
      const vw = viewport.clientWidth;
      const widths = imgs.map(function (img) {
        return img.getBoundingClientRect().width;
      });
      if (widths.some(function (w) { return w < 1; })) return null;

      let left = 0;
      for (let j = 0; j < index; j++) {
        left += widths[j] + parseGapPx();
      }
      const itemCenter = left + widths[index] / 2;
      const viewportCenter = vw / 2;
      return viewportCenter - itemCenter;
    }

    function apply() {
      const tx = centerOffset();
      if (tx === null) return;
      track.style.transform = "translateX(" + tx + "px)";
    }

    function normalize(i) {
      return ((i % imgs.length) + imgs.length) % imgs.length;
    }

    function setIndex(i) {
      index = normalize(i);
      apply();
    }

    if (prevBtn) prevBtn.addEventListener("click", function () { setIndex(index - 1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { setIndex(index + 1); });

    window.addEventListener("resize", debounce(apply, 120));

    function waitImages() {
      const pending = imgs.map(function (img) {
        if (img.complete) return Promise.resolve();
        return new Promise(function (resolve) {
          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        });
      });
      return Promise.all(pending);
    }

    waitImages().then(function () {
      // Start centered on the configured slide.
      setIndex(index);
      requestAnimationFrame(apply);
    });
  }

  document.addEventListener("DOMContentLoaded", async function () {
    // Build each category independently so one missing set doesn't break the whole page.
    for (let ci = 0; ci < categories.length; ci++) {
      const cat = categories[ci];
      const categoryKey = cat.key;
      const title = cat.title || categoryKey;

      const stripEl = document.getElementById("photo-" + categoryKey + "-strip-root");
      const galleryEl = document.getElementById("photo-" + categoryKey + "-gallery-root");
      if (!stripEl || !galleryEl) continue;

      const items = await discoverItems(categoryKey, title);
      if (!items.length) {
        stripEl.style.display = "none";
        galleryEl.style.display = "none";
        continue;
      }

      const gallery = buildMasonryGallery(galleryEl, items, categoryKey);
      if (!gallery) continue;

      initStripCarousel(stripEl, items, categoryKey, gallery.open);
    }
  });
})();

