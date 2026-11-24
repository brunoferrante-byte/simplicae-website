/* Simplicae site analytics. Loaded by every page.
   Loads Google Tag Manager and reports site events to its data layer.
   The container sends to the Simplicae GA4 property (G-2QFR6GQM8C). Clear GTM_ID to switch all tracking off. */
(function () {
  var GTM_ID = 'GTM-WTX5RQNH';

  window.dataLayer = window.dataLayer || [];

  /* Every event carries the same four fields, so a value from one event never leaks into the next. */
  window.sxTrack = function (name, params) {
    params = params || {};
    window.dataLayer.push({
      event: name,
      label: params.label,
      location: params.location,
      method: params.method,
      link_url: params.link_url
    });
  };

  if (GTM_ID) {
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    document.head.appendChild(s);
  }

  function where(el) {
    var box = el.closest('section[id], header, footer');
    if (!box) return 'page';
    return box.id || box.tagName.toLowerCase();
  }

  /* Automatic click tracking: calls to action, email links, client login and other outbound links. */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a, button');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var label = (a.textContent || '').trim().slice(0, 80);
    var loc = where(a);

    if (a.matches('.btn, .navcta, .btn-dark')) {
      window.sxTrack('cta_click', { label: label, location: loc });
    }
    if (href.indexOf('mailto:') === 0) {
      window.sxTrack('email_click', { location: loc });
    } else if (/^https?:\/\//.test(href)) {
      var host = '';
      try { host = new URL(href).hostname; } catch (err) {}
      if (host && host !== window.location.hostname) {
        window.sxTrack(host === 'os.simplicae.com' ? 'client_login_click' : 'outbound_click', { link_url: href, location: loc });
      }
    }
  });
})();
