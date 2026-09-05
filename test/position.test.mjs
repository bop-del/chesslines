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
