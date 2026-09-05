// One string, shown in the top-right corner. It answers exactly one question
// after a push: is the tab I am looking at the change I just made, or a stale
// copy? Pages takes 1–3 minutes, and without this the only way to tell is to
// guess.
//
// Bump it by one in every commit that changes shipped code (index.html, css/,
// js/). Docs-only and scripts/-only commits leave it alone — a bump that
// changes nothing on screen makes it useless for the one job it has.
export const BUILD = 'b10';
