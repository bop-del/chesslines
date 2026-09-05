import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildNumber } from '../scripts/build-number.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

test('the shipped build number matches what history says it should be', () => {
    // The point of deriving it is that it cannot drift. If this fails, someone
    // edited js/version.js by hand — run `npm run build-number`.
    const shipped = readFileSync(join(ROOT, 'js', 'version.js'), 'utf8')
        .match(/BUILD = '(b\d+)'/)?.[1];

    assert.equal(shipped, buildNumber());
});

test('the build number has the shape the page expects', () => {
    assert.match(buildNumber(), /^b\d+$/);
});
