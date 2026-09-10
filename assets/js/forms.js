/* ============================================================================
   KNSS — Forms: validation + structured WhatsApp submission
   Flow: validate → format a professional message → open wa.me prefilled →
   clearly tell the user to press Send inside WhatsApp.
   ========================================================================== */
(function () {
  'use strict';

  var PHONE_RE = /^(\+?91[\-\s]?)?[6-9]\d{9}$/;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PIN_RE = /^\d{6}$/;
  var started = {}; /* form start tracking, once per form */

  function KNSS() { return window.KNSS || {}; }
  function track(name, params) {
    if (typeof window.trackEvent === 'function') window.trackEvent(name, params);
  }

  /* ---------- helpers ---------- */

  function formOf(el) { return el.closest('form'); }

  function fieldWrap(input) { return input.closest('.field'); }

  function setError(input, message) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    var errorEl = wrap.querySelector('.field-error');
    wrap.classList.add('is-invalid');
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
  }

  function clearError(input) {
    var wrap = fieldWrap(input);
    if (!wrap) return;
    var errorEl = wrap.querySelector('.field-error');
    wrap.classList.remove('is-invalid');
    input.removeAttribute('aria-invalid');
    if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }
  }

  function validateField(input) {
    var value = (input.value || '').trim();

    if (input.required && value === '') {
      setError(input, 'This field is required.');
      return false;
    }

    if (input.type === 'tel' && value !== '') {
      if (!PHONE_RE.test(value.replace(/[\s\-().]/g, ''))) {
        setError(input, 'Please enter a valid 10-digit mobile number (with optional +91).');
        return false;
      }
    }

    if (input.type === 'email' && value !== '') {
      if (!EMAIL_RE.test(value)) {
        setError(input, 'Please enter a valid email address.');
        return false;
      }
    }

    if ((input.name === 'pin') && value !== '') {
      if (!PIN_RE.test(value)) {
        setError(input, 'PIN code must be exactly 6 digits.');
        return false;
      }
    }

    if (input.type === 'date' && value !== '') {
      var chosen = new Date(value + 'T00:00:00');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        setError(input, 'Please choose today or a future date.');
        return false;
      }
    }

    clearError(input);
    return true;
  }

  function validateForm(form) {
    var firstInvalid = null;
    /* Format checks run on every field (even optional ones, e.g. an optional
       email or PIN); the required check itself only applies to [required]. */
    form.querySelectorAll('input:not([type="radio"]), select, textarea').forEach(function (input) {
      var ok = validateField(input);
      if (!ok && !firstInvalid) firstInvalid = input;
    });
    return firstInvalid;
  }

  function showStatus(form, kind, html) {
    var status = form.querySelector('.form-status');
    if (!status) return;
    status.hidden = false;
    status.innerHTML = '<div class="status-card status-card--' + kind + '" role="' + (kind === 'error' ? 'alert' : 'status') + '">' + html + '</div>';
    if (typeof status.scrollIntoView === 'function') status.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function formData(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      if (typeof value === 'string') data[key] = value.trim();
    });
    /* radio groups that are unchecked still get their default label */
    if (!data.existing) data.existing = 'No';
    return data;
  }

  /* ---------- message builders (structured, professional) ---------- */

  function contactMessage(data, sourcePage) {
    return KNSS().buildWhatsAppMessage({
      intro: 'I would like to enquire about your services.',
      sections: [
        { heading: 'CUSTOMER DETAILS', fields: [
          ['Name', data.name], ['Phone', data.phone], ['Email', data.email],
          ['Company', data.company], ['Location', data.location]
        ] },
        { heading: 'SERVICE REQUIRED', fields: [['Service', data.service]] }
      ],
      requirement: data.message,
      source: 'Contact Form — ' + sourcePage
    });
  }

  function quoteMessage(data, sourcePage) {
    return KNSS().buildWhatsAppMessage({
      intro: 'I would like to request a quotation.',
      sections: [
        { heading: 'CUSTOMER DETAILS', fields: [
          ['Name', data.name], ['Phone', data.phone], ['Email', data.email], ['Company', data.company]
        ] },
        { heading: 'LOCATION', fields: [
          ['Address', data.address], ['City', data.city], ['PIN Code', data.pin]
        ] },
        { heading: 'SERVICE REQUIRED', fields: [['Service', data.service]] },
        { heading: 'PROPERTY DETAILS', fields: [
          ['Property', data.property], ['Approximate Area', data.area],
          ['Floors', data.floors], ['Users/Employees', data.users],
          ['Existing System', data.existing]
        ] }
      ],
      requirement: data.message,
      source: 'Website Quote Request — ' + sourcePage
    });
  }

  function siteVisitMessage(data, sourcePage) {
    return KNSS().buildWhatsAppMessage({
      intro: 'I would like to request a site visit.',
      sections: [
        { heading: 'CONTACT DETAILS', fields: [
          ['Name', data.name], ['Phone', data.phone], ['Email', data.email], ['Location', data.location]
        ] },
        { heading: 'VISIT REQUEST', fields: [
          ['Service', data.service], ['Preferred Date', data.date], ['Preferred Time', data.time]
        ] }
      ],
      requirement: data.message,
      source: 'Site Visit Request — ' + sourcePage
    });
  }

  var BUILDERS = {
    'contact': contactMessage,
    'quote': quoteMessage,
    'site-visit': siteVisitMessage
  };

  var TRACK_NAMES = {
    'contact': ['contact_form_start', 'contact_form_submit'],
    'quote': ['quote_form_start', 'quote_form_submit'],
    'site-visit': ['site_visit_form_start', 'site_visit_form_submit']
  };

  /* ---------- progress bar (quote form) ---------- */

  function initProgress(form) {
    var fill = document.getElementById('quoteProgress');
    var label = document.getElementById('quoteProgressLabel');
    if (!fill || !label || form.id !== 'quoteForm') return;

    var requiredEls = Array.prototype.slice.call(form.querySelectorAll('[required]'));

    function update() {
      var done = requiredEls.filter(function (el) { return (el.value || '').trim() !== ''; }).length;
      var pct = requiredEls.length ? Math.round((done / requiredEls.length) * 100) : 0;
      fill.style.width = pct + '%';
      label.textContent = pct + '% complete';
    }
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
  }

  /* ---------- main init ---------- */

  function initForms() {
    var forms = document.querySelectorAll('form[data-form-type]');
    if (!forms.length) return;

    forms.forEach(function (form) {
      var type = form.getAttribute('data-form-type');
      var sourcePage = window.location.pathname || '/';

      /* hidden metadata for a future backend */
      var sp = form.querySelector('[name="source_page"]');
      var ft = form.querySelector('[name="form_type"]');
      var sa = form.querySelector('[name="submitted_at"]');
      if (sp) sp.value = sourcePage;
      if (ft) ft.value = type;
      if (sa) sa.value = '';

      /* date min = today */
      var dateInput = form.querySelector('input[type="date"]');
      if (dateInput) dateInput.min = new Date().toISOString().slice(0, 10);

      /* live validation feedback + form-start tracking */
      form.querySelectorAll('input, select, textarea').forEach(function (input) {
        input.addEventListener('input', function () {
          if (fieldWrap(input) && fieldWrap(input).classList.contains('is-invalid')) validateField(input);
        });
        input.addEventListener('change', function () {
          if (fieldWrap(input) && fieldWrap(input).classList.contains('is-invalid')) validateField(input);
        });
      });

      form.addEventListener('input', function () {
        if (!started[type]) { started[type] = true; track(TRACK_NAMES[type][0], { page: sourcePage }); }
      }, { once: true });

      initProgress(form);

      var submitting = false;

      form.addEventListener('submit', function (event) {
        event.preventDefault();
        if (submitting) return; /* duplicate-submit guard */

        var stamp = form.querySelector('[name="submitted_at"]');
        if (stamp) stamp.value = new Date().toISOString();

        var firstInvalid = validateForm(form);
        if (firstInvalid) {
          showStatus(form, 'error',
            '<strong>Please check the highlighted fields.</strong><br>Some required information is missing or needs correction.');
          firstInvalid.focus({ preventScroll: true });
          if (typeof firstInvalid.scrollIntoView === 'function') firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        var data = formData(form);
        var builder = BUILDERS[type];
        if (!builder || !KNSS().openWhatsApp) return;

        var message = builder(data, sourcePage);
        var submitBtn = form.querySelector('button[type="submit"]');
        submitting = true;
        if (submitBtn) {
          submitBtn.setAttribute('aria-busy', 'true');
          submitBtn.style.opacity = '0.7';
          var span = submitBtn.querySelector('span');
          if (span) { span.dataset.original = span.textContent; span.textContent = 'Opening WhatsApp…'; }
        }

        var opened = KNSS().openWhatsApp(message);

        window.setTimeout(function () {
          submitting = false;
          if (submitBtn) {
            submitBtn.removeAttribute('aria-busy');
            submitBtn.style.opacity = '';
            var label2 = submitBtn.querySelector('span');
            if (label2 && label2.dataset.original) label2.textContent = label2.dataset.original;
          }
          if (opened) {
            track(TRACK_NAMES[type][1], { page: sourcePage, service: data.service || '' });
            showStatus(form, 'success',
              '<strong>Your enquiry message is ready in WhatsApp. Please press Send to submit it.</strong><br>' +
              'Nothing is sent automatically — WhatsApp opens with your details pre-filled, and your message reaches us only after you press Send.' +
              '<div class="status-actions">' +
              '<button type="button" class="btn btn--wa btn--sm" data-reopen-wa>Open WhatsApp Again</button>' +
              '<span class="small-muted">If WhatsApp did not open, please allow pop-ups for this site.</span>' +
              '</div>');
            var reopen = form.querySelector('[data-reopen-wa]');
            if (reopen) {
              reopen.addEventListener('click', function () {
                KNSS().openWhatsApp(message);
              });
            }
          } else {
            showStatus(form, 'error',
              '<strong>WhatsApp is not configured yet.</strong><br>' +
              'Please email your requirement to ' + ((window.SITE_CONFIG || {}).email || '') + ' — we will respond personally.');
          }
        }, 700);
      });
    });
  }

  window.KNSS_FORMS = { initForms: initForms };
})();
