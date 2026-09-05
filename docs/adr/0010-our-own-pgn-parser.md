# ADR 0010 — Our own PGN parser, because chess.js discards variations

**Status:** accepted
**Date:** 2026-09-05

## Context

ADR 0002 vendors chess.js precisely so this project does not write chess logic
by hand. chess.js has a `loadPgn()`. The consistent decision would be to use it.

It cannot be used, for a specific and verifiable reason.

## Decision

**The PGN parser is ours** — `js/data/pgn.js`, roughly 30 lines of tokenising
plus a tree walk. chess.js is still used underneath it, for legality and SAN on
every move the parser applies.

## Rationale

**chess.js silently discards variations.** Verified in this repo: loading
`1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6` returns a history of
`e4 e5 Nf3 Nc6` — the variation is gone and **no error is raised**. It is a
legality and SAN engine, not a PGN library.

**Variations are the data model, not a nicety.** An opening is a tree: Black
has choices, and a repertoire has to hold "if he plays this, I play that." A
parser that flattens the tree cannot represent the thing this app is about.

**Silent failure earns its own check.** A loud failure would be caught by any
test. This one returns a plausible line and loses the branches, which is why
`test/pgn.test.mjs` asserts on variations directly.

**The grammar is genuinely small.** SAN moves, `(`, `)`, `{comments}`, `$n`
NAGs, move numbers to skip, result markers. The rule that matters is one line:
a variation attaches as a **sibling of the preceding move** — on `(` rewind one
ply, on `)` restore.

**This does not contradict ADR 0002.** That ADR vendors the part that is hard
and dangerous to write. Parsing is neither: every move the parser produces is
still handed to chess.js for legality, so an illegal move in a PGN is rejected
rather than trusted. Ownership stops exactly where the danger starts.

## Consequences

**Positive:** The tree the whole app needs, with variations intact.

**Positive:** Illegal moves are rejected loudly at parse time, which is how the
starter list is proved legal (ADR 0005).

**Negative:** Full PGN is a larger grammar than this — RAV edge cases, unusual
tag pairs, SAN oddities. This parser handles what the starter list and hand-
written repertoires contain, not arbitrary tournament PGN. Importing files from
elsewhere would be a new decision.
