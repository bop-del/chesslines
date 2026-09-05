# Move texts — sources

Where every sentence in `js/data/openings.js` comes from, so any claim can be
checked rather than taken on trust. Researched 2026-09-05 for the three
openings Explain ships with (ADR 0011).

**The rule this file exists to serve:** a wrong move text teaches a child
something false, authoritatively. Sourcing does not make a sentence *good* —
whether it works for a nine-year-old is a human judgement — but it makes every
factual claim in it checkable by somebody other than its author.

**Read this before editing a move text.** If you change what a sentence
asserts, change the entry here too, or the next reader has no way to tell
which claims were checked.

## What was deliberately not used

- **Chess forums.** Posts on chess.com forums came up repeatedly and are
  excluded as sources. They are useful for finding an argument, never for
  settling one.
- **Search-result snippets.** Where a page could not be fetched (several
  returned HTTP 403), its summary text was not quoted. A snippet is the search
  engine's paraphrase, not the page.
- **Unverifiable statistics.** A "46% amateur win rate" figure was found with
  no traceable provenance and dropped.

---

## Italian Game — C54

`1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4`

### The opening

- The bishop goes to c4, the "Italian bishop", where it attacks f7 — a pawn
  "protected only by the king". <https://en.wikipedia.org/wiki/Italian_Game>
- One of the oldest recorded openings, and "still frequently taught to
  beginners". <https://en.wikipedia.org/wiki/Italian_Game>
- Fights for the centre by the basic principles; leads to both quiet
  positional and sharp tactical games.
  <https://www.chess.com/openings/Italian-Game>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| e5 | Takes an equal share of the centre and is one of the few moves that directly interferes with White's plan of d4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5> |
| Nf3 | Develops, controls d4, attacks e5, and prepares to castle. | <https://en.wikipedia.org/wiki/Open_Game> |
| Nc6 | Defends e5 and controls d4 — it covers both squares at once. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3> |
| Bc4 | Controls d5 and pressures f7, "the most vulnerable pawn"; readies castling; plans c3 and d4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4> |
| Bc5 | Develops the bishop before the knight so the queen keeps control of g5 until Black can castle. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4/3...Bc5> |
| c3 | Adds a defender to d4 and prepares to occupy it with the d-pawn. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4/3...Bc5/4._c3> |
| Nf6 | Develops, attacks e4, and prepares castling. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4/3...Bc5/4._c3/4...Nf6> |
| d4 | Builds the e4+d4 pawn centre; Black must take or surrender the centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4/3...Bc5/4._c3/4...Nf6/5._d4> |

### Why c3 comes before d4 — the countable answer

Black controls d4 three times, White twice. Played immediately, 4. d4 simply
drops the pawn to `exd4`, `Bxd4` or `Nxd4`. `c3` is the move that flips the
count.
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bc4/3...Bc5>

This is the rare case where a plan has a reason a nine-year-old can check by
counting, so the move text says the count.

### Why f7 is weak

It is "protected only by the king".
<https://en.wikipedia.org/wiki/Italian_Game> — and castling is what fixes it,
since the rook then defends it.
<https://www.chesskid.com/learn/articles/the-weakest-square>

### Noted, not used

- **No source supports "Bc5 aims at f2."** The mirror-image idea is intuitive
  and the sources justify `Bc5` by g5-control and castling speed instead. The
  move text follows the sources, not the intuition.
- **5. d4 is the historical main line, not the modern one.** Top-level play
  now prefers 5. d3. This does not make d4 wrong — Wikipedia calls it the
  "classical plan" for "central domination" — and it is by far the clearer
  idea to explain. Recorded so the choice is known to be a choice.
  <https://en.wikipedia.org/wiki/Giuoco_Piano>

---

## Queen's Gambit Declined — D50

`1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5`

### The opening

- White offers a pawn to gain control of the centre; among the oldest openings
  still played. <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4>
- **Not a true gambit** — "the pawn is either regained, or can only be held
  unprofitably by Black."
  <https://en.wikipedia.org/wiki/Queen%27s_Gambit_Accepted>
- 1.d4 games are less forcing than 1.e4 games: more closed and positional.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4>
- Declining with `e6` builds a solid position; d5 and e6 give Black a foothold
  in the centre. <https://en.wikipedia.org/wiki/Queen%27s_Gambit_Declined>

### Per move

| Move | Claim | Source |
|---|---|---|
| d4 | Takes the centre; controls c5 and e5; opens a diagonal for the queen's bishop. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4> |
| d5 | Controls e4, denying White the ideal two-pawn centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5> |
| c4 | If Black takes, "their d-pawn is deflected from its duty controlling the centre" and White secures a bigger share of it. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5> |
| e6 | Bolsters d5 and frees the dark-squared bishop — but blocks the light-squared one, "a perennial challenge for Black". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6> |
| Nc3 | Develops, pressures d5, controls e4 for a future e4 break. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6/3._Nc3> |
| Nf6 | Develops, defends d5, and stops White playing e4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6/3._Nc3> |
| Bg5 | Pins the f6 knight against the queen. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6/3._Nc3/3...Nf6/4._Bg5> |

