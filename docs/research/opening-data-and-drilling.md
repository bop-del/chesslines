# Opening data and drilling — research

Bootstrap research, September 2026. Claims here were verified by running them,
not read from documentation; where something is single-sourced or untested it
says so.

## Data format

**On disk: PGN with variations, one file per repertoire.** Human-readable,
hand-editable, and the universal interchange format — a Lichess study export
pastes straight in.

**chess.js does not preserve variations.** Verified: loading
`1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6` parses without error, but `history()`
returns only `e4 e5 Nf3 Nc6`. The RAV is silently discarded. chess.js is a
**legality and SAN engine only**, not a repertoire parser. This is a quiet
failure — no exception, just missing lines — so it needs a check of its own.

**The variation parser is ours, ~30 lines.** The whole grammar is: SAN moves,
`(`, `)`, `{}`, `$n`, and move numbers to skip. The rule that matters is that a
variation attaches as a *sibling of the preceding move*:

```js
// on '(' : stack.push([cur, prev]); cur = prev;   // rewind one ply
// on ')' : [cur, prev] = stack.pop();
```

Verified against a real 5-chapter Lichess study — 65 nodes, depth 39, nested
RAVs — parsed correctly.

### The position key

**The first four FEN fields**: piece placement, side to move, castling rights,
en-passant square. **Drop the halfmove clock and the fullmove number** — they
encode *how you arrived*, not what the position is.

This is what makes transpositions merge, and it was verified:
`1.d4 Nf6 2.c4 e6 3.Nc3 d5` and `1.d4 d5 2.c4 e6 3.Nc3 Nf6` give **different
full FENs but identical 4-field keys**.

Keep en passant: a position where an en-passant capture is legal genuinely is a
different position. Lichess's EPD does the same, refined to set the field only
when the capture is actually legal.

