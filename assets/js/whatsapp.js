/* ============================================================================
   KNSS — WhatsApp click-to-chat engine
   Reads the number from SITE_CONFIG.whatsapp. Never exposes an unverified
   number: when the placeholder is still in place, links stay inert and the
   UI explains the situation instead of opening a broken chat.
   ========================================================================== */
(function () {
  'use strict';

  var PLACEHOLDER = 'WHATSAPP_NUMBER_HERE';

  /* Tamil/English runtime message helper (KNSS_I18N may not exist yet) */
  function T(id, fallback, params) {
    if (window.KNSS_I18N && typeof window.KNSS_I18N.t === 'function') {
      return window.KNSS_I18N.t(id, fallback, params);
    }
    var out = fallback;
    if (params) {
      Object.keys(params).forEach(function (k) {
        out = out.split('{' + k + '}').join(String(params[k]));
      });
    }
    return out;
  }

  function digits(value) {
    return String(value || '').replace(/\D+/g, '');
  }

  function isWhatsAppConfigured() {
    var cfg = window.SITE_CONFIG || {};
    if (!cfg.whatsapp || cfg.whatsapp === PLACEHOLDER) return false;
    return digits(cfg.whatsapp).length >= 10;
  }

  function normalizedNumber() {
    return digits((window.SITE_CONFIG || {}).whatsapp);
  }

  /* Builds the wa.me URL with a safely encoded message. */
  function waLink(message) {
    return 'https://wa.me/' + normalizedNumber() + '?text=' + encodeURIComponent(message);
  }

  /* Opens WhatsApp in a new tab/window. Returns false when not configured. */
  function openWhatsApp(message) {
    if (!isWhatsAppConfigured()) return false;
    var win = window.open(waLink(message), '_blank', 'noopener');
    /* Popup blocked → navigate current tab as a fallback */
    if (!win) window.location.href = waLink(message);
    return true;
  }

  /* ------------------------------------------------------------------
     Message generator
     data = {
       intro:  string (first line after greeting),
       sections: [{ heading, fields: [[label, value], ...] }],
       requirement: string (free text block),
       source: string
     }
  ------------------------------------------------------------------ */
  function buildWhatsAppMessage(data) {
    var cfg = window.SITE_CONFIG || {};
    var business = cfg.businessName || 'Keerthi Networks and Security Solution';
    var lines = [];

    function push(line) { lines.push(line); }
    function row(label, value) {
      if (value === undefined || value === null) return;
      var v = String(value).trim();
      if (v === '') return;
      push(label + ': ' + v);
    }

    push(T('wa.greeting', 'Hello {b},', { b: business }));
    push('');

    if (data.intro) {
      push(data.intro);
    } else {
      push(T('wa.generalIntro', 'I found your website and would like to know more about your services.'));
    }

    (data.sections || []).forEach(function (section) {
      var rows = (section.fields || []).filter(function (f) {
        return f[1] !== undefined && f[1] !== null && String(f[1]).trim() !== '';
      });
      if (!rows.length) return;
      push('');
      push(section.heading);
      rows.forEach(function (f) { row(f[0], f[1]); });
    });

    if (data.requirement && String(data.requirement).trim() !== '') {
      push('');
      push(T('wa.section.requirement', 'REQUIREMENT'));
      push(String(data.requirement).trim());
    }

    push('');
    push(T('wa.source', 'Source:') + ' ' + (data.source || T('wa.src.website', 'Website')));
    push('');
    push(T('wa.closing', 'Please contact me regarding this requirement.'));
    push('');
    push(T('wa.thanks', 'Thank you.'));

    return lines.join('\n');
  }

  /* Message used by floating button, header, footer and service CTAs */
  function buildProductMessage(product) {
    var cfg = window.SITE_CONFIG || {};
    var business = cfg.businessName || 'Keerthi Networks and Security Solution';
    if (product) {
      return (
        T('wa.greeting', 'Hello {b},', { b: business }) + '\n\n' +
        T('wa.productIntro', 'I am interested in your {product} solutions.', { product: product }) + '\n\n' +
        T('wa.generalIntroShort', 'I found your website and would like more information.') + '\n\n' +
        T('wa.thanks', 'Thank you.')
      );
    }
    return (
      T('wa.greeting', 'Hello {b},', { b: business }) + '\n\n' +
      T('wa.generalIntro', 'I found your website and would like to know more about your services.') + '\n\n' +
      T('wa.thanks', 'Thank you.')
    );
  }

  /* ------------------------------------------------------------------
     Button wiring — every [data-wa] element gets a real wa.me href
  ------------------------------------------------------------------ */
  function initWhatsAppButtons() {
    var buttons = document.querySelectorAll('[data-wa]');
    var pageProduct = (document.body.getAttribute('data-wa-product') || '').trim();

    buttons.forEach(function (btn) {
      var product = (btn.getAttribute('data-wa-product') || pageProduct).trim();
      var message = buildProductMessage(product);

      if (isWhatsAppConfigured()) {
        btn.setAttribute('href', waLink(message));
      } else {
        btn.setAttribute('href', '#');
        btn.setAttribute('data-wa-unconfigured', 'true');
        if (btn.id === 'floatingWhatsApp') {
          btn.setAttribute('aria-disabled', 'true');
          btn.setAttribute('title', T('wa.unconfiguredTitle', 'WhatsApp number is being updated — please use email for now'));
        }
      }

      btn.addEventListener('click', function (event) {
        if (!isWhatsAppConfigured()) {
          event.preventDefault();
          if (typeof window.showNotice === 'function') {
            window.showNotice(
              T('toast.waUpdating', 'Our WhatsApp number is being updated. Please reach us by email at {email} — the chat option will be live shortly.', { email: (window.SITE_CONFIG || {}).email || '' }),
              'info'
            );
          }
          if (typeof window.trackEvent === 'function') {
            window.trackEvent('whatsapp_click', { status: 'unconfigured', product: product || 'general' });
          }
          return;
        }
        /* Keep href default behaviour; also refresh message right before opening */
        btn.setAttribute('href', waLink(buildProductMessage(product)));
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('whatsapp_click', { product: product || 'general' });
        }
      });
    });
  }

  /* Public API */
  window.KNSS = {
    isWhatsAppConfigured: isWhatsAppConfigured,
    waLink: waLink,
    openWhatsApp: openWhatsApp,
    buildWhatsAppMessage: buildWhatsAppMessage,
    buildProductMessage: buildProductMessage,
    initWhatsAppButtons: initWhatsAppButtons
  };
})();
