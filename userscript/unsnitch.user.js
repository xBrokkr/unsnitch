// ==UserScript==
// @name         Unsnitch — strip X (Twitter) tracking from links
// @namespace    https://github.com/xBrokkr/unsnitch
// @version      1.0.0
// @description  Stop X from snitching on your links: removes ?s=, t=, a= and other share-tracking params from copied/shared links and the address bar. No network requests.
// @author       Meriç Kalkan
// @license      MIT
// @homepageURL  https://github.com/xBrokkr/unsnitch
// @supportURL   https://github.com/xBrokkr/unsnitch/issues
// @downloadURL  https://raw.githubusercontent.com/xBrokkr/unsnitch/main/userscript/unsnitch.user.js
// @updateURL    https://raw.githubusercontent.com/xBrokkr/unsnitch/main/userscript/unsnitch.user.js
// @match        *://x.com/*
// @match        *://*.x.com/*
// @match        *://twitter.com/*
// @match        *://*.twitter.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

// ===== BEGIN extension/core/clean.js (verbatim) =====
/*
 * Unsnitch core — strips X (Twitter) and supported sites' share-tracking parameters from links.
 *
 * Works as a classic <script> (sets globalThis.UnsnitchCore) and via
 * require() in Node (module.exports). No dependencies, no network.
 *
 *   cleanUrl('https://x.com/a/status/1?s=20&t=abc') -> 'https://x.com/a/status/1'
 *   cleanText('look https://x.com/a/status/1?s=20 lol') -> 'look https://x.com/a/status/1 lol'
 */
