# Library research — chesslines

Findings from the bootstrap research, September 2026. Destined for
`docs/research/` in the new repo, and the source material for the vendoring
ADR. Everything here was verified by running it, not read from documentation.

## The constraint that decides everything

No build step, no npm at runtime, no CDN. A library is usable only if it can be
**vendored**: source copied into the repo, imported with a relative ES module
import. That single rule eliminates most of the field before quality is even
considered.

## Rules engine

### Chosen: chess.js 1.4.0

`dist/esm/chess.js` — a single self-contained ESM file, 3,368 lines / 107 KB
(~23.9 KB gzipped), **zero `import` statements**, one `export`. Copy to
`js/vendor/`, import relatively, done.

- **License:** BSD-2-Clause — permissive, fine for a public repo.
- **Health:** released 2025-06-14; repo pushed 2026-08-11; 4,394 stars;
  ~165k weekly npm downloads. Actively maintained.
- **Dependencies:** none.
- **Correctness, measured:** 378/378 checks pass on the Ethereal 128-position
  perft corpus at depth ≤3. The six canonical Chess Programming Wiki positions
  pass deeper, including Kiwipete depth 4 (4,085,603) and Position 4 depth 4
  (422,333).
- **Mobile Safari:** safe. Newest syntax is `?.` / `??` (ES2020) and BigInt
  literals for Zobrist hashing — all Safari 14+. No private fields, no `.at()`,
  no `Object.groupBy`, no Node globals.
- **Browser proof:** vendored, served, imported as a bare
  `<script type="module">`. Chromium and WebKit both gave 20 legal opening
  moves, correct SAN and PGN, threefold / checkmate / insufficient-material all
  correct, with 0 console errors and 0 failed requests.

**Vendoring note:** delete the trailing `//# sourceMappingURL=chess.js.map`
line. Harmless — browsers fetch it only with devtools open — but it points at a
file that will not exist.

**API surface we need:** `new Chess(fen)`, `load()`, `fen()`, `move()`,
`moves({verbose, square, piece})`, `undo()`, `isCheck()`, `isCheckmate()`,
`isStalemate()`, `isDraw()`, `isInsufficientMaterial()`,
`isThreefoldRepetition()`, `isGameOver()`, `pgn()`, `loadPgn()`, `history()`,
`turn()`, `board()`, `validateFen()`. Verbose moves carry `san`, `lan`, `flags`
and `before`/`after` FENs — `after` is useful for keying trainer positions.

**Trap for future readers:** the v1 rename dropped the old snake_case API, so
any tutorial written before 2023 will not compile against this version.

### Rejected

**chessops 0.15.1** — lichess's own engine, excellent correctness pedigree,
~1,807 lines core. Rejected on **GPL-3.0-or-later**: vendoring it would force
the entire repo to GPL. Also depends on `@badrap/result`, so it is not
drop-in vendorable regardless.

**js-chess-engine 2.4.6** — MIT and maintained, but `dist/` is CommonJS with
`require()`/`exports` plus TypeScript downlevel helpers. Cannot run in a browser
without a bundler. Disqualified by rule 2.

**chess.mjs 2.3.2** — the genuine runner-up. BSD-2-Clause, `"type": "module"`,
zero dependencies, a single 2,154-line source file, and perft-correct on
positions 1–3 at depth 3. Rejected because it is a fork of the *old* chess.js
0.x snake_case API (`in_check()`, `load_pgn()`) — an aging API for no size win
over the maintained original.

**cm-chess 4.0.0** — MIT and ESM, and its variation-tree handling is genuinely
appealing for an opening trainer. Rejected because it depends on `chess.mjs`
plus `cm-pgn`, so vendoring means pulling in a dependency tree. Worth
revisiting if we ever hand-roll variation handling and regret it.

**chess-js** (2017), **chess.ts** (2021) — abandoned.

### Writing our own

