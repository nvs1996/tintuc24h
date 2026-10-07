(function () {
  var trigger = document.getElementById('tiktok-gate-trigger');
  if (!trigger) return;

  var tiktokLink = trigger.dataset.tiktokLink;
  var tiktokId = trigger.dataset.tiktokId;
  var wrapper = document.getElementById('article-content-wrapper');
  var overlay = document.getElementById('tiktok-gate-overlay');
  var actionButtons = overlay ? overlay.querySelectorAll('.tiktok-gate-action') : [];

  if (!tiktokLink || !wrapper || !overlay || !actionButtons.length) return;

  wrapper.classList.add('is-gated');

  setTimeout(function () {
    overlay.style.display = 'flex';
  }, 2000);

  actionButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (tiktokId) {
        var url = '/api/tiktok-click/' + tiktokId;
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url);
        } else {
          fetch(url, { method: 'POST', keepalive: true });
        }
      }
      window.open(tiktokLink, '_blank', 'noopener');
      overlay.style.display = 'none';
      wrapper.classList.remove('is-gated');
    });
  });
})();

(function () {
  var main = document.querySelector('.featured__main');
  var secondary = document.querySelector('.featured__secondary');
  if (!main || !secondary) return;

  var STACK_BREAKPOINT = 700; // matches the .featured__grid single-column breakpoint

  function syncHeight() {
    if (window.innerWidth <= STACK_BREAKPOINT) {
      secondary.style.maxHeight = '';
      return;
    }
    secondary.style.maxHeight = main.offsetHeight + 'px';
  }

  syncHeight();
  window.addEventListener('resize', syncHeight);
  window.addEventListener('load', syncHeight);
})();
