# Move texts — sources

Where every sentence in `js/data/openings.js` comes from, so any claim can be
checked rather than taken on trust. Researched 2026-09-05 for the three
openings Explain shipped with (ADR 0011), and 2026-09-06 for the remaining
nine (#12).

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

---
---

# The remaining nine — researched 2026-09-06 (#12)

Same standard as above. Three background research agents read the sources; each
line was researched as the **exact variation shipped**, not the opening in
general, because a code names a position.

**Two claims were checked on the board as well as in the sources**, using the
repo's own vendored chess.js. Where a source and the position disagreed, the
position won. Both are recorded under the lines they belong to.

## What this round deliberately did not use

- **Chess forums**, again — they dominated the search results for the London's
  `4...Bd6` and were excluded wholesale.
- **A scoring figure for the Sicilian.** The widely repeated *New in Chess 2000
  Yearbook* percentages are attributed to Wikipedia, but a direct fetch of that
  article returned no such statistics. "Most popular" is sourced;
  **"highest-scoring" is not, and is not claimed.**
- **The general rule "attack a pawn chain at its base."** Wikipedia's `Pawn
  chain` and `Pawn structure` articles do not state it. The *specific* claim —
  that `...c5` hits White's chain at its base in the French — is sourced twice,
  and that is what the move text says. The general rule is chess folklore here,
  not a checked claim.

---

## Ruy Lopez — C78

`1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O` — taught from **White's** side.

### The opening

- Named after the 16th-century Spanish priest Ruy López de Segura.
  <https://en.wikipedia.org/wiki/Ruy_Lopez>
- "The most extensively developed" of all the Open Games.
  <https://en.wikipedia.org/wiki/Ruy_Lopez>
- The bishop on b5 is the "Spanish bishop". <https://en.wikipedia.org/wiki/Ruy_Lopez>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| e5 | Takes an equal share of the centre and interferes with White's plan of d4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5> |
| Nf3 | Attacks e5, prepares kingside castling, supports a later d2–d4. | <https://en.wikipedia.org/wiki/Open_Game> |
| Nc6 | Defends e5 and controls d4 — it covers both squares at once. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3> |
| Bb5 | Attacks the knight that defends e5, so the threat on the pawn is *indirect*. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5> |
| a6 | The Morphy Defence. "Puts the question" to the bishop: take, retreat, but do not stay. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5/3...a6> |
| Ba4 | Retreats but keeps the bishop on the same diagonal, maintaining the pressure. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5/3...a6/4._Ba4> |
| Nf6 | "Develops a knight and threatens White's e-pawn." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5/3...a6/4._Ba4/4...Nf6> |
| O-O | "The main line is to leave it hanging and castle"; prepares Re1 to defend e4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5/3...a6/4._Ba4/4...Nf6/5._O-O> |

### "Bb5 wins the e5 pawn" is false, and the move text says so

The beginner's version of this opening is that `Bb5` threatens to win e5. It
does not, and both a source and the board agree.

Wikibooks states it exactly: White "**indirectly** threatens to win the pawn,
though **it's not an *immediate* threat** because of a tactical trick where
Black can win the pawn back."
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5>

The trick is `4. Bxc6 dxc6 5. Nxe5 Qd4!`, "forking the knight and e-pawn and
regaining the material with a good position".
<https://en.wikipedia.org/wiki/Ruy_Lopez>

**Checked on the board**, because this is the kind of claim that must not be
taken on trust: playing `Bxc6 dxc6 Nxe5` into the repo's own chess.js leaves
Black with `Qd4` and `Qg5` available. The refutation is real.

So the move text names the **target** — the defender of e5 — and states the
`Qd4` resource outright rather than promising a pawn. This is the same rule the
Queen's Gambit `Bg5` entry already follows: name the pin, never the win.

### What has been achieved after 5. O-O

- White is castled and the e-pawn is deliberately left hanging; long-term "the
  pawn is not really at risk", with Re1 coming.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._Bb5/3...a6/4._Ba4/4...Nf6>
- The position is the junction from which Black chooses the Closed, Open or
  Arkhangelsk. <https://en.wikipedia.org/wiki/Ruy_Lopez>

### Noted, not used

- **"Spanish Torture"** is sourced <https://www.chess.com/openings/Ruy-Lopez-Opening>
  but is a poor thing to tell a child about an opening he is being asked to enjoy.
- **No source names the bare position after 5. O-O.** The catalogue calls the
  line "Ruy Lopez: Morphy Defense", which attaches to the `3...a6` complex. The
  closing sentence therefore does not lean on a position name.

---

## Scotch Game — C45

`1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5` — taught from **White's** side.

### The opening

- Named after an 1824 correspondence match between Edinburgh and London; first
  documented by Ercole del Rio in 1750. <https://en.wikipedia.org/wiki/Scotch_Game>
- "White strikes on the center immediately... White virtually guarantees a space
  advantage." <https://www.chess.com/openings/Scotch-Game>
- Lets White "avoid the heavy theory of the Ruy Lopez, which is especially
  advantageous for beginners." <https://www.chess.com/openings/Scotch-Game>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| e5 | Takes an equal share of the centre and interferes with White's plan of d4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5> |
| Nf3 | Attacks e5, prepares castling, supports a later d2–d4. | <https://en.wikipedia.org/wiki/Open_Game> |
| Nc6 | Defends e5 and controls d4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3> |
| d4 | "With this aggressive pawn advance, White looks to open up the centre." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4> |
| exd4 | "Played almost every time... leads to a very open game, with a lot of space for both players." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4> |
| Nxd4 | "White centralises their knight, supported by their queen." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4/3...exd4> |
| Bc5 | "Attacks White's central knight and puts indirect pressure on the f2 square." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4/3...exd4/4._Nxd4/4...Bc5> |

### What has been achieved after 4...Bc5

The line ends on a **Black** move, so the closing sentence describes a question
posed, not a triumph. The knight on d4 is "initially defended only by the
queen" <https://en.wikipedia.org/wiki/Scotch_Game>, and `Bc5` forces White "to
invest a tempo to either protect the knight or add another defender to it."
<https://www.chess.com/openings/Scotch-Game>

The position **is** named — Classical Variation — so the ending may use it.

### Noted, not used

- **`4...Nf6` (Schmidt) is described as the most common reply, not `4...Bc5`.**
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nf3/2...Nc6/3._d4/3...exd4/4._Nxd4>
  The shipped line therefore teaches the Classical rather than the commonest
  branch. Recorded so the choice is known to be a choice — the same treatment
  the Italian's `5. d4` gets above.

---

## Vienna Game — C27 (Frankenstein–Dracula)

`1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5` — taught from **White's** side.

### The old idea sentence described a different opening, and was replaced

`openings.js` said: *"Develop the queenside knight first and keep the f-pawn
free to advance."*

That is a fair description of the **quiet Vienna**, where White follows with
`f4`. It is not a description of this line, and the contradiction is sourced:
`3. Bc4` is the Stanley Variation, in which "**White restrains themselves from
the committal f4** and places another piece where it controls d5."
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6>

So the sentence named a plan the shipped moves decline on move three. It now
reads: *"Let Black grab the e-pawn, then come after the king with the queen."*
The gambit framing is supported — Wikibooks concludes that White's third move
"was actually a gambit".
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4/3...Nxe4>

### The opening

- Named by Tim Harding in his 1976 Vienna Game book: the play was so aggressive
  that "a game between Dracula and the Frankenstein Monster would not seem out
  of place." <https://en.wikipedia.org/wiki/Frankenstein%E2%80%93Dracula_Variation>
- Wikibooks calls `4. Qh5` "one of the sharpest of all chess variations".
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4/3...Nxe4>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| e5 | Takes an equal share of the centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5> |
| Nc3 | Develops toward the centre and guards e4. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3> |
| Nf6 | "Black attacks e4 and contests d5." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6> |
| Bc4 | The Stanley Variation: White declines `f4` and "has nailed down Black's d-pawn by controlling d5 with three pieces." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4> |
| Nxe4 | Black "has eliminated two of the attackers of d5 with one stroke". Endorsed by Alekhine. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4> |
| Qh5 | "The more active response to the loss of the pawn is 4. Qh5!" It threatens `Qxf7#` and hits e5 at the same time. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4/3...Nxe4> · <https://en.wikipedia.org/wiki/Frankenstein%E2%80%93Dracula_Variation> |

### What has been achieved after 4. Qh5 — no name to lean on

**Confirmed unnamed.** Wikipedia names the *variation*, which begins at
`3...Nxe4`, not the post-`Qh5` position; the chess.com page for the variation
was fetched and is a navigation shell with no prose. The catalogue's longest
matching entry likewise stops at `3...Nxe4`.

What is sourced instead:

- The immediate threat is mate on f7.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._Nc3/2...Nf6/3._Bc4/3...Nxe4/4._Qh5>
- It is a **double** attack, on f7 *and* e5 — `4...Nd6` is "the only good
  response to White's dual threats against f7 and e5".
  <https://en.wikipedia.org/wiki/Frankenstein%E2%80%93Dracula_Variation>

**Checked on the board.** In the repo's own chess.js, Black has 32 legal replies
after `4. Qh5`; the natural-looking `4...Nf6??` is answered by `Qxf7#`, and
`4...Nd6`, `4...Ng5` and `4...d5` all still allow `Qxf7+`. The ending sentence
rests on this rather than on a name.

### Is it sound? What the sources actually say

Reported straight, because the line's reputation runs ahead of it:

- "involves many complications, but **with accurate play is viable for both
  sides**"; whether Black has enough compensation "remains a matter of opinion."
  <https://en.wikipedia.org/wiki/Frankenstein%E2%80%93Dracula_Variation>
- Ulf Andersson recommended `5. Qxe5+` for White. Same URL.
- But it is "rarely seen in top-level play". Same URL.
- Wikibooks marks `4. Qh5` with "!" — an endorsement, not a dubious mark.

**No source read calls `4. Qh5` unsound.** The nearby *bad* fourth moves are
clearly marked as such: `4. Bxf7+` "is considered weak"
<https://en.wikipedia.org/wiki/Vienna_Game>, and `4. Nxe4` "permits the fork
4...d5". Same URL.

### The gap, reported rather than filled

**No source read reconciles `4. Qh5` with the standard "do not bring the queen
out early" advice**, which Felix is likely taught at his club. The move text
names the tension in its own words — the same treatment the Scandinavian entry
gives the identical problem — but it is not resting that sentence on a citation,
because none was found.

---

## King's Gambit — C39

`1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4` — taught from **White's** side.

### The opening

- White "offers a pawn to divert Black's e-pawn from the center", gains the
  f-file and strengthens d4. <https://en.wikipedia.org/wiki/King%27s_Gambit>
- **The cost is in the same breath:** "By moving the f-pawn so early, before
  they have castled, White has greatly weakened their kingside and exposed their
  king to danger."
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| e5 | Takes an equal share of the centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5> |
| f4 | Offers a pawn to divert the e-pawn from d4, opens the f-file for the rook after castling — and weakens White's own king. | <https://en.wikipedia.org/wiki/King%27s_Gambit> · <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4> |
| exf4 | Black takes, and now threatens `...Qh4+`, which White "couldn't successfully block ... with the g-pawn thanks to the Black pawn on f4". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4/2...exf4> |
| Nf3 | "Develops a knight and controls the h4 square. This is important to prevent Black from playing Qh4+." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4/2...exf4/3._Nf3> |
| g5 | Defends the extra pawn; left alone Black adds `...h6` and `...Bg7` and "turn[s] the f4-pawn into a fortress." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4/2...exf4/3._Nf3/3...g5> |
| h4 | "Immediately undermine[s] Black's attempts to set up a pawn chain"; attacks g5 twice while it is defended once, and "practically forces 4...g4". | <https://en.wikipedia.org/wiki/King%27s_Gambit> · <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4/2...exf4/3._Nf3/3...g5/4._h4> |

### The `Qh4+` claim is stated in the right direction

**Checked on the board**, because the usual shorthand ("Nf3 stops Qh4+") invites
the wrong reading. After `2...exf4` it is **Black** to move, so `Qh4+` is never
White's option: in the repo's chess.js, Black has no `Qh4` available before
`3. Nf3` is played (the queen's path is blocked), and `Qh4+` appears in
**Black's** legal-move list once the game continues. The move text therefore
says the knight covers h4 so that *Black's* check cannot come — not that White
is prevented from anything.

### The modern reputation — do not oversell it

This is the one shipped line whose status is genuinely contested:

- Tarrasch called it "a decisive mistake [that] it is almost madness to play";
  Fischer published a line he argued "loses by force".
  <https://en.wikipedia.org/wiki/King%27s_Gambit> ·
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4>
- It is now "very rare at the highest levels".
  <https://en.wikipedia.org/wiki/King%27s_Gambit>
- **But not where Felix plays:** "the opening has never lost its popularity
  among chess club-level players". Same URL. It remains "playable as a surprise
  weapon in faster time controls and popular in amateur games".
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e5/2._f4>

Supportable: exciting, old, still played by club players, and White is knowingly
taking a risk with his own king. **Not supportable:** that it is objectively
good, or that it is refuted. The intro says the honest version.

### Noted, not used

- **"Allgaier/Kieseritzky territory" is one move early.** Both names attach at
  move five (`5. Ng5` / `5. Ne5`), after `4...g4`. The text says those lines are
  coming, not that they have arrived.

---

## London System — D02

`1. d4 d5 2. Nf3 Nf6 3. Bf4 e6 4. e3 Bd6` — taught from **White's** side.

### The opening

- The standard order is knight before bishop; the full setup is "d4, Nf3, Bf4,
  e3, Bd3, Nbd2, c3". <https://en.wikipedia.org/wiki/London_System>
- **The repo's code comment is confirmed:** the accelerated variant "plays 2.Bf4
  immediately" and is "Accelerated insofar as White has played Bf4 before Nf3".
  <https://en.wikipedia.org/wiki/London_System> ·
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._Bf4>
- The appeal: "White can play the same basic setup for almost all of Black's
  responses. For this reason, the theory on the London is not as extensive as it
  is for other openings." <https://www.chess.com/openings/London-System>

### Per move

| Move | Claim | Source |
|---|---|---|
| d4 | Takes the centre; controls c5 and e5; opens a diagonal for the queen's bishop. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4> |
| d5 | "Controls the e4 square, so preventing White from securing an ideal two-pawn centre". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5> |
| Nf3 | "A flexible developing move." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._Nf3> |
| Nf6 | The most common reply, "due to its flexibility". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._Nf3> |
| Bf4 | The bishop develops **outside the pawn chain** so that e3 can follow. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._Bf4> |
| e6 | Supports d5 and frees the dark-squared bishop — but shuts in the light-squared one, "a perennial challenge for Black". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._c4/2...e6> |
| e3 | "Now that they have developed their bishop, they can play e3 without trapping it behind the pawn chain." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._Nf3/2...Nf6/3._Bf4> |
| Bd6 | Black's `...e6`/`...Bd6` formation "directly challenges White's ... bishop on f4". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._Bf4> |

### Why the bishop comes out before e3 — the one mechanical idea

Sourced twice, nearly verbatim:

> "Now that they have developed their bishop, they can play e3 without trapping
> it behind the pawn chain."
> <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._Nf3/2...Nf6/3._Bf4>

> "White develops their dark-squared bishop, so that they may play e3 to support
> the d4 pawn without leaving the bishop stuck behind the pawn chain."
> <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._Bf4>

**The link to the "problem bishop" must be stated carefully.** No source read
uses that phrase about the *Queen's Gambit*, or about White's c1-bishop. What is
sourced is that Black's own `...e6` hems its light-squared bishop in — the same
trap, one move later, on the other side of the board. The move text says that,
and the `e6` text says it from Black's side. It does not say "the problem bishop
of the Queen's Gambit", which would be unsourced.

### What has been achieved after 4...Bd6 — no name to lean on

**Confirmed unnamed by the catalogue:** `scripts/lib/tsv/d.tsv` has London
entries at `3. Bf4` and then jumps to the `3...c5 4. e3` branch; the only
`3. Bf4 e6` row is `D01 Rapport-Jobava System`, a different move order via
`2. Nc3`.

So the ending describes the setup instead: pawns on d4 and e3, knight on f3,
dark-squared bishop already outside on f4, with Bd3, c3, Nbd2, castling and a
later Ne5 to come. That plan is sourced as the standard London formation
<https://en.wikipedia.org/wiki/London_System> ·
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._Bf4>.
Black has mirrored it and offers a trade. **This is an equal-ish position and
the text does not claim an advantage.**

### Noted, not used

- **The London's real criticism** is that it produces "repetitive games and a
  lack of dynamic play". <https://en.wikipedia.org/wiki/London_System> For Felix
  the repetitiveness is the feature; the intro says so without hiding it.
- **b2 is loosened by `Bf4`**, and Black's standard counter is `...c5` and
  `...Qb6`. <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...d5/2._Nf3/2...Nf6/3._Bf4>
  Off the shipped line, which plays `...e6`. Noted if the line is extended.
- **Three Wikibooks pages in this line return HTTP 404** — `.../3._Bf4/3...e6`,
  `.../3._Bf4/3...e6/4._e3` and `.../4._e3/4...Bd6`. The per-move tree stops at
  `3. Bf4`, so this line's last three half-moves rest on the London overview
  pages plus the QGD `...e6` page. **It is the least per-move-sourced of the
  nine**, and that is recorded rather than hidden.

---

## Caro-Kann Defense — B15

`1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5` — taught from **Black's** side.

### The opening

- `1...c6` "prepares for 2...d5 without blocking in the light-squared bishop,
  which is considered the main drawback of its cousin the French Defense".
  <https://www.chess.com/openings/Caro-Kann-Defense>
- "the Caro–Kann does not hinder the development of Black's queen's bishop."
  <https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence>
- "A standby for positional players at almost every level ... a particular
  favorite of world champion GM Anatoly Karpov."
  <https://www.chess.com/openings/Caro-Kann-Defense>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Occupies a centre square, attacks d5, frees the queen and king's bishop. | <https://en.wikipedia.org/wiki/King%27s_Pawn_Game> |
| c6 | Prepares `...d5` with the c-pawn ready to recapture — and unlike `1...e6`, does not block Black's own light-squared bishop. | <https://www.chess.com/openings/Caro-Kann-Defense> · <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6> |
| d4 | "If your opponent allows you to put two pawns in the centre, then put two pawns in the centre." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6/2._d4> |
| d5 | The point of `...c6`; if White trades, `...cxd5` recaptures with a pawn. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6/2._d4/2...d5> |
| Nc3 | "White develops a knight, ready to take back on e4." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6/2._d4/2...d5/3._Nc3> |
| dxe4 | The main move, "denying White their two-pawn centre". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6/2._d4/2...d5/3._Nc3> |
| Nxe4 | "An obvious recapture. This is the traditional treatment of the Caro-Kann." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6/2._d4/2...d5/3._Nc3/3...dxe4/4._Nxe4> |
| Bf5 | The Classical: Black "clear[s] the center and develop[s] his bishop to a good square, while attacking the central knight". | <https://www.chess.com/openings/Caro-Kann-Defense-Classical-Variation> |

### The French comparison — the idea the line exists to teach

Three independent sources state it: chess.com (above), Wikipedia (above), and
Wikibooks — compared to `1...e6`, the Caro-Kann "avoids blocking in Black's own
bishop." <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6>

The French side is confirmed from the French article itself: "the pawn on e6 can
impede the development of the bishop on c8, known by many players as the French
bishop". <https://en.wikipedia.org/wiki/French_Defence>

**Note the asymmetry:** the Caro-Kann sources name the French; the French
article does not name the Caro-Kann. The comparison is sourced in one direction,
which is enough for the move text to draw it — and the move text draws it in
that direction only.

**One inference, flagged as such.** The phrasing "the bishop gets out *before*
`...e6` shuts the door" is a synthesis of two sourced facts — that `...e6`
blocks the c8 bishop, and that the Caro-Kann's point is not blocking it. No
single page states the sequencing in those words. The underlying facts are
solid; the joining of them is ours.

### The honest cost, which the text does not hide

- Black "lag[s] in development" for having spent a move on `...c6`.
  <https://en.wikipedia.org/wiki/Caro%E2%80%93Kann_Defence>
- "if Black later wishes to assault White's centre with c5, they will have lost
  a tempo". <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c6>

The intro names the time cost, the same way the Scandinavian's names the early
queen.

### What has been achieved after 4...Bf5

**The catalogue does not name this position** — its "Classical Variation" rows
all run through `3. Nd2`, not our `3. Nc3`, so no entry matches. But the
position is universally called the **Classical** in the literature (Wikipedia,
Wikibooks and chess.com all name it), so the ending uses that name **on the
sources' authority, not the catalogue's**.

The ECO code `B15` is what the dataset's derivation rule yields for this move
order and is asserted by `test/openings.test.mjs`; it is the broader `3. Nc3`
code and does **not** itself mean "Classical". The ending says the name, never
the code.

---

## French Defense — C17 (Winawer, Advance)

`1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5` — taught from **Black's** side.

### The opening

- "Black's position is often somewhat cramped in the early game; in particular,
  the pawn on e6 can impede the development of the bishop on c8, known by many
  players as the French bishop." <https://en.wikipedia.org/wiki/French_Defence>
- Black "almost always play[s] c7–c5 early on to attack White's pawn chain at
  its base." <https://en.wikipedia.org/wiki/French_Defence,_Advance_Variation>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Opens lines for the queen and king's bishop, and fights for the centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4> |
| e6 | Supports the coming `...d5`; the trade-off is that it "obstructs Black's queen-side bishop and makes it harder to develop." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6> |
| d4 | White "takes the opportunity to put a second pawn in the centre, and open their bishops and queen for development." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4> |
| d5 | Challenges White's centre and threatens `...dxe4`. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4> |
| Nc3 | Develops, defends e4, pressures d5. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3> |
| Bb4 | Pins the c3 knight to the king — the knight that defends e4 — so "the e-pawn is left unprotected". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3/3...Bb4> |
| e5 | "White pushes their e-pawn forward, gaining space and defending it with the d4 pawn." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3/3...Bb4/4._e5> |
| c5 | "Black's usual response is 4...c5, threatening White's pawn chain at its base." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3/3...Bb4/4._e5> |

### The idea sentence was ambiguous, and now names whose chain

`openings.js` said: *"Build a solid pawn chain, then attack its base with c5."*

Both halves are supportable, but **"its base" reads as the base of the chain
Black just built.** Black does build a chain (e6–d5); the one `...c5` attacks is
**White's** (e5–d4), at d4. The sources are unambiguous on that point — quoted
twice above — so the sentence now says *"attack White's at its base with c5."*

### The general pawn-chain rule is folklore here, and is not asserted

Neither Wikipedia's `Pawn chain` nor `Pawn structure` states the rule "attack a
chain at its base"; `Hypermodernism (chess)` credits Nimzowitsch with
"undermining" without spelling it out.
<https://en.wikipedia.org/wiki/Pawn_chain>

The **specific** instance is sourced twice. So the move text explains this
position concretely — e5 is protected by d4, and d4 has no pawn helping it —
rather than teaching a general rule as though it had been checked.

### What has been achieved after 4...c5

- White has more space and a fixed chain; Black has the pin still standing,
  pressure on d4, and "more space on the queenside".
  <https://en.wikipedia.org/wiki/French_Defence,_Advance_Variation>
- White's usual reply is `5. a3`, because defending d4 with `c3` is unavailable
  — the knight is already there.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3/3...Bb4/4._e5>

### Noted, not used

- **`...c5` has a cost:** it "blocks the escape route for Black's dark-squared
  bishop", which is why `5. a3` wins the bishop pair after `5...Bxc3+ 6.bxc3`.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...e6/2._d4/2...d5/3._Nc3/3...Bb4/4._e5/4...c5>
  Just past the eight half-moves shipped; worth a text if the line is extended.
- **"White is forced to play 4. e5" is too strong.** Wikibooks says the pin
  "forces 4. e5" but lists `4.exd5`, `4.Ne2`, `4.Bd3`, `4.a3` and `4.Bd2` as
  real alternatives on the same page. The move text says `e5` is what White
  does and why, not that it is forced.

---

## Sicilian Defense — B54

`1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3` — taught from **Black's** side.

### The opening

- `1...c5` is "the mainline in master-level games today", 46% of continuations
  in the Lichess Masters database against 23% for `1...e5`.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4>
- It "became recognised as the defence that offered Black the most winning
  chances against 1.e4." <https://en.wikipedia.org/wiki/Sicilian_Defence>
- The point in one sentence: Black "controls the d4 square with a flank pawn,
  asserting that trading their flank c-pawn for White's d-pawn will surely be to
  their advantage, as it will leave them with two central pawns to White's one."
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5>

### Per move

| Move | Claim | Source |
|---|---|---|
| e4 | Opens lines for the queen and king's bishop, and fights for the centre. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4> |
| c5 | Controls d4 with a flank pawn, offering to trade a wing pawn for a centre pawn. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5> |
| Nf3 | "White increases their control of the d4 square: the conventional plan is to follow with 3. d4 cxd4 4. Nxd4 and open the position." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3> |
| d6 | Controls e5, so "Black can develop ...Nf6 safely in the future, without any worry of White playing e5". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6> |
| d4 | White offers the trade the whole `2. Nf3` plan was preparing. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3> |
| cxd4 | "Black captures towards the centre with a flank pawn, breaking up White's two pawn centre." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4> |
| Nxd4 | Black now has "two central pawns to White's one, and a semi-open c-file to use." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4> |
| Nf6 | "Black starts the development of their pieces, whilst also attacking the e4 pawn". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4/3...cxd4/4._Nxd4/4...Nf6> |
| Nc3 | "White defends their e-pawn while developing a piece" — "the main move by far". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4/3...cxd4/4._Nxd4/4...Nf6/5._Nc3> |

### `...d6` and `...Nf6` are one idea, and the source says so

The strongest teachable link in the line: `2...d6` controls e5, and that is
precisely what makes `4...Nf6` safe two moves later. "When Black played 2...d6,
they controlled the e5 square, thus preventing White from playing e5 and kicking
away this knight."
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4/3...cxd4/4._Nxd4/4...Nf6>

The same page gives the countable reason `5. Nc3` is near-forced: White "does
not have time to play 5. c4?", because `5...Nxe4` follows "in which White is
down a pawn for no compensation." The move text says this, in the same spirit as
the Italian's `c3`-before-`d4` count.

### The honest cost, which the text names

"1...c5 is that it does not help Black to develop" — the c-pawn opens no line
for a piece the way `1...e5` does, and White "meanwhile has opened attacking
lines".
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5> ·
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4>

The `c5` text says so rather than selling a free lunch.

### What has been achieved after 5. Nc3 — no name to lean on

**Confirmed unnamed:** the catalogue's longest match stops at `4...Nf6`, and the
sources treat the position as a crossroads rather than a named variation —
Wikibooks lists `5...Nc6` (Classical), `5...e6` (Scheveningen), `5...g6`
(Dragon) and `5...a6` (Najdorf) as the continuations *from here*.
<https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4/1...c5/2._Nf3/2...d6/3._d4/3...cxd4/4._Nxd4/4...Nf6/5._Nc3>

So the ending describes the structure: a centre pawn for a wing pawn, the
semi-open c-file, and a choice not yet made.

### Noted, not used

- **No scoring figure was obtained.** The widely repeated *New in Chess 2000
  Yearbook* percentages appeared in a search result attributed to the Wikipedia
  article, but a direct fetch of that article returned no such statistics. The
  intro claims **popularity only** — which is sourced — and never
  "highest-scoring", which is not.

---

## King's Indian Defense — E70

`1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6` — taught from **Black's** side.

### The opening

- "a hypermodern opening, where Black deliberately allows White control of the
  centre with pawns, with a view to subsequently challenging it."
  <https://en.wikipedia.org/wiki/King%27s_Indian_Defence>
- The general principle: "control the center of the chess board indirectly with
  pieces, rather than occupying that area with pawns", thus "inviting the
  opponent to occupy the centre with pawns, which can then become targets of
  attack." <https://en.wikipedia.org/wiki/Hypermodernism_(chess)>

### Per move

| Move | Claim | Source |
|---|---|---|
| d4 | Takes the centre; controls c5 and e5; opens a diagonal for the queen's bishop. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4> |
| Nf6 | "Controls e4 while developing a knight" — the hypermodern way, "controlling it from afar with pieces". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6> |
| c4 | "White takes more space and increases the control of the important d5 square". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4> |
| g6 | Prepares to "fianchetto their dark square bishop with ...Bg7", from where "the bishop will exert pressure on the long diagonal and target White's centre". | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6> |
| Nc3 | Develops toward the centre and supports the e4 push. | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6/3._Nc3/3...Bg7> |
| Bg7 | "Black's idea is to concede the centre to white and to then put pressure on it using the bishop on g7." Also defensive — "the bishop is important to defend the king after Black castles." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6/3._Nc3/3...Bg7> · <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6> |
| e4 | "The most principled move" — "White takes over the centre that Black has conceded." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6/3._Nc3/3...Bg7/4._e4> |
| d6 | "The d-pawn prevents White from playing 5. e5 and kicking Black's knight, opens a line for the queen's bishop, and will be a springboard for later attacks on the centre, ...e5 or ...c5." | <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6/3._Nc3/3...Bg7/4._e4> |

### `...d6` does three things, in one sourced sentence

Unusually clean for a move text: stop `e5`, open the c8 bishop's line, and
prepare `...e5`. All three are in the single Wikibooks sentence quoted above, so
the move text can say all three without stitching sources together.

### The framing that must not be dropped

Every source frames the concession as **deliberate and half of a plan** —
"concede the centre to white and to *then* put pressure on it". A text that
stops at "let White have the centre" teaches a child to give away the centre and
do nothing about it. The move texts and the ending both carry the second half.

### What has been achieved after 4...d6

- White has c4, d4 and e4 — allowed on purpose, and now a target as much as an
  asset. <https://en.wikipedia.org/wiki/Hypermodernism_(chess)>
- Black's g7 bishop is aimed down the long diagonal at it.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6>
- The break is loaded: the mainline runs `5. Nf3 O-O 6. Be2 e5 7. O-O`, so
  `...e5` lands two moves after the shipped line ends.
  <https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._d4/1...Nf6/2._c4/2...g6/3._Nc3/3...Bg7/4._e4>

### Noted, not used

- **The two-wing race** — after White plays d5, Black goes `...f5` or `...b5`
  while White attacks on the queenside — is the KID's real character and falls
  outside eight half-moves.
  <https://en.wikipedia.org/wiki/King%27s_Indian_Defence>

---

## Source quality for this round, honestly

**Strongest:** Wikibooks *Chess Opening Theory*, which carries a per-move page
with reasoning for nearly every half-move shipped here. Wikipedia second, with
named attributions — Tim Harding for the Frankenstein–Dracula name, Tarrasch and
Fischer on the King's Gambit, Alekhine on `3...Nxe4`, Ercole del Rio on the
Scotch.

**Adequate, used as corroboration:** chess.com opening pages. Their quality is
uneven — the general *Caro-Kann Defense* page carries the clearest statement of
the French comparison found anywhere in this round, while the *Classical
Variation*, *King's Gambit Accepted* and *Frankenstein–Dracula* pages are
essentially move lists with no prose and were not quoted beyond a sentence each.

**Checked against the board, not only the page:** the Ruy Lopez `Qd4` refutation,
the Vienna's mate on f7, and the direction of the King's Gambit `Qh4+` claim.
The repo's own chess.js is the authority for all three, and in each case it
agreed with the source once the source was read precisely.

**Could not be read (HTTP 404):** three Wikibooks pages covering the London's
last three half-moves. The London is the least per-move-sourced line of the nine,
which is recorded above rather than papered over.

**Not obtained:** lichess move-frequency figures — the explorer API needs auth,
the same limitation the first round hit. Every frequency claim here comes from
Wikipedia or Wikibooks prose and is attributed there.

**Gaps left open rather than filled:**
- No source reconciles the Vienna's `4. Qh5` with the "do not develop the queen
  early" rule Felix is taught at his club.
- No source states the general "attack a chain at its base" rule.
- No traceable scoring figure exists for the Sicilian in anything readable here.
