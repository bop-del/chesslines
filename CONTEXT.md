# chesslines

The vocabulary of an app that teaches a nine-year-old chess openings. Terms
here are the ones this project argues about; general chess words that mean what
they always mean are not listed.

## Language

**Line**:
One concrete sequence of moves that this app teaches, belonging to an opening
and carrying a text per move. There are twelve; three ship with texts.
_Avoid_: opening (means the named idea, not our sequence), variation, repertoire entry

**Opening**:
The named idea a line belongs to — "Italian Game", "Queen's Gambit". Named by
the catalogue, not by us, and one opening covers many possible lines.
_Avoid_: line, defence, system

**Catalogue**:
The 3,810 CC0 entries from Lichess, keyed by position. Its only job is naming a
position, including one reached by a move order the line did not anticipate. It
is exhaustive, not curated, so it can never be the list a child chooses from.
_Avoid_: database, dataset, opening list

**Starter list**:
The twelve lines we hand-picked and wrote ourselves. Curation is the part the
catalogue cannot do.
_Avoid_: catalogue, our openings, the twelve

**Position key**:
The first four FEN fields — placement, side to move, castling rights, en
passant. Drops the clocks, so two move orders reaching the same position share
one key. Everything hangs on this rather than on a node in a tree.
_Avoid_: FEN (that is the six-field string), hash, position id

**Own move**:
A move of the line played by the side the line is for. Felix plays these
himself; the board accepts only this move and refuses any other.
_Avoid_: user move, correct move, player move

**Opponent move**:
A move of the line played by the other side. The app plays these itself, with
their text, the same way Drill will. Four of the Scandinavian's eight moves are
these, because that line is taught from Black.
_Avoid_: computer move, White's move (depends on the line), automatic move

**Move text**:
The one sentence attached to a move, saying what it achieves. Always names a
plan, never an evaluation. Display-only: never stored, never exported.
_Avoid_: comment, annotation, explanation, description

**Move hint**:
The next own move, shown on the board itself — its from-square marked quietly,
its to-square marked strongly, and an arrow drawn from one to the other. A
per-viewer preference that can be switched off, defaulting to on. In the code
it is `.from-hint`, `.to-hint` and the arrow, all drawn by `Board.showMove()`.
_Avoid_: hint (the board already has a `.hint` class meaning something else),
highlight, cue

**Arrow**:
The line with a head drawn from the hint's from-square to its to-square, in an
SVG over the board (issue #27). Part of the move hint, not a feature beside it:
the same switch turns it off, and it is absent in every case the rings are.
Straight for every move, knights included — it says *from here to there*, not
*along this path*.
_Avoid_: move arrow (the hint is the move; this is one of its three marks),
line (that means a taught sequence here), pointer

> **Why the hint is an outline, and why it does not reuse `.hint`.** The board
> has four markers already: `.selected`, `.hint` and `.wrong` fill the square;
> `.target` and `.capture` are a dot and a ring. A fill would collide with
> `.selected` — tapping the piece would paint over the hint at the exact moment
> it is being used — so the hint is an outline, which coexists with a fill and
> a dot on one square. `.hint` itself is a green fill belonging to wrong-move
> feedback, a different idea despite the name. Both pseudo-elements are also
> spoken for on a square (the target dot, the capture ring, the coordinate
> labels), which is why the outline is an `outline` and not a `::before`.

**Launchpad**:
The session in the main clone. It stays on `main`, never checks out a feature
branch, and exists to create lanes and start agents in them — so it cannot be
moved under its own feet by work happening elsewhere. Addressable as the Herdr
agent `launchpad`.
_Avoid_: main session, host, parent

**Lane**:
One ticket's isolated place to work: a git worktree for the files, plus a Herdr
workspace and agent for the session. Both halves are required — a pane alone
shares the launchpad's working directory, which is not isolation.
_Avoid_: worktree (that is only the files), pane, window, branch

**Mode**:
One of the three things Felix can be doing: Explain, Adopt, Drill. Adopt is an
act rather than a place, so only two of them are tabs.
_Avoid_: screen (that is one view), tab (that is the control), section

**Tab**:
One of the three destinations on the list screen — Openings, Mine, Practise.
They name where he is, not what he is doing, so they are absent while a line is
being walked. A tab he cannot use yet is greyed and carries the condition that
opens it: a path, not a promised reward.
_Avoid_: menu, nav, mode (a tab is the control, not the thing)

**Repertoire**:
The lines Felix has adopted, and what the Mine tab shows. His data, in his
browser, keyed by position. Adopting is the only way anything enters it.
_Avoid_: my openings, collection, favourites, saved lines
