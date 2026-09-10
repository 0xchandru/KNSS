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
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (el) {
      /* Elements already in the first viewport appear without delay */
      observer.observe(el);
    });
  }

  window.KNSS_ANIMATIONS = { initAnimations: initAnimations };
})();
