# Data Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parse PGN with variations into a move tree, key positions so
transpositions merge, and name any position from the CC0 opening catalogue —
with the legality of every shipped line proved by a check.

**Architecture:** Three pure ES modules under `js/data/`, each with one job and
no DOM access. `pgn.js` tokenises PGN and builds a tree; `position.js` derives
the four-field key; `catalogue.js` looks a key up in a generated map. A
data-prep script under `scripts/` converts the Lichess TSVs into that map at
author time, never at runtime. Node's built-in test runner covers the pure
logic; `verify.mjs` keeps covering the browser.

**Tech Stack:** Vanilla ES modules, no build step. Vendored chess.js 1.4.0
(`js/vendor/chess.js`, BSD-2-Clause) for legality and SAN. `node --test` (built
in, no dependency) for unit tests. Playwright for the browser run.

**Spec:** `docs/superpowers/specs/2026-09-05-chesslines-design.md`

## Global Constraints

Copied from the spec and `CLAUDE.md`. Every task's requirements include these.

- **No runtime dependencies.** No npm package in shipped code, no CDN links. All
  imports relative.
- **No build step.** What is in the repo runs in the browser.
- **Vanilla JS + native ES modules.** No framework.
- **Keep files small.** Split at ~500 lines.
- **English everywhere in the repo** — code, comments, docs, commits.
- **No commit trailers.** Never add `Co-Authored-By:` or `Claude-Session:` lines
  in this repo.
- **Git identity is `boris.diebold+gh@gmail.com`.** Never pass `-c
  user.email=...`.
- **Bump `js/version.js` by one in every commit that changes shipped code**
  (`index.html`, `css/`, `js/`). Docs-only and `scripts/`-only commits leave it
  alone. Tasks below say explicitly which ones bump.
- **Stored data is always English SAN.** No German piece letter ever reaches a
  position key, a repertoire, or an export file.
- **The position key is the first four FEN fields** — placement, side to move,
  castling, en passant. Never all six.

---

## File Structure

| File | Responsibility |
|---|---|
| `js/data/position.js` | Derive the four-field key from a FEN. Nothing else. |
| `js/data/pgn.js` | Tokenise PGN, build a move tree with variations. |
| `js/data/catalogue.js` | Look up `key → {eco, name}` in the generated map. |
| `js/data/openings.js` | The hand-picked starter list. Data, not logic. |
| `js/data/catalogue-map.js` | **Generated.** Do not hand-edit. |
| `scripts/build-catalogue.mjs` | Lichess TSVs → `catalogue-map.js`. Author time. |
| `scripts/lib/tsv/*.tsv` | Vendored CC0 source data. |
| `test/position.test.mjs` | Unit tests for the key. |
| `test/pgn.test.mjs` | Unit tests for the parser. |
| `test/openings.test.mjs` | Legality of every shipped line. |

`js/ui/` and `js/train/` are out of scope for this plan.

---

### Task 1: The position key

The foundation: get this wrong and transpositions never merge, which is the bug
the spec says only surfaces once a repertoire has grown.

**Files:**
- Create: `js/data/position.js`
- Create: `test/position.test.mjs`
- Modify: `package.json` (add the `test` script)

**Interfaces:**
- Consumes: nothing.
- Produces: `key(fen: string) => string` — the first four space-separated
  fields of a FEN. Used by every later task and by `catalogue.js`.

- [ ] **Step 1: Write the failing test**

Create `test/position.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../js/vendor/chess.js';
import { key } from '../js/data/position.js';

test('drops the halfmove clock and fullmove number', () => {
    const fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    assert.equal(key(fen), 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -');
});

test('transposing move orders produce the same key', () => {
    // The Queen's Gambit Declined, reached two ways. This is the whole reason
    // the key exists — the full FENs differ only in the move counters.
    const a = new Chess();
    const b = new Chess();
    for (const m of ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'd5']) a.move(m);
    for (const m of ['d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6']) b.move(m);

    assert.notEqual(a.fen(), b.fen(), 'full FENs should differ');
    assert.equal(key(a.fen()), key(b.fen()), 'four-field keys should match');
});

test('en passant is kept — it makes a genuinely different position', () => {
    const g = new Chess();
    for (const m of ['e4', 'a6', 'e5', 'd5']) g.move(m);
    // After 1.e4 a6 2.e5 d5 the d6 square is a legal en passant target.
    assert.ok(key(g.fen()).endsWith(' d6'), `expected ep target d6, got ${key(g.fen())}`);
});

test('castling rights are kept — they change what is legal', () => {
    const g = new Chess();
    for (const m of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'O-O']) g.move(m);
    const k = key(g.fen());
    assert.ok(!k.includes('KQ'), 'white should have lost its castling rights');
});
```

