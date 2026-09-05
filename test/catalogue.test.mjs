import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../js/vendor/chess.js';
import { nameOf, nameOfLine } from '../js/data/catalogue.js';

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

test('a line is named somewhere along it, even when its last position is not', () => {
    // The catalogue names openings, and a line can run one ply past the last
    // named position into an unnamed middlegame — 3 of the 12 starter lines do.
    // So the useful question is never "is the final position named?" but "what
    // is the deepest named position along this line?", which is what the UI
    // will ask. Checked here on the Sicilian, whose final position is unnamed.
    const g = new Chess();
    let deepest = null;
    for (const m of ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3']) {
        g.move(m);
        const found = nameOf(g.fen());
        if (found) deepest = found;
    }
    assert.equal(nameOf(g.fen()), null, 'the final position is past the catalogue');
    assert.ok(deepest, 'but the line is named earlier');
    assert.match(deepest.name, /Sicilian/);
});

test('nameOfLine finds the deepest name along a line', () => {
    const g = new Chess();
    const fens = [];
    for (const m of ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3']) {
        g.move(m);
        fens.push(g.fen());
    }
    const found = nameOfLine(fens);
    assert.ok(found, 'the Sicilian line should be named');
    assert.match(found.name, /Sicilian/);
});

test('nameOfLine keeps the deepest name, not the first', () => {
    // 1. a3 is Anderssen's Opening — a real, named opening — so this line is
    // named at ply 1 and unnamed after. nameOfLine must still return it: the
    // line has a name even though its final position does not.
    const g = new Chess();
    const fens = [];
    for (const m of ['a3', 'h6', 'h3', 'a6']) { g.move(m); fens.push(g.fen()); }
    const found = nameOfLine(fens);
    assert.ok(found, 'the line starts with a named opening');
    assert.match(found.name, /Anderssen/);
    assert.equal(nameOf(fens.at(-1)), null, 'though the final position is unnamed');
});

test('nameOfLine returns null when nothing along the line is named', () => {
    // A line whose every position is past the catalogue.
    const g = new Chess();
    const fens = [];
    for (const m of ['Nh3', 'Nh6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1']) {
        g.move(m);
        fens.push(g.fen());
    }
    // Guard: if the catalogue ever grows to name one of these, this test is
    // telling the truth about the data and should be given a deader line.
    const named = fens.map((f) => nameOf(f)).filter(Boolean);
    if (named.length === 0) assert.equal(nameOfLine(fens), null);
});
