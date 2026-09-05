# ADR 0005 — Dev dependencies permitted; shipped code stays dependency-free

**Status:** accepted
**Date:** 2026-09-05

*Carried from [sndlab ADR 0004](https://github.com/bop-del/sndlab), with a
second devDependency-free addition: the test runner is built into Node.*

## Context

ADR 0001 forbids runtime dependencies. Verification, however, requires driving a
real browser, and every way to do that is Node tooling.

The bar this project has to clear is higher than sndlab's. There, an unverified
claim produced a wrong sound. Here it produces **a chess line that is wrong**,
taught to a nine-year-old who has no reason to doubt it. "It works" without
evidence is not acceptable at that stake.

## Decision

**Dev dependencies are permitted. Shipped code stays dependency-free.**

The boundary is what the browser downloads from GitHub Pages. `index.html`,
`css/` and `js/` have no dependencies and no build step — not negotiable.
Everything under `scripts/` and `test/`, plus `package.json` and
`node_modules/`, is development tooling that never reaches a user.

Concretely:

- **Playwright** as the single devDependency, driving both engines from
  `scripts/verify.mjs`.
- **`node --test`** for unit tests over the pure logic in `js/data/` — built
  into Node, so it costs no dependency at all.

## Rationale

**Rule 1 always said "shipped code."** Playwright is not imported by anything
under `js/`, does not appear in `index.html`, and Pages serves the repo
untouched. *What is in the repo runs in the browser* remains literally true.

**Two layers, because they catch different things.** `node --test` covers the
pure logic — the position key, the PGN tree, catalogue lookup — in milliseconds,
which is what makes test-first practical. The browser run covers what unit tests
structurally cannot: that the modules actually load over HTTP, that the imports
resolve, that the console is clean, and that it all works in **WebKit** as well
as Chromium. Neither layer replaces the other.

**WebKit is not optional here.** ADR 0006 makes iOS Safari the target device.
A suite that only ran Chromium would be green while the actual target was
broken.

**Every shipped line is proved legal.** The starter list is run through the
engine in `test/openings.test.mjs` and again in both browsers. This is the
check that matters most in the whole project: a mistyped move in a curated
opening is invisible to review and authoritative to a child.

**Screenshots are for assessment, not regression.** Every run writes one to be
looked at — layout, contrast, whether a nine-year-old could use it. It is
explicitly not a committed pixel baseline; baselines protect a design you are
afraid to break, and ADR 0001 wants aggressive rewrites to stay cheap.

## Consequences

**Positive:** An agent can verify its own work. "It works" becomes a claim with
evidence.

**Positive:** The failure modes a no-build ES-modules project is uniquely prone
to — a bad import path, a 404 module, a dead listener — are caught immediately.

**Negative:** Cloning and *running* the app still needs nothing; cloning and
*verifying* it needs `npm install` and a browser download. This is the first
crack in "clone it and it runs" and should not be widened casually: a further
devDependency needs a reason, not a precedent.

**Negative:** Local gate only, per ADR 0004. Discipline, not enforcement.