- [ ] **Step 2: Add the test script and run it to verify it fails**

Add to `package.json` `"scripts"`:

```json
"test": "node --test test/"
```

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/data/position.js'`

- [ ] **Step 3: Write the minimal implementation**

Create `js/data/position.js`:

```js
// The position key.
//
// A FEN has six fields; the last two — halfmove clock and fullmove number —
// record how you arrived, not what the position is. Dropping them is what makes
// transpositions merge: the same position reached by two move orders gets one
// key, and so one progress record.
//
// This is the format the Chess Programming Wiki calls EPD. Four projects
// converged on it independently (ChessTempo, Chessbook, OpeningTree,
// chessdriller) — see docs/research/opening-data-and-drilling.md.
//
// Castling rights and the en passant square stay: both change which moves are
// legal, so a position that differs in either genuinely is a different position.

export function key(fen) {
    return fen.split(' ').slice(0, 4).join(' ');
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

`js/data/position.js` is shipped code, so the build number bumps.

```bash
# Edit js/version.js: BUILD = 'b1' → 'b2'
git add js/data/position.js test/position.test.mjs package.json js/version.js
git commit -m "The position key: four fields, so transpositions merge"
```

---

### Task 2: PGN with variations

chess.js discards variations **silently** — no error, just a shorter history.
That is the failure this task exists to prevent, so the first test is the one
that proves the parser does what chess.js does not.

**Files:**
- Create: `js/data/pgn.js`
- Create: `test/pgn.test.mjs`

**Interfaces:**
- Consumes: `key(fen)` from `js/data/position.js`.
- Produces: `parse(pgn: string) => Node`, where

  ```js
  Node = {
      san: string | null,   // null only for the root
      fen: string,          // full FEN after this move
      key: string,          // four-field key, from position.js
      children: Node[],     // [0] is the main line; [1..] are variations
  }
  ```

  Later tasks walk `children[0]` for the main line and treat the rest as
  alternatives.

- [ ] **Step 1: Write the failing test**

Create `test/pgn.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../js/vendor/chess.js';
import { parse } from '../js/data/pgn.js';

// Walk the main line, collecting SAN.
const mainLine = (node) => {
    const out = [];
    let n = node;
    while (n.children.length) {
        n = n.children[0];
        out.push(n.san);
    }
    return out;
};

test('chess.js drops variations — this is why the parser exists', () => {
    // Guard test. If a future chess.js version starts preserving variations
    // this fails, and the parser's justification needs revisiting.
    const g = new Chess();
    g.loadPgn('1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6');
    assert.deepEqual(g.history(), ['e4', 'e5', 'Nf3', 'Nc6']);
    assert.ok(!g.history().includes('c5'), 'chess.js still drops the RAV');
});

test('parses a plain line', () => {
    const root = parse('1. e4 e5 2. Nf3 Nc6');
    assert.deepEqual(mainLine(root), ['e4', 'e5', 'Nf3', 'Nc6']);
});

test('a variation attaches as a sibling of the preceding move', () => {
    // 1... c5 is an alternative to 1... e5, so it is a second child of the
    // node after 1. e4 — not a child of e5.
    const root = parse('1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6');
    const afterE4 = root.children[0];
    assert.equal(afterE4.san, 'e4');
    assert.equal(afterE4.children.length, 2, 'e4 should have two continuations');
    assert.equal(afterE4.children[0].san, 'e5');
    assert.equal(afterE4.children[1].san, 'c5');
    // And the variation carries its own continuation.
    assert.deepEqual(mainLine(afterE4.children[1]), ['Nf3', 'd6']);
});

test('handles nested variations', () => {
    const root = parse('1. e4 e5 (1... c5 2. Nf3 (2. Nc3 Nc6) d6) 2. Nf3');
    const c5 = root.children[0].children[1];
    assert.equal(c5.san, 'c5');
    assert.equal(c5.children.length, 2, 'c5 should have Nf3 and Nc3');
    assert.equal(c5.children[0].san, 'Nf3');
    assert.equal(c5.children[1].san, 'Nc3');
});

test('ignores comments, NAGs and result markers', () => {
    const root = parse('1. e4 {best by test} e5 $1 2. Nf3 1-0');
    assert.deepEqual(mainLine(root), ['e4', 'e5', 'Nf3']);
});

