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
