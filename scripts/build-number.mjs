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
// Run it whenever shipped files changed:  npm run build-number
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

export function buildNumber() {
    const out = execFileSync('git', ['rev-list', '--count', 'HEAD', '--', ...SHIPPED], {
        cwd: ROOT,
        encoding: 'utf8',
    });
    return `b${out.trim()}`;
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
