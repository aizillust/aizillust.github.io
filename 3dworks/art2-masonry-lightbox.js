/**
 * Lightbox for the Learning Blender (Art 2) masonry gallery under 3dworks/.
 * Strip carousel uses ../personal/projects-carousel.js + IllLightbox separately.
 */
(function () {
  function init(root) {
    var btns = root.querySelectorAll("button.ill-tile-btn");
    var imgs = Array.prototype.map.call(btns, function (b) {
      return b.querySelector("img");
    }).filter(Boolean);
    if (!imgs.length || !window.IllLightbox) return;

    var lbCtrl = window.IllLightbox.create({
      ariaLabel: "Full size Blender project image",
      itemsLength: imgs.length,
      onRender: function (ctx) {
        var im = imgs[ctx.index];
        ctx.imgEl.src = im.getAttribute("src");
        ctx.imgEl.alt = im.alt || "";
      },
    });
    root.appendChild(lbCtrl.lb);

    btns.forEach(function (btn, index) {
      btn.addEventListener("click", function () {
        lbCtrl.open(index);
      });
      btn.setAttribute("tabindex", "0");
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          lbCtrl.open(index);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("blender-art2-masonry-root");
    if (root) init(root);
  });
})();
