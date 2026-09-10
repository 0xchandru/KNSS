/* ============================================================================
   KNSS — Main bootstrap
   Initialises every module in the right order. All page behaviour hangs off
   small init* functions so nothing runs twice and nothing is orphaned.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- Toast / notice utility ---------- */
  var toastTimers = [];

  function showNotice(message, kind) {
    var region = document.getElementById('toastRegion');
    if (!region) return;
    var toast = document.createElement('div');
    toast.className = 'toast' + (kind === 'success' ? ' toast--success' : '');
    var iconSvg = kind === 'success'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
    toast.innerHTML = iconSvg + '<span></span>';
    toast.querySelector('span').textContent = message;
    region.appendChild(toast);

    var timer = window.setTimeout(function () {
      toast.classList.add('is-leaving');
      window.setTimeout(function () { toast.remove(); }, 300);
    }, 5200);
    toastTimers.push(timer);
    if (toastTimers.length > 4) {
      var oldest = region.querySelector('.toast');
      if (oldest) oldest.remove();
    }
  }

  /* ---------- Boot ---------- */
  function init() {
    window.showNotice = showNotice;

    if (window.KNSS_NAV) window.KNSS_NAV.initNavigation();
    if (window.KNSS_ANIMATIONS) window.KNSS_ANIMATIONS.initAnimations();
    if (window.KNSS_FAQ) window.KNSS_FAQ.initFAQ();
    if (window.KNSS_PROJECTS) {
      window.KNSS_PROJECTS.initProjectFilters();
      window.KNSS_PROJECTS.initLightbox();
    }
    if (window.KNSS_FORMS) window.KNSS_FORMS.initForms();
    if (window.KNSS_ANALYTICS) window.KNSS_ANALYTICS.initAnalytics();
    if (window.KNSS) window.KNSS.initWhatsAppButtons();

    /* Unconfigured phone CTA (mobile bottom bar) */
    document.querySelectorAll('[data-call-unconfigured]').forEach(function (el) {
      el.addEventListener('click', function (event) {
        event.preventDefault();
        showNotice('Our phone number is being updated. Please reach us on WhatsApp or email — both are answered personally.', 'info');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
