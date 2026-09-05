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
    //
    // The variation opens directly after 1... Nf6, because that is the move it
    // is an alternative to. Written any later it would rewind to the wrong ply
    // — which the parser rejects as an illegal line, correctly.
    const root = parse('1. d4 Nf6 (1... d5 2. c4 e6 3. Nc3 Nf6) 2. c4 e6 3. Nc3 d5');
    const afterD4 = root.children[0];
    const viaNf6 = afterD4.children[0];
    const viaD5 = afterD4.children[1];
    assert.equal(viaNf6.san, 'Nf6');
    assert.equal(viaD5.san, 'd5');

    const leaf = (n) => { while (n.children.length) n = n.children[0]; return n; };
    assert.notEqual(leaf(viaNf6).fen, leaf(viaD5).fen, 'full FENs should differ');
    assert.equal(leaf(viaNf6).key, leaf(viaD5).key, 'four-field keys should match');
});

test('rejects an illegal move rather than failing silently', () => {
    // A typo in a repertoire must be loud. Silence here teaches a child a move
    // that does not exist.
    assert.throws(() => parse('1. e4 e5 2. Ke3'), /Ke3/);
});
