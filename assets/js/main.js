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

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = document.getElementById('year');
    if (el) el.textContent = String(new Date().getFullYear());
  }

  /* ---------- Preloader ---------- */
  function initPreloader() {
    var preloader = document.getElementById('sitePreloader');
    if (!preloader) return;

    var isDone = false;
    try { isDone = !!sessionStorage.getItem('knss_preloaded'); } catch (e) {}

    function dismiss(instant) {
      try { sessionStorage.setItem('knss_preloaded', '1'); } catch (e) {}
      document.documentElement.classList.add('preloader-done');
      if (instant) {
        preloader.classList.add('is-loaded');
        preloader.style.display = 'none';
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        return;
      }
      preloader.classList.add('is-loaded');
      window.setTimeout(function () {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
      }, 350);
    }

    if (isDone) {
      dismiss(true);
      return;
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
      window.setTimeout(function () { dismiss(false); }, 100);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        window.setTimeout(function () { dismiss(false); }, 80);
      });
      window.addEventListener('load', function () {
        dismiss(false);
      });
      /* Safety fallback */
      window.setTimeout(function () { dismiss(false); }, 500);
    }
  }

  /* Handle Back/Forward Cache (bfcache) navigation */
  window.addEventListener('pageshow', function () {
    try { sessionStorage.setItem('knss_preloaded', '1'); } catch (e) {}
    document.documentElement.classList.add('preloader-done');
    var p = document.getElementById('sitePreloader');
    if (p) {
      p.classList.add('is-loaded');
      p.style.display = 'none';
      if (p.parentNode) p.parentNode.removeChild(p);
    }
  });

  /* ---------- Image Skeletons & Lazy Loading ---------- */
  function initImageSkeletons() {
    var images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(function (img) {
      function markLoaded() {
        img.classList.add('img-loaded');
        var parent = img.closest('figure, .mini-project-media, .page-hero-frame, .project-card-media, .frame');
        if (parent) parent.classList.add('is-loaded');
      }
      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener('load', markLoaded);
        img.addEventListener('error', markLoaded);
      }
    });
  }

  /* ---------- Hero Carousel ---------- */
  function initHeroCarousel() {
    var carousel = document.getElementById('heroCarousel');
    var track = document.getElementById('heroCarouselTrack');
    if (!carousel || !track) return;

    var slides = Array.from(track.querySelectorAll('.hero-carousel-slide'));
    var dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
    var prevBtn = document.getElementById('heroCarouselPrev');
    var nextBtn = document.getElementById('heroCarouselNext');
    if (!slides.length) return;

    var currentIndex = 0;
    var totalSlides = slides.length;
    var autoplayDelay = 5000;
    var timer = null;
    var touchStartX = 0;
    var touchEndX = 0;

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';

      slides.forEach(function (slide, i) {
        var isActive = i === currentIndex;
        slide.classList.toggle('is-active', isActive);
        var link = slide.querySelector('.hero-carousel-link');
        if (link) {
          link.setAttribute('tabindex', isActive ? '0' : '-1');
        }
      });

      dots.forEach(function (dot, i) {
        var isActive = i === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
      stopAutoplay();
      timer = window.setInterval(nextSlide, autoplayDelay);
    }

    function stopAutoplay() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    /* Button controls */
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        startAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        startAutoplay();
      });
    }

    /* Dot indicators */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var slideIndex = parseInt(this.getAttribute('data-slide'), 10);
        if (!isNaN(slideIndex)) {
          goToSlide(slideIndex);
          startAutoplay();
        }
      });
    });

    /* Pause on mouse hover & keyboard focus */
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', startAutoplay);

    /* Touch gestures (mobile swipe) */
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        startAutoplay();
      }
    }, { passive: true });

    /* Keyboard navigation (Arrow keys) */
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      }
    });

    /* Initial state & start */
    goToSlide(0);
    startAutoplay();
  }

  /* ---------- Boot ---------- */
  function init() {
    initPreloader();
    initImageSkeletons();
    initHeroCarousel();
    window.showNotice = showNotice;

    initYear();

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
        showNotice(window.KNSS_I18N && window.KNSS_I18N.t
          ? window.KNSS_I18N.t('toast.callUpdating', 'Our phone number is being updated. Please reach us on WhatsApp or email — both are answered personally.')
          : 'Our phone number is being updated. Please reach us on WhatsApp or email — both are answered personally.', 'info');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
