# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
