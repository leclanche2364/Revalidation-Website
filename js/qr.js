// Revalidation Copilot: "scan to get the app" QR code for desktop readers.
// Phones and tablets are left untouched: the script returns before doing anything.
//
// Two placements, both desktop only:
//   1. Inline, inside every end-of-post .cta-box (the moment of intent).
//   2. A small card in the empty right-hand margin, shown while reading,
//      only when the margin is wide enough, hidden while a .cta-box is on
//      screen (so two codes never show at once), and dismissible for 30 days.
// Scans are counted by /get, which logs them before sending the phone to its store.

(function () {
  var desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  if (!desktop.matches) return;

  var ctaBoxes = Array.prototype.filter.call(document.querySelectorAll('.cta-box'), function (el) {
    return !el.parentElement.closest('.cta-box');
  });
  if (!ctaBoxes.length) return;

  var DISMISS_KEY = 'rc_qr_card_dismissed';
  var DISMISS_DAYS = 30;
  var CARD_WIDTH = 200;
  var MIN_MARGIN = CARD_WIDTH + 48;

  var css = [
    '.rc-qr-inline{display:flex;align-items:center;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(24,50,71,.12);text-align:left}',
    '.rc-qr-inline img{width:128px;height:128px;flex:none;background:#fff;border-radius:8px;border:1px solid rgba(24,50,71,.12)}',
    '.rc-qr-inline p{margin:0;font-size:.95rem;line-height:1.45;color:inherit}',
    '.rc-qr-inline strong{display:block;margin-bottom:2px}',
    '.rc-qr-card{position:fixed;top:120px;z-index:50;width:' + CARD_WIDTH + 'px;box-sizing:border-box;padding:16px;background:#fff;border:1px solid rgba(24,50,71,.14);border-radius:14px;box-shadow:0 8px 24px rgba(24,50,71,.10);font-family:inherit;color:#183247;text-align:center;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .25s,transform .25s,visibility .25s}',
    '.rc-qr-card.is-visible{opacity:1;visibility:visible;transform:none}',
    '.rc-qr-card .rc-qr-title{margin:0 0 10px;padding:0 18px;font-size:1rem;line-height:1.3;font-weight:700;color:#183247}',
    '.rc-qr-card img{display:block;width:152px;height:152px;margin:0 auto 10px}',
    '.rc-qr-card p{margin:0;font-size:.85rem;line-height:1.4;color:#475569}',
    '.rc-qr-card .rc-qr-free{margin-top:6px;font-weight:600;color:#0aa37f}',
    '.rc-qr-card a{color:#183247}',
    '.rc-qr-close{position:absolute;top:6px;right:6px;width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:#64748b;font-size:18px;line-height:1;cursor:pointer}',
    '.rc-qr-close:hover{background:#f1f5f9;color:#183247}',
    '.rc-qr-close:focus-visible,.rc-qr-card a:focus-visible{outline:3px solid #0aa37f;outline-offset:2px}',
    '@media (prefers-reduced-motion: reduce){.rc-qr-card{transition:none}}',
    '@media print{.rc-qr-card,.rc-qr-inline{display:none}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // 1. Inline QR in every end-of-post call to action.
  ctaBoxes.forEach(function (box) {
    var block = document.createElement('div');
    block.className = 'rc-qr-inline';
    block.innerHTML =
      '<img src="/images/qr-blog-cta.svg" alt="QR code: scan with your phone camera to download Revalidation Copilot" width="128" height="128" loading="lazy">' +
      '<p><strong>Reading on a computer?</strong>Point your phone\'s camera at this code to get the app. Free on iPhone and Android.</p>';
    box.appendChild(block);
  });

  // 2. Margin card.
  function dismissedRecently() {
    try {
      var t = Number(localStorage.getItem(DISMISS_KEY));
      return t && Date.now() - t < DISMISS_DAYS * 864e5;
    } catch (e) { return false; }
  }
  if (dismissedRecently()) return;

  var card = document.createElement('aside');
  card.className = 'rc-qr-card';
  card.setAttribute('aria-label', 'Get the app on your phone');
  card.innerHTML =
    '<button type="button" class="rc-qr-close" aria-label="Hide this">&times;</button>' +
    '<p class="rc-qr-title">Get the app on your phone</p>' +
    '<img src="/images/qr-blog-sidebar.svg" alt="QR code: scan with your phone camera to download Revalidation Copilot" width="152" height="152" loading="lazy">' +
    '<p>Point your phone\'s camera at the code.</p>' +
    '<p class="rc-qr-free">Free on iPhone and Android</p>';
  document.body.appendChild(card);

  var ctaOnScreen = false;
  var closed = false;

  function place() {
    // The free margin is whatever sits to the right of the article column.
    var margin = window.innerWidth - ctaBoxes[0].getBoundingClientRect().right;
    if (margin < MIN_MARGIN) return false;
    card.style.right = Math.max(24, Math.round((margin - CARD_WIDTH) / 2)) + 'px';
    return true;
  }

  function update() {
    var show = !closed && desktop.matches && !ctaOnScreen &&
      window.scrollY > window.innerHeight * 0.8 && place();
    card.classList.toggle('is-visible', show);
  }

  if ('IntersectionObserver' in window) {
    var onScreen = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) onScreen.add(e.target); else onScreen.delete(e.target);
      });
      ctaOnScreen = onScreen.size > 0;
      update();
    });
    ctaBoxes.forEach(function (box) { io.observe(box); });
  }

  card.querySelector('.rc-qr-close').addEventListener('click', function () {
    closed = true;
    update();
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch (e) {}
  });

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
