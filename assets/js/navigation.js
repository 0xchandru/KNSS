/* ============================================================================
   KNSS — Navigation: sticky header, mobile drawer, dropdown, active state,
   back-to-top. Keyboard accessible throughout.
   ========================================================================== */
(function () {
  'use strict';

  var mqDesktop = window.matchMedia ? window.matchMedia('(min-width: 1221px)') : { matches: true, addEventListener: function () {} };
  var header, navToggle, navClose, primaryNav, backdrop, backToTop;

  function bodyIs(page) {
    return (document.body.getAttribute('data-page') || '') === page;
  }

  /* ---------- Sticky header state ---------- */
  function initStickyHeader() {
    var ticking = false;
    var onScroll = function () {
      if (document.body.classList.contains('nav-open')) return;
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var y = window.scrollY || window.pageYOffset;
          header.classList.toggle('is-scrolled', y > 40);
          if (backToTop) {
            var visible = y > 600;
            backToTop.classList.toggle('is-visible', visible);
            backToTop.hidden = false;
            backToTop.setAttribute('tabindex', visible ? '0' : '-1');
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile drawer ---------- */
  function openDrawer() {
    document.body.classList.add('nav-open');
    document.documentElement.classList.add('nav-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    if (navClose) {
      try {
        navClose.focus({ preventScroll: true });
      } catch (e) {
        navClose.focus();
      }
    }
  }

  function closeDrawer(restoreFocus) {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    document.documentElement.classList.remove('nav-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    closeAllDropdowns();
    if (restoreFocus) navToggle.focus();
  }

  function initDrawer() {
    if (!navToggle || !primaryNav) return;
    navToggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (document.body.classList.contains('nav-open')) closeDrawer(false);
      else openDrawer();
    });
    if (navClose) {
      navClose.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeDrawer(true);
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', function () { closeDrawer(false); });
    }

    /* Close after tapping a real link inside the drawer */
    primaryNav.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') return; /* ignore hash-only links */
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

    /* Desktop: open on hover with graceful debounce so moving to dropdown doesn't close it */
    var closeTimer = null;
    wrapper.addEventListener('mouseenter', function () {
      if (!mqDesktop.matches) return;
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      wrapper.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    });
    wrapper.addEventListener('mouseleave', function () {
      if (!mqDesktop.matches) return;
      closeTimer = setTimeout(function () {
        wrapper.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }, 220);
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
    var raw = (document.body.getAttribute('data-page') || window.location.pathname || '').trim();
    var clean = raw.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
    if (!clean) clean = 'home';

    var activeNav = '';
    if (clean === 'home' || clean === 'index.html') {
      activeNav = 'home';
    } else if (clean.indexOf('solutions') !== -1) {
      activeNav = 'solutions';
    } else if (clean.indexOf('about') !== -1) {
      activeNav = 'about';
    } else if (clean.indexOf('industries') !== -1) {
      activeNav = 'industries';
    } else if (clean.indexOf('projects') !== -1) {
      activeNav = 'projects';
    } else if (clean.indexOf('why') !== -1) {
      activeNav = 'why';
    } else if (clean.indexOf('contact') !== -1) {
      activeNav = 'contact';
    } else if (clean.indexOf('faq') !== -1) {
      activeNav = 'faq';
    }

    if (activeNav) {
      var links = document.querySelectorAll('.nav-link');
      for (var i = 0; i < links.length; i++) {
        if (links[i].getAttribute('data-nav') === activeNav) {
          links[i].classList.add('is-active');
          links[i].setAttribute('aria-current', 'page');
        }
      }
    }

    var allNavLinks = document.querySelectorAll('.nav-link:not(.dropdown-toggle)');
    for (var j = 0; j < allNavLinks.length; j++) {
      allNavLinks[j].addEventListener('click', function () {
        for (var k = 0; k < allNavLinks.length; k++) {
          allNavLinks[k].classList.remove('is-active');
          allNavLinks[k].removeAttribute('aria-current');
        }
        this.classList.add('is-active');
        this.setAttribute('aria-current', 'page');
      });
    }
  }

  /* ---------- Dynamic Header Spacing & Responsive Collapse ---------- */
  function checkHeaderCollapsible() {
    // Breakpoints are handled cleanly and consistently via CSS media queries for both EN and TA
    if (document.body.classList.contains('header-compact')) {
      document.body.classList.remove('header-compact');
    }
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
    if (navToggle && primaryNav) initDrawer();
    initDropdown();

    checkHeaderCollapsible();
    window.addEventListener('resize', checkHeaderCollapsible, { passive: true });
    window.addEventListener('orientationchange', checkHeaderCollapsible, { passive: true });
    document.addEventListener('knss:langchange', function () {
      window.requestAnimationFrame(checkHeaderCollapsible);
    });

    if (backToTop) {
      backToTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  window.KNSS_NAV = { initNavigation: initNavigation };
})();
