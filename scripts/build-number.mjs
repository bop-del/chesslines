// The build number, derived rather than typed.
//
// It answers exactly one question after a push: is the tab I am looking at the
// change I just made, or a stale copy? A hand-typed number can be skipped,
// duplicated across branches, or simply wrong — and a wrong build number is
// worse than none, because it answers that question confidently and falsely.
//
// It is also the file every parallel lane touches. Each lane must bump it, each
// edits the same line, so every parallel merge conflicted on the same trivial
// thing (issue #17). A number computed from history cannot conflict: there is
// nothing to choose.
//
// The count is commits that touched what the browser downloads. Not every
// commit — docs and dev tooling ship to nobody, and a number that moves without
// the page moving is useless for the one job it has.
//
// Run it once, when the lane lands — after the rebase, before the PR. Not while
// building: a lane that writes the number mid-flight writes it again after the
// rebase, which is the noise #22 counted (four "Set the build number" commits on
// main in one day) and the false green it caused.
//
//   git rebase origin/main && npm run build-number
//
// It rewrites js/version.js only when the number actually changed, and the
// result is stable — running it twice says "unchanged" the second time.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = join(ROOT, 'js', 'version.js');

// What the browser downloads from Pages. js/vendor/ is in here deliberately:
// re-vendoring chess.js changes what ships, even though we did not write it.
// js/version.js is excluded, and that exclusion is what makes this work at all.
// Writing the number is itself a commit touching js/, so counting it would move
// the count again the moment it lands — the value would never converge, and
// chasing it commit by commit does not terminate. Excluded, the number is a
// fixed point: writing it cannot change what it should be.
const SHIPPED = ['index.html', 'css/', 'js/', ':!js/version.js'];

function git(...args) {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function countAt(ref) {
    return Number(git('rev-list', '--count', ref, '--', ...SHIPPED));
}

// The number this checkout owes: what will be on Pages once everything here has
// landed. This is what `npm run build-number` writes.
export function buildNumber() {
    return `b${countAt('HEAD')}`;
}

// Where "landed" is measured from. On `main` that is HEAD itself; on a lane it
// is the point the lane was cut from, because the lane's own shipped commits
// have not reached Pages yet.
//
// Falls back to HEAD when there is no `origin/main` to compare against — a
// fresh clone with no remote, or `main` itself before the first fetch. Then
// every commit counts as landed, which is the old behaviour and the right one:
// there is no lane to be ahead of.
function landedRef() {
    try {
        git('rev-parse', '--verify', '--quiet', 'origin/main');
    } catch {
        return 'HEAD';
    }

    // The merge base, not `origin/main` itself. A lane that has not rebased is
    // *behind* on other lanes' work as well as ahead on its own; the base is
    // the only point both agree on, so it is the number the lane was handed.
    return git('merge-base', 'HEAD', 'origin/main');
}

// The number that is live — the one js/version.js should be holding right now.
export function landedBuildNumber() {
    return `b${countAt(landedRef())}`;
}

// Shipped commits on this lane that have not landed. Zero on `main`, which is
// what makes the number written there final.
export function pendingCommits() {
    return countAt('HEAD') - countAt(landedRef());
}

function main() {
    const next = buildNumber();
    const current = readFileSync(VERSION, 'utf8');
    const found = current.match(/BUILD = '(b\d+)'/);

    if (!found) {
        console.error('js/version.js does not contain a BUILD string');
        process.exit(1);
    }

    if (found[1] === next) {
        console.log(`${next} — unchanged`);
        return;
    }

    writeFileSync(VERSION, current.replace(found[0], `BUILD = '${next}'`));
    console.log(`${found[1]} → ${next}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
