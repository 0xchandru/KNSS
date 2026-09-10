/* ============================================================================
   KNSS — Navigation: sticky header, mobile drawer, dropdown, active state,
   back-to-top. Keyboard accessible throughout.
   ========================================================================== */
(function () {
  'use strict';

  var mqDesktop = window.matchMedia ? window.matchMedia('(min-width: 1081px)') : { matches: true, addEventListener: function () {} };
  var header, navToggle, navClose, primaryNav, backdrop, backToTop;

  function bodyIs(page) {
    return (document.body.getAttribute('data-page') || '') === page;
  }

  /* ---------- Sticky header state ---------- */
  function initStickyHeader() {
    var onScroll = function () {
      var y = window.scrollY || window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 24);
      if (backToTop) {
        var visible = y > 640;
        backToTop.classList.toggle('is-visible', visible);
        backToTop.hidden = false;
        backToTop.setAttribute('tabindex', visible ? '0' : '-1');
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile drawer ---------- */
  function openDrawer() {
    document.body.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    var first = primaryNav.querySelector('a, button');
    if (first) first.focus();
  }

  function closeDrawer(restoreFocus) {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    closeAllDropdowns();
    if (restoreFocus) navToggle.focus();
  }

  function initDrawer() {
    navToggle.addEventListener('click', function () {
      if (document.body.classList.contains('nav-open')) closeDrawer(false);
      else openDrawer();
    });
    navClose.addEventListener('click', function () { closeDrawer(true); });
    backdrop.addEventListener('click', function () { closeDrawer(false); });

    /* Close after tapping a real link inside the drawer */
    primaryNav.querySelectorAll('a[href^="/"], a[href^="http"]').forEach(function (link) {
      link.addEventListener('click', function () { closeDrawer(false); });
    });

    /* Esc closes, simple focus trap inside the panel */
    document.addEventListener('keydown', function (event) {
      if (!document.body.classList.contains('nav-open')) return;
      if (event.key === 'Escape') { closeDrawer(true); return; }
      if (event.key !== 'Tab') return;
      var focusables = primaryNav.querySelectorAll('a[href], button:not([disabled])');
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });

    /* Reset if viewport grows to desktop */
    mqDesktop.addEventListener('change', function (e) {
      if (e.matches) closeDrawer(false);
    });
  }

  /* ---------- Solutions dropdown ---------- */
  function closeAllDropdowns(except) {
    document.querySelectorAll('.has-dropdown.is-open').forEach(function (item) {
      if (item === except) return;
      item.classList.remove('is-open');
      var toggle = item.querySelector('.dropdown-toggle');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
  }

  function initDropdown() {
    var wrapper = document.querySelector('.has-dropdown');
    if (!wrapper) return;
    var toggle = wrapper.querySelector('.dropdown-toggle');

    toggle.addEventListener('click', function (event) {
      event.stopPropagation();
      var open = wrapper.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    /* Desktop: open on hover as well */
    mqDesktop.addEventListener('change', function () {});
    wrapper.addEventListener('mouseenter', function () {
      if (!mqDesktop.matches) return;
      wrapper.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    });
    wrapper.addEventListener('mouseleave', function () {
      if (!mqDesktop.matches) return;
      wrapper.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });

    document.addEventListener('click', function (event) {
      if (!wrapper.contains(event.target)) closeAllDropdowns();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && wrapper.classList.contains('is-open')) {
        wrapper.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* ---------- Active navigation state ---------- */
  function initActiveNav() {
    var map = {
      'index.html': 'home',
      '/': 'home',
      'about-us.html': 'about',
      'industries.html': 'industries',
      'projects.html': 'projects',
      'why-choose-us.html': 'why',
      'contact-us.html': 'contact'
    };
    var page = document.body.getAttribute('data-page') || '';
    if (page.indexOf('/solutions/') === 0) {
      var el = document.querySelector('[data-nav="solutions"]');
      if (el) el.classList.add('is-active');
      return;
    }
    var key = map[page];
    if (!key) return;
    var link = document.querySelector('[data-nav="' + key + '"]');
    if (link) link.classList.add('is-active');
  }

  function initNavigation() {
    header = document.getElementById('siteHeader');
    navToggle = document.getElementById('navToggle');
    navClose = document.getElementById('navClose');
    primaryNav = document.getElementById('primaryNav');
    backdrop = document.getElementById('navBackdrop');
    backToTop = document.getElementById('backToTop');
    if (!header) return;

    initStickyHeader();
    initActiveNav();
    if (navToggle && primaryNav && backdrop && navClose) initDrawer();
    initDropdown();

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  window.KNSS_NAV = { initNavigation: initNavigation };
})();
