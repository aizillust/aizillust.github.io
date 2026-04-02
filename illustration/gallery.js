(function () {
  const items = window.ILL_GALLERY_ITEMS;
  if (!items || !items.length) return;

  function mediaPath(file, preview) {
    return (preview ? '../illustration/images/' : 'images/') + file;
  }

  function buildPreview(root) {
    root.classList.add('ill-masonry-preview');
    items.forEach((item, index) => {
      const a = document.createElement('a');
      a.className = 'ill-tile-link';
      a.href = '../illustration/index.html';
      const img = document.createElement('img');
      img.src = mediaPath(item.file, true);
      img.alt = item.alt || '';
      img.loading = 'lazy';
      a.appendChild(img);
      root.appendChild(a);
    });
  }

  function buildFullPage(root) {
    const wrap = document.createElement('div');
    wrap.className = 'ill-masonry';

    const lbCtrl = window.IllLightbox.create({
      ariaLabel: 'Full size illustration',
      itemsLength: items.length,
      onRender: ({ imgEl, index }) => {
        const item = items[index];
        imgEl.src = mediaPath(item.file, false);
        imgEl.alt = item.alt || '';
      },
    });
    const { open } = lbCtrl;

    items.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ill-tile-btn';
      btn.setAttribute('aria-label', 'View larger: ' + (item.alt || 'illustration'));
      const im = document.createElement('img');
      im.src = mediaPath(item.file, false);
      im.alt = item.alt || '';
      im.loading = index < 4 ? 'eager' : 'lazy';
      btn.appendChild(im);
      btn.addEventListener('click', () => open(index));
      wrap.appendChild(btn);
    });

    root.appendChild(wrap);
    root.appendChild(lbCtrl.lb);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const preview = document.getElementById('ill-preview-root');
    const full = document.getElementById('ill-gallery-root');
    if (preview) buildPreview(preview);
    if (full) buildFullPage(full);
  });
})();
