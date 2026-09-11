/* ============================================================================
   KNSS — Scroll-reveal animations (respects prefers-reduced-motion)
   ========================================================================== */
(function () {
  'use strict';

  function initAnimations() {
    var targets = document.querySelectorAll('.reveal, .reveal-stagger');
    if (!targets.length) return;

    var reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '120px 0px 120px 0px', threshold: 0.02 });

    targets.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.top < (window.innerHeight || 800) + 160 && rect.bottom > -80) {
        el.classList.add('is-visible');
      } else {
        observer.observe(el);
      }
    });

    /* Activate animation hide only for unrevealed offscreen elements */
    document.documentElement.classList.add('animations-ready');

    /* Safety fallback */
    window.setTimeout(function () {
      targets.forEach(function (el) { el.classList.add('is-visible'); });
    }, 450);
  }

  window.KNSS_ANIMATIONS = { initAnimations: initAnimations };
})();
