# ADR 0009 — German and English, and why stored data stays English SAN

**Status:** accepted
**Date:** 2026-09-05

## Context

Felix is learning chess in German, at a chess club, in German notation. Chess
notation is language-specific: German uses `K D T L S B` — König, Dame, Turm,
Läufer, Springer, Bauer — so `Nf3` is `Sf3` and `Qd8` is `Dd8`.

This is not only about button labels. An app that taught him `N` for knight
would work directly against what his club teaches him.

chess.js (ADR 0002) speaks English SAN only.

## Decision

A toggle between German and English, in **three deliberately separated layers**:

1. **Interface text** — a flat key–value map per language in `js/i18n/`. No
   library, no interpolation beyond simple placeholders.
2. **Piece letters in notation** — a **display-time mapping**, applied when
   notation is rendered and nowhere else.
3. **Opening names** — the ~12 starter openings carry hand-written German names
   and idea sentences. Positions named from the full CC0 catalogue stay English.

> **The rule that must not be broken: stored data is always English SAN.** The
> repertoire, the export file and the position keys never see a German letter.

Language is a per-user preference in localStorage, defaulting to
`navigator.language`. **It is not in the URL.**

This lands with **Explore**, the first mode with UI text — not retrofitted after
three modes exist.

## Rationale

**Translation at the edge is the only rule that survives contact with export.**
A repertoire exported while set to German must import cleanly into English, and
a shared file must not depend on the sender's language. The moment a German
letter reaches storage, every consumer of that data needs to know which language
wrote it — including a future version of this app, and including chess.js, which
would reject `Sf3` outright.

**The position key is English SAN by construction** (ADR 0007), so keeping
storage English keeps one representation rather than two.

**Language is not in the URL** because a shared repertoire link would then carry
the *sender's* language, which is wrong: the recipient should see their own.

**Opening names are an accepted asymmetry, not an oversight.** Hand-translating
twelve starter openings is a morning's work; translating 3,810 catalogue entries
is not work this project will do. The starter list is what Felix meets; the
catalogue only names positions he wanders into.

**Doing this now is cheaper than doing it later** by a large margin.
Retrofitting i18n means touching every string in every mode, and the strings
that get missed are the ones on rare paths — error messages, edge-case feedback.

## Consequences

**Positive:** Felix sees `Sf3`, matching his club. Exports stay portable.

**Positive:** Adding a third language is a new map plus a letter table.

**Negative:** Every rendered move must pass through the mapping. A missed path
shows English notation in a German UI — a visible bug, caught by the check
below.

**Negative:** The starter list carries two names and two idea sentences per
opening, both hand-written by someone who plays. That is real editorial work and
it gates Explore.

**Negative:** Mixed languages on screen when a catalogue-named position appears
in a German UI. Accepted, per the asymmetry above.

## Checks

- The same move renders as `Sf3` in German and `Nf3` in English.
- A repertoire exported in one language imports in the other.
- **No German letter ever reaches storage.**
