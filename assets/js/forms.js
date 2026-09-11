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

  /* Tamil/English runtime message helper */
  function T(id, fallback, params) {
    if (window.KNSS_I18N && typeof window.KNSS_I18N.t === 'function') {
      return window.KNSS_I18N.t(id, fallback, params);
    }
    var out = fallback;
    if (params) {
      Object.keys(params).forEach(function (k) {
        out = out.split('{' + k + '}').join(String(params[k]));
      });
    }
    return out;
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
      setError(input, T('validation.required', 'This field is required.'));
      return false;
    }

    if (input.type === 'tel' && value !== '') {
      if (!PHONE_RE.test(value.replace(/[\s\-().]/g, ''))) {
        setError(input, T('validation.phone', 'Please enter a valid 10-digit mobile number (with optional +91).'));
        return false;
      }
    }

    if (input.type === 'email' && value !== '') {
      if (!EMAIL_RE.test(value)) {
        setError(input, T('validation.email', 'Please enter a valid email address.'));
        return false;
      }
    }

    if ((input.name === 'pin') && value !== '') {
      if (!PIN_RE.test(value)) {
        setError(input, T('validation.pin', 'PIN code must be exactly 6 digits.'));
        return false;
      }
    }

    if (input.type === 'date' && value !== '') {
      var chosen = new Date(value + 'T00:00:00');
      var today = new Date();
      today.setHours(0, 0, 0, 0);
      if (chosen < today) {
        setError(input, T('validation.date', 'Please choose today or a future date.'));
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
      intro: T('wa.contactIntro', 'I would like to enquire about your services.'),
      sections: [
        { heading: T('wa.section.customer', 'CUSTOMER DETAILS'), fields: [
          [T('wa.label.name', 'Name'), data.name], [T('wa.label.phone', 'Phone'), data.phone], [T('wa.label.email', 'Email'), data.email],
          [T('wa.label.company', 'Company'), data.company], [T('wa.label.location', 'Location'), data.location]
        ] },
        { heading: T('wa.section.service', 'SERVICE REQUIRED'), fields: [[T('wa.label.service', 'Service'), data.service]] }
      ],
      requirement: data.message,
      source: T('wa.src.contact', 'Contact Form') + ' — ' + sourcePage
    });
  }

  function quoteMessage(data, sourcePage) {
    return KNSS().buildWhatsAppMessage({
      intro: T('wa.quoteIntro', 'I would like to request a quotation.'),
      sections: [
        { heading: T('wa.section.customer', 'CUSTOMER DETAILS'), fields: [
          [T('wa.label.name', 'Name'), data.name], [T('wa.label.phone', 'Phone'), data.phone], [T('wa.label.email', 'Email'), data.email], [T('wa.label.company', 'Company'), data.company]
        ] },
        { heading: T('wa.section.location', 'LOCATION'), fields: [
          [T('wa.label.address', 'Address'), data.address], [T('wa.label.city', 'City'), data.city], [T('wa.label.pin', 'PIN Code'), data.pin]
        ] },
        { heading: T('wa.section.service', 'SERVICE REQUIRED'), fields: [[T('wa.label.service', 'Service'), data.service]] },
        { heading: T('wa.section.property', 'PROPERTY DETAILS'), fields: [
          [T('wa.label.property', 'Property'), data.property], [T('wa.label.area', 'Approximate Area'), data.area],
          [T('wa.label.floors', 'Floors'), data.floors], [T('wa.label.users', 'Users/Employees'), data.users],
          [T('wa.label.existing', 'Existing System'), data.existing]
        ] }
      ],
      requirement: data.message,
      source: T('wa.src.quote', 'Website Quote Request') + ' — ' + sourcePage
    });
  }

  function siteVisitMessage(data, sourcePage) {
    return KNSS().buildWhatsAppMessage({
      intro: T('wa.visitIntro', 'I would like to request a site visit.'),
      sections: [
        { heading: T('wa.section.contact', 'CONTACT DETAILS'), fields: [
          [T('wa.label.name', 'Name'), data.name], [T('wa.label.phone', 'Phone'), data.phone], [T('wa.label.email', 'Email'), data.email], [T('wa.label.location', 'Location'), data.location]
        ] },
        { heading: T('wa.section.visit', 'VISIT REQUEST'), fields: [
          [T('wa.label.service', 'Service'), data.service], [T('wa.label.date', 'Preferred Date'), data.date], [T('wa.label.time', 'Preferred Time'), data.time]
        ] }
      ],
      requirement: data.message,
      source: T('wa.src.visit', 'Site Visit Request') + ' — ' + sourcePage
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
      label.textContent = T('form.progress', '{n}% complete', { n: pct });
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
            T('form.fixErrors', '<strong>Please check the highlighted fields.</strong><br>Some required information is missing or needs correction.'));
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
          if (span) { span.dataset.original = span.textContent; span.textContent = T('form.opening', 'Opening WhatsApp…'); }
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
              T('form.readyTitle', '<strong>Your enquiry message is ready in WhatsApp. Please press Send to submit it.</strong>') + '<br>' +
              T('form.readyBody', 'Nothing is sent automatically — WhatsApp opens with your details pre-filled, and your message reaches us only after you press Send.') +
              '<div class="status-actions">' +
              '<button type="button" class="btn btn--wa btn--sm" data-reopen-wa>' + T('form.reopen', 'Open WhatsApp Again') + '</button>' +
              '<span class="small-muted">' + T('form.popupNote', 'If WhatsApp did not open, please allow pop-ups for this site.') + '</span>' +
              '</div>');
            var reopen = form.querySelector('[data-reopen-wa]');
            if (reopen) {
              reopen.addEventListener('click', function () {
                KNSS().openWhatsApp(message);
              });
            }
          } else {
            showStatus(form, 'error',
              T('form.waUnconfigured', '<strong>WhatsApp is not configured yet.</strong><br>Please email your requirement to {email} — we will respond personally.', { email: (window.SITE_CONFIG || {}).email || '' }));
          }
        }, 700);
      });
    });
  }

  window.KNSS_FORMS = { initForms: initForms };
})();
