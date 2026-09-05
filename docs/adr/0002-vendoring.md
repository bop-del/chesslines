# ADR 0002 — Vendoring third-party code, and `js/vendor/` as out-of-view

**Status:** accepted
**Date:** 2026-09-05

## Context

ADR 0001 forbids runtime dependencies. This project nonetheless needs chess
legality: which moves are legal from a position, what a move is called in SAN,
and what FEN a position produces. That is the one part of this app where being
subtly wrong is worse than being obviously broken — a board that teaches an
illegal move teaches something false, authoritatively, to someone with no reason
to doubt it.

Writing a legality engine by hand is a well-known trap: castling through check,
en passant, pinned pieces, promotion, threefold repetition. It is a month of
work to get right and a permanent source of rare bugs.

## Decision

**Vendor it.** [chess.js](https://github.com/jhlywa/chess.js) 1.4.0
(BSD-2-Clause) is committed to this repo as `js/vendor/chess.js`, with its
licence beside it as `js/vendor/chess.js.LICENSE`.

`js/vendor/` is **out of view**: it is third-party code, read-only by
convention, not reviewed line by line, not reformatted to house style, and not
counted against the ~500-line file rule. It is treated as an opaque appliance
with a documented interface.

Vendored code is pinned to an exact version and updated deliberately, never
automatically.

## Rationale

**It keeps ADR 0001 literally true.** A vendored file is served by GitHub Pages
like any other file in the repo. There is no install step, no lockfile
resolution, no CDN that can go down or serve something different tomorrow.
*What is in the repo runs in the browser* still holds.

**The failure modes are opposite, and that is the whole argument.** A legality
bug is silent and rare — it produces a position that looks fine and is wrong. A
rendering bug puts a piece on the wrong square and you see it instantly. Code
whose failures are invisible is exactly the code worth taking from a project
with years of testing behind it; code whose failures are obvious is safe to own
(ADR 0003).

**Supply-chain risk drops to zero after the copy.** The decision to trust
chess.js is made once, when the file is committed, by a human reading a diff.
There is no npm postinstall, no transitive dependency, and no future version
that arrives without being asked for.

**BSD-2-Clause permits it** with attribution, which the committed
`.LICENSE` file provides.

## Consequences

**Positive:** Legality, SAN and FEN are correct without this project owning that
problem. The position key (ADR 0007) and the PGN parser both build directly on
it.

**Negative:** Updates are manual. A chess.js bugfix reaches this project only
when someone re-vendors it. Acceptable: the rules of chess are stable, and this
app uses a small, long-settled part of the API.

**Negative:** 3,367 lines of code in the repo that nobody here has read in full.
That is the honest price of the decision, and the reason `js/vendor/` is
fenced off by convention rather than mixed into `js/`.

**Neutral:** The parser is *not* vendored, because chess.js cannot do that job —
it silently discards variations (ADR 0006). Vendoring is for the part that is
hard and dangerous, not for everything third-party code happens to touch.

## Alternatives considered

**npm dependency on chess.js** — rejected by ADR 0001, and it would require a
build step to reach the browser.

**A CDN `<script>` tag** — no build step, but it adds a network dependency and a
third party who can change what they serve. A static app that stops working
because someone else's CDN changed is a worse outcome than a slightly stale
vendored file.

**Writing legality by hand** — rejected above. The one place in this project
where "not invented here" is the right instinct.
