/* Revalidation Copilot — video facade loader
 * Usage: <div class="video-embed" data-video="tt-audit" data-ratio="9/16"></div>
 *        <script src="/videos.js" defer></script>
 * Renders a click-to-load facade (thumbnail + play button), swaps in the
 * platform iframe on click. Never loads third-party JS before interaction.
 */
(function () {
  'use strict';
  var YT_RATIO = '16 / 9';
  var TT_RATIO = '9 / 16';

  function el(tag, attrs) {
    var n = document.createElement(tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function render(node, v) {
    var ratio = v.platform === 'youtube' ? YT_RATIO : TT_RATIO;
    var ratioAttr = node.getAttribute('data-ratio');
    if (ratioAttr) ratio = ratioAttr.replace('/', ' / ');
    node.style.position = 'relative';
    node.style.aspectRatio = ratio;
    node.style.width = '100%';
    node.style.maxWidth = node.getAttribute('data-max-width') || (v.platform === 'youtube' ? '640px' : '360px');
    node.style.overflow = 'hidden';
    node.style.borderRadius = '12px';
    node.style.background = '#111';
    node.style.margin = '1rem 0';

    var thumb = el('img', {
      src: v.thumb,
      alt: v.title,
      loading: 'lazy',
      style: 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block'
    });
    var btn = el('button', {
      'aria-label': 'Play video: ' + v.title,
      style: 'position:absolute;inset:0;width:100%;height:100%;border:0;cursor:pointer;background:transparent;display:flex;align-items:center;justify-content:center'
    });
    var icon = el('span', {
      style: 'width:64px;height:64px;border-radius:50%;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center'
    });
    icon.textContent = '\u25B6';
    icon.style.color = '#fff';
    icon.style.fontSize = '24px';
    btn.appendChild(icon);
    node.appendChild(thumb);
    node.appendChild(btn);

    btn.addEventListener('click', function () {
      var iframe = el('iframe', {
        src: v.platform === 'youtube'
          ? 'https://www.youtube-nocookie.com/embed/' + v.id + '?autoplay=1&rel=0'
          : 'https://www.tiktok.com/embed/v2/' + v.id,
        title: v.title,
        allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen; autoplay',
        allowFullscreen: '',
        style: 'position:absolute;inset:0;width:100%;height:100%;border:0'
      });
      node.textContent = '';
      node.appendChild(iframe);
    });
  }

  function boot() {
    var nodes = document.querySelectorAll('.video-embed[data-video]');
    if (!nodes.length) return;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/videos.json', true);
    xhr.onload = function () {
      if (xhr.status !== 200) return;
      var data;
      try { data = JSON.parse(xhr.responseText); } catch (e) { return; }
      nodes.forEach(function (node) {
        var v = data[node.getAttribute('data-video')];
        if (v) render(node, v);
      });
    };
    xhr.send();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();