// Revalidation Copilot: "scan to get the app" QR code for desktop readers.
// Phones and tablets are left untouched: the script returns before doing anything.
//
// Three pieces, all desktop only:
//   0. A "web app coming soon" pop-up when a reader clicks a download link,
//      with a QR code to start on her phone today, instead of sending her
//      to phone store pages she cannot use from a laptop.
//   1. Inline, inside every end-of-post .cta-box (the moment of intent).
//   2. A small card in the empty right-hand margin, shown while reading,
//      only when the margin is wide enough, hidden while a .cta-box is on
//      screen (so two codes never show at once), and dismissible for 30 days.
// Scans are counted by /get, which logs them before sending the phone to its store.
// Impressions (a QR at least half on screen, once per placement per page view) are
// logged here for experiment exp_qr_desktop_2026-10-06. Impression and scan rows
// share the same medium (qr_blog_cta, qr_blog_sidebar, qr_download, qr_webapp_soon),
// so scan rate per placement is a simple join in website_events.

(function () {
  var desktop = window.matchMedia('(hover: hover) and (pointer: fine) and (min-width: 1024px)');
  if (!desktop.matches) return;

  var ctaBoxes = Array.prototype.filter.call(document.querySelectorAll('.cta-box'), function (el) {
    return !el.parentElement.closest('.cta-box');
  });

  var EXPERIMENT = 'exp_qr_desktop_2026-10-06';
  var seen = {};
  function logImpression(medium) {
    if (seen[medium]) return;
    seen[medium] = true;
    try {
      navigator.sendBeacon('https://affiliate-signup.odubunmi.workers.dev', JSON.stringify({
        type: 'track_qr_impression', medium: medium, campaign: EXPERIMENT,
        path: location.pathname, url: location.href
      }));
    } catch (e) {}
  }
  // Fires once when an element is at least half visible. (A fixed, hidden element still
  // "intersects", so the margin card and the pop-up log their own impression instead.)
  function onHalfVisible(el, medium) {
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { logImpression(medium); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
  }

  // The download page already shows its QR in its own HTML. Here we only count it,
  // and never intercept its store buttons.
  var onDownloadPage = /^\/download(\.html)?$/.test(location.pathname);
  if (onDownloadPage) {
    var dlQr = document.querySelector('.qr-desktop img');
    if (dlQr) onHalfVisible(dlQr, 'qr_download');
    return;
  }

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
    '.rc-soon{box-sizing:border-box;width:calc(100% - 48px);max-width:560px;padding:32px;border:0;border-radius:18px;background:#fff;color:#183247;box-shadow:0 24px 60px rgba(15,30,45,.28);font-family:inherit;text-align:left}',
    '.rc-soon::backdrop{background:rgba(15,30,45,.55)}',
    '.rc-soon .rc-qr-close{top:12px;right:12px}',
    '.rc-soon-eyebrow{display:inline-block;margin:0;padding:4px 10px;border-radius:999px;background:#e6f6f1;color:#08795e;font-size:.75rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase}',
    '.rc-soon-title{margin:12px 0 8px;font-size:1.5rem;line-height:1.25;font-weight:700;color:#183247}',
    '.rc-soon-lead{margin:0;font-size:1rem;line-height:1.55;color:#475569}',
    '.rc-soon-qr{display:flex;align-items:center;gap:20px;margin:22px 0 14px;padding:16px;border:1px solid rgba(24,50,71,.12);border-radius:14px;background:#f8fafc}',
    '.rc-soon-qr img{width:152px;height:152px;flex:none;background:#fff;border-radius:8px}',
    '.rc-soon-qr p{margin:0;font-size:.95rem;line-height:1.5;color:#334155}',
    '.rc-soon-qr strong{display:block;margin-bottom:4px;font-size:1.05rem;color:#183247}',
    '.rc-soon-qr .rc-qr-free{margin-top:8px;font-weight:600;color:#08795e}',
    '.rc-soon-alt{margin:0;font-size:.9rem;color:#64748b}',
    '.rc-soon-alt a{color:#183247}',
    '.rc-soon a:focus-visible,.rc-soon .rc-qr-close:focus-visible{outline:3px solid #0aa37f;outline-offset:2px}',
    '@media (prefers-reduced-motion: reduce){.rc-qr-card{transition:none}}',
    '@media print{.rc-qr-card,.rc-qr-inline,.rc-soon{display:none}}'
  ].join('');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);


  // 0. "Web app coming soon" pop-up on download clicks.
  // Uses the native <dialog>: Esc closes it, focus is trapped and returned for free.
  var soon = null;
  function isDownloadLink(a) {
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return false; }
    if (/(^|\.)apps\.apple\.com$|(^|\.)play\.google\.com$/.test(u.hostname)) return true;
    if (u.hostname !== location.hostname && !/(^|\.)revalidationaicopilot\.co\.uk$/.test(u.hostname)) return false;
    if (u.pathname === '/download.html' || u.pathname === '/download') return true;
    // "/" is also the logo link, so only count it when it is styled as a call to action.
    return (u.pathname === '/' || u.pathname === '/index.html') &&
      (!!a.closest('.cta-box') || /(^|\s)(btn|cta-button)(\s|$)/.test(a.className));
  }
  function openSoon() {
    if (!soon) {
      soon = document.createElement('dialog');
      soon.className = 'rc-soon';
      soon.setAttribute('aria-labelledby', 'rc-soon-title');
      soon.innerHTML =
        '<button type="button" class="rc-qr-close" aria-label="Close">&times;</button>' +
        '<p class="rc-soon-eyebrow">Coming soon</p>' +
        '<p class="rc-soon-title" id="rc-soon-title">Revalidation Copilot is coming to your browser</p>' +
        '<p class="rc-soon-lead">Write reflections, log CPD and build your portfolio on a big screen, with everything synced to the app on your phone.</p>' +
        '<div class="rc-soon-qr">' +
          '<img src="/images/qr-webapp-soon.svg" alt="QR code: scan with your phone camera to download Revalidation Copilot" width="152" height="152">' +
          '<div><p><strong>Start today on your phone</strong>Point your phone\'s camera at this code. It opens the App Store or Google Play.</p>' +
          '<p class="rc-qr-free">Free to start. Everything you add will be there when the web app opens.</p></div>' +
        '</div>' +
        '<p class="rc-soon-alt">Prefer the store pages? <a href="/download.html" data-rc-soon-skip>See all download options</a></p>';
      document.body.appendChild(soon);
      soon.querySelector('.rc-qr-close').addEventListener('click', function () { soon.close(); });
      // A click on the dimmed backdrop lands on the dialog element itself.
      soon.addEventListener('click', function (e) { if (e.target === soon) soon.close(); });
    }
    if (typeof soon.showModal === 'function') soon.showModal(); else return false;
    logImpression('qr_webapp_soon');
    try {
      navigator.sendBeacon('https://affiliate-signup.odubunmi.workers.dev', JSON.stringify({
        type: 'track_download_click', store: 'web', source: 'website',
        medium: 'webapp_soon_popup', campaign: location.pathname, url: location.href
      }));
    } catch (e) {}
    return true;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!desktop.matches) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.hasAttribute('data-rc-soon-skip') || !isDownloadLink(a)) return;
    if (openSoon()) e.preventDefault();
  });

  // 1. Inline QR in every end-of-post call to action.
  ctaBoxes.forEach(function (box) {
    var block = document.createElement('div');
    block.className = 'rc-qr-inline';
    block.innerHTML =
      '<img src="/images/qr-blog-cta.svg" alt="QR code: scan with your phone camera to download Revalidation Copilot" width="128" height="128" loading="lazy">' +
      '<p><strong>Reading on a computer? The web app is coming soon.</strong>Until then, point your phone\'s camera at this code to get the app. Free on iPhone and Android.</p>';
    box.appendChild(block);
    onHalfVisible(block.querySelector('img'), 'qr_blog_cta');
  });

  // 2. Margin card.
  function dismissedRecently() {
    try {
      var t = Number(localStorage.getItem(DISMISS_KEY));
      return t && Date.now() - t < DISMISS_DAYS * 864e5;
    } catch (e) { return false; }
  }
  if (!ctaBoxes.length || dismissedRecently()) return;

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
    if (show) logImpression('qr_blog_sidebar');
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
