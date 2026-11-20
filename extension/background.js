/*
 * Unsnitch — background (Chrome: service worker, Firefox: event page).
 *
 * Adds a "Copy clean link" context-menu item on X links (on X pages), and
 * asks the page's content script to copy the cleaned URL to the clipboard.
 */
'use strict';

// Chrome's service worker loads the core here; Firefox lists it in manifest
// background.scripts instead (importScripts doesn't exist there).
if (typeof importScripts === 'function' && !globalThis.UnsnitchCore) importScripts('core/clean.js');

var X_PATTERNS = ['*://x.com/*', '*://*.x.com/*', '*://twitter.com/*', '*://*.twitter.com/*'];
var MENU_ID = 'unsnitch-copy-clean-link';

function setupMenu() {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: chrome.i18n.getMessage('copyCleanLink'),
      contexts: ['link'],
      documentUrlPatterns: X_PATTERNS, // our content script only runs on X
      targetUrlPatterns: X_PATTERNS
    });
  });
}

chrome.runtime.onInstalled.addListener(setupMenu);
chrome.runtime.onStartup.addListener(setupMenu);

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId !== MENU_ID || !tab || tab.id == null || !info.linkUrl) return;
  var clean = globalThis.UnsnitchCore.cleanUrl(info.linkUrl);
  chrome.tabs.sendMessage(tab.id, { type: 'unsnitch:copy', text: clean }, { frameId: info.frameId || 0 }, function () {
    void chrome.runtime.lastError; // tab may have no content script (e.g. not reloaded since install)
  });
  if (clean !== info.linkUrl) {
    chrome.storage.local.get({ cleanedCount: 0 }, function (res) {
      chrome.storage.local.set({ cleanedCount: (Number(res.cleanedCount) || 0) + 1 });
    });
  }
});
