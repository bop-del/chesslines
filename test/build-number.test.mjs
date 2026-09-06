import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import {
    buildNumber,
    landedBuildNumber,
    pendingCommits,
    needsRebase,
} from '../scripts/build-number.mjs';

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

// The regression #22 is about, in a repo built for the purpose. Asserting it
// against *this* checkout cannot work: the numbers would be computed the same
// way on both sides of the assertion, which passes by construction and proves
// nothing. A fixture with real commits is the only way to watch the number move.
const lane = () => {
    const dir = mkdtempSync(join(tmpdir(), 'lane-'));
    const git = (...args) => execFileSync('git', args, { cwd: dir, encoding: 'utf8' }).trim();

    git('init', '-qb', 'main');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    mkdirSync(join(dir, 'js'));
    writeFileSync(join(dir, 'index.html'), '<html>\n');
    writeFileSync(join(dir, 'js', 'version.js'), "export const BUILD = 'b1';\n");
    git('add', '-A');
    git('commit', '-qm', 'init');
    // Stands in for `origin/main`: what has landed, and what a lane is cut from.
    git('update-ref', 'refs/remotes/origin/main', 'main');

    return { dir, git };
};

test('committing a shipped file does not make the suite red', (t) => {
    // #22, exactly: "the suite was 55/55 before the commit and 54/55 after,
    // because committing a shipped file is itself what invalidates the number."
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    git('checkout', '-qb', 'feat/x');
    writeFileSync(join(dir, 'index.html'), '<html>changed\n');
    git('commit', '-qam', 'a shipped change');

    // The file still holds what landed, and that is correct rather than stale.
    assert.equal(landedBuildNumber({ cwd: dir }), 'b1');
    // What it owes once it lands has moved, and that is what gets written then.
    assert.equal(buildNumber({ cwd: dir }), 'b2');
    assert.equal(pendingCommits({ cwd: dir }), 1);
});

test('landing the lane is what moves the number', (t) => {
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    git('checkout', '-qb', 'feat/x');
    writeFileSync(join(dir, 'index.html'), '<html>changed\n');
    git('commit', '-qam', 'a shipped change');
    git('checkout', '-q', 'main');
    git('merge', '-q', '--ff-only', 'feat/x');
    git('update-ref', 'refs/remotes/origin/main', 'main');

    // Once landed there is nothing pending, and the number the file must hold
    // is the one the lane owed.
    assert.equal(pendingCommits({ cwd: dir }), 0);
    assert.equal(landedBuildNumber({ cwd: dir }), 'b2');
});

test('a docs-only commit does not move the number', (t) => {
    // The number tracks what is deployed; one that changes without the page
    // changing is useless for the one job it has (CLAUDE.md).
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    git('checkout', '-qb', 'docs/x');
    writeFileSync(join(dir, 'README.md'), 'docs\n');
    git('add', '-A');
    git('commit', '-qm', 'docs only');

    assert.equal(pendingCommits({ cwd: dir }), 0);
});

test('writing the number is not itself a shipped change', (t) => {
    // js/version.js is excluded from its own count. Without that, writing the
    // number would move the count again and the value would never settle.
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    writeFileSync(join(dir, 'js', 'version.js'), "export const BUILD = 'b2';\n");
    git('commit', '-qam', 'Set the build number to what history says');

    assert.equal(buildNumber({ cwd: dir }), 'b1');
});

test('it refuses to write a number the lane has not rebased for', (t) => {
    // The failure #22 records from #13's merge: the lane derived a number, then
    // rebased, and the rebase dropped the bump as already-applied — leaving
    // js/version.js behind what history said. Deriving before the rebase is
    // always wasted work and sometimes wrong, so the script says so.
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    git('checkout', '-qb', 'feat/x');
    writeFileSync(join(dir, 'index.html'), '<html>lane\n');
    git('commit', '-qam', 'lane ships');

    // main moves on underneath it, so the lane is no longer based on it.
    git('checkout', '-q', 'main');
    writeFileSync(join(dir, 'css.css'), 'x\n');
    writeFileSync(join(dir, 'index.html'), '<html>other\n');
    git('add', '-A');
    git('commit', '-qm', 'another lane landed');
    git('update-ref', 'refs/remotes/origin/main', 'main');
    git('checkout', '-q', 'feat/x');

    assert.equal(needsRebase({ cwd: dir }), true);
});

test('a lane sitting on the tip of main needs no rebase', (t) => {
    const { dir, git } = lane();
    t.after(() => rmSync(dir, { recursive: true, force: true }));

    git('checkout', '-qb', 'feat/x');
    writeFileSync(join(dir, 'index.html'), '<html>lane\n');
    git('commit', '-qam', 'lane ships');

    assert.equal(needsRebase({ cwd: dir }), false);
});
