#!/usr/bin/env node
/*
 * Copies the version from package.json into extension/manifest.json and the
 * userscript's @version header. Runs automatically from `npm version`, so a
 * release bump always reaches Tampermonkey/Violentmonkey users (they only
 * update when @version goes up).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

const manifestPath = join(root, 'extension', 'manifest.json');
const manifest = readFileSync(manifestPath, 'utf8');
writeFileSync(manifestPath, manifest.replace(/("version":\s*")[^"]*(")/, `$1${version}$2`));

const userscriptPath = join(root, 'userscript', 'unsnitch.user.js');
const userscript = readFileSync(userscriptPath, 'utf8');
if (!/^\/\/ @version\s+\S+$/m.test(userscript)) throw new Error('userscript has no @version line');
writeFileSync(userscriptPath, userscript.replace(/^(\/\/ @version\s+)\S+$/m, `$1${version}`));

console.log(`synced version ${version}`);
