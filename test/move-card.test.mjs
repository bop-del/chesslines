import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, chmodSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Moving the card is a separate write to a separate system, and nothing else
// notices when it is missed: card #14 sat in `In progress` for a day after its
// PR had merged and its issue had closed (#22). `/accept-ticket` confirming the
// card reads `Done` catches that, but a confirmation only catches what someone
// remembered to do. This script does it.
//
// `gh` is never really called: a stub earlier on PATH records the arguments and
// answers with a board. That keeps the test hermetic — the real board is a
// shared, live thing, and a test that moved a real card would be a test nobody
// could run twice.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SCRIPT = join(ROOT, 'scripts', 'move-card.mjs');

const SCRATCH = mkdtempSync(join(tmpdir(), 'move-card-'));
after(() => rmSync(SCRATCH, { recursive: true, force: true }));

/** A board with one card per entry, in the shape `gh project item-list` returns. */
function board(items) {
    return JSON.stringify({
        items: items.map(([number, id, status]) => ({
            id,
            status,
            content: { number, title: `Issue ${number}` },
        })),
    });
}

/**
 * Run the script with `gh` stubbed out.
 * Returns its stdout plus every `gh` invocation, one per line.
 */
function run(args, { items = [[22, 'PVTI_card22', 'Needs review']], fail = false } = {}) {
    const bin = mkdtempSync(join(SCRATCH, 'stub-'));
    const log = join(bin, 'gh.log');

    // Records what it was asked, then answers the board for a read and either
    // succeeds or fails for a write.
    writeFileSync(
        join(bin, 'gh'),
        `#!/bin/sh
echo "$*" >> ${log}
case "$1 $2" in
  "project item-list") cat <<'BOARD'
${board(items)}
BOARD
  ;;
  "project item-edit") ${fail ? 'echo "gh: rejected" >&2; exit 1' : 'echo ok'} ;;
esac
`,
    );
    chmodSync(join(bin, 'gh'), 0o755);

    // The stub bin comes first so `gh` resolves to it; node's own directory has
    // to be on there too, since the runner is not always in /usr/bin.
    const result = execFileSync('node', [SCRIPT, ...args], {
        encoding: 'utf8',
        env: { PATH: `${bin}:${dirname(process.execPath)}:/usr/bin:/bin`, HOME: bin },
    });

    return { out: result, calls: existsSync(log) ? readFileSync(log, 'utf8') : '' };
}

test('it moves the ticket\'s card to Done', () => {
    const { out, calls } = run(['22']);

    // The item id comes from the board, never from the issue number: they are
    // different id spaces and guessing one from the other moves someone else's
    // card.
    assert.match(calls, /item-edit .*--id PVTI_card22/);
    assert.match(calls, /--single-select-option-id bafab4de/);
    assert.match(out, /22/);
});

test('it says so and changes nothing when the card is already Done', () => {
    const { out, calls } = run(['22'], { items: [[22, 'PVTI_card22', 'Done']] });

    // Re-running after a merge that already moved it must be safe and silent
    // about success, so the landing step can be repeated without thinking.
    assert.doesNotMatch(calls, /item-edit/);
    assert.match(out, /already/i);
});

test('an issue with no card fails loudly rather than moving nothing quietly', () => {
    // The failure that matters: a card that was never added to the board looks
    // exactly like a successful no-op unless the script says otherwise.
    assert.throws(() => run(['99']), /99/);
});

test('a rejected write fails rather than reporting a move that did not happen', () => {
    // `gh` 403s when the token has lost the `project` scope. Reporting Done on
    // top of that is the same lie the board rules exist to prevent.
    assert.throws(() => run(['22'], { fail: true }));
});

test('the status ids match the ones the tracker doc publishes', () => {
    // The ids live in two places: this script, and the table in
    // docs/agents/issue-tracker.md that a human reads. Adding or renaming a
    // column mints new ids for *every* option, so the two drift in one move —
    // and a stale id does not error, it writes the wrong column.
    const doc = readFileSync(join(ROOT, 'docs', 'agents', 'issue-tracker.md'), 'utf8');
    const script = readFileSync(SCRIPT, 'utf8');

    const published = [...doc.matchAll(/^\| (\w[\w ]*?) \| `(\w+)` \|$/gm)]
        .map(([, status, id]) => [status, id]);

    assert.ok(published.length >= 6, 'the status table should still be in the tracker doc');

    for (const [status, id] of published) {
        assert.match(
            script,
            new RegExp(`'${status}': '${id}'`),
            `${status} is '${id}' in the tracker doc; move-card.mjs disagrees`,
        );
    }
});
