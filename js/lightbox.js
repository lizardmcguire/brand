// Lightbox for the creative collage (design: Figma frame "CreativeLightbox").
// Click a tile to open it large with its description; arrows / ← → keys / swipe
// move between images; Esc, the close button, clicking the empty space, or the
// browser Back button closes it.
(function () {
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.collage .tile'));
  if (!tiles.length) return;

  var chevron = '<svg viewBox="0 0 28 28" width="28" height="28" aria-hidden="true">' +
    '<path d="M10.5 5.25 19.25 14l-8.75 8.75" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Image viewer');
  box.hidden = true;
  box.innerHTML =
    '<button class="lb-close" type="button" aria-label="Close">Close</button>' +
    '<button class="lb-prev" type="button" aria-label="Previous image">' + chevron + '</button>' +
    '<div class="lb-stage"><figure class="lb-figure">' +
      '<img class="lb-img" alt="">' +
      '<figcaption class="lb-caption"></figcaption>' +
    '</figure></div>' +
    '<button class="lb-next" type="button" aria-label="Next image">' + chevron + '</button>' +
    '<p class="lb-count" aria-live="polite"></p>';
  document.body.appendChild(box);

  var img = box.querySelector('.lb-img');
  var caption = box.querySelector('.lb-caption');
  var count = box.querySelector('.lb-count');
  var current = -1;
  var lastFocus = null;

  function show(i) {
    current = (i + tiles.length) % tiles.length;
    var t = tiles[current];
    var thumb = t.querySelector('img');
    img.src = t.getAttribute('href');
    img.alt = thumb ? thumb.alt : '';
    var d = t.getAttribute('data-description') || '';
    caption.textContent = d;
    caption.hidden = !d;
    count.textContent = (current + 1) + ' / ' + tiles.length;
    // preload neighbours so arrows feel instant
    [current + 1, current - 1].forEach(function (n) {
      var p = new Image(); p.src = tiles[(n + tiles.length) % tiles.length].getAttribute('href');
    });
  }

  function open(i) {
    lastFocus = document.activeElement;
    show(i);
    box.hidden = false;
    document.documentElement.classList.add('lb-open');
    if (!history.state || !history.state.lightbox) history.pushState({ lightbox: true }, '');
    box.querySelector('.lb-next').focus({ preventScroll: true });
  }

  function close(fromHistory) {
    if (box.hidden) return;
    box.hidden = true;
    document.documentElement.classList.remove('lb-open');
    img.removeAttribute('src');
    if (!fromHistory && history.state && history.state.lightbox) history.back();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }

  tiles.forEach(function (t, i) {
    t.addEventListener('click', function (e) {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let people open the image in a new tab
      e.preventDefault();
      open(i);
    });
  });

  box.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  box.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  box.querySelector('.lb-close').addEventListener('click', function () { close(false); });
  box.addEventListener('click', function (e) {
    // clicking empty space (not the image, caption or buttons) closes
    if (e.target === box || e.target.classList.contains('lb-stage') || e.target.classList.contains('lb-figure')) close(false);
  });

  document.addEventListener('keydown', function (e) {
    if (box.hidden) return;
    if (e.key === 'Escape') close(false);
    else if (e.key === 'ArrowRight') show(current + 1);
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'Tab') {
      // keep keyboard focus inside the viewer
      var f = Array.prototype.slice.call(box.querySelectorAll('button'));
      var idx = f.indexOf(document.activeElement);
      if (e.shiftKey && idx <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && idx === f.length - 1) { e.preventDefault(); f[0].focus(); }
    }
  });

  window.addEventListener('popstate', function () { close(true); });

  // swipe left/right on touch screens
  var startX = null, startY = null;
  box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; startY = e.touches[0].clientY; }, { passive: true });
  box.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX, dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    startX = startY = null;
  }, { passive: true });
})();
