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

    // Clean up any previous clones if re-initialized
    track.querySelectorAll('.hero-carousel-clone').forEach(function (el) {
      el.remove();
    });

    var originalSlides = Array.from(track.querySelectorAll('.hero-carousel-slide'));
    var totalSlides = originalSlides.length;
    var dots = Array.from(carousel.querySelectorAll('.hero-carousel-dot'));
    var prevBtn = document.getElementById('heroCarouselPrev');
    var nextBtn = document.getElementById('heroCarouselNext');
    if (totalSlides < 2) return;

    // Create clones for seamless infinite loop (Slide 5 at start, Slide 1 at end)
    var cloneFirst = originalSlides[0].cloneNode(true);
    cloneFirst.classList.add('hero-carousel-clone');
    cloneFirst.classList.remove('is-active');
    cloneFirst.setAttribute('aria-hidden', 'true');
    var firstLink = cloneFirst.querySelector('.hero-carousel-link');
    if (firstLink) firstLink.setAttribute('tabindex', '-1');

    var cloneLast = originalSlides[totalSlides - 1].cloneNode(true);
    cloneLast.classList.add('hero-carousel-clone');
    cloneLast.classList.remove('is-active');
    cloneLast.setAttribute('aria-hidden', 'true');
    var lastLink = cloneLast.querySelector('.hero-carousel-link');
    if (lastLink) lastLink.setAttribute('tabindex', '-1');

    track.appendChild(cloneFirst);
    track.insertBefore(cloneLast, originalSlides[0]);

    // Track state: indices range from 0 (cloneLast) to totalSlides + 1 (cloneFirst)
    // Real slides are at indices 1 to totalSlides
    var trackIndex = 1;
    var autoplayDelay = 5000;
    var timer = null;
    var isTransitioning = false;

    /* Hold-to-slide / Dragging state */
    var isDragging = false;
    var startPos = 0;
    var currentTranslate = 0;
    var prevTranslate = 0;
    var hasMoved = false;

    function getPositionX(e) {
      if (e.type.indexOf('mouse') !== -1) {
        return e.pageX;
      }
      if (e.touches && e.touches.length) {
        return e.touches[0].clientX;
      }
      if (e.changedTouches && e.changedTouches.length) {
        return e.changedTouches[0].clientX;
      }
      return 0;
    }

    function getRealIndex(idx) {
      if (idx <= 0) return totalSlides - 1;
      if (idx >= totalSlides + 1) return 0;
      return idx - 1;
    }

    function updateVisuals(idx) {
      var realIdx = getRealIndex(idx);

      // Update dots
      dots.forEach(function (dot, i) {
        var isActive = i === realIdx;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Update slides
      var allSlides = Array.from(track.querySelectorAll('.hero-carousel-slide'));
      allSlides.forEach(function (slide, i) {
        var isActive = (i === idx) || (idx === 0 && i === totalSlides) || (idx === totalSlides + 1 && i === 1);
        slide.classList.toggle('is-active', isActive);
        var link = slide.querySelector('.hero-carousel-link');
        if (link) {
          link.setAttribute('tabindex', isActive ? '0' : '-1');
        }
      });
    }

    function moveToTrackIndex(targetIndex, animate) {
      if (animate === false) {
        track.style.transition = 'none';
        trackIndex = targetIndex;
        track.style.transform = 'translateX(-' + (trackIndex * 100) + '%)';
        track.offsetHeight; // force reflow
        updateVisuals(trackIndex);
        return;
      }

      isTransitioning = true;
      trackIndex = targetIndex;
      track.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
      track.style.transform = 'translateX(-' + (trackIndex * 100) + '%)';
      updateVisuals(trackIndex);
    }

    function checkReset() {
      if (trackIndex >= totalSlides + 1) {
        track.style.transition = 'none';
        trackIndex = 1;
        track.style.transform = 'translateX(-100%)';
        track.offsetHeight; // force reflow
        updateVisuals(trackIndex);
      } else if (trackIndex <= 0) {
        track.style.transition = 'none';
        trackIndex = totalSlides;
        track.style.transform = 'translateX(-' + (totalSlides * 100) + '%)';
        track.offsetHeight; // force reflow
        updateVisuals(trackIndex);
      }
      isTransitioning = false;
    }

    track.addEventListener('transitionend', function (e) {
      if (e.target !== track) return;
      checkReset();
    });

    function nextSlide() {
      if (isTransitioning) checkReset();
      moveToTrackIndex(trackIndex + 1, true);
    }

    function prevSlide() {
      if (isTransitioning) checkReset();
      moveToTrackIndex(trackIndex - 1, true);
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

    /* Drag & Hold to slide Handlers */
    function dragStart(e) {
      if (e.target.closest('.hero-carousel-controls')) return;

      if (isTransitioning) {
        checkReset();
      }

      isDragging = true;
      hasMoved = false;
      startPos = getPositionX(e);
      stopAutoplay();

      var slideWidth = carousel.clientWidth;
      currentTranslate = -(trackIndex * slideWidth);
      prevTranslate = currentTranslate;

      track.classList.add('is-dragging');
      carousel.classList.add('is-dragging');
    }

    function dragMove(e) {
      if (!isDragging) return;
      var currentPosition = getPositionX(e);
      var diff = currentPosition - startPos;
      if (Math.abs(diff) > 5) {
        hasMoved = true;
      }
      currentTranslate = prevTranslate + diff;
      track.style.transform = 'translateX(' + currentTranslate + 'px)';
    }

    function dragEnd() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('is-dragging');
      carousel.classList.remove('is-dragging');

      var movedBy = currentTranslate - prevTranslate;
      var slideWidth = carousel.clientWidth;
      var threshold = Math.min(slideWidth * 0.12, 50);

      if (movedBy < -threshold) {
        // Dragged left -> smoothly slide to next
        moveToTrackIndex(trackIndex + 1, true);
      } else if (movedBy > threshold) {
        // Dragged right -> smoothly slide to prev
        moveToTrackIndex(trackIndex - 1, true);
      } else {
        // Snap back
        moveToTrackIndex(trackIndex, true);
      }

      startAutoplay();
    }

    /* Prevent link clicks during drag */
    track.addEventListener('click', function (e) {
      if (hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    /* Mouse drag events */
    carousel.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    /* Touch drag events */
    carousel.addEventListener('touchstart', dragStart, { passive: true });
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('touchend', dragEnd, { passive: true });

    /* Button controls */
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        nextSlide();
        startAutoplay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        prevSlide();
        startAutoplay();
      });
    }

    /* Dot indicators */
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.stopPropagation();
        var slideIndex = parseInt(this.getAttribute('data-slide'), 10);
        if (!isNaN(slideIndex)) {
          if (isTransitioning) checkReset();
          moveToTrackIndex(slideIndex + 1, true);
          startAutoplay();
        }
      });
    });

    /* Pause on hover & focus */
    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', function () {
      if (!isDragging) startAutoplay();
    });
    carousel.addEventListener('focusin', stopAutoplay);
    carousel.addEventListener('focusout', function () {
      if (!isDragging) startAutoplay();
    });

    /* Progressive One-by-One Idle Preloader:
       Loads carousel images before scroll, sequentially one-by-one after critical page content is ready */
    function initProgressiveLoader() {
      var queue = [];
      for (var s = 1; s < totalSlides; s++) {
        queue.push(s);
      }

      var preloadedMap = {};

      function preloadSlide(idx, callback) {
        if (preloadedMap[idx]) {
          if (callback) callback();
          return;
        }
        preloadedMap[idx] = true;

        var slide = originalSlides[idx];
        if (!slide) {
          if (callback) callback();
          return;
        }

        var img = slide.querySelector('.hero-carousel-img');
        var picture = slide.querySelector('picture');
        var source = picture ? picture.querySelector('source') : null;

        if (!img) {
          if (callback) callback();
          return;
        }

        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        var targetUrl = (isMobile && source && source.srcset) ? source.srcset : (img.currentSrc || img.src);

        var prefetcher = new Image();
        prefetcher.decoding = 'async';

        function markReady() {
          if (img.decode) {
            img.decode().catch(function () {}).finally(function () {
              slide.classList.add('is-loaded');
              if (callback) callback();
            });
          } else {
            slide.classList.add('is-loaded');
            if (callback) callback();
          }
        }

        prefetcher.onload = markReady;
        prefetcher.onerror = function () {
          if (callback) callback();
        };
        prefetcher.src = targetUrl;
      }

      function processQueue() {
        if (queue.length === 0) return;
        var nextIdx = queue.shift();
        preloadSlide(nextIdx, function () {
          // Small micro-pause (60ms) between slides keeps the browser rendering butter smooth
          setTimeout(processQueue, 60);
        });
      }

      function preloadAllImmediately() {
        while (queue.length > 0) {
          preloadSlide(queue.shift());
        }
      }

      // Schedule sequential preloading once page content has finished rendering
      var scheduleIdle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 100); };

      if (document.readyState === 'complete') {
        scheduleIdle(processQueue);
      } else {
        window.addEventListener('load', function () {
          scheduleIdle(processQueue);
        });
        // Safety timeout so queue begins even if load event is deferred
        setTimeout(function () {
          scheduleIdle(processQueue);
        }, 300);
      }

      // If user hovers, touches, or starts interacting earlier, load all remaining immediately
      var onInteract = function () {
        preloadAllImmediately();
        carousel.removeEventListener('pointerenter', onInteract);
        carousel.removeEventListener('touchstart', onInteract);
      };
      carousel.addEventListener('pointerenter', onInteract, { passive: true, once: true });
      carousel.addEventListener('touchstart', onInteract, { passive: true, once: true });
    }

    initProgressiveLoader();

    /* Window resize recalculation */
    window.addEventListener('resize', function () {
      moveToTrackIndex(trackIndex, false);
    });

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
    moveToTrackIndex(1, false);
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
