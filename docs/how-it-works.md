# How it works

## What X adds to links

When you copy or share a post, X appends query parameters to the URL:

| Param | Example | What it reveals |
|---|---|---|
| `s` | `s=19` (Android), `s=20` (iPhone/iPad), `s=46` (desktop web) | Which kind of client the link was shared from. |
| `t` | `t=<token>` | A per-share token. It lets X tie a click on the link to the share event, and so to the account that created it. |
| `a` | `a=<token>` | A newer token with the same purpose. It identifies who shared the link and when. |
| `ref_src`, `ref_url`, `refsrc` | `ref_src=twsrc%5Etfw` | Where the link was embedded or came from. |
| `cn` | `cn=...` | Campaign/notification attribution. |
| `utm_*` | `utm_source=...` | Standard campaign tags. |

The tokens are opaque to us; X knows their meaning. The practical effect is that when someone opens the link, X can connect the visit back to the person who shared it. None of these are needed to load the post.

Example:

```
https://x.com/0xBrokkr/status/2115853762229076368?a=Kq3vX9mPzR2tLw8nYb4c&s=19
→ https://x.com/0xBrokkr/status/2115853762229076368
```

## The cleaning rule

Defined in `extension/core/clean.js` (the single source of truth):

- Hosts: `x.com` and `twitter.com`, with optional `www.` or `mobile.` prefix, case-insensitive. Only `http:`/`https:` URLs.
- On those hosts, every query parameter is removed except `q`, `f`, `pf` and `lf` (needed for `/search`). The `?` goes too if nothing remains.
- Host, path and `#hash` are preserved byte-for-byte; the original string is edited, not re-serialized.
- Other sites use a denylist in `SITE_RULES`: only the listed trackers are removed, every other parameter stays. Today that is YouTube (`youtube.com`, `www.`/`m.`/`music.` and `youtu.be`), where `si`, `pp` and `feature` are removed and `t`, `v`, `list`, `index` are kept.
- URLs on any other host and invalid strings are returned unchanged.
- `cleanText` finds `http(s)://…` URLs inside larger text and cleans each one, leaving trailing punctuation (`.,;:!?)]}`) alone.

The file works as a classic script (sets `globalThis.UnsnitchCore`) and with `require()`. It has no dependencies and makes no network requests.

## How the extension intercepts copy and share

The content script `main-world.js` runs in the page's own JavaScript world at `document_start`, before X's code, on x.com/twitter.com only. It wraps these APIs so any X URL passing through is cleaned:

- `navigator.clipboard.writeText` and `navigator.clipboard.write` (text/plain and text/html items; cleaned lazily). This covers X's own **Copy link** button.
- `DataTransfer.prototype.setData` for text formats, which covers sites' own `copy` handlers and drag and drop.
- A capturing `copy` event listener: when you press Ctrl/Cmd+C or `execCommand('copy')` runs, the selected text (including inside inputs/textareas) is cleaned and put on the clipboard instead.
- `navigator.share`: the `url` and `text` fields are cleaned before the native share sheet opens.
- The address bar: on load, `pushState`, `replaceState` and `popstate`, the current URL is cleaned and swapped in with the original `history.replaceState`, with no reload.

It never throws; on any error the original browser behavior runs. After capturing the core, it deletes `globalThis.UnsnitchCore` so the page can't tamper with it.

`isolated.js` is the bridge to extension storage. It reads the on/off switch from `chrome.storage.sync`, tells the page script via `window.postMessage` (messages are accepted only from the same window and origin and must be `{ns:'unsnitch', …}`), and counts cleaned links in `chrome.storage.local`. The address bar is only touched once the enabled state is known, so a disabled extension never changes the URL. `background.js` adds a **Copy clean link** context-menu item on X links; the popup has the toggle, counter and a **Paste & clean** box.

Permissions: `storage`, `contextMenus`, `clipboardWrite`; site access only via the four content-script match patterns. No host permissions, no network requests, no remote code.

The userscript (`userscript/unsnitch.user.js`) inlines the same core plus the same wrappers and address-bar cleaning, without the switch, counter or storage.

## Limitations

- **Links already shared.** If someone sent you a link with `?s=…&t=…`, that identifying token was created at share time. Cleaning it before you open it avoids sending it to X; it can't undo the share. Paste it into the popup/web app first.
- **Mobile apps.** Native iOS/Android apps copy links outside the browser, so the extension can't intercept them. Use the [iOS Shortcut or Android web app](mobile.md).
- **Other places that add trackers.** Only X, Twitter and the YouTube rule above are cleaned. Other sites, shortened links such as `t.co`, and links where the tracking is inside the path are left alone.
- **Search params.** `q`, `f`, `pf` and `lf` are kept so search works; any other parameter is dropped, even a legitimate one.
- **Logged-in activity is still visible to X.** This only removes share attribution from links. X still sees your account's normal activity when you browse it.
- **Untested in real browsers so far.** The core has unit tests; the browser wrappers have had only syntax checks and stubbed smoke runs.
