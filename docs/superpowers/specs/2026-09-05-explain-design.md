# Explain — design

**Date:** 2026-09-05
**Status:** approved, unimplemented
**Amends:** `2026-09-05-chesslines-design.md` (Scope, §Explore, Build order)

## What this is

The third mode, and the first one Felix meets. He picks an opening, reads two
or three sentences on what it is for, and then walks the line **one move at a
time** — playing each move himself on the board, with a sentence per move
saying what that move achieves.

It replaces **Explore**. There is no separate browse-only mode.

## Why this changes an approved decision

The parent spec lists as out of scope:

> teaching the *plans* behind an opening beyond a single line of prose per
> opening — that is a much larger project and would change what this is.

This spec deliberately reverses that, and the reversal needs stating plainly
because the original reasoning was sound.

**What the old scope got right:** the cost. Twelve openings at 96 half-moves,
in two languages, is 192 move sentences, and 24 intros on top — **216 texts**.
That is a different project from "a dozen openings with one sentence each" (24
sentences), and pretending otherwise would be dishonest.

**Why it changes anyway:** a list you click through teaches a nine-year-old the
*names* of openings. It does not teach him why anyone plays them. The move is
where the idea actually lives — "the bishop points at f7" means nothing until
you watch the bishop arrive there. A mode that stops at the name is teaching
the index rather than the book.

**What keeps the cost honest:** the depth stays exactly where the parent spec
put it — about five moves, three lines, 15–25 positions. Explain does not go
deeper than Explore would have; it says more about the same moves. And it
**ships with three openings, not twelve** (see Scope below), so the idea is
tested on the actual child before the remaining sentences are written.

## Scope

**In:** picking an opening; a short intro; walking the line move by move, either
by playing the moves or by watching them; a sentence per move; German and
English throughout.

**Out:** scoring, progress, adoption into a repertoire (that is Adopt), engine
evaluation, free play off the line, and any explanation longer than a sentence
per move.

**Ships with three openings** — Italian Game, Queen's Gambit, Scandinavian
Defense. Two for White, one for Black; all three have ideas that survive
compression into one sentence per move. The other nine stay visible in the list
but are not yet selectable, because an opening without its move texts is not
what this mode is.

That is **54 texts to write** (24 half-moves × 2 languages, plus 3 intros × 2),
against 216 for the full twelve. The point of the smaller number is not effort
saved but **feedback earned**: whether a sentence per move actually helps Felix
is not knowable from a desk, and writing 216 texts before finding out is the
expensive way to be wrong.

## The flow

1. **A list of openings.** Name and the one-line `idea`, grouped by side.
   Openings without move texts are shown but inert.
2. **Intro.** Two or three sentences: what the opening is for, what it feels
   like to play. Then the board, with the opening's side at the bottom.
3. **Move by move.** The board waits for the next move of the line. Felix plays
   it. The move's sentence appears. Repeat to the end of the line.
4. **Or watch instead.** A *show me* control plays the line automatically, and
   can be stopped at any point — after which he continues playing it himself.

There is no mode switch. Playing is the default; watching is a control that is
always available and never required.

### A move that is not the line's move

The board **refuses it** — the piece does not move. A short line names the move
the opening plays instead, and the board shows it.

This is deliberate and it is not a drill. There is no wrong answer being
recorded, no retry counter, nothing to lose. The parent spec's rule that
feedback names the idea rather than the verdict applies: *"the Italian plays
Bc4 here, pointing at f7"*, never *"wrong"*.

**Why refuse rather than allow and rename.** Letting him wander and naming the
resulting position from the CC0 catalogue is the more impressive behaviour, and
it is wrong for this mode: the moment he leaves the line, every prepared
sentence stops applying and the mode has nothing left to say. The catalogue's
naming job belongs where a position is genuinely arrived at freely — not here.

## Data

`js/data/openings.js` keeps its shape and gains two fields per opening:

```js
{
    id: 'italian-game',
    eco: 'C50',
    name:  { en: 'Italian Game', de: 'Italienische Partie' },
    idea:  { en: '…', de: '…' },        // unchanged — one line, for the list
    intro: { en: '…', de: '…' },        // new — two or three sentences
    side: 'w',
    pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 …',
    moves: [                             // new — one entry per half-move
        { san: 'e4', en: '…', de: '…' },
        { san: 'e5', en: '…', de: '…' },
        …
    ],
}
```

