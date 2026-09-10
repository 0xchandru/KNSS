/* ============================================================================
   KNSS — WhatsApp click-to-chat engine
   Reads the number from SITE_CONFIG.whatsapp. Never exposes an unverified
   number: when the placeholder is still in place, links stay inert and the
   UI explains the situation instead of opening a broken chat.
   ========================================================================== */
(function () {
  'use strict';

  var PLACEHOLDER = 'WHATSAPP_NUMBER_HERE';

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

    push('Hello ' + business + ',');
    push('');

    if (data.intro) {
      push(data.intro);
    } else {
      push('I found your website and would like to know more about your services.');
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
      push('REQUIREMENT');
      push(String(data.requirement).trim());
    }

    push('');
    push('Source: ' + (data.source || 'Website'));
    push('');
    push('Please contact me regarding this requirement.');
    push('');
    push('Thank you.');

    return lines.join('\n');
  }

  /* Message used by floating button, header, footer and service CTAs */
  function buildProductMessage(product) {
    var cfg = window.SITE_CONFIG || {};
    var business = cfg.businessName || 'Keerthi Networks and Security Solution';
    if (product) {
      return (
        'Hello ' + business + ',\n\n' +
        'I am interested in your ' + product + ' solutions.\n\n' +
        'I found your website and would like more information.\n\n' +
        'Thank you.'
      );
    }
    return (
      'Hello ' + business + ',\n\n' +
      'I found your website and would like to know more about your services.\n\n' +
      'Thank you.'
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
          btn.setAttribute('title', 'WhatsApp number is being updated — please use email for now');
        }
      }

      btn.addEventListener('click', function (event) {
        if (!isWhatsAppConfigured()) {
          event.preventDefault();
          if (typeof window.showNotice === 'function') {
            window.showNotice(
              'Our WhatsApp number is being updated. Please reach us by email at ' +
              ((window.SITE_CONFIG || {}).email || '') + ' — the chat option will be live shortly.',
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
