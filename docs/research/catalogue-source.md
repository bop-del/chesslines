# The opening catalogue

`js/data/catalogue-map.js` is generated from
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings),
vendored under `scripts/lib/tsv/`.

**Licence: CC0 1.0**, verbatim from the source repo's README:

> As a collection of facts, this data set is in the public domain.
> Considerable effort was spent curating and cleaning the data. Insofar as that
> qualifies for copyright, the work is released under the CC0 Public Domain
> Dedication.

No attribution is required; it is credited anyway, in the page footer and here.

**ECO caveat:** "ECO code is a registered trademark of Chess Informant." That is
a trademark on the name, not copyright on the codes as facts.

## Regenerating

```
node scripts/build-catalogue.mjs
```

Author time only — never at runtime. The TSVs are 388 KB; parsing them in the
browser would be a build step in all but name.

Expect `3810 rows, 0 failed, 3810 positions`. **A non-zero failure count means
stop and investigate** — every line replays cleanly today, so a failure means
either the source data or the engine has changed under us.

## Size

457 KB raw, **61 KB gzipped**, and GitHub Pages does serve gzip (verified:
`content-encoding: gzip`). It is the largest shipped file, so it is the first
thing to revisit if load time on a phone ever becomes a complaint. Options at
that point: split by ECO letter and load on demand, or trim to the openings a
beginner will actually reach.

## Why keyed by position

Naive move-sequence lookup mis-names transpositions. The Queen's Gambit Declined
reached via `1.d4 Nf6` returns "Indian Defense: Normal Variation", where the
position-keyed map returns `D35 Queen's Gambit Declined: Normal Defense` for
both move orders.

The key is the first four FEN fields (`js/data/position.js`), so it is the same
key the repertoire and the progress record use.

## Reading a code off the data, not from memory

An ECO code names a *position*, so a line that starts differently carries a
different code. Two of the twelve starter openings were wrong when written from
memory:

- `1. d4 d5 2. Bf4` is the **Accelerated** London System, D00 — not the London
  System. The standard move order puts the knight first: `1. d4 d5 2. Nf3 Nf6
  3. Bf4`, which is D02.
- The King's Indian line `1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6` is **E70**,
  not E60 or E61.

Look a line up before changing its code:

```sh
awk -F'\t' '$3=="1. d4 d5 2. Nf3 Nf6 3. Bf4" {print $1"\t"$2}' scripts/lib/tsv/*.tsv
```
