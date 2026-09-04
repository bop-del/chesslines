# chesslines — design

**Date:** 2026-09-05
**Status:** approved, unimplemented beyond the board

## What this is

A static browser app for learning chess openings. Two primary users: Boris and
his nine-year-old son Felix. Public, so other people may use it, but every
design trade-off is settled in Felix's favour.

Felix does not yet have a repertoire and wants to learn several openings. That
sentence is the whole reason the app is shaped the way it is: it is not a drill
tool with a fixed set of lines, it is a way to **meet openings, choose some, and
then remember them**.

Same shape as [sndlab](https://github.com/bop-del/sndlab) — static, no build
step, no runtime dependencies, deployed from `main` to GitHub Pages. The
workflow, the board rules, the verification run and the build number are carried
over deliberately.

## Scope

**In:** browsing a curated list of openings, adopting them into a personal
repertoire, drilling that repertoire with spaced repetition, and exporting and
importing the result.

**Out, for now:** engine evaluation, playing full games, tactics puzzles,
opponent modelling, accounts, and any server. Also out: teaching the *plans*
behind an opening beyond a single line of prose per opening — that is a much
larger project and would change what this is.

## The three modes

Ordered as Felix meets them.

### Explore

A curated list of about a dozen real openings — Italian Game, Ruy Lopez,
Scotch, Queen's Gambit, London System, Scandinavian, Caro-Kann, French, and
similar. Tap one and play through its moves on the board, with the name and a
one-sentence idea. No scoring, no commitment.

**The catalogue cannot be this list.** The CC0 Lichess dataset has 3,810
openings and is exhaustive rather than curated — it contains "Sicilian Defense:
King David's Opening, `2. Ke2`" and four separate Myers Attacks. Ranking that by
ECO code and handing it to a nine-year-old would be actively unhelpful. The
starter list is hand-written by us; the dataset's job is different (see Data).

### Adopt

"Add this to my repertoire", choosing a side to play it from. This is the moment
a browsed opening becomes his, and it is the only way anything enters the
repertoire. The repertoire is **his data**, held in the browser, not a file in
this repo.

### Drill

Spaced repetition over what he has adopted. Empty until he adopts something,
which is correct — the app should have nothing to drill on day one.

The app plays the opponent's moves; Felix plays his own. A wrong move is
corrected immediately, shown on the board, and retried.

## Data

Three separate things, deliberately not merged.

### Catalogue — in the repo, CC0

[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings):
3,810 openings, 5 TSVs of `eco`/`name`/`pgn`, 388 KB raw. Public domain (CC0),
verbatim: *"As a collection of facts, this data set is in the public domain."*

Its only job is **naming a position Felix reaches**, including one he reaches by
a move order the line did not anticipate.

Converted at data-prep time by a script under `scripts/` — never at runtime —
into a position-keyed map of `[epd, eco, name]`, about 61 KB gzipped. The
conversion is worth the step: naive move-sequence lookup mis-names
transpositions, where position-keyed lookup does not.

### Starter list — in the repo, ours

About twelve openings, hand-picked, each with its ECO code, its moves, the side
it is for, and one sentence on the idea. Written by us because curation is the
part the dataset cannot do.

### Repertoire — his, in the browser

What he adopted, which side, and a progress record. Keyed by position, never by
node in a tree.

## The position key

**The first four FEN fields**: piece placement, side to move, castling rights,
en-passant square. The halfmove clock and fullmove number are dropped — they
record *how you arrived*, not what the position is.

Verified in this repo: `1.d4 Nf6 2.c4 e6 3.Nc3 d5` and `1.d4 d5 2.c4 e6 3.Nc3
Nf6` produce different full FENs and an identical 4-field key.

**Progress hangs on positions, not tree nodes.** Four independent projects
converge here — ChessTempo, Chessbook, OpeningTree and chessdriller. A per-node
design cannot represent a position reached two ways, and that failure only
appears once a repertoire has grown, which is the worst time to discover it.

En passant stays in the key: a position where the capture is legal genuinely is
a different position.

## Components

Each is separately testable and holdable in view.

| Unit | Job | Depends on |
|---|---|---|
| `js/vendor/chess.js` | Legality, SAN, FEN. Vendored, opaque, out of view. | — |
| `js/board/Board.js` | Renders a position, reports tap-to-move intent. **Built.** | — |
| `js/data/pgn.js` | Parses PGN **with variations** into a move tree. | chess.js |
| `js/data/catalogue.js` | Position → opening name. | generated map |
| `js/train/schedule.js` | The ladder: when is a card due, what happens on a miss. | — |
| `js/train/session.js` | Picks the next line to drill, decides what to auto-play. | schedule, tree |
| `js/store/repertoire.js` | Load, save, export, import. | — |
| `js/i18n/*` | UI strings, and English SAN → German notation for display. | — |
| `js/ui/*` | The three modes. | all of the above |

**The PGN parser is ours, and it must be.** chess.js silently discards
variations — verified here: loading `1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6`
returns a history of `e4 e5 Nf3 Nc6` with no error raised. It is a legality and
SAN engine only. The parser is about 30 lines; the whole grammar is SAN moves,
`(`, `)`, `{}`, `$n`, and move numbers to skip. The rule that matters is that a
variation attaches as a sibling of the preceding move: on `(` rewind one ply, on
`)` restore.

Because that failure is silent, it gets a check of its own.

## Scheduling

A fixed eight-level ladder, one integer per card.

```js
const LADDER_H = [4, 24, 72, 168, 336, 720, 2160, 4320]; // 4h,1d,3d,1w,2w,1mo,3mo,6mo
const next  = (lvl, ok) => ok ? Math.min(lvl + 1, 8) : Math.max(1, lvl - 2);
const dueAt = (lvl, now = Date.now()) => now + LADDER_H[lvl - 1] * 3600e3;
```

**A miss demotes two levels rather than resetting to one.** Chessable resets to
the bottom; this is softened deliberately for a child, and it is the one tunable
worth keeping.

**No ease factor.** SM-2's only real machinery over a ladder is per-card ease,
which produces "ease hell" (Anki's own term) and needs deck volume to earn its
keep. At the scale of one child's repertoire there is no review-budget pressure
for it to help, and integers serialize cleanly.

### Scheduling granularity is not delivery granularity

State lives per move, but a move cannot be quizzed alone — you have to play into
the position. So:

- **Only Felix's own moves are ever scheduled.** Opponent moves are never
  quizzed.
- To build a session, search the tree for a line containing due moves, auto-play
  the moves that are not due as context, and quiz only the ones that are.
- **Continue from the previous line where possible** — rewind a ply at a time
  looking for another due continuation before resetting the board. Fewer resets
  matters a lot for a child.
- Where several own moves are acceptable, carry the siblings and accept any.

## Persistence

**localStorage, one compact key**, with the due date as a day number rather than
an ISO string. Measured at about 2 KB for 150 cards.

**Export and import from day one**, as a JSON file: a Blob plus `<a download>`
to save, `<input type="file">` to restore. `showSaveFilePicker` is unsupported
in Safari, so the File System Access API is out.

Export exists for two reasons, and the second is the one that makes it a feature
rather than a chore: it is a backup, **and** it is how a repertoire Felix built
can be kept, moved to another device, or shown to somebody.

### The iOS problem, stated plainly

WebKit's tracking prevention policy deletes **all script-writeable storage after
7 days of Safari use without interaction with the site** — localStorage and
IndexedDB alike. "IndexedDB is safer on iOS" is folklore with no primary source,
so its async complexity buys nothing here.

Practising twice a week never trips it. A three-week holiday could, and it would
erase a child's practice history.

**The only documented defence is Add to Home Screen**, which is explicitly
exempt from the 7-day cap. That makes a PWA a *durability* feature, not a
convenience — which is a different argument from the one that deferred it.
Deferred for now, with export as the mitigation; recorded here so the reason is
already written down when it comes back.

**Not URL state**, despite the usual preference for it: a repertoire plus
progress exceeds the safe ~2,000-character cap, and gzip barely helps at this
size. The URL remains right for *sharing a repertoire* later; it is wrong for
carrying daily progress.

## Designing for a nine-year-old

Every one of these is a decision, not a nicety.

- **Depth: about 3 lines, 5 moves deep, 15–25 positions.** Consensus favours
  principles over memorization; ChessKid places its first opening lesson around
  position 14 of 173. Openings come late, and shallow is correct.
- **No streak.** Announced tangible rewards undermine intrinsic motivation more
  in children than adults, and gamification's measured effect decays from
  d=1.57 within an hour to **d=−0.20 over a year**. Unexpected rewards showed no
  undermining at all (d=0.01). So: a progress meter that only goes up, and
  surprise unlocks — never a streak that can be lost.
- **Feedback names the idea**, not just the verdict: "this develops toward the
  centre", not "correct".
- **Always allow a retry.** A wrong move is shown, explained, and tried again.
- **Board oriented to his side.**
- **No engine evaluation.** A −0.3 is meaningless and discouraging to a child.

Two things deliberately not built on: the spacing literature does not cleanly
support short-frequent sessions for the 6–10 band, and "attention span = age in
minutes" is unsupported. Session length is tested on the actual child, not
derived from a rule.

## German and English

A toggle between the two. Felix is learning chess in German, and chess notation
is language-specific — this is not only about button labels.

Three layers, deliberately separated because they carry different risks:

**1. Interface text.** Buttons, prompts, feedback. A flat key–value map per
language in `js/i18n/`, no library, no interpolation beyond simple placeholders.

**2. Piece letters in notation.** German uses `K D T L S B` — König, Dame, Turm,
Läufer, Springer, Bauer — so `Nf3` is `Sf3` and `Qd8` is `Dd8`. chess.js speaks
English SAN only, so this is a **display-time mapping**, applied when notation is
rendered.

> **The rule that must not be broken: stored data is always English SAN.** The
> repertoire, the export file and the position keys never see a German letter.
> A repertoire exported while set to German must import cleanly into English,
> and a shared file must not depend on the sender's language. Translation
> happens at the edge, on the way to the screen, and nowhere else.

This matters for Felix specifically: an app that taught him `N` for knight would
work against what his chess club teaches him.

**3. Opening names.** The CC0 catalogue is English-only. The ~12 starter
openings get hand-written German names and idea sentences — "Italienische
Partie", "Damengambit". Positions named from the full catalogue stay English,
which is an accepted asymmetry rather than an oversight: translating 3,810
opening names is not work this project will do.

Language is a per-user preference in localStorage, defaulting to the browser's
`navigator.language`. It is not in the URL — that would make a shared repertoire
link carry the sender's language, which is wrong.

**Checks:** notation renders as `Sf3` in German and `Nf3` in English for the
same move; a repertoire exported in one language imports in the other; and no
German letter ever reaches storage.

## Verification

Everything in sndlab's rules carries over: both engines, a screenshot looked at
by eye, and the build number bumped in every commit that changes shipped code.

Checks this project needs that sndlab has no analogue for:

1. **The repertoire data is legal.** Every line in the starter list replays
   through chess.js without an illegal move. A typo that teaches Felix a move
   that does not exist is the worst failure this app has, and it is cheap to
   make impossible.
2. **Variations survive parsing.** chess.js drops them silently; our parser must
   not, and a silent failure needs an explicit check.
3. **Transpositions merge.** Two move orders into the same position share a key.
4. **The phone.** Board square, squares at least 44px at 375px wide, no
   horizontal scroll.

### What the run cannot see

`touch-action` does not apply on desktop Safari, so the iOS defenses in
`board.css` — the long-press callout, rubber-band scrolling, touch-action itself
— are **structurally invisible to Playwright on both engines**. sndlab's issue
#5 is the precedent: green everywhere, broken on the actual phone.

A real device is the only proof, and `/accept-ticket` asks for it by name.

Neither can the run judge whether the app **teaches**. That is the acceptance
question, and unlike sndlab's "does it sound good" it cannot be answered in
thirty seconds by one person — it needs Felix to use the thing. The acceptance
loop is slower here by nature.

## Build order

Each step is usable before the next exists.

1. **The board** — tap-to-move, phone-sized. *Done: 16 checks green on both
   engines.*
2. **PGN with variations** — the parser and its tree, plus the legality check
   over the starter list.
3. **Explore** — the curated list, playable on the board, named from the
   catalogue. German and English land here, with the first UI text — retrofitting
   i18n after three modes exist is much worse than starting with it.
4. **Adopt** — repertoire in localStorage, with export and import.
5. **Drill** — the ladder, the session builder, the retry-and-explain loop.
6. **Then judge.** Watch Felix use it before building more. The PWA decision and
   the session-length question both wait for that.

## Decisions recorded as ADRs

- 0001 — No framework, no build step *(carried from sndlab, amended for
  vendoring)*
- 0002 — Vendoring third-party code, and `js/vendor/` as out-of-view
- 0003 — A hand-written board, tap-to-move only
- 0004 — Branch deploy *(carried from sndlab)*
- 0005 — Dev dependencies permitted; shipped code stays dependency-free
  *(carried)*
- 0006 — iOS is the target, and the verification gap it leaves
- 0007 — Positions, not nodes: the repertoire data model
- 0008 — localStorage plus export, and the 7-day rule
- 0009 — German and English, and why stored data stays English SAN

## Open questions

- **Which openings go in the starter list.** Twelve is the target. Boris picks;
  Felix should have a say, since he is the one choosing from it.
- **How the "idea" sentence gets written** for each opening — by hand, and by
  someone who plays. Twice over, once per language.
- **Session length and cadence** — deliberately untested until Felix has used it.
