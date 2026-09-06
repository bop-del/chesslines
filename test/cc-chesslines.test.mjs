import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, chmodSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// The launcher is the one place that knows how to start a session for this
// repo: the right GitHub account, and the engineering skills that a lane agent
// has no other way of getting (issue #15). A lane needs it too, which means it
// must be able to start somewhere other than the main clone — so the directory
// is the argument these tests pin down.
//
// `claude` is never actually started: the tests put a stub earlier on PATH that
// prints where it was run and what it was passed, and exits. That keeps the
// test hermetic and instant, and it is the only part of the launcher that
// cannot be observed any other way.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LAUNCHER = join(ROOT, 'bin', 'cc-chesslines');

// One scratch root per run, removed at the end. Every fake HOME, lane and stub
// bin lives under it, so the suite leaves nothing behind — a test that litters
// the temp directory a few entries at a time is a test nobody wants to run
// often, and this one is fast enough to run constantly.
const SCRATCH = mkdtempSync(join(tmpdir(), 'cc-launcher-'));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

const scratchDir = (prefix) => mkdtempSync(join(SCRATCH, prefix));

/** A HOME with a main clone and a skills repo in the places the launcher looks. */
function fakeHome() {
    const home = scratchDir('cc-home-');
    mkdirSync(join(home, 'code', 'chesslines'), { recursive: true });
    mkdirSync(join(home, 'code', 'mattpocock-skills', '.claude-plugin'), { recursive: true });
    return home;
}

/** Run the launcher with `claude` and `gh` stubbed out, and return its output. */
function run(args = [], { home } = {}) {
    // Not a default parameter: one evaluated on every call would build a fake
    // HOME even for the callers that pass their own, and throw it away.
    home ??= fakeHome();
    const bin = scratchDir('cc-stub-');

    // Reports the working directory and the arguments it was handed.
    writeFileSync(
        join(bin, 'claude'),
        '#!/bin/sh\necho "CLAUDE-CWD: $PWD"\necho "CLAUDE-ARGS: $*"\n',
    );
    chmodSync(join(bin, 'claude'), 0o755);

    // The account check must not reach the network, and must not be the thing
    // under test — it answers with the right account so the run is quiet.
    writeFileSync(join(bin, 'gh'), '#!/bin/sh\necho bop-del\n');
    chmodSync(join(bin, 'gh'), 0o755);

    // PATH is replaced rather than prepended, and the environment is built
    // from nothing: inheriting the real one means the launcher can see the real
    // gh, the real skills repo and the real HOME, and a test that passes
    // because of the machine it ran on is not evidence of anything.
    return execFileSync('sh', [LAUNCHER, ...args], {
        encoding: 'utf8',
        env: { PATH: `${bin}:/usr/bin:/bin`, HOME: home },
    });
}

test('with no argument it starts in the main clone', () => {
    // The launchpad's case, and the one that must not change: an existing
    // `cc-chesslines` with no argument behaves exactly as it did.
    const home = fakeHome();

    const out = run([], { home });
    assert.match(out, new RegExp(`CLAUDE-CWD: ${join(home, 'code', 'chesslines')}$`, 'm'));
});

test('a directory argument starts the session there instead', () => {
    // A lane lives under ~/.herdr/worktrees/, not beside the clone. Without
    // this the launcher would cd the agent out of its worktree and into the
    // main clone — the exact failure /start-ticket warns about.
    const lane = scratchDir('cc-lane-');

    const out = run([lane]);
    assert.match(out, new RegExp(`CLAUDE-CWD: ${lane}$`, 'm'));
});

test('a missing directory fails instead of starting somewhere else', () => {
    assert.throws(() => run([join(SCRATCH, 'cc-does-not-exist-9e3a')]));
});

test('a flag is not mistaken for a directory', () => {
    // The parse rule this change introduces. A flag first means no directory
    // was given, so the launchpad's clone is still the answer — and the flag
    // must reach claude rather than being eaten as a path.
    const home = fakeHome();

    const out = run(['--continue'], { home });
    assert.match(out, new RegExp(`CLAUDE-CWD: ${join(home, 'code', 'chesslines')}$`, 'm'));
    assert.match(out, /CLAUDE-ARGS:.*--continue/);
});

test('an empty first argument is dropped rather than passed on', () => {
    // `cc-chesslines "" --foo` used to hand claude an empty argument, because
    // the branch that chose the main clone did not consume it.
    const home = fakeHome();

    const out = run(['', '--continue'], { home });
    assert.match(out, new RegExp(`CLAUDE-CWD: ${join(home, 'code', 'chesslines')}$`, 'm'));
    assert.match(out, /CLAUDE-ARGS: --plugin-dir \S+ --continue$/m);
});

test('a relative directory is refused rather than resolved against the caller', () => {
    // /start-ticket passes the lane path out of a Herdr response, which is
    // absolute. A relative one would land wherever the caller happened to be —
    // which for a sourced shell function is the main clone, silently.
    const home = fakeHome();

    const out = run(['.'], { home });
    assert.match(out, new RegExp(`CLAUDE-CWD: ${join(home, 'code', 'chesslines')}$`, 'm'));
});

test('the engineering skills are passed through to claude', () => {
    // The finding that broke the first lane: an agent started without
    // --plugin-dir has no /implement, no /tdd, no /code-review.
    const lane = scratchDir('cc-lane-');

    const out = run([lane]);
    assert.match(out, /CLAUDE-ARGS:.*--plugin-dir/);
});

test('claude arguments still reach claude after a directory', () => {
    const lane = scratchDir('cc-lane-');

    const out = run([lane, '--dangerously-skip-permissions']);
    assert.match(out, /CLAUDE-ARGS:.*--dangerously-skip-permissions/);
});
