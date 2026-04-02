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

  function setupLightbox(root, lb) {
    const img = lb.querySelector('.ill-lightbox-img');
    const btnClose = lb.querySelector('.ill-lightbox-close');
    const btnPrev = lb.querySelector('.ill-lightbox-prev');
    const btnNext = lb.querySelector('.ill-lightbox-next');
    let current = 0;

    function normalize(i) {
      return ((i % items.length) + items.length) % items.length;
    }

    function render() {
      const item = items[current];
      img.src = mediaPath(item.file, false);
      img.alt = item.alt || '';
    }

    function open(index) {
      current = normalize(index);
      render();
      lb.hidden = false;
      lb.setAttribute('aria-hidden', 'false');
      document.documentElement.classList.add('ill-lightbox-open');
    }

    function close() {
      lb.hidden = true;
      lb.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('ill-lightbox-open');
    }

    function step(delta) {
      current = normalize(current + delta);
      render();
    }

    btnClose.addEventListener('click', (e) => {
      e.stopPropagation();
      close();
    });
    const backdrop = lb.querySelector('.ill-lightbox-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', close);
    }
    btnPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      step(-1);
    });
    btnNext.addEventListener('click', (e) => {
      e.stopPropagation();
      step(1);
    });
    const frame = lb.querySelector('.ill-lightbox-frame');
    if (frame) {
      frame.addEventListener('click', (e) => e.stopPropagation());
    }

    document.addEventListener('keydown', function onKey(e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'ArrowRight') step(1);
    });

    return { open, close };
  }

  function buildFullPage(root) {
    const wrap = document.createElement('div');
    wrap.className = 'ill-masonry';

    const lb = document.createElement('div');
    lb.className = 'ill-lightbox';
    lb.hidden = true;
    lb.setAttribute('aria-hidden', 'true');
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Full size illustration');
    lb.innerHTML =
      '<div class="ill-lightbox-backdrop" aria-hidden="true"></div>' +
      '<button type="button" class="ill-lightbox-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="ill-lightbox-prev" aria-label="Previous image">&#8249;</button>' +
      '<div class="ill-lightbox-frame"><img class="ill-lightbox-img" src="" alt=""></div>' +
      '<button type="button" class="ill-lightbox-next" aria-label="Next image">&#8250;</button>';

    const { open } = setupLightbox(root, lb);

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
    root.appendChild(lb);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const preview = document.getElementById('ill-preview-root');
    const full = document.getElementById('ill-gallery-root');
    if (preview) buildPreview(preview);
    if (full) buildFullPage(full);
  });
})();
