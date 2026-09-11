/* ============================================================================
   KNSS — Projects: category/industry filters + accessible lightbox
   ========================================================================== */
(function () {
  'use strict';

  /* Tamil/English runtime label helper */
  function lbl(id, fallback) {
    if (window.KNSS_I18N && typeof window.KNSS_I18N.t === 'function') {
      return window.KNSS_I18N.t(id, fallback);
    }
    return fallback;
  }

  /* ---------------- Filters ---------------- */

  function initProjectFilters() {
    var filterWrap = document.getElementById('projectFilters');
    var grid = document.getElementById('projectsGrid');
    if (!filterWrap || !grid) return;

    var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
    var countEl = document.getElementById('projectCount');
    var emptyEl = document.getElementById('projectsEmpty');
    var state = { category: 'all', industry: 'all' };

    filterWrap.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var group = btn.getAttribute('data-filter-group');
        var value = btn.getAttribute('data-filter');
        state[group] = value;
        filterWrap.querySelectorAll('[data-filter-group="' + group + '"]').forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });
        apply();
        if (typeof window.trackEvent === 'function') {
          window.trackEvent('project_filter', { group: group, value: value });
        }
      });
    });

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var okCat = state.category === 'all' || card.getAttribute('data-category') === state.category;
        var okInd = state.industry === 'all' || card.getAttribute('data-industry') === state.industry;
        var show = okCat && okInd;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (countEl) countEl.textContent = (window.KNSS_I18N && window.KNSS_I18N.t)
        ? window.KNSS_I18N.t('projects.showing', 'Showing {n} of {t} projects', { n: visible, t: cards.length })
        : 'Showing ' + visible + ' of ' + cards.length + ' projects';
      if (emptyEl) {
        if (visible === 0) {
          emptyEl.removeAttribute('hidden');
          emptyEl.style.display = 'grid';
        } else {
          emptyEl.setAttribute('hidden', '');
          emptyEl.style.display = 'none';
        }
      }
    }

    apply();
  }

  /* ---------------- Lightbox ---------------- */

  function initLightbox() {
    var grid = document.getElementById('projectsGrid');
    if (!grid) return;

    var triggers = Array.prototype.slice.call(grid.querySelectorAll('[data-lightbox]'));
    if (!triggers.length) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.hidden = true;
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', lbl('projects.viewer','Project photo viewer'));
    lightbox.innerHTML =
      '<figure class="lightbox-figure">' +
      '  <img alt="">' +
      '  <figcaption class="lightbox-caption"><strong></strong><span></span></figcaption>' +
      '</figure>' +
      '<button type="button" class="lightbox-btn lightbox-close" aria-label="' + lbl('projects.closeViewer','Close viewer') + '">×</button>' +
      '<button type="button" class="lightbox-btn lightbox-prev" aria-label="' + lbl('projects.prevPhoto','Previous photo') + '">‹</button>' +
      '<button type="button" class="lightbox-btn lightbox-next" aria-label="' + lbl('projects.nextPhoto','Next photo') + '">›</button>';
    document.body.appendChild(lightbox);

    var img = lightbox.querySelector('img');
    var capTitle = lightbox.querySelector('figcaption strong');
    var capMeta = lightbox.querySelector('figcaption span');
    var current = 0;
    var visibleCards = [];
    var lastFocus = null;

    function visibleTriggers() {
      return triggers.filter(function (t) {
        return !t.closest('.project-card').classList.contains('is-hidden');
      });
    }

    function render() {
      var card = visibleCards[current].closest('.project-card');
      var picture = visibleCards[current].querySelector('img');
      var title = card.querySelector('h3').textContent;
      var meta = card.querySelector('.project-card-meta');
      var services = card.querySelectorAll('.project-card-services .tag');
      img.src = picture.getAttribute('src');
      img.alt = picture.getAttribute('alt') || title;
      capTitle.textContent = title;
      capMeta.textContent = (meta ? meta.textContent.trim() : '') +
        (services.length ? '  ·  ' + Array.prototype.map.call(services, function (s) { return s.textContent; }).join(', ') : '');
    }

    function open(index, triggerList) {
      visibleCards = triggerList;
      current = index;
      lastFocus = document.activeElement;
      render();
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      lightbox.querySelector('.lightbox-close').focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }

    function move(step) {
      var n = visibleCards.length;
      current = (current + step + n) % n;
      render();
    }

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var list = visibleTriggers();
        open(list.indexOf(trigger), list);
        if (typeof window.trackEvent === 'function') window.trackEvent('project_view', {});
      });
    });

    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { move(-1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { move(1); });
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowLeft') move(-1);
      if (event.key === 'ArrowRight') move(1);
    });
  }

  window.KNSS_PROJECTS = { initProjectFilters: initProjectFilters, initLightbox: initLightbox };
})();
