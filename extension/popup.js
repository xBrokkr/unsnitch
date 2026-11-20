/*
 * Unsnitch popup: on/off switch, cleaned-links counter and a paste & clean box.
 * Settings: chrome.storage.sync.enabled (default true)
 * Stats:    chrome.storage.local.cleanedCount
 */
'use strict';

var core = globalThis.UnsnitchCore;
var $ = function (id) { return document.getElementById(id); };

// All text comes from _locales/<lang>/messages.json. The English text in popup.html is only a fallback.
function t(key) { return chrome.i18n.getMessage(key) || key; }

function localize() {
  var lang = chrome.i18n.getMessage('htmlLang');
  if (lang) document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(function (el) {
    var text = chrome.i18n.getMessage(el.dataset.i18n);
    if (text) el.textContent = text;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
    var text = chrome.i18n.getMessage(el.dataset.i18nTitle);
    if (text) el.title = text;
  });
}
localize();

function renderEnabled(on) {
  $('enabled').checked = on;
  document.body.classList.toggle('off', !on);
  $('status').textContent = on ? t('statusOn') : t('statusOff');
}

function renderCount(n) {
  n = Number(n) || 0;
  $('count').textContent = n.toLocaleString();
  $('count-label').textContent = n === 1 ? t('countLabelOne') : t('countLabelMany');
}

chrome.storage.sync.get({ enabled: true }, function (res) { renderEnabled(res.enabled !== false); });
chrome.storage.local.get({ cleanedCount: 0 }, function (res) { renderCount(res.cleanedCount); });

chrome.storage.onChanged.addListener(function (changes, area) {
  if (area === 'local' && changes.cleanedCount) renderCount(changes.cleanedCount.newValue);
  if (area === 'sync' && changes.enabled) renderEnabled(changes.enabled.newValue !== false);
});

$('enabled').addEventListener('change', function (e) {
  chrome.storage.sync.set({ enabled: e.target.checked });
  renderEnabled(e.target.checked);
});

$('clean').addEventListener('click', function () {
  var input = $('input');
  var before = input.value;
  var after = core.cleanText(before);
  input.value = after;
  if (!after.trim()) {
    $('feedback').textContent = t('feedbackEmpty');
    return;
  }
  navigator.clipboard.writeText(after).then(function () {
    $('feedback').textContent = after === before ? t('feedbackAlreadyCleanCopied') : t('feedbackCleanedCopied');
  }, function () {
    input.select();
    $('feedback').textContent = after === before ? t('feedbackAlreadyClean') : t('feedbackCleanedManual');
  });
  if (after !== before) {
    chrome.storage.local.get({ cleanedCount: 0 }, function (res) {
      chrome.storage.local.set({ cleanedCount: (Number(res.cleanedCount) || 0) + 1 });
    });
  }
});
