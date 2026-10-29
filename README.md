<div align="center">

<img src="assets/brand/logo.svg" width="112" height="112" alt="Unsnitch logo: a chain link with its tracking tail cut off">

# Unsnitch

**Stop X from snitching on your links.**

A tiny, open-source browser extension that strips the share-tracking codes X (Twitter) adds to links you copy or share.

[![License: MIT](https://img.shields.io/badge/license-MIT-00E676?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/xBrokkr/unsnitch/ci.yml?branch=main&style=flat-square&label=CI)](https://github.com/xBrokkr/unsnitch/actions/workflows/ci.yml)
![Zero dependencies](https://img.shields.io/badge/dependencies-0-00E676?style=flat-square)
![No network requests](https://img.shields.io/badge/network%20requests-none-00E676?style=flat-square)
[![GitHub stars](https://img.shields.io/github/stars/xBrokkr/unsnitch?style=flat-square&color=00E676)](https://github.com/xBrokkr/unsnitch/stargazers)

[**Chrome**](#chrome--edge--brave) · [**Firefox**](#firefox) · [**Userscript**](#userscript-tampermonkey--violentmonkey--userscripts-for-safari) · [**iPhone**](docs/mobile.md) · [**Android**](docs/mobile.md) · [**Web cleaner**](https://xBrokkr.github.io/unsnitch/)

<img src="assets/brand/og.png" width="720" alt="Stop X from snitching on your links: a link with ?a=…&s=19 struck through, becoming a clean link">

</div>

---

## The problem

When you hit **Copy link** or **Share** on a post, X adds tracking parameters to the URL:

```diff
- https://x.com/0xBrokkr/status/2115853762229076368?a=Kq3vX9mPzR2tLw8nYb4c&s=19
+ https://x.com/0xBrokkr/status/2115853762229076368
```

Both links open the same post. The first one also carries a token tied to the share and a code for the app it came from. Anyone can see it, and X can use it to connect the people who click with the person who shared. Unsnitch removes those parameters before the link leaves your clipboard.

## What does X put in your links?

| Param | Example | What it is |
| --- | --- | --- |
| `s` | `?s=19`, `?s=20`, `?s=46` | A code for the app or platform you shared from. Common reports say 19 is Android, 20 is iPhone and 46 is desktop web, but people report other numbers too and X doesn't document it. |
| `t` | `&t=Xy3k…` | A share token, widely reported to be tied to the account that shared the link. |
| `a` | `?a=Kq3vX9mPzR2tLw8nYb4c` | A newer share token, also reported to be tied to the sharer. |
| `ref_src`, `ref_url`, `cn`, `refsrc`, `utm_*` | `?ref_src=twsrc%5Etfw` | Referral and campaign tags from embeds and emails. |

Unsnitch removes **every** query parameter on X links **except** `q`, `f`, `pf` and `lf`, which search URLs need to keep working. The host, the path and any `#hash` stay exactly as they were.

**Other sites** use the opposite rule: only known trackers are removed and everything else is kept, so a link never breaks.

| Site | Removed | Kept (examples) |
| --- | --- | --- |
| YouTube (`youtube.com`, `www.`, `m.`, `music.`, `youtu.be`) | `si`, `pp`, `feature` | `v`, `list`, `index`, `t` (timestamp) |

Links to any other site are never modified. The extension still only runs on X pages: a YouTube link is cleaned when you copy it from a post on X, in the popup's **Paste & clean** box or in the web cleaner.

## What it does

- **Cleans links automatically on x.com and twitter.com.** This includes X's own *Copy link* button, <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>C</kbd> on selected text (also inside text boxes), drag-and-drop text and the native **Share** sheet.
- **Cleans the address bar.** If you open a link with tracking parameters, the URL shown is rewritten to the clean version without reloading the page. This also happens when you move around inside X.
- **Adds a "Copy clean link" item to the right-click menu** for any X link on an X page.
- **Toolbar popup:**
  - an on/off switch that syncs across your browsers
  - an *N links unsnitched* counter, stored only on your device
  - a **Paste & clean** box that cleans any text you paste into it, including whole messages with several X links

## Install

**Fastest, no developer mode needed** (while the store listings are in progress):

- **Userscript:** install [`unsnitch.user.js`](https://raw.githubusercontent.com/xBrokkr/unsnitch/main/userscript/unsnitch.user.js) with Tampermonkey, Violentmonkey or the Userscripts app on Safari. It cleans copies, shares and the address bar.
- **Bookmarklet:** works in any browser, nothing to install: [docs/bookmarklet.md](docs/bookmarklet.md).
- **Web cleaner:** paste a link at [xBrokkr.github.io/unsnitch](https://xBrokkr.github.io/unsnitch/). On phones, see [iPhone and Android](docs/mobile.md).

### Chrome / Edge / Brave

- **Chrome Web Store:** *coming soon* (`CHROME_WEB_STORE_URL`)
- **Install from source in about 30 seconds:**
  1. Download this repo ([ZIP](https://github.com/xBrokkr/unsnitch/archive/refs/heads/main.zip)) and unzip it, or `git clone https://github.com/xBrokkr/unsnitch`.
  2. Open `chrome://extensions` and turn on **Developer mode** (top right).
  3. Click **Load unpacked** and select the `extension/` folder.

Or grab the prebuilt `unsnitch-chrome.zip` from the [latest release](https://github.com/xBrokkr/unsnitch/releases/latest).

### Firefox

- **Firefox Add-ons:** *coming soon* (`AMO_URL`). Needs Firefox 128 or newer.
- **Temporary install from source:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and pick `extension/manifest.json`. Firefox removes it again when it restarts.

### Userscript (Tampermonkey / Violentmonkey / Userscripts for Safari)

Install [`userscript/unsnitch.user.js`](https://raw.githubusercontent.com/xBrokkr/unsnitch/main/userscript/unsnitch.user.js). It cleans copies, shares and the address bar the same way the extension does. It has no popup or counter.

### Bookmarklet

Works in any browser with no install: [docs/bookmarklet.md](docs/bookmarklet.md).

### iPhone / iPad: Shortcut

**One tap:** download [`Unsnitch.shortcut`](shortcut/Unsnitch.shortcut) on your iPhone → **Add Shortcut** → in X tap **Share → Unsnitch**. The clean link lands on your clipboard. Details and a manual build: [docs/mobile.md](docs/mobile.md#ios-the-unsnitch-shortcut).

### Android: web app

Open the [web cleaner](https://xBrokkr.github.io/unsnitch/), choose **Install app / Add to Home screen**, and then **Unsnitch** appears in your share menu: [docs/mobile.md](docs/mobile.md#android-unsnitch-web-app-pwa).

### Manual

Delete everything from the `?` onward. That's all Unsnitch does, but automatically.

## How it works

The whole cleaner is one small function, [`extension/core/clean.js`](extension/core/clean.js). It runs as a plain `<script>` or via `require()` in Node, with no build step.

On X pages, the extension wraps the browser APIs X uses to copy and share (`navigator.clipboard.writeText` / `write`, the `copy` event, `navigator.share`). It passes each X link through `cleanUrl()` and then hands the result back. It also replaces the address bar URL with `history.replaceState`, so the page doesn't reload. Full write-up: **[docs/how-it-works.md](docs/how-it-works.md)**.

```js
const { cleanUrl, cleanText } = require('./extension/core/clean.js');

cleanUrl('https://x.com/a/status/1?s=20&t=abc');      // 'https://x.com/a/status/1'
cleanText('look https://x.com/a/status/1?s=20 lol');  // 'look https://x.com/a/status/1 lol'
```

## Privacy

**No data leaves your device.** Unsnitch makes no network requests and has no analytics or telemetry. It loads no remote code and has zero dependencies. You can read the whole extension, about 570 lines including the popup, in one sitting.

| Permission | Why |
| --- | --- |
| `storage` | Saves the on/off switch, synced through your browser's own sync, and the local counter. |
| `contextMenus` | Adds the right-click **Copy clean link** item. |
| `clipboardWrite` | Writes the cleaned link when you use the right-click menu or the popup. |
| Site access: `x.com`, `twitter.com` (and their subdomains) | Runs the content script that cleans copies, shares and the address bar. It doesn't run on any other site. |

There is no `tabs`, `scripting`, `host_permissions` or "read all sites" permission. Full policy: [PRIVACY.md](PRIVACY.md).

## FAQ

<details>
<summary><b>Does this break X links?</b></summary>

No. The tracking parameters aren't needed to open a post. The clean link opens the same post, and search links keep the parameters they need (`q`, `f`, `pf`, `lf`).
</details>

<details>
<summary><b>Can X still tell that I shared a link?</b></summary>

Unsnitch removes the identifying tokens from links you share. It doesn't hide what you do *on* X while logged in, and it can't change links that were already shared before you installed it.
</details>

<details>
<summary><b>What about the X mobile app?</b></summary>

Browser extensions can't run inside native apps. On iPhone use the [Shortcut](docs/mobile.md#ios-the-unsnitch-shortcut); on Android use the [web app](docs/mobile.md#android-unsnitch-web-app-pwa) from the share menu. You can also paste into the [web cleaner](https://xBrokkr.github.io/unsnitch/).
</details>

<details>
<summary><b>Why does it need clipboard permission?</b></summary>

Only so the right-click **Copy clean link** item and the popup's **Clean & copy** button can write to your clipboard. Unsnitch never reads your clipboard in the background.
</details>

<details>
<summary><b>Will it touch YouTube, Instagram or other links?</b></summary>

YouTube links lose their share id (`si`, `pp`, `feature`) and keep everything else, including the `t` timestamp. Every other site is left alone on purpose. Support for more sites (Instagram `igsh`, Spotify `si`, …) is a great [first contribution](CONTRIBUTING.md#good-first-issues).
</details>

<details>
<summary><b>Is this affiliated with X?</b></summary>

No. Unsnitch is an independent open-source project and isn't affiliated with or endorsed by X Corp.
</details>

## Contributing

PRs are welcome, especially new tracking parameters, other sites, a Safari port and translations. See [CONTRIBUTING.md](CONTRIBUTING.md). Run the tests with `npm test`.

## ⭐ Like it?

**If this saved you from being tracked, a ⭐ helps others find it.**

<a href="https://star-history.com/#xBrokkr/unsnitch&Date">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=xBrokkr/unsnitch&type=Date&theme=dark">
    <img alt="Star history chart" src="https://api.star-history.com/svg?repos=xBrokkr/unsnitch&type=Date" width="600">
  </picture>
</a>

## Support

Unsnitch is free and always will be. If it saved you from being tracked, a ⭐ on GitHub helps others find it, and you can [buy me a coffee ☕](https://buymeacoffee.com/merickalkaf).

## License

[MIT](LICENSE) © 2026 Meriç Kalkan

<sub>Unsnitch is not affiliated with X Corp. "X" and "Twitter" are trademarks of their respective owners.</sub>
