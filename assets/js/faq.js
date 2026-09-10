/* ============================================================================
   KNSS — FAQ accordion (accessible, animated, one-open-per-list)
   ========================================================================== */
(function () {
  'use strict';

  function initFAQ() {
    document.querySelectorAll('.faq-list').forEach(function (list) {
      var items = list.querySelectorAll('.faq-item');

      items.forEach(function (item) {
        var btn = item.querySelector('.faq-btn');
        var panel = item.querySelector('.faq-a');
        if (!btn || !panel) return;

        /* enable animated open/close (before JS: hidden = graceful no-JS view) */
        panel.removeAttribute('hidden');

        btn.addEventListener('click', function () {
          var isOpen = btn.getAttribute('aria-expanded') === 'true';

          /* close others in the same list */
          items.forEach(function (other) {
            if (other === item) return;
            var ob = other.querySelector('.faq-btn');
            var op = other.querySelector('.faq-a');
            if (ob) ob.setAttribute('aria-expanded', 'false');
            if (op) op.setAttribute('aria-hidden', 'true');
            other.classList.remove('is-open');
          });

          btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
          panel.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
          item.classList.toggle('is-open', !isOpen);
        });
      });
    });
  }

  window.KNSS_FAQ = { initFAQ: initFAQ };
})();
