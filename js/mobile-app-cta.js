// On phone-sized browsers, send web-app calls to action to the native app
// download page. Desktop visitors keep the existing web app links.
(function () {
  var phoneLayout = window.matchMedia('(max-width: 767px)');
  if (!phoneLayout.matches || /^\/download(?:\.html)?\/?$/.test(location.pathname)) return;

  document.querySelectorAll('a[href^="https://app.revalidationaicopilot.co.uk"]').forEach(function (link) {
    if (!/open\s+(?:the\s+)?web\s+app/i.test(link.textContent || '')) return;

    link.href = '/download.html';
    link.textContent = 'Download the app →';
    link.setAttribute('aria-label', 'Download Revalidation Copilot for iPhone or Android');
    link.dataset.mobileAppDownload = 'true';
  });

  // The home page already has a dedicated mobile app button beside the web CTA.
  // Avoid showing two identical download buttons on small screens.
  document.querySelectorAll('.hero-ctas [data-mobile-app-download="true"]').forEach(function (link) {
    if (link.parentElement.querySelector('a[href="/download.html"]:not([data-mobile-app-download="true"])')) {
      link.hidden = true;
    }
  });
})();
