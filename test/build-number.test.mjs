import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { buildNumber, landedBuildNumber, pendingCommits } from '../scripts/build-number.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const shipped = () =>
    readFileSync(join(ROOT, 'js', 'version.js'), 'utf8').match(/BUILD = '(b\d+)'/)?.[1];

test('the shipped build number is the one the last landed commit earned', () => {
    // The point of deriving it is that it cannot drift. If this fails, someone
    // edited js/version.js by hand — run `npm run build-number`.
    //
    // Measured against what has *landed*, not against HEAD. A lane's own
    // shipped commits are already in HEAD's count but are not on Pages yet, so
    // comparing to HEAD made the act of committing a feature turn the suite red
    // — #22: "55/55 green before the commit and 54/55 after", reported in good
    // faith and wrong. The number is written once, when the lane lands.
    assert.equal(shipped(), landedBuildNumber());
});

test('the build number has the shape the page expects', () => {
    assert.match(buildNumber(), /^b\d+$/);
});

test('the number owed at landing counts the lane\'s unlanded shipped commits', () => {
    // What `npm run build-number` will write when this lane lands. On `main`
    // there is nothing pending and it equals the shipped number; on a lane it
    // is ahead by exactly the shipped commits this branch adds.
    const owed = Number(buildNumber().slice(1));
    const landed = Number(landedBuildNumber().slice(1));

    assert.equal(owed - landed, pendingCommits());
});