(function (root) {
  'use strict';

  // x.com / twitter.com, optionally prefixed by www. or mobile. (case-insensitive).
  var X_HOST_RE = /^(?:(?:www|mobile)\.)?(?:x|twitter)\.com$/i;

  // The only query params worth keeping (used by /search). Everything else —
  // s, t, a, ref_src, ref_url, cn, refsrc, utm_*, … — is tracking.
  var KEEP = { q: true, f: true, pf: true, lf: true };

  // Other sites: remove only known trackers; preserve all other parameters.
  var SITE_RULES = [
    { host: /^(?:(?:www|m|music)\.youtube\.com|youtube\.com|youtu\.be)$/i,
      strip: { si: true, pp: true, feature: true } },
  ];

  // http(s) URLs inside free text; stops at whitespace, quotes and angle brackets.
  var URL_IN_TEXT_RE = /https?:\/\/[^\s<>"'`]+/gi;

  // Punctuation that usually ends a sentence rather than a URL.
  var TRAILING_PUNCT_RE = /[.,;:!?)\]}]+$/;

  function isXHost(host) {
    return typeof host === 'string' && X_HOST_RE.test(host);
  }

  function decodeKey(key) {
    try {
      return decodeURIComponent(key.replace(/\+/g, ' '));
    } catch (e) {
      return key;
    }
  }

  /**
   * Returns the URL without tracking params. Unsupported sites, non-http(s) URLs and
   * invalid input are returned unchanged. Host, path and #hash are preserved
   * byte-for-byte (we edit the original string rather than re-serialising).
   */
  function cleanUrl(input) {
    if (typeof input !== 'string') return input;
    var parsed;
    try {
      parsed = new URL(input);
    } catch (e) {
      return input;
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return input;
    var isX = isXHost(parsed.hostname);
    var rule = SITE_RULES.find(function (site) { return site.host.test(parsed.hostname); });
    if (!isX && !rule) return input;

    // Split "base?query#hash" on the raw string. A '#' always ends the query,
    // and the first '?' before it always starts it.
    var hashIdx = input.indexOf('#');
    var beforeHash = hashIdx < 0 ? input : input.slice(0, hashIdx);
    var hash = hashIdx < 0 ? '' : input.slice(hashIdx);
    var qIdx = beforeHash.indexOf('?');
    if (qIdx < 0) return input;

    var kept = beforeHash.slice(qIdx + 1).split('&').filter(function (pair) {
      var key = decodeKey(pair.split('=')[0]);
      if (pair === '') return false; // drop empty pairs from '?&a' or 'a&&b'
      return isX ? KEEP[key] === true : rule.strip[key] !== true;
    });

    return beforeHash.slice(0, qIdx) + (kept.length ? '?' + kept.join('&') : '') + hash;
  }

  /** Cleans every supported URL found inside a larger string. */
  function cleanText(text) {
    if (typeof text !== 'string' || text.indexOf('http') < 0) return text;
    return text.replace(URL_IN_TEXT_RE, function (match) {
      var trail = (match.match(TRAILING_PUNCT_RE) || [''])[0];
      var url = trail ? match.slice(0, -trail.length) : match;
      return cleanUrl(url) + trail;
    });
  }

  var api = { cleanUrl: cleanUrl, cleanText: cleanText, isXHost: isXHost };

  if (typeof module === 'object' && module && module.exports) module.exports = api;
  if (root) root.UnsnitchCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
// ===== END extension/core/clean.js =====

// Port of extension/main-world.js without the on/off switch, counter or storage.
(function () {
  'use strict';

  var core = globalThis.UnsnitchCore;
  if (!core || typeof core.cleanText !== 'function') return;
  // Grab our reference, then hide the global so the page can't tamper with it.
  try { delete globalThis.UnsnitchCore; } catch (e) { /* ignore */ }

  function clean(text, fn) {
    if (typeof text !== 'string') return text;
    try { return (fn || core.cleanText)(text); } catch (e) { return text; }
  }

  function patch(obj, name, wrap) {
    try {
      var orig = obj && obj[name];
      if (typeof orig === 'function') obj[name] = wrap(orig);
    } catch (e) { /* ignore */ }
  }

  // --- navigator.clipboard.writeText(text) ---
  patch(globalThis.Clipboard && Clipboard.prototype, 'writeText', function (orig) {
    return function writeText(text) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof text === 'string') args[0] = clean(text);
      return orig.apply(this, args);
    };
  });

  // --- navigator.clipboard.write([ClipboardItem]) ---
  var TEXT_TYPES = ['text/plain', 'text/html'];

  function cleanItem(item) {
    var types = item.types || [];
    if (!types.some(function (t) { return TEXT_TYPES.indexOf(t) >= 0; })) return item;
    var data = {};
    types.forEach(function (type) {
      var blob = item.getType(type);
      data[type] = TEXT_TYPES.indexOf(type) < 0 ? blob : blob.then(function (b) {
        return b.text().then(function (txt) {
          var out = clean(txt);
          return out === txt ? b : new Blob([out], { type: type });
        });
      });
    });
    var opts = item.presentationStyle ? { presentationStyle: item.presentationStyle } : undefined;
    return new ClipboardItem(data, opts);
  }

  patch(globalThis.Clipboard && Clipboard.prototype, 'write', function (orig) {
    return function write(items) {
      var args = Array.prototype.slice.call(arguments);
      if (Array.isArray(items) && typeof ClipboardItem === 'function') {
        try { args[0] = items.map(cleanItem); } catch (e) { args[0] = items; }
      }
      return orig.apply(this, args);
    };
  });

  // --- DataTransfer#setData (site copy handlers, drag & drop) ---
  patch(globalThis.DataTransfer && DataTransfer.prototype, 'setData', function (orig) {
    return function setData(format, data) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof format === 'string' && /^text(\/plain|\/html|\/uri-list)?$/i.test(format)) {
        args[1] = clean(data);
      }
      return orig.apply(this, args);
    };
  });

  // --- Plain copy (Ctrl+C / execCommand('copy')) of a selection ---
  function selectedText() {
    var el = document.activeElement;
    if (el && (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') &&
        typeof el.selectionStart === 'number' && el.selectionStart !== el.selectionEnd) {
      return String(el.value).slice(el.selectionStart, el.selectionEnd);
    }
    var sel = document.getSelection && document.getSelection();
    return sel ? String(sel) : '';
  }

  window.addEventListener('copy', function (e) {
    try {
      if (!e.clipboardData) return;
      var text = selectedText();
      var out = clean(text);
      if (!text || out === text) return;
      e.clipboardData.setData('text/plain', out);
      e.preventDefault();
    } catch (err) { /* ignore */ }
  }, true);

  // --- navigator.share({ url, text, title }) ---
  patch(globalThis.Navigator && Navigator.prototype, 'share', function (orig) {
    return function share(data) {
      var args = Array.prototype.slice.call(arguments);
      if (data && typeof data === 'object') {
        try {
          var copy = Object.assign({}, data);
          if (typeof copy.url === 'string') copy.url = clean(copy.url, core.cleanUrl);
          if (typeof copy.text === 'string') copy.text = clean(copy.text);
          args[0] = copy;
        } catch (e) { args[0] = data; }
      }
      return orig.apply(this, args);
    };
  });

  // --- Address bar: drop tracking params on load and SPA navigation ---
  var replaceState = history.replaceState;

  function scrubLocation() {
    try {
      var href = location.href;
      var out = core.cleanUrl(href);
      if (out !== href) replaceState.call(history, history.state, '', out);
    } catch (e) { /* ignore */ }
  }

  ['pushState', 'replaceState'].forEach(function (name) {
    patch(History.prototype, name, function (orig) {
      return function () {
        var ret = orig.apply(this, arguments);
        scrubLocation();
        return ret;
      };
    });
  });
  window.addEventListener('popstate', scrubLocation);
  scrubLocation();
})();