**Progress must hang on positions, not on tree nodes.** Four independent
projects converged here — ChessTempo shares learning data across repertoires,
Chessbook's founder says *"Store EPDs, not FENs"* and *"treating repertoires as
a collection of lines… doesn't work for transpositions"*, OpeningTree keys a Map
by truncated FEN, and chessdriller keys `[fromFen, toFen]`. A per-node design
(Listudy's) cannot represent a line reached two ways — and that bug only
surfaces once the repertoire has grown.

## Where the content comes from

**Write the repertoire by hand.** For a nine-year-old the whole thing is about
20 lines, ~1.4 KB of PGN. The research below argues for ~3 lines about 5 moves
deep, so curation matters far more than volume. A single hand-written `.pgn` in
the repo is the entire content pipeline.

**Ship [lichess-org/chess-openings](https://github.com/lichess-org/chess-openings)
for opening *names*, not lines.** Licence, verbatim: *"As a collection of facts,
this data set is in the public domain… released under the CC0 Public Domain
Dedication."* 3,810 openings across 5 TSVs, 388 KB raw / 51 KB gzipped.

**Build the name map at data-prep time**, in a script under `scripts/`, never at
runtime. All 3,810 lines replay through chess.js with zero failures, producing
`[epd, eco, name]` at 457 KB raw / 61 KB gzipped. The step earns itself: naive
move-sequence lookup mis-names transpositions — the QGD reached via `1.d4 Nf6`
returns only "Indian Defense: Normal Variation", while the position-keyed map
returns `D35 Queen's Gambit Declined: Normal Defense` for **both** move orders.

**Lichess Study export works anonymously**, if vetted lines are wanted later.
Verified live: `GET /api/study/{id}.pgn?variations=true&comments=true` returns
200, `content-type: application/x-chess-pgn`, `access-control-allow-origin: *`,
with real nested RAVs. Only public, non-unlisted chapters are readable without
auth.

**Chessable is out as a source**, first-party and stated twice: *"nor do we
provide .pgn files"* — deliberate, to combat piracy. Any design assuming a user
can bring their Chessable repertoire across is unbuildable. ChessTempo is the
better precedent: full bidirectional PGN with a documented import spec.

**The Lichess opening *explorer* API now requires OAuth**, 25 requests/min per
token ([announcement, 3 Mar 2026](https://lichess.org/@/thibault/blog/the-opening-explorer-now-requires-authentication/FSWh9Zg3)).
Confirmed: 401 from both explorer hosts while `lichess.org/api` returned 200
from the same IP. This closes off frequency-weighted drilling (Chessbook weights
by what you would actually face at your rating) for an anonymous static page.

**ECO caveat:** "ECO code is a registered trademark of Chess Informant" — a
trademark on the name, not copyright on the codes as facts.

## Scheduling

**A fixed 8-level ladder. One integer per card.**

```js
const LADDER_H = [4, 24, 72, 168, 336, 720, 2160, 4320]; // 4h,1d,3d,1w,2w,1mo,3mo,6mo
const next  = (lvl, ok) => ok ? Math.min(lvl + 1, 8) : Math.max(1, lvl - 2);
const dueAt = (lvl, now = Date.now()) => now + LADDER_H[lvl - 1] * 3600e3;
```

**On a miss, demote two levels rather than resetting to zero.** Chessable resets
to level 1; softened here deliberately for a child. This is the one tunable
worth having.

**No ease factor.** SM-2's only machinery over a plain ladder is per-card ease,
and ease is what produces "ease hell" (Anki's own term). It needs deck volume to
earn its keep, and with ~80 cards there is no review-budget pressure for it to
help. Integers also serialize and URL-encode cleanly. SM-2's parameters, if it
is ever wanted: `I(1)=1, I(2)=6, I(n)=I(n-1)×EF`,
`EF' = EF+(0.1−(5−q)(0.08+(5−q)0.02))`, initial 2.5, floor 1.3
([source](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)).

### Scheduling granularity is not delivery granularity

The core architectural point, from reading chessdriller's source directly. State
lives **per move**, but a move cannot be quizzed in isolation — you have to
*play into* the position.

- **Only the player's own moves are ever scheduled.** Opponent moves are never
  quizzed.
- To build a session, **breadth-first search the tree for a line containing due
  moves**, auto-play the non-due moves as context, and quiz only the due ones.
- **Continue from the previous line where possible** — rewind one ply at a time
  looking for another due continuation before resetting the board. Fewer board
  resets, which matters a great deal for a child.
- Where several own moves are acceptable in one position, carry the siblings as
  `branches` and accept any of them.

## Persistence

**localStorage, one compact key.** Measured: 150 cards as
`[[idx, level, dueDay], …]` is ~2 KB — 0.04% of the 5 MB budget. Store the due
date as a day number, not an ISO string.

**iOS eviction, the actual current rule.** WebKit's
[Tracking Prevention Policy](https://webkit.org/tracking-prevention/): *"ITP
deletes all cookies created in JavaScript and all other script-writeable storage
after 7 days of no user interaction with the website."*

- It covers **localStorage, IndexedDB, service workers and the cache alike**.
  "IndexedDB is safer on iOS" is folklore with no primary source — do not pay
  IndexedDB's async complexity hoping for durability.
- The clock counts **days of Safari use**, and **interaction with the site
  resets it**. A child practising twice a week never hits it; a three-week
  holiday could.

**The one documented defence is Add to Home Screen**, explicitly exempt: *"The
first-party domain of home screen web applications is exempt from ITP's 7-day
cap on all script-writeable storage."* It also gets a browser-tier quota (60% of
disk per origin since Safari 17) and storage isolated from Safari.
`navigator.storage.persist()` is **not** a documented defence against ITP.

**Escape hatch: export/import a JSON file.** Blob plus `<a download>`, restored
via `<input type="file">`. `showSaveFilePicker` is unsupported in Safari (MDN
compat: `version_added: false`), so the File System Access API is out. At ~2 KB,
an occasional "save my progress" button is more reliable than any storage API.

**Why not URL state**, despite the project's usual preference: gzip barely helps
at this size (123 vs 130 bytes for a single line), and a full repertoire plus
progress exceeds the safe ~2,000-character cap. URL state suits **sharing a
repertoire**; it does not suit carrying daily progress.

## Teaching a nine-year-old

- **Depth: about 3 lines, ~5 moves deep, 15–25 positions total.** Consensus is
  principles over memorization; the honest version is principles first, plus a
  few moves in a few key spots. ChessKid places its first opening lesson at
  roughly position 14 of 173 — openings come *late*.
- **Skip the streak.** Two well-replicated findings cut against conventional
  gamification for children. Announced tangible rewards undermine intrinsic
  motivation *more* in children than adults (verbal praise: adults d=0.43,
  children d=0.11, not significant —
  [Deci, Koestner & Ryan](https://www.selfdeterminationtheory.org/SDT/documents/2001_DeciKoestnerRyan.pdf)),
  and gamification's effect decays from d=1.57 under an hour to **d=−0.20 over a
  year** ([Kim & Castelli 2021](https://pmc.ncbi.nlm.nih.gov/articles/PMC8037535/)).
  **Unexpected rewards showed no undermining at all (d=0.01)** — that is the
  clean lever. Prefer a monotonic progress meter (ChessKid's Stars "only go up")
  and surprise unlocks over a loss-bearing streak.
- **UX:** immediate feedback naming the *idea* ("this develops toward the
  centre"), always allow a retry, board oriented to the child's side, and **no
  engine evaluation** — a −0.3 is meaningless and discouraging to a
  nine-year-old.
- **Two caveats not papered over:** the spacing literature does not cleanly
  support short-frequent sessions for the 6–10 band specifically (primary grades
  showed the most negative effects), and "attention span = age in minutes" plus
  the 8-second goldfish figure are **unsupported**. Do not build a session-length
  rule on them; test cadence on the actual child.

## Explicitly unverified

Treat these as open: Chessable's exact interval ladder (their support page 403'd;
single-sourced), Chessbook's PGN export (third-party review only, and Chessbook
is **not** open source — the repos 404 with no Wayback snapshots), and every iOS
rule above, which is **documented policy, not device-tested**. sndlab's issue #5
is the precedent: only a real phone proves mobile behaviour.
