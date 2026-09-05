# ADR 0003 — A hand-written board, tap-to-move only

**Status:** accepted
**Date:** 2026-09-05

## Context

Every chess web app needs a board. The default choice is
[chessground](https://github.com/lichess-org/chessground) (Lichess's board) or
chessboard.js — both mature, both solving drag-and-drop, animation and
responsive sizing.

ADR 0002 has just argued for vendoring third-party code. The obvious question is
why the board is not vendored too.

## Decision

**The board is hand-written** — `js/board/Board.js`, 64 squares of DOM, twelve
piece symbols, rendering a position and reporting move intent.

**Tap-to-move only. There is no drag.**

The board never mutates game state. It renders what it is given and calls
`onMove(move)` with the move the user chose; whoever owns the game decides what
happens next.

## Rationale

**The failure mode is visible, which is what makes it safe to own.** ADR 0002
vendors chess.js because legality bugs are silent. A board bug puts a piece on
the wrong square and you see it immediately, in the first screenshot of the
verification run. That inversion is the entire reason these two decisions differ.

**Drag-and-drop does not work on the target device.** HTML5 drag-and-drop does
not fire from touch on iPhone at all, and iOS is the target (ADR 0004).
Supporting drag would mean pointer events, touch-action juggling and a scroll
conflict — a large share of any board library's complexity, spent on an
interaction this app has decided not to have.

**Two taps are better for a nine-year-old anyway.** A dropped drag is a small
frustration in something meant to encourage. Tap-select then tap-destination is
unambiguous, forgiving of imprecision, and reachable by keyboard and screen
reader in a way drag never is.

**A board is a few hundred lines of DOM.** Without drag, the hard parts of a
board library are gone. What remains — squares, orientation, highlighting legal
targets — is code worth owning, because every mode in this app (explore, adopt,
drill) needs to decorate the board differently.

**No dependency to fight.** Chessground assumes its own state model and ships
its own CSS; bending it to a tap-only, child-facing UI would likely cost more
than writing the board did.

## Consequences

**Positive:** Total control over presentation — highlighting a wrong move,
showing the correction, orienting to Felix's side (ADR 0008) are all trivial.

**Positive:** No animation system, and none needed.

**Negative:** Anything a board library gives free — premoves, arrows, piece
animation — is ours to build if it is ever wanted. Accepted: none of it is in
scope.

**Negative:** Accessibility is ours to get right, not inherited.

## Alternatives considered

**Chessground** — the best board on the web, and genuinely tempting. Rejected on
the drag argument above plus its state-model assumptions; the part of it this
app would use is the part that is cheap to write.

**chessboard.js** — older, jQuery-era, drag-centric. Same objection, less
upside.