Estimated **3–6 focused days** to reach perft-clean, plus more for SAN and draw
rules. 0x88 board representation is the right choice — off-board tests become a
single mask.

The reason this was rejected is not the days. It is that **perft validates move
generation only**; SAN disambiguation and draw rules have no equivalent safety
net, and that is exactly where bugs survive casual testing.

Classic bugs, roughly in the order people hit them:

- Castling through or out of check — the square the king *crosses* must be
  unattacked, not merely the destination. Forgetting that a rook move or rook
  capture clears that side's rights.
- En passant: leaving the EP square set when no pawn can actually capture it
  (breaks FEN comparison and threefold detection). The discovered-check case
  where capturing en passant removes *two* pawns from one rank and exposes the
  king to a rook — this passes casual testing and only perft catches it.
- Pins: treating a pinned piece as immobile when it may legally move *along*
  the pin ray.
- Promotion counted as one move rather than four.
- SAN disambiguation: emitting `Nf3` when two knights reach f3, or
  over-disambiguating with file *and* rank where file alone suffices. `+` / `#`
  suffixes.
- Threefold repetition comparing full FEN including move counters — it must
  compare position, side to move, castling rights, and a *usable* EP square.
- Fifty-move rule counting plies rather than moves.

**Test corpus if this is ever revisited:** the Chess Programming Wiki perft
results for the six canonical positions, and Ethereal's machine-readable
`standard.epd` — 128 positions with `;D1 20 ;D2 400 …` node counts, trivially
parsed. Kiwipete catches castling and en passant bugs; Position 3 catches the
EP discovered-check case.

## Board rendering

### Chosen: hand-built, CSS grid, tap-to-move only

~150–250 lines for tap-to-move. Squares as `<div>`s in a CSS grid, pieces
absolutely positioned so CSS transforms can animate them later.

Chosen over vendoring because the failure mode is *visible*: a board bug puts a
piece on the wrong square and you see it instantly. Contrast the engine, where
a bug is silent and authoritative. Tap-to-move is also the better interaction
on a phone — no finger covering the board, no mis-drops — and materially better
for a child, for whom a dropped drag is a small frustration in something meant
to encourage.

**Accepted costs, to be stated in the ADR:** no move animation initially;
we build the promotion dialog, board flipping, and coordinate labels ourselves.
Accessibility is ours, though tap-to-move is *easier* to make accessible than
drag ever was.

### Rejected

**cm-chessboard 8.14.0** — the only vendorable library of the three, and a
close call. MIT, zero dependencies, plain unbuilt ESM with relative imports,
local SVG sprite. Core vendor set is 1,844 lines / 75 KB plus 8 KB CSS and a
23 KB sprite. Its touch model is *correct* — it never touches the HTML5 drag
API, and it calls `preventDefault()` only when the touch lands on a piece you
are allowed to move, so the page still scrolls elsewhere.

Rejected only because we chose tap-to-move, which is small enough to own. If
drag is ever required, **this is the one to vendor** — do not rebuild it. Note
it ships `user-select` but no `-webkit-` prefixes and no `touch-action` at all,
so the iOS defenses below would have to be patched in regardless.

**chessground 10.1.1** — lichess's board, technically vendorable (prebuilt ESM,
pieces base64-inlined in CSS, so no external fetches). Rejected on
**GPL-3.0-or-later**, same repo-wide relicensing problem as chessops.

**chessboard.js 1.0.0** — requires jQuery. Disqualified by rule 1, and
unmaintained since 2019 besides.

**Canvas** — rejected outright. Loses DOM accessibility, text rendering and CSS
transitions, and gains nothing at 8×8.

Note that **no board library computes legal moves**. The board and the engine
are independent choices.

## Piece graphics

**Cburnett SVG set**, from Wikimedia Commons, **CC BY-SA 3.0** (authors
User:Cburnett and User:Rfc1394). A single sprite using `<symbol id="wk">` …
`id="bp"` referenced via `<use href="#wk">`, so it works as a local file, an
inline `<svg>` block, or a data URI.

