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

    // Helper to create and properly initialize clones
    function createCloneSlide(sourceSlide, isCloneLast) {
      var clone = sourceSlide.cloneNode(true);
      clone.classList.add('hero-carousel-clone');
      clone.classList.add(isCloneLast ? 'hero-carousel-clone--last' : 'hero-carousel-clone--first');
      clone.classList.remove('is-active');
      clone.setAttribute('aria-hidden', 'true');
      var link = clone.querySelector('.hero-carousel-link');
      if (link) link.setAttribute('tabindex', '-1');

      var cloneImg = clone.querySelector('.hero-carousel-img');
      var sourceImg = sourceSlide.querySelector('.hero-carousel-img');
      var clonePic = clone.querySelector('picture');
      var sourcePic = sourceSlide.querySelector('picture');

      if (cloneImg && sourceImg) {
        cloneImg.removeAttribute('loading');
        cloneImg.setAttribute('decoding', 'async');

        var isMobile = window.matchMedia('(max-width: 768px)').matches;
        var sourceSource = sourcePic ? sourcePic.querySelector('source') : null;
        var cloneSource = clonePic ? clonePic.querySelector('source') : null;

        if (sourceSource && cloneSource && sourceSource.getAttribute('srcset')) {
          cloneSource.setAttribute('srcset', sourceSource.getAttribute('srcset'));
        }

        var targetUrl = (isMobile && sourceSource && sourceSource.getAttribute('srcset'))
          ? sourceSource.getAttribute('srcset')
          : (sourceImg.currentSrc || sourceImg.getAttribute('src') || sourceImg.src);

        if (targetUrl) {
          cloneImg.src = targetUrl;
        }

        if (cloneImg.decode) {
          cloneImg.decode().catch(function () {});
        }
      }

      return clone;
    }

    function syncCloneWithSource(cloneEl, sourceSlide) {
      if (!cloneEl || !sourceSlide) return;
      var cloneImg = cloneEl.querySelector('.hero-carousel-img');
      var sourceImg = sourceSlide.querySelector('.hero-carousel-img');
      var clonePic = cloneEl.querySelector('picture');
      var sourcePic = sourceSlide.querySelector('picture');
      if (!cloneImg || !sourceImg) return;

      var isMobile = window.matchMedia('(max-width: 768px)').matches;
      var sourceSource = sourcePic ? sourcePic.querySelector('source') : null;
      var cloneSource = clonePic ? clonePic.querySelector('source') : null;

      if (sourceSource && cloneSource && sourceSource.getAttribute('srcset')) {
        cloneSource.setAttribute('srcset', sourceSource.getAttribute('srcset'));
      }

      var targetUrl = (isMobile && sourceSource && sourceSource.getAttribute('srcset'))
        ? sourceSource.getAttribute('srcset')
        : (sourceImg.currentSrc || sourceImg.getAttribute('src') || sourceImg.src);

      if (targetUrl && cloneImg.src !== targetUrl) {
        cloneImg.src = targetUrl;
      }

      if (cloneImg.decode) {
        cloneImg.decode().catch(function () {});
      }
      cloneEl.classList.add('is-loaded');
    }

    // Create clones for seamless infinite loop (Slide 5 at start, Slide 1 at end)
    var cloneFirst = createCloneSlide(originalSlides[0], false);
    var cloneLast = createCloneSlide(originalSlides[totalSlides - 1], true);

    track.appendChild(cloneFirst);
    track.insertBefore(cloneLast, originalSlides[0]);

    // Track state: indices range from 0 (cloneLast) to totalSlides + 1 (cloneFirst)
    // Real slides are at indices 1 to totalSlides
    var trackIndex = 1;
    var autoplayDelay = 5000;
    var timer = null;
    var isTransitioning = false;
    var resetTimeout = null;

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
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }

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

      if (targetIndex <= 0 || targetIndex >= totalSlides + 1) {
        resetTimeout = setTimeout(function () {
          checkReset();
        }, 550);
      }
    }

    function checkReset() {
      if (resetTimeout) {
        clearTimeout(resetTimeout);
        resetTimeout = null;
      }
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
      if (trackIndex === totalSlides) {
        syncCloneWithSource(cloneFirst, originalSlides[0]);
      }
      if (carousel.__preloadSlide) {
        carousel.__preloadSlide(1);
      }
      moveToTrackIndex(trackIndex + 1, true);
    }

    function prevSlide() {
      if (isTransitioning) checkReset();
      syncCloneWithSource(cloneLast, originalSlides[totalSlides - 1]);
      if (carousel.__preloadSlide) {
        carousel.__preloadSlide(totalSlides - 1);
      }
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

      if (trackIndex === 1) {
        syncCloneWithSource(cloneLast, originalSlides[totalSlides - 1]);
      } else if (trackIndex === totalSlides) {
        syncCloneWithSource(cloneFirst, originalSlides[0]);
      }
      if (carousel.__preloadAllImmediately) {
        carousel.__preloadAllImmediately();
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
        syncCloneWithSource(cloneLast, originalSlides[totalSlides - 1]);
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

    /* Progressive Idle Preloader:
       1. Preloads adjacent slides (Slide 2 [forward] and Slide 5 / cloneLast [backward])
          immediately once critical page content is ready.
       2. Continues the lazy loading feature by sequentially loading remaining distant slides
          (Slide 3, then Slide 4) one-by-one with micro-pauses in background idle time.
       3. If user interacts (touch, drag, hover) at any time, instantly dispatches all remaining slides.
    */
    function initProgressiveLoader() {
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
          var decodePromises = [];
          if (img.decode) {
            decodePromises.push(img.decode().catch(function () {}));
          }
          slide.classList.add('is-loaded');

          // If this is Slide 5 (Fire Safety), sync and decode cloneLast immediately!
          if (idx === totalSlides - 1 && cloneLast) {
            syncCloneWithSource(cloneLast, slide);
            var cLastImg = cloneLast.querySelector('.hero-carousel-img');
            if (cLastImg && cLastImg.decode) {
              decodePromises.push(cLastImg.decode().catch(function () {}));
            }
          }

          // If this is Slide 1 (Data Networking), sync and decode cloneFirst immediately!
          if (idx === 0 && cloneFirst) {
            syncCloneWithSource(cloneFirst, slide);
            var cFirstImg = cloneFirst.querySelector('.hero-carousel-img');
            if (cFirstImg && cFirstImg.decode) {
              decodePromises.push(cFirstImg.decode().catch(function () {}));
            }
          }

          if (decodePromises.length > 0) {
            Promise.all(decodePromises).finally(function () {
              if (callback) callback();
            });
          } else {
            if (callback) callback();
          }
        }

        prefetcher.onload = markReady;
        prefetcher.onerror = function () {
          if (callback) callback();
        };
        prefetcher.src = targetUrl;
      }

      // Slide 1 (index 0) is already loaded. Sync cloneFirst immediately.
      syncCloneWithSource(cloneFirst, originalSlides[0]);

      // Distant slides queue to load one by one dynamically: [2, 3] (Slide 3, then Slide 4)
      var distantQueue = [];
      for (var s = 2; s < totalSlides - 1; s++) {
        distantQueue.push(s);
      }

      function processDistantQueue() {
        if (distantQueue.length === 0) return;
        var nextIdx = distantQueue.shift();
        preloadSlide(nextIdx, function () {
          setTimeout(processDistantQueue, 60);
        });
      }

      function preloadAllImmediately() {
        // Preload immediate adjacent slides first if not already done
        preloadSlide(1); // Slide 2 (forward)
        preloadSlide(totalSlides - 1); // Slide 5 (backward / cloneLast)
        while (distantQueue.length > 0) {
          preloadSlide(distantQueue.shift());
        }
      }

      function startLoadingSequence() {
        // Step 1: Preload immediate neighbors (Slide 2 [forward] and Slide 5 [backward / cloneLast])
        // so that swiping in EITHER direction is instantaneous with ZERO blank screen!
        preloadSlide(1, function () {
          preloadSlide(totalSlides - 1, function () {
            // Step 2: Continue the lazy load feature dynamically one by one
            setTimeout(processDistantQueue, 60);
          });
        });
      }

      var scheduleIdle = window.requestIdleCallback || function (cb) { return setTimeout(cb, 50); };

      if (document.readyState === 'complete') {
        scheduleIdle(startLoadingSequence);
      } else {
        window.addEventListener('load', function () {
          scheduleIdle(startLoadingSequence);
        });
        setTimeout(function () {
          scheduleIdle(startLoadingSequence);
        }, 150);
      }

      // Preload everything immediately on any user gesture or interaction
      var onInteract = function () {
        preloadAllImmediately();
        carousel.removeEventListener('pointerenter', onInteract);
        carousel.removeEventListener('touchstart', onInteract);
        carousel.removeEventListener('mousedown', onInteract);
      };
      carousel.addEventListener('pointerenter', onInteract, { passive: true, once: true });
      carousel.addEventListener('touchstart', onInteract, { passive: true, once: true });
      carousel.addEventListener('mousedown', onInteract, { passive: true, once: true });

      // Expose to carousel controls
      carousel.__preloadAllImmediately = preloadAllImmediately;
      carousel.__preloadSlide = preloadSlide;
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