### The existing one-line idea is confirmed

`openings.js` said: *"Offer the c-pawn to pull Black's d-pawn away and own the
centre."* The source says the d-pawn is "deflected from its duty controlling
the centre". That is the same claim, and it stands.

### Bg5 — what the move text may and may not say

The pin **targets** the defender of d5. It does **not** win the pawn: the only
source connecting the pin to d5 is the page documenting the Elephant Trap,
where exactly that idea backfires (`4...Nbd7 5.cxd5 exd5 6.Nxd5?? Nxd5!`).
<https://en.wikipedia.org/wiki/Queen%27s_Gambit_Declined,_Elephant_Trap>

So the text says the bishop pins the knight that guards d5 — never that the
pawn is falling.

---

## Scandinavian Defense — B01

`1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6` — taught from **Black's** side.

### The opening

- "The general goal of the Scandinavian is to prevent White from controlling
  the center of the board with pawns, effectively forcing an open game."
  <https://en.wikipedia.org/wiki/Scandinavian_Defense>
- "2.exd5 is played in the overwhelming majority of games at all levels...
  arguably Black's most forcing defense to 1.e4."
  <https://en.wikipedia.org/wiki/Scandinavian_Defense>
- Practical for improving players: plans repeat, little forced theory.
  <https://chessdoctrine.com/chess-openings/kings-pawn/scandinavian-defense/>
- Not a novelty: recorded in 1475, and played by Larsen (beating Karpov),
  Anand and Carlsen. <https://en.wikipedia.org/wiki/Scandinavian_Defense>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| d5 | Challenges White's centre pawn immediately, on move one. | <https://en.wikipedia.org/wiki/Scandinavian_Defense> |
| exd5 | Almost always played; the only move offering White real prospects. | <https://en.wikipedia.org/wiki/Scandinavian_Defense> |
| Qxd5 | Wins the pawn straight back, "at the cost of a tempo". | <https://en.wikipedia.org/wiki/Scandinavian_Defense> |
| Nc3 | Develops a piece *with tempo* by attacking the queen. | <https://simplifychess.com/scandinavian-defense/index.html> |
| Qa5 | The main line; an active square — the queen will pin the c3 knight once White plays d4. | <https://simplifychess.com/scandinavian-defense/index.html> |
| d4 | Takes the centre — and opens the diagonal that activates Black's pin. | <https://simplifychess.com/scandinavian-defense/index.html> |
| Nf6 | Develops, covers d5, and prepares the standard structure. | <https://www.chessigma.com/openings/scandinavian-defense> |

### The queen-out-early problem

Felix is likely taught at his club not to bring the queen out early. This
opening appears to break that rule, and the app must not gloss over it.

- Chess.com states it plainly: the line "breaks the rule, often taught to
  players just starting out, of not developing the queen too early", and Black
  "loses time recapturing".
  <https://www.chess.com/openings/Scandinavian-Defense>
- Wikipedia states the trade: "Black hopes for a free game with easy
  development, but at the cost of a tempo."
  <https://en.wikipedia.org/wiki/Scandinavian_Defense>

The move text names the cost rather than hiding it. **A forum argument that
the tempo count is really even was found and is deliberately excluded** — it
is a disagreement between anonymous posters, and the two authoritative sources
agree with each other.

### The existing one-line idea was overstated, and is changed

`openings.js` said: *"easy to learn, and it looks the same every game."*

- **Supportable:** few forced lines to memorise, plans repeat, and Black
  almost always reaches the intended setup.
- **Not supportable:** that the *game* looks the same. Wikipedia lists four
  serious White fourth moves after `3...Qa5` plus the `4.b4` gambit, and notes
  "both players have the option of castling on either side of the board" —
  the opposite of a position that plays itself. Chess.com adds that Black "is
  in danger of a quick knockout".
  <https://en.wikipedia.org/wiki/Scandinavian_Defense>

Changed to a claim about the **setup** rather than the game.

### Noted for a later line

`...c6` is described as critical — it gives the queen a retreat, and
forgetting it "often leads to losing the queen to a fork".
<https://kingdomofchess.com/scandinavian-defense/> It falls just outside the
eight half-moves shipped here; worth a text if the line is ever extended.

---

## Source quality, honestly

**Strongest:** Wikipedia and Wikibooks, which carry per-move reasoning and
cite named authors (Emms, *The Scandinavian*, 2004, throughout the Wikipedia
article).

**Adequate, and used only where they agree with each other:**
simplifychess.com, chessigma.com, chessdoctrine.com, kingdomofchess.com.
These are opening-guide sites without named authorities. Every claim taken
from them appears in at least two of them independently — the pin on c3 after
d4 is the main example.

**Could not be read (HTTP 403):** chessable.com, thechessworld.com,
365chess.com. **Lichess opening pages** carry no descriptions for these lines,
and its explorer API needs auth — so no independent move-frequency figures
were obtained.