Share-alike applies to **the images, not to our code** — so a public repo needs
an attribution line, and probably a credit in the UI.

**Avoid the "Staunty" set** that cm-chessboard also ships: CC BY-NC-SA 4.0,
non-commercial.

## iOS — what actually breaks

The highest-value part of the research, because most of it is invisible to the
verification run.

**HTML5 drag-and-drop does not fire from touch on iPhone at all.** iPadOS 15+
fires it only from a trackpad or pointer. Any board built on `dragstart` is
dead on the target device. This alone invalidates most chessboard tutorials.

Input model, if drag is ever added:

- `touchmove` always targets the element the touch **started** on, not what is
  under the finger. Resolve the destination with
  `document.elementFromPoint(t.clientX, t.clientY)`. This is the single most
  common chessboard drag bug.
- Handle `touchcancel` — an incoming call or a finger straying into browser
  chrome fires it, and without cleanup the dragged piece is orphaned mid-board.
- Register `touchmove` with `{passive: false}`, or `preventDefault()` is
  silently ignored and the page scrolls under the piece.
- Prefer `preventDefault()` on `touchmove` over `touchstart` — preventing
  `touchstart` also suppresses the synthesized mouse and click events.

CSS defenses:

```css
.board {
  touch-action: none;              /* board only, never the page */
  -webkit-touch-callout: none;     /* no long-press action sheet */
  -webkit-user-select: none; user-select: none;
  -webkit-tap-highlight-color: transparent;
  aspect-ratio: 1;
  width: min(100vw, 100svh - <chrome>);
}
.piece { -webkit-user-drag: none; }
body { overscroll-behavior: none; }  /* no rubber-band chaining */
```

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

Support floors, from caniuse: `touch-action` iOS 13+; `env()` safe-area insets
iOS 11.3+ (needs `viewport-fit=cover`); Pointer Events iOS 13.2+;
`dvh`/`svh`/`lvh` iOS 15.4+. Use `svh` for a board that must never be clipped
by the URL bar.

**Tap delay is mostly solved** — iOS 9.3+ removed the 350 ms delay for pages
declaring `width=device-width`. `touch-action: manipulation` opts individual
elements in. Do **not** reach for `user-scalable=no`: it blocks pinch-zoom for
low-vision users.

**A regression to watch:** an Apple forum thread reports
`-webkit-touch-callout` misbehaving on iOS 26.1. Verify on device.

### The verification gap

caniuse marks `touch-action` as **not applicable on desktop Safari** —
"not applicable to platforms that do not support touch events". So
`touch-action` bugs, the long-press callout menu, rubber-band scrolling and
`-webkit-touch-callout` are all **structurally invisible** to a Playwright run,
on both engines.

This is the same shape as sndlab's issue #5: green on Chromium and WebKit,
broken on the actual phone. It is the evidence behind the iOS ADR, and the
reason a real device stays the only proof for anything touch-related.

## Sources

- chess.js — https://github.com/jhlywa/chess.js · https://jhlywa.github.io/chess.js/
- chessops — https://github.com/niklasf/chessops
- js-chess-engine — https://github.com/josefjadrny/js-chess-engine
- chess.mjs — https://github.com/shaack/chess.mjs
- cm-chess — https://github.com/shaack/cm-chess
- cm-chessboard — https://github.com/shaack/cm-chessboard
- chessground — https://github.com/lichess-org/chessground
- Perft results — https://www.chessprogramming.org/Perft_Results
- Ethereal standard.epd — https://github.com/AndyGrant/Ethereal
- Cburnett pieces — https://commons.wikimedia.org/wiki/Category:SVG_chess_pieces/Standard
- MDN touch-action, Touch events, env(), -webkit-touch-callout
- caniuse.com
