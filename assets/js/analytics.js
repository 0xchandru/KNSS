/* ============================================================================
   KNSS — Analytics bridge (GA4 + GTM), event tracking
   No real IDs are included until the client provides them; every event is
   still pushed to dataLayer so a later integration needs zero code changes.
   ========================================================================== */
(function () {
  'use strict';

  var PLACEHOLDERS = ['GA_MEASUREMENT_ID', 'GTM_CONTAINER_ID', ''];
  var gaLoaded = false;
  var gtmLoaded = false;

  function cfg() { return window.SITE_CONFIG || {}; }

  function isReal(value) {
    return value && PLACEHOLDERS.indexOf(value) === -1;
  }

  function loadGA(id) {
    if (gaLoaded || !isReal(id)) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { anonymize_ip: true });
  }

  function loadGTM(id) {
    if (gtmLoaded || !isReal(id)) return;
    gtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
  }

  /* Central event sink — always records to dataLayer, forwards to gtag if active */
  function trackEvent(name, params) {
    var payload = Object.assign({
      event: name,
      page_path: window.location.pathname,
      page_type: document.body.getAttribute('data-page-type') || ''
    }, params || {});
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function' && name !== 'gtm.js') {
      window.gtag('event', name, params || {});
    }
  }

  function initAnalytics() {
    var config = cfg();
    loadGA(config.gaMeasurementId);
    loadGTM(config.gtmContainerId);
    window.trackEvent = trackEvent;

    /* Delegated click tracking for [data-track] elements
       (hero_cta_click, quote_click, site_visit_click, phone_click,
        whatsapp_click, project_view …) */
    document.addEventListener('click', function (event) {
      var el = event.target.closest('[data-track]');
      if (!el) return;
      var name = el.getAttribute('data-track');
      if (!name) return;
      trackEvent(name, {
        link_text: (el.textContent || '').trim().slice(0, 80),
        link_url: el.getAttribute('href') || '',
        wa_product: el.getAttribute('data-wa-product') || ''
      });
    }, { passive: true });

    /* Automatic service_view on solution pages */
    if (document.body.getAttribute('data-page-type') === 'service') {
      trackEvent('service_view', {
        service: document.body.getAttribute('data-wa-product') || ''
      });
    }
  }

  window.KNSS_ANALYTICS = { initAnalytics: initAnalytics };
})();
