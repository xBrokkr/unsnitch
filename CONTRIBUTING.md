# Contributing to Unsnitch

Thanks for helping! Unsnitch stays **tiny, auditable and dependency-free**, so please keep PRs small and focused.

## Ground rules

- **Zero runtime dependencies.** Avoid devDependencies too, unless there's no reasonable alternative.
- **No network requests, analytics or remote code.** Ever. PRs that add them won't be merged.
- **No new permissions** unless there's a strong reason, explained in the PR.
- Plain modern JavaScript. No TypeScript, frameworks or bundlers. `extension/` must load unpacked as-is.
- `extension/core/clean.js` is the single source of truth for cleaning. It has to keep working both as a classic `<script>` (`globalThis.UnsnitchCore`) and through `require()`.

## Dev setup

You only need **Node 20+**. There's no `npm install`.

```sh
git clone https://github.com/xBrokkr/unsnitch
cd unsnitch
npm test          # node --test
npm run build     # dist/unsnitch-chrome.zip + dist/unsnitch-firefox.zip (needs the `zip` CLI)
```

### Load the extension

- **Chrome / Edge / Brave:** go to `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select `extension/`. After editing, click the reload icon on the card and then reload the X tab.
- **Firefox 128+:** go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on…** and select `extension/manifest.json`.

### Project map

| Path | What |
| --- | --- |
| `extension/core/clean.js` | `cleanUrl`, `cleanText`, `isXHost`: the actual logic |
| `extension/main-world.js` | Wraps clipboard, copy and share APIs in the page and cleans the address bar |
| `extension/isolated.js` | Bridges to extension storage (on/off, counter) and handles context-menu copies |
| `extension/background.js` | Right-click **Copy clean link** |
| `extension/popup.*` | Toolbar popup |
| `test/` | `node:test` unit tests |
| `scripts/build.mjs` | Builds the per-browser zips |
| `userscript/`, `site/`, `docs/` | Userscript, landing page and web cleaner, guides |

> `site/clean.js` and the code inside `userscript/unsnitch.user.js` are **copies** of `extension/core/clean.js`. If you change the core, update them too.

## Adding a tracking parameter

On X links, Unsnitch already removes **every** parameter except an allowlist (`q`, `f`, `pf`, `lf`). So a new X tracking parameter like `?zz=…` is usually removed already. What helps most is a **test** that proves it:

```js
// test/clean.test.js
test('removes zz', () => {
  assert.equal(cleanUrl('https://x.com/a/status/1?zz=abc&s=20'), 'https://x.com/a/status/1');
});
```

If X adds a parameter that is **needed** for a page to work, add it to the `KEEP` allowlist in `clean.js` and test that it survives.

Spotted a new parameter in the wild? Open a [new tracking parameter](https://github.com/xBrokkr/unsnitch/issues/new?template=new-tracker-param.yml) issue, even if you don't send a PR.

## Good first issues

- **More sites:** Instagram `igsh`, TikTok `_t` / `_r` / `is_from_webapp`. Add one entry to `SITE_RULES` in `clean.js` (a denylist: strip only the listed params), test it, and keep the "unrelated URLs are untouched" tests green. No new permissions or content-script matches. YouTube (#2) is a worked example.
- **Safari port** with `xcrun safari-web-extension-converter`.
- **Localization** with `_locales/` for the extension name, description and popup strings.
- **Docs and translations** of the README.
- **More tests** for edge cases: weird encodings, IDN hosts, very long URLs.

## Pull requests

1. Fork and create a branch.
2. `npm test` must pass. Add tests for behavior changes.
3. For anything that touches copy or share behavior, say which browsers you tested by hand.
4. Add a line to `CHANGELOG.md` under **Unreleased**.

By contributing, you agree that your work is released under the [MIT License](LICENSE) and that you'll follow the [Code of Conduct](CODE_OF_CONDUCT.md).
