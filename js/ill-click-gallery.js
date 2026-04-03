/**
 * Click-to-lightbox for direct child <img> nodes (no strip carousel).
 * Use: <div data-ill-click-gallery aria-label="Description">...</div>
 */
(function () {
  function init(root) {
    var imgs = Array.prototype.slice.call(root.querySelectorAll(":scope > img"));
    if (!imgs.length || !window.IllLightbox) return;

    var label = root.getAttribute("aria-label") || "Full size image";
    var lbCtrl = window.IllLightbox.create({
      ariaLabel: label,
      itemsLength: imgs.length,
      onRender: function (ctx) {
        var im = imgs[ctx.index];
        ctx.imgEl.src = im.currentSrc || im.src;
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
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-ill-click-gallery]").forEach(init);
  });
})();
