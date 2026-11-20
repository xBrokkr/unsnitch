# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Remove Instagram share ids (`igsh`, `igshid`) from `instagram.com` and `www.instagram.com` links; `img_index` and every other parameter stay. No new permissions or content-script matches (#1).
- Remove TikTok share and device params (`_t`, `_r`, `is_from_webapp`, `sender_device`, `is_copy_url`, `web_id`) from `tiktok.com`, `www.tiktok.com` and `m.tiktok.com` links; every other parameter stays. Short links such as `vm.tiktok.com` are left as they are, since resolving them would need a network request. No new permissions or content-script matches (#4).
- Remove the Luma share code (`tk`) from `luma.com`, `www.luma.com` and `lu.ma` links; every other parameter stays. No new permissions or content-script matches (#11).
- Localization: the extension name and description, the popup text and the **Copy clean link** menu title now come from `extension/_locales/`, in English and Turkish. The extension shows Turkish when the browser language is Turkish and English otherwise, and a new language is one `messages.json`. No new permissions. The popup's **Clean & copy** button no longer wraps when a translation is longer (#6).

### Fixed
- `cleanText` no longer deletes a trailing ellipsis (`…`) after a link: `https://x.com/a/status/1?s=20…` used to lose the `…` together with the tracker. Found while adding edge-case tests for encoded keys, odd query strings, hashes, ports and credentials, look-alike and IDN hosts, very long URLs and `cleanText` wrappers (#7).

## [1.1.0] - 2026-10-31

### Added
- Remove YouTube share trackers (`si`, `pp`, `feature`) on the supported YouTube hosts while preserving timestamps, playlists and other parameters. No new permissions or content-script matches. Thanks @ungaaaabungaaa (#8).
- Remove Spotify share ids (`si`, `pi`, `dlsi`) from `open.spotify.com` links; `context`, `nd` and every other parameter stay. No new permissions or content-script matches (#3).

### Fixed
- The userscript's `@version` now follows each release, so Tampermonkey and Violentmonkey pick up updates automatically (#10).

## [1.0.0] - 2026-10-29

First public release.

### Added
- Core cleaner `extension/core/clean.js` (`cleanUrl`, `cleanText`, `isXHost`). It removes every query parameter from X links except `q`, `f`, `pf` and `lf`, which covers `s`, `t`, `a`, `ref_src`, `ref_url`, `cn`, `refsrc` and `utm_*`. It keeps the host, the path and the `#hash`, and it never touches links to other sites. The file works as a classic script and via `require()`.
- Manifest V3 extension for Chrome (121+) and Firefox (128+):
  - Automatic cleaning on `x.com` / `twitter.com` (plus `www.` and `mobile.`) of the *Copy link* button, <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>C</kbd> and `execCommand` copies, copies made by the site's own handlers, drag-and-drop text and the native Share sheet.
  - Address-bar cleanup on page load and during in-app navigation, with no reload.
  - Right-click **Copy clean link** on X links.
  - Toolbar popup with an on/off switch (synced), an "N links unsnitched" counter (local) and a **Paste & clean** box.
- Permissions are limited to `storage`, `contextMenus` and `clipboardWrite`, plus content scripts on X domains only. There are no network requests and no remote code.
- Tests with `node:test` (`npm test`) and a build script with no dependencies (`npm run build` → `dist/unsnitch-chrome.zip`, `dist/unsnitch-firefox.zip`).
- Userscript, bookmarklet, iOS Shortcut guide, and a web cleaner you can install as an Android app (PWA).

[Unreleased]: https://github.com/xBrokkr/unsnitch/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/xBrokkr/unsnitch/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/xBrokkr/unsnitch/releases/tag/v1.0.0
