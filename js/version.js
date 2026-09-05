// One string, shown in the top-right corner. It answers exactly one question
// after a push: is the tab I am looking at the change I just made, or a stale
// copy? Pages takes 1–3 minutes, and without this the only way to tell is to
// guess.
//
// Derived, not typed: `npm run build-number` counts the commits that touched
// what the browser downloads (index.html, css/, js/) and writes the result
// here. Docs-only and scripts/-only commits do not move it — a number that
// changes without the page changing is useless for the one job it has.
//
// Do not edit this by hand. A test asserts it matches what history says, and
// deriving it is what stops parallel lanes conflicting on this line (#17).
export const BUILD = 'b16';
