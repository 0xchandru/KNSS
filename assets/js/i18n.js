/* ============================================================================
   KNSS — i18n engine (EN / த language toggle)
   ----------------------------------------------------------------------------
   Static, dependency-free. Works together with the generated dictionary in
   i18n-data.js (KNSS_I18N_DATA). Three translation layers:

     1. strings — exact-English text node  → Tamil
     2. attrs   — attribute values         → Tamil (checked before strings
                  for <option> text so select options can override nav labels)
     3. runtime — message IDs used by the JS modules (forms/WhatsApp/projects),
                  with {param} interpolation. Looked up through KNSS_I18N.t().

   Switching languages:
     - walks the DOM once, remembering every original text node / attribute so
       switching back to English restores the built HTML exactly;
     - swaps <title> via the per-page meta map (keyed by <body data-page>);
     - sets <html lang> and a .lang-ta class (Tamil typography) and persists
       the choice in localStorage ("knss-lang");
     - fires a "knss:langchange" event after every switch.
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.KNSS_I18N_DATA;
  var STORAGE_KEY = 'knss-lang';
  var TA = DATA && DATA.lang === 'ta' ? 'ta' : 'ta';
  var currentLang = 'en';

  /* original values, remembered the first time Tamil is applied */
  var origText = new Map();   /* Text node  -> original nodeValue        */
  var origAttr = new Map();   /* Element    -> { attr: originalValue }   */
  var origTitle = null;

  var ATTR_NAMES = ['placeholder', 'aria-label', 'title', 'alt'];

  function dict() {
    return DATA && DATA.strings ? DATA.strings : {};
  }

  function normalise(s) {
    return String(s).replace(/\s+/g, ' ').trim();
  }

  /* ---------- runtime message lookup (JS-composed strings) ---------- */

  function t(id, fallback, params) {
    var out = fallback;
    if (currentLang === 'ta' && DATA && DATA.runtime && DATA.runtime[id]) {
      out = DATA.runtime[id];
    }
    if (params) {
      Object.keys(params).forEach(function (k) {
        out = out.split('{' + k + '}').join(String(params[k]));
      });
    }
    return out;
  }

  function lang() {
    return currentLang;
  }

  function isTa() {
    return currentLang === 'ta';
  }

  /* ---------- DOM walking ---------- */

  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, SVG: 1, TEXTAREA: 1, CODE: 1 };

  function translateTextNodes(root, toTa) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var parent = node.parentNode;
        if (!parent || SKIP_TAGS[parent.nodeName]) return NodeFilter.FILTER_REJECT;
        /* <option> text is handled by translateAttrs (attrs map wins so a
           select option can differ from a nav label with the same text) */
        if (parent.nodeName === 'OPTION') return NodeFilter.FILTER_REJECT;
        /* do not touch lightbox content cloned into body — it mirrors cards */
        if (parent.closest && parent.closest('.lightbox')) return NodeFilter.FILTER_REJECT;
        /* do not translate language toggle pill labels */
        if (parent.closest && parent.closest('[data-lang-toggle]')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);

    var strings = dict();
    nodes.forEach(function (node) {
      var key = normalise(node.nodeValue);
      if (toTa) {
        if (!origText.has(node)) origText.set(node, node.nodeValue);
        var hit = strings[key];
        if (hit) {
          /* keep the node's original edge whitespace so inline markup
             (spans inside headings, the © year) keeps its spacing */
          var m = node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
          node.nodeValue = m[1] + hit + m[3];
        }
      } else if (origText.has(node)) {
        node.nodeValue = origText.get(node);
      }
    });
  }

  function translateAttrs(root, toTa) {
    var els = root.querySelectorAll('*');
    var attrsMap = DATA && DATA.attrs ? DATA.attrs : {};
    var strings = dict();

    Array.prototype.forEach.call(els, function (el) {
      if (SKIP_TAGS[el.nodeName]) return;
      if (el.closest && el.closest('.lightbox')) return;

      ATTR_NAMES.forEach(function (attr) {
        if (!el.hasAttribute(attr)) return;
        var val = el.getAttribute(attr);
        if (!val || !val.trim()) return;

        if (toTa) {
          if (!origAttr.has(el)) origAttr.set(el, {});
          var bag = origAttr.get(el);
          if (!(attr in bag)) bag[attr] = val;

          var key = normalise(val);
          var hit;
          if (el.nodeName === 'OPTION' && attrsMap[key]) hit = attrsMap[key];
          else hit = attrsMap[key] || strings[key];
          if (hit) el.setAttribute(attr, hit);
        } else {
          var bag2 = origAttr.get(el);
          if (bag2 && attr in bag2) el.setAttribute(attr, bag2[attr]);
        }
      });

      /* <option> text: attrs map first (property-type selects say வீடு, not முகப்பு) */
      if (el.nodeName === 'OPTION') {
        var key2 = normalise(el.textContent);
        var first = el.firstChild;
        var isText = first && first.nodeType === 3;
        if (toTa) {
          if (isText && !origText.has(first)) origText.set(first, first.nodeValue);
          var hit2 = attrsMap[key2] || strings[key2];
          if (hit2 && isText) first.nodeValue = hit2;
        } else if (isText && origText.has(first)) {
          first.nodeValue = origText.get(first);
        }
      }
    });
  }

  function translateTitle(toTa) {
    var path = document.body ? document.body.getAttribute('data-page') : null;
    if (toTa) {
      if (origTitle === null) origTitle = document.title;
      var entry = path && DATA && DATA.meta && DATA.meta[path];
      if (entry && entry.title) document.title = entry.title;
    } else if (origTitle !== null) {
      document.title = origTitle;
    }
  }

  /* ---------- toggle UI ---------- */

  function syncToggles() {
    document.querySelectorAll('[data-lang-toggle]').forEach(function (group) {
      group.querySelectorAll('[data-lang-option]').forEach(function (btn) {
        var active = btn.getAttribute('data-lang-option') === currentLang;
        btn.setAttribute('aria-pressed', active ? 'true' : 'false');
        btn.classList.toggle('is-active', active);
      });
    });
  }

  function setLang(next, options) {
    next = next === 'ta' ? 'ta' : 'en';
    if (next === currentLang && !(options && options.force)) return;
    currentLang = next;
    var toTa = next === 'ta';

    if (document.body) {
      translateTitle(toTa);
      translateTextNodes(document.body, toTa);
      translateAttrs(document.body, toTa);
    }
    document.documentElement.lang = toTa ? 'ta' : 'en';
    document.documentElement.classList.toggle('lang-ta', toTa);

    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* private mode */ }
    syncToggles();
    document.dispatchEvent(new CustomEvent('knss:langchange', { detail: { lang: next } }));
  }

  /* ---------- init ---------- */

  function donePending() {
    document.documentElement.classList.remove('i18n-pending');
    document.documentElement.classList.add('i18n-ready');
  }

  function init() {
    if (!DATA) {
      donePending();
      return; /* dictionary missing — stay English, hide nothing */
    }

    document.querySelectorAll('[data-lang-toggle] [data-lang-option]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLang(btn.getAttribute('data-lang-option'));
      });
    });

    var saved = 'en';
    try {
      var param = new URLSearchParams(window.location.search).get('lang');
      if (param === 'ta' || param === 'en') {
        saved = param;
      } else {
        saved = localStorage.getItem(STORAGE_KEY) || 'en';
      }
    } catch (e) { /* private mode */ }
    if (saved === 'ta') {
      setLang('ta', { force: true });
    } else {
      currentLang = 'en';
      syncToggles();
    }
    donePending();
  }

  if (document.body) {
    init();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ---------- public API ---------- */
  window.KNSS_I18N = {
    lang: lang,
    isTa: isTa,
    t: t,
    setLang: setLang
  };
})();
