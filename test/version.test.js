'use strict';

// package.json is the single source of truth; `npm version` syncs the rest.
const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const { version } = JSON.parse(read('package.json'));

test('manifest version matches package.json', () => {
  assert.equal(JSON.parse(read('extension/manifest.json')).version, version);
});

test('userscript @version matches package.json', () => {
  assert.equal(read('userscript/unsnitch.user.js').match(/^\/\/ @version\s+(\S+)$/m)[1], version);
});
