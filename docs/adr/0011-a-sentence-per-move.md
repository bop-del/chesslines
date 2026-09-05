# ADR 0011 — A sentence per move, and shipping three openings to find out

**Status:** accepted
**Date:** 2026-09-05

## Context

The design spec ruled out, in Scope:

> teaching the *plans* behind an opening beyond a single line of prose per
> opening — that is a much larger project and would change what this is.

The Explore mode built on that: a list, a name, one sentence, tap through the
moves. The Explain mode replaces it with a sentence **per move**, which is
exactly what that line excluded.

## Decision

**One sentence per move**, at the depth the spec already fixed — about five
moves per opening, not deeper.

**Ship with three openings, not twelve.** The remaining nine stay visible in
the list but inert until their texts exist.

**The texts are written by Claude, reviewed by Boris, and sourced.** Web
research backs each claim and the sources are recorded in `docs/research/` with
links.

## Rationale

**A name is an index entry, not an explanation.** A list that gives "Italian
Game" and one sentence teaches a nine-year-old what the opening is *called*.
The idea lives in the moves — "the bishop points at f7" is inert prose until
you watch the bishop arrive there. Stopping at the name teaches the index
rather than the book.

**The old scope was right about the cost, and the cost is real.** Twelve
openings at 96 half-moves in two languages is 192 move sentences plus 24
intros — **216 texts**, against 24 for one sentence per opening. That is
a different project, and this ADR does not pretend otherwise.

**Three openings is the whole point, not a compromise.** Whether a sentence per
move actually helps Felix cannot be settled at a desk. Writing 216 texts before
finding out is the expensive way to be wrong; writing 54 and watching him use
them is the cheap way to find out. The parent spec already says the acceptance
loop here needs the actual child.

**Depth does not move.** The spec's "about 3 lines, 5 moves deep, 15–25
positions" is untouched. Explain says *more about the same moves* — it does not
go deeper, and going deeper would be a new decision.

**Sourcing substitutes for authorship, and only partly.** The spec reserved
these sentences for "someone who plays". Replacing that with a citation is a
real trade: a sourced sentence can be checked by anyone, where a hand-written
one rests on the author's memory. But a source establishes that *Bc4 aims at
f7*; it cannot establish that the sentence works **for a nine-year-old**. That
judgement stays with Boris on review and is not researchable.

## Consequences

**Positive:** The mode teaches rather than lists. Every claim is traceable to a
source in `docs/research/`.

**Positive:** Three openings is a week of writing, not a month, and the shape
gets tested before the bulk of the work.

**Negative:** Nine of twelve openings are visible but not usable at launch. A
list with inert entries needs to explain itself, which is a UI problem this
mode now owns.

**Negative:** `moves` duplicates the move sequence already in `pgn`. The
mitigation is a check that they agree move for move — without it, a drifted
array attaches the bishop's sentence to the knight's move, which is wrong,
silent, and authoritative to a child. That is the same failure class the
legality tests exist for.

**Negative:** The scope line has now moved once. It is recorded here so the
next request to move it further argues against a written decision rather than
against nothing.

## Alternatives considered

**Keep Explore, add Explain beside it.** Two modes over the same data, and for
a nine-year-old one choice too many. Rejected: if a sentence per move is
better, it should replace the weaker mode rather than sit next to it.

**All twelve openings at launch.** The honest full version, and the one that
risks 216 texts on an untested assumption.

**Texts as PGN comments** (`1. e4 {takes the centre}`). Standard PGN, and the
parser already skips comments. Rejected: two languages do not fit one comment,
and the line becomes unreadable.