**`pgn` remains the single source of truth.** `moves` is description hanging off
it, never a second definition of the line. Legality is still proved by parsing
`pgn`; nothing in `moves` is trusted for anything but text.

**A check enforces that they agree**: the SAN sequence in `moves` must equal the
main line parsed from `pgn`, move for move. Without it the two drift, and a
drifted `moves` array attaches the bishop's sentence to the knight's move —
wrong, silent, and authoritative to a child. This is the same failure mode the
legality tests exist for, so it gets the same treatment.

An opening with no `moves` array is valid data; it is a list entry that is not
yet selectable.

### Where the file lives

One file, as now. At twelve openings fully written this is about 390 lines
against the 500-line rule — close, but under. When it does cross, the split to
`js/data/lines/` is mechanical: the per-opening structure is already the unit,
so splitting moves objects between files without reshaping any of them. Doing
it now would cost three steps per new opening (write, import, register) to buy
nothing today.

## The texts, and how they are checked

The sentences are **written by Claude and reviewed by Boris**, with web research
behind them. Sources are recorded in `docs/research/` with links, so any claim
can be traced to where it came from.

This is a change from the parent spec's "by hand, by someone who plays". The
substitution is sourcing for authorship: a sentence with a citation can be
checked by anyone, where a hand-written one rests on the author's memory.

**What sourcing cannot do, stated so nobody assumes otherwise:** a source
establishes that *Bc4 aims at f7*. It cannot establish that the sentence works
**for a nine-year-old**. That judgement is Boris's on review and cannot be
researched away — it is the same judgement the parent spec reserves for a human
throughout.

Every sentence names a **plan, not an evaluation**. "+0.3" means nothing to a
child; "now the bishop watches f7" is something he can act on. This rule is
already written at the top of `openings.js` and applies unchanged.

## Components

| Unit | Job | Depends on |
|---|---|---|
| `js/data/openings.js` | The starter list, now with intros and per-move texts. | — |
| `js/ui/list.js` | The opening list; inert entries for openings without texts. | openings, i18n |
| `js/ui/explain.js` | The walk: expects a move, accepts or refuses it, shows the text, drives *show me*. | openings, pgn, Board, i18n |
| `js/i18n/*` | UI strings, and English SAN → German letters at display time. | — |

`js/data/pgn.js`, `js/data/position.js`, `js/data/catalogue.js` and
`js/board/Board.js` are used as they are. The board already reports move intent
without mutating state, which is exactly what refusing a move requires.

## German and English

Unchanged from ADR 0009, and this mode is where it lands first: interface text
from a flat map per language, piece letters mapped at display time, and
**stored data always English SAN**. Move texts are UI text — they are never
stored and never exported, so they add no new risk to that rule.

The catalogue stays English-only. It is not consulted in this mode.

## Verification

- **Unit:** every `moves` array matches its `pgn` main line, move for move;
  every opening with `moves` has both languages for every entry; openings
  without `moves` are well-formed.
- **Browser, both engines:** picking an opening shows its intro; playing the
  line's move advances and shows that move's text; playing a different move
  advances nothing; *show me* runs the line and can be stopped; the German
  toggle renders `Sf3` where English renders `Nf3`.
- **Screenshot:** phone-sized, showing board and move text together — the
  layout question this mode actually has is whether both fit on a phone.

**What the run cannot judge:** whether the sentences teach. That needs Felix.
The parent spec already says the acceptance loop is slower here by nature, and
this mode is where that bites hardest.

## What this does not build

- No adoption, no repertoire, no progress — that is Adopt.
- No free play off the line, and no catalogue naming.
- No audio, no animation beyond what *show me* needs.
- No explanation beyond one sentence per move. The parent spec's warning that
  this becomes a much larger project still stands; the line has moved once,
  deliberately, and not again.

## Open questions

- **Which three openings.** Italian, Queen's Gambit and Scandinavian are the
  proposal. Felix should have a say — he is the one choosing from the list.
- **Whether a sentence per move is the right grain.** The reason for shipping
  three openings rather than twelve is to find this out cheaply.
