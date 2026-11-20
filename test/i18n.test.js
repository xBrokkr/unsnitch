'use strict';

// Keeps the translations in step with the code that uses them.
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync } = require('node:fs');
const { join } = require('node:path');

const ext = join(__dirname, '..', 'extension');
const read = (p) => readFileSync(join(ext, p), 'utf8');
const manifest = JSON.parse(read('manifest.json'));
const locales = readdirSync(join(ext, '_locales'));
const messages = Object.fromEntries(locales.map((l) => [l, JSON.parse(read(`_locales/${l}/messages.json`))]));

// Every message key the extension asks the browser for.
function usedKeys() {
  const keys = new Set();
  for (const [, key] of read('manifest.json').matchAll(/__MSG_(\w+)__/g)) keys.add(key);
  for (const [, key] of read('popup.html').matchAll(/data-i18n(?:-title)?="(\w+)"/g)) keys.add(key);
  for (const file of ['popup.js', 'background.js']) {
    for (const [, key] of read(file).matchAll(/\b(?:t|chrome\.i18n\.getMessage)\('(\w+)'\)/g)) keys.add(key);
  }
  return keys;
}

test('the default locale exists and the manifest uses message keys', () => {
  assert.ok(locales.includes(manifest.default_locale), `_locales/${manifest.default_locale} is missing`);
  for (const field of ['name', 'short_name', 'description']) {
    assert.match(manifest[field], /^__MSG_\w+__$/, `manifest.${field} should be a __MSG_…__ key`);
  }
});

test('English and Turkish are shipped', () => {
  assert.ok(locales.includes('en'));
  assert.ok(locales.includes('tr'));
});

test('every language defines every key the extension uses', () => {
  const used = usedKeys();
  assert.ok(used.size > 10, 'found the keys used by the manifest, popup and background');
  for (const locale of locales) {
    for (const key of used) assert.ok(key in messages[locale], `${locale}: missing "${key}"`);
  }
});

test('every language has the same keys as the default language', () => {
  const base = Object.keys(messages[manifest.default_locale]).sort();
  for (const locale of locales) assert.deepEqual(Object.keys(messages[locale]).sort(), base, locale);
});

test('messages are non-empty, have no "$" placeholders and fit the store limits', () => {
  for (const locale of locales) {
    for (const [key, { message }] of Object.entries(messages[locale])) {
      assert.equal(typeof message, 'string', `${locale}.${key}`);
      assert.ok(message.trim().length > 0, `${locale}.${key} is empty`);
      assert.ok(!message.includes('$'), `${locale}.${key} contains "$", which starts a placeholder`);
    }
    assert.ok(messages[locale].extName.message.length <= 75, `${locale}: extName is longer than 75 characters`);
    assert.ok(messages[locale].extDescription.message.length <= 132, `${locale}: extDescription is longer than 132 characters`);
    // Folders use Chrome's names (pt_BR); htmlLang is the BCP 47 code of the same language (pt-BR).
    assert.equal(messages[locale].htmlLang.message.replace(/-/g, '_'), locale, `${locale}: htmlLang doesn't match the folder name`);
  }
});