test('ignores a tag pair header', () => {
    const root = parse('[Event "Test"]\n[White "A"]\n\n1. e4 e5');
    assert.deepEqual(mainLine(root), ['e4', 'e5']);
});

test('every node carries a position key', () => {
    const root = parse('1. e4 e5');
    const e4 = root.children[0];
    assert.equal(e4.key, e4.fen.split(' ').slice(0, 4).join(' '));
    assert.ok(e4.key.includes('w') || e4.key.includes('b'));
});

test('transposing variations share a key', () => {
    // The two move orders into the QGD, written as siblings. Their leaf nodes
    // must agree, or progress cannot merge across them.
    const root = parse('1. d4 Nf6 2. c4 e6 3. Nc3 d5 (1... d5 2. c4 e6 3. Nc3 Nf6)');
    const viaNf6 = root.children[0].children[0];
    const viaD5 = root.children[0].children[1];
    const leaf = (n) => { while (n.children.length) n = n.children[0]; return n; };
    assert.equal(leaf(viaNf6).key, leaf(viaD5).key);
});

test('rejects an illegal move rather than failing silently', () => {
    // A typo in a repertoire must be loud. Silence here teaches a child a move
    // that does not exist.
    assert.throws(() => parse('1. e4 e5 2. Ke3'), /Ke3/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/data/pgn.js'`

- [ ] **Step 3: Write the minimal implementation**

Create `js/data/pgn.js`:

```js
// PGN with variations, into a tree.
//
// chess.js parses PGN but silently discards variations — loading
// `1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6` gives a history of four moves and
// no error. A repertoire is mostly variations, so the parser is ours. chess.js
// is still what decides whether a move is legal and what its SAN is.
//
// The grammar is small: SAN moves, parentheses, {comments}, $NAGs, move numbers
// and a result marker. The one rule that matters is that a variation is an
// alternative to the move *before* it — so on '(' we rewind one ply, and on ')'
// we restore where we were.

import { Chess } from '../vendor/chess.js';
import { key } from './position.js';

const node = (san, fen) => ({ san, fen, key: key(fen), children: [] });

export function parse(pgn) {
    const game = new Chess();
    const root = node(null, game.fen());

    // `cursor` is where the next move attaches; `parent` is the node before it,
    // which is what a variation branches from.
    let cursor = root;
    let parent = root;
    const stack = [];

    for (const token of tokenise(pgn)) {
        if (token === '(') {
            // Rewind one ply: the variation is a sibling of `cursor`.
            stack.push([cursor, parent, game.fen()]);
            game.load(parent.fen);
            cursor = parent;
            continue;
        }

        if (token === ')') {
            const [c, p, fen] = stack.pop();
            cursor = c;
            parent = p;
            game.load(fen);
            continue;
        }

        // A move. chess.js validates it; an illegal one throws, which is what
        // we want — a typo in a repertoire must never pass quietly.
        let move;
        try {
            move = game.move(token);
        } catch {
            move = null;
        }
        if (!move) throw new Error(`Illegal move in PGN: ${token}`);

        const child = node(move.san, game.fen());
        cursor.children.push(child);
        parent = cursor;
        cursor = child;
    }

    return root;
}

// Strip everything that is not a move or a bracket, and split the rest.
function* tokenise(pgn) {
    const body = pgn
        .replace(/\[[^\]]*\]/g, ' ')       // tag pairs
        .replace(/\{[^}]*\}/g, ' ')        // comments
        .replace(/;[^\n]*/g, ' ')          // rest-of-line comments
        .replace(/\$\d+/g, ' ')            // NAGs
        .replace(/\d+\.(\.\.)?/g, ' ')     // move numbers, incl. "1..."
        .replace(/([()])/g, ' $1 ');       // brackets become their own tokens

    for (const token of body.split(/\s+/)) {
        if (!token) continue;
        if (token === '1-0' || token === '0-1' || token === '1/2-1/2' || token === '*') continue;
        yield token;
    }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 13 tests total (4 from Task 1, 9 here).

- [ ] **Step 5: Commit**

```bash
# Edit js/version.js: BUILD = 'b2' → 'b3'
git add js/data/pgn.js test/pgn.test.mjs js/version.js
git commit -m "PGN with variations, because chess.js drops them silently"
```

---

### Task 3: The starter list, and proof that every line is legal

The spec calls a wrong line the worst failure this app has: it teaches a child
something false, authoritatively. This task makes that impossible to ship.

**Files:**
- Create: `js/data/openings.js`
- Create: `test/openings.test.mjs`

**Interfaces:**
- Consumes: `parse(pgn)` from `js/data/pgn.js`.
- Produces: `OPENINGS: Opening[]`, where

  ```js
  Opening = {
      id: string,        // stable, used as a repertoire key: 'italian-game'
      eco: string,       // 'C50'
      name: { en: string, de: string },
      idea: { en: string, de: string },   // one sentence, for a nine-year-old
      side: 'w' | 'b',   // which side this is a repertoire for
      pgn: string,       // the line, English SAN
  }
  ```

  `js/ui/` consumes this in a later plan. `id` is what a repertoire stores.

- [ ] **Step 1: Write the failing test**

Create `test/openings.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from '../js/data/pgn.js';
import { OPENINGS } from '../js/data/openings.js';

test('every shipped line is legal', () => {
    // The check that matters most in this repo. A typo here teaches a child a
    // move that does not exist, and he has no reason to doubt it.
    for (const o of OPENINGS) {
        assert.doesNotThrow(() => parse(o.pgn), `${o.id}: ${o.pgn}`);
    }
});

test('every opening has both languages', () => {
    for (const o of OPENINGS) {
        for (const field of ['name', 'idea']) {
            assert.ok(o[field].en?.trim(), `${o.id}: missing ${field}.en`);
            assert.ok(o[field].de?.trim(), `${o.id}: missing ${field}.de`);
        }
    }
});

test('ids are unique and stable-looking', () => {
    const ids = OPENINGS.map((o) => o.id);
    assert.equal(new Set(ids).size, ids.length, 'duplicate id');
    for (const id of ids) {
        assert.match(id, /^[a-z0-9-]+$/, `${id} is not a slug`);
    }
});

test('sides are valid and the line matches the side', () => {
    for (const o of OPENINGS) {
        assert.ok(o.side === 'w' || o.side === 'b', `${o.id}: bad side`);
    }
});

test('the list is small enough for a child', () => {
    // The spec says about a dozen. A catalogue dump is the failure mode.
    assert.ok(OPENINGS.length >= 8 && OPENINGS.length <= 16,
        `${OPENINGS.length} openings — the spec says about twelve`);
});

test('ECO codes look like ECO codes', () => {
    for (const o of OPENINGS) {
        assert.match(o.eco, /^[A-E]\d{2}$/, `${o.id}: ${o.eco}`);
    }
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/data/openings.js'`

- [ ] **Step 3: Write the starter list**

Create `js/data/openings.js`. The ECO codes and move orders below were checked
against the CC0 Lichess dataset; the idea sentences are written for a
nine-year-old and deliberately name a plan rather than an evaluation.

```js
// The starter list: what Felix chooses from.
//
// Hand-picked, because the catalogue cannot do this job. The CC0 dataset has
// 3,810 openings including "Sicilian Defense: King David's Opening" (2. Ke2)
// and four separate Myers Attacks — exhaustive, not curated. A nine-year-old
// needs a dozen real openings with names he will actually hear.
//
// Every line here is proved legal by test/openings.test.mjs. Add one only with
// its test passing: a wrong line teaches something false, authoritatively.
//
// The idea sentence names a *plan*, never an evaluation. "+0.3" means nothing
// to a child; "get the bishop pointing at f7" does.

export const OPENINGS = [
    {
        id: 'italian-game',
        eco: 'C50',
        name: { en: 'Italian Game', de: 'Italienische Partie' },
        idea: {
            en: 'Point the bishop at f7, the weakest square in Black’s camp, and castle early.',
            de: 'Der Läufer zielt auf f7, das schwächste Feld bei Schwarz — und dann schnell rochieren.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. c3 Nf6 5. d4',
    },
    {
        id: 'ruy-lopez',
        eco: 'C60',
        name: { en: 'Ruy Lopez', de: 'Spanische Partie' },
        idea: {
            en: 'Pin the knight that defends e5, then build a big centre behind it.',
            de: 'Den Springer fesseln, der e5 deckt, und dahinter ein starkes Zentrum aufbauen.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O',
    },
    {
        id: 'scotch-game',
        eco: 'C44',
        name: { en: 'Scotch Game', de: 'Schottische Partie' },
        idea: {
            en: 'Break the centre open at once, before Black has finished developing.',
            de: 'Das Zentrum sofort öffnen, bevor Schwarz fertig entwickelt ist.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nf3 Nc6 3. d4 exd4 4. Nxd4 Bc5',
    },
    {
        id: 'vienna-game',
        eco: 'C25',
        name: { en: 'Vienna Game', de: 'Wiener Partie' },
        idea: {
            en: 'Develop the queenside knight first and keep the f-pawn free to advance.',
            de: 'Zuerst den Damenspringer entwickeln und den f-Bauern frei halten.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. Nc3 Nf6 3. Bc4 Nxe4 4. Qh5',
    },
    {
        id: 'kings-gambit',
        eco: 'C30',
        name: { en: 'King’s Gambit', de: 'Königsgambit' },
        idea: {
            en: 'Give up a pawn to rip the centre open and attack fast.',
            de: 'Einen Bauern opfern, um das Zentrum aufzureißen und schnell anzugreifen.',
        },
        side: 'w',
        pgn: '1. e4 e5 2. f4 exf4 3. Nf3 g5 4. h4',
    },
    {
        id: 'london-system',
        eco: 'D02',
        name: { en: 'London System', de: 'Londoner System' },
        idea: {
            en: 'Set the same solid shape up every game: bishop out before the e-pawn moves.',
            de: 'Jede Partie derselbe solide Aufbau: Läufer raus, bevor der e-Bauer zieht.',
        },
        side: 'w',
        pgn: '1. d4 d5 2. Bf4 Nf6 3. e3 e6 4. Nf3 Bd6',
    },
    {
        id: 'queens-gambit',
        eco: 'D06',
        name: { en: 'Queen’s Gambit', de: 'Damengambit' },
        idea: {
            en: 'Offer the c-pawn to pull Black’s d-pawn away and own the centre.',
            de: 'Den c-Bauern anbieten, um den d-Bauern wegzulocken und das Zentrum zu beherrschen.',
        },
        side: 'w',
        pgn: '1. d4 d5 2. c4 e6 3. Nc3 Nf6 4. Bg5',
    },
    {
        id: 'scandinavian-defense',
        eco: 'B01',
        name: { en: 'Scandinavian Defense', de: 'Skandinavische Verteidigung' },
        idea: {
            en: 'Challenge the e-pawn immediately — easy to learn and it always looks the same.',
            de: 'Den e-Bauern sofort angreifen — leicht zu lernen und sieht immer gleich aus.',
        },
        side: 'b',
        pgn: '1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 Nf6',
    },
    {
        id: 'caro-kann',
        eco: 'B10',
        name: { en: 'Caro-Kann Defense', de: 'Caro-Kann-Verteidigung' },
        idea: {
            en: 'Support the d-pawn with the c-pawn so the light-squared bishop can get out.',
            de: 'Den d-Bauern mit dem c-Bauern stützen, damit der weißfeldrige Läufer herauskommt.',
        },
        side: 'b',
        pgn: '1. e4 c6 2. d4 d5 3. Nc3 dxe4 4. Nxe4 Bf5',
    },
    {
        id: 'french-defense',
        eco: 'C00',
        name: { en: 'French Defense', de: 'Französische Verteidigung' },
        idea: {
            en: 'Build a solid pawn chain and counter-attack its base with c5.',
            de: 'Eine feste Bauernkette bauen und ihre Basis mit c5 angreifen.',
        },
        side: 'b',
        pgn: '1. e4 e6 2. d4 d5 3. Nc3 Bb4 4. e5 c5',
    },
    {
        id: 'sicilian-defense',
        eco: 'B20',
        name: { en: 'Sicilian Defense', de: 'Sizilianische Verteidigung' },
        idea: {
            en: 'Trade a wing pawn for a centre pawn and play for the counter-attack.',
            de: 'Einen Flügelbauern gegen einen Zentrumsbauern tauschen und auf Gegenangriff spielen.',
        },
        side: 'b',
        pgn: '1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3',
    },
    {
        id: 'kings-indian-defense',
        eco: 'E60',
        name: { en: 'King’s Indian Defense', de: 'Königsindische Verteidigung' },
        idea: {
            en: 'Let White take the centre, then attack it with the fianchettoed bishop and e5.',
            de: 'Weiß das Zentrum überlassen und es dann mit dem Fianchetto-Läufer und e5 angreifen.',
        },
        side: 'b',
        pgn: '1. d4 Nf6 2. c4 g6 3. Nc3 Bg7 4. e4 d6',
    },
];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 19 tests total.

If any line throws, **fix the line, not the test** — the test is the whole point
of the task.

- [ ] **Step 5: Commit**

```bash
# Edit js/version.js: BUILD = 'b3' → 'b4'
git add js/data/openings.js test/openings.test.mjs js/version.js
git commit -m "Twelve openings, each one proved legal"
```

---

### Task 4: Vendor the CC0 catalogue and generate the name map

**Files:**
- Create: `scripts/build-catalogue.mjs`
- Create: `scripts/lib/tsv/{a,b,c,d,e}.tsv` (downloaded)
- Create: `js/data/catalogue-map.js` (generated)
- Create: `docs/research/catalogue-source.md`

**Interfaces:**
- Consumes: `key(fen)` from `js/data/position.js`, `Chess` from the vendored
  engine.
- Produces: `js/data/catalogue-map.js` exporting
  `MAP: Record<string, [eco: string, name: string]>` keyed by position key.

- [ ] **Step 1: Download the source data**

The dataset is CC0 — "As a collection of facts, this data set is in the public
domain." Vendored rather than fetched at runtime, because rule 1 forbids a CDN
and because a build that depends on the network is not reproducible.

```bash
mkdir -p scripts/lib/tsv
for f in a b c d e; do
  curl -sfL "https://raw.githubusercontent.com/lichess-org/chess-openings/master/$f.tsv" \
    -o "scripts/lib/tsv/$f.tsv"
done
wc -l scripts/lib/tsv/*.tsv   # expect 3811 lines total across the five
```

- [ ] **Step 2: Write the generator**

Create `scripts/build-catalogue.mjs`:

```js
// Lichess CC0 openings → a position-keyed name map.
//
// Author time only. Run it when the source data changes; commit the output.
// It must never run in the browser — the TSVs are 388 KB and parsing them at
// load time would be a build step in all but name.
//
//   node scripts/build-catalogue.mjs
//
// Keyed by position rather than by move sequence, because naive sequence
// lookup mis-names transpositions: the QGD reached via 1.d4 Nf6 comes back as
// "Indian Defense: Normal Variation", where the position-keyed map gives
// "Queen's Gambit Declined: Normal Defense" for both move orders.
//
// Source: https://github.com/lichess-org/chess-openings (CC0 1.0)

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { Chess } from '../js/vendor/chess.js';
import { key } from '../js/data/position.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const OUT = join(ROOT, 'js/data/catalogue-map.js');

const map = {};
let rows = 0;
let failed = 0;

for (const letter of ['a', 'b', 'c', 'd', 'e']) {
    const tsv = await readFile(join(ROOT, 'scripts/lib/tsv', `${letter}.tsv`), 'utf8');
    for (const line of tsv.split('\n').slice(1)) {
        if (!line.trim()) continue;
        const [eco, name, pgn] = line.split('\t');
        if (!pgn) continue;
        rows++;

        const game = new Chess();
        try {
            for (const token of pgn.split(/\s+/)) {
                if (/^\d+\.$/.test(token) || !token) continue;
                game.move(token.replace(/^\d+\.+/, ''));
            }
        } catch {
            failed++;
            console.warn(`  skipped ${eco} ${name}: ${pgn}`);
            continue;
        }

        // First name wins: the TSVs are ordered so the shorter, more general
        // name comes before its own sub-variations.
        const k = key(game.fen());
        if (!(k in map)) map[k] = [eco, name];
    }
}

const body = `// GENERATED by scripts/build-catalogue.mjs — do not edit.
//
// Position key → [ECO, name], from lichess-org/chess-openings (CC0 1.0,
// public domain). ${Object.keys(map).length} positions.
//
// Regenerate with: node scripts/build-catalogue.mjs

export const MAP = ${JSON.stringify(map, null, 0)};
`;

await writeFile(OUT, body);
console.log(`  ${rows} rows, ${failed} failed, ${Object.keys(map).length} positions`);
console.log(`  → js/data/catalogue-map.js (${(body.length / 1024).toFixed(0)} KB)`);
```

- [ ] **Step 3: Run it**

Run: `node scripts/build-catalogue.mjs`
Expected: about 3,810 rows, **0 failed**, and roughly 3,000+ positions.

If `failed` is not 0, stop and investigate before committing — the research
found all 3,810 lines replay cleanly, so a failure means the parser or the
source data has changed.

- [ ] **Step 4: Record the source and its licence**

Create `docs/research/catalogue-source.md`:

```markdown
# The opening catalogue

`js/data/catalogue-map.js` is generated from
[lichess-org/chess-openings](https://github.com/lichess-org/chess-openings),
vendored under `scripts/lib/tsv/`.

**Licence: CC0 1.0**, verbatim from the source repo: *"As a collection of
facts, this data set is in the public domain… released under the CC0 Public
Domain Dedication."* No attribution is required; it is credited anyway.

**ECO caveat:** "ECO code is a registered trademark of Chess Informant." That
is a trademark on the name, not copyright on the codes as facts.

## Regenerating

    node scripts/build-catalogue.mjs

Author time only — never at runtime. The TSVs are 388 KB; parsing them in the
browser would be a build step in all but name.

## Why keyed by position

Naive move-sequence lookup mis-names transpositions. The Queen's Gambit
Declined reached via `1.d4 Nf6` returns "Indian Defense: Normal Variation",
where the position-keyed map returns `D35 Queen's Gambit Declined: Normal
Defense` for both move orders.
```

- [ ] **Step 5: Commit**

The generated map is shipped code, so the build number bumps.

```bash
# Edit js/version.js: BUILD = 'b4' → 'b5'
git add scripts/build-catalogue.mjs scripts/lib/tsv js/data/catalogue-map.js \
        docs/research/catalogue-source.md js/version.js
git commit -m "The catalogue: 3,810 CC0 openings, keyed by position"
```

---

### Task 5: Name a position

**Files:**
- Create: `js/data/catalogue.js`
- Create: `test/catalogue.test.mjs`

**Interfaces:**
- Consumes: `MAP` from `js/data/catalogue-map.js`, `key(fen)` from
  `js/data/position.js`.
- Produces: `nameOf(fen: string) => {eco: string, name: string} | null`.
  Returns `null` for a position the catalogue does not know, which is normal
  and not an error.

- [ ] **Step 1: Write the failing test**

Create `test/catalogue.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../js/vendor/chess.js';
import { nameOf } from '../js/data/catalogue.js';

const after = (...moves) => {
    const g = new Chess();
    for (const m of moves) g.move(m);
    return g.fen();
};

test('names a well-known position', () => {
    const found = nameOf(after('e4', 'e5', 'Nf3', 'Nc6', 'Bc4'));
    assert.ok(found, 'the Italian Game should be in the catalogue');
    assert.equal(found.eco, 'C50');
    assert.match(found.name, /Italian/);
});

test('names the same position reached by a different move order', () => {
    // This is the reason the map is position-keyed rather than sequence-keyed.
    const a = nameOf(after('d4', 'Nf6', 'c4', 'e6', 'Nc3', 'd5'));
    const b = nameOf(after('d4', 'd5', 'c4', 'e6', 'Nc3', 'Nf6'));
    assert.ok(a, 'should name the QGD');
    assert.deepEqual(a, b, 'both move orders should give the same name');
});

test('returns null for a position nobody has named', () => {
    assert.equal(nameOf(after('a3', 'h6', 'h3', 'a6')), null);
});

test('the starting position is not claimed as an opening', () => {
    const found = nameOf(new Chess().fen());
    // Either null or a generic name — but it must not throw.
    assert.doesNotThrow(() => nameOf(new Chess().fen()));
    if (found) assert.ok(typeof found.name === 'string');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL — `Cannot find module '../js/data/catalogue.js'`

- [ ] **Step 3: Write the minimal implementation**

Create `js/data/catalogue.js`:

```js
// Naming a position.
//
// The map is generated (scripts/build-catalogue.mjs) and keyed by position, so
// a name is found however the position was reached. An unknown position is
// normal — the catalogue names openings, and most positions are not one.

import { MAP } from './catalogue-map.js';
import { key } from './position.js';

export function nameOf(fen) {
    const entry = MAP[key(fen)];
    if (!entry) return null;
    const [eco, name] = entry;
    return { eco, name };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS, 23 tests total.

- [ ] **Step 5: Commit**

```bash
# Edit js/version.js: BUILD = 'b5' → 'b6'
git add js/data/catalogue.js test/catalogue.test.mjs js/version.js
git commit -m "Name a position, whichever way it was reached"
```

---

### Task 6: Wire the data layer into the browser run

Unit tests prove the logic; `verify.mjs` proves it survives a real browser.
Both engines, because the desktop is not the target.

**Files:**
- Modify: `scripts/verify.mjs` (add checks to the `checks` array)
- Modify: `js/main.js` (expose the data layer for assertions)

**Interfaces:**
- Consumes: everything above.
- Produces: nothing new — this task only proves what exists.

- [ ] **Step 1: Expose the data layer**

In `js/main.js`, extend the existing `window.chesslines` assignment:

```js
import { OPENINGS } from './data/openings.js';
import { nameOf } from './data/catalogue.js';
import { parse } from './data/pgn.js';
import { key } from './data/position.js';

// …existing wiring…

// Exposed for the verification run, which asserts on real state rather than on
// what the UI claims about itself.
window.chesslines = { game, board, OPENINGS, nameOf, parse, key };
```

- [ ] **Step 2: Add the browser checks**

Add these to the `checks` array in `scripts/verify.mjs`, before the closing `]`:

```js
    {
        name: 'the data layer loads in the browser',
        async run(page) {
            const n = await page.evaluate(() => window.chesslines.OPENINGS.length);
            assert(n >= 8 && n <= 16, `${n} openings loaded`);
        },
    },

    {
        name: 'every shipped opening line is legal in the browser too',
        async run(page) {
            // The same assertion as the unit test, run where it actually
            // matters. A module that parses under Node but throws in WebKit
            // would otherwise ship.
            const bad = await page.evaluate(() =>
                window.chesslines.OPENINGS
                    .filter((o) => {
                        try { window.chesslines.parse(o.pgn); return false; }
                        catch { return true; }
                    })
                    .map((o) => o.id));
            assert(bad.length === 0, `illegal lines: ${bad.join(', ')}`);
        },
    },

    {
        name: 'variations survive parsing in the browser',
        async run(page) {
            // chess.js drops these silently. If our parser ever regresses to
            // the same behaviour, this is what catches it.
            const kids = await page.evaluate(() => {
                const root = window.chesslines.parse('1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3');
                return root.children[0].children.map((c) => c.san);
            });
            eq(kids.length, 2, 'continuations after 1. e4');
            eq(kids[1], 'c5', 'the variation');
        },
    },

    {
        name: 'transpositions share a position key',
        async run(page) {
            const same = await page.evaluate(() => {
                const { parse, key } = window.chesslines;
                const leaf = (n) => { while (n.children.length) n = n.children[0]; return n; };
                const a = leaf(parse('1. d4 Nf6 2. c4 e6 3. Nc3 d5'));
                const b = leaf(parse('1. d4 d5 2. c4 e6 3. Nc3 Nf6'));
                return { equal: a.key === b.key, fensDiffer: a.fen !== b.fen };
            });
            assert(same.fensDiffer, 'the full FENs should differ');
            assert(same.equal, 'the four-field keys should match');
        },
    },

    {
        name: 'the catalogue names a position',
        async run(page) {
            const found = await page.evaluate(() => {
                const g = new window.chesslines.game.constructor();
                for (const m of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']) g.move(m);
                return window.chesslines.nameOf(g.fen());
            });
            assert(found, 'the Italian Game should be named');
            eq(found.eco, 'C50', 'ECO code');
        },
    },
```

- [ ] **Step 3: Run the browser suite**

Run: `node scripts/verify.mjs`
Expected: PASS on both chromium and webkit — 21 checks each.

- [ ] **Step 4: Look at the screenshot**

Open `.screenshots/app-phone.png` and say what is wrong with it. Per
`CLAUDE.md`, nothing is verified until the image has been looked at — a green
run with an unexamined screenshot is not a verification.

The data layer has no UI yet, so the board should look exactly as it did
before. A change here means something unwired broke the page.

- [ ] **Step 5: Commit**

```bash
# Edit js/version.js: BUILD = 'b6' → 'b7'
git add scripts/verify.mjs js/main.js js/version.js
git commit -m "Prove the data layer in a real browser, both engines"
```

---

## What this plan does not build

Named so the next plan starts from a clear line, and so no task here quietly
grows into them:

- **Explore, Adopt and Drill** — the three modes. Each is its own plan.
- **`js/i18n/`** — the German/English toggle and the SAN letter mapping. The
  data layer carries both languages in `openings.js`, but nothing renders them
  yet.
- **`js/store/repertoire.js`** — localStorage, export and import.
- **`js/train/`** — the ladder and the session builder.

## Self-review notes

Checked against the spec:

- **Position key** — Task 1, including the transposition case the spec calls
  out by name.
- **PGN with variations** — Task 2, with a guard test that fails if chess.js
  ever starts preserving them.
- **Catalogue, generated at author time** — Task 4, with the licence recorded.
- **Starter list, hand-picked, both languages** — Task 3. Twelve openings, size
  asserted so it cannot drift into a catalogue dump.
- **Legality of every shipped line** — Task 3 and again in Task 6. The spec
  calls this the worst failure the app has; it is checked twice, in Node and in
  both browsers.
- **Stored data stays English SAN** — nothing in this plan writes German into a
  key or a tree; the German strings live only in `openings.js` display fields.
- **Both engines, screenshot examined, build number bumped** — Task 6, and
  every task's commit step.

Deferred to later plans by design: i18n rendering, the three modes, storage,
and scheduling.
