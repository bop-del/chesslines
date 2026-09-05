import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Walk } from '../js/train/walk.js';
import { OPENINGS } from '../js/data/openings.js';

const italian = OPENINGS.find((o) => o.id === 'italian-game');       // White, 9 plies
const scandi = OPENINGS.find((o) => o.id === 'scandinavian-defense'); // Black, 8 plies

test('a walk starts before the first move', () => {
    const w = new Walk(italian);
    assert.equal(w.played, 0);
    assert.equal(w.next.san, 'e4');
    assert.equal(w.done, false);
});

test('whose move it is follows the side the line is for', () => {
    // The Italian is taught from White, so White's moves are Felix's.
    const w = new Walk(italian);
    assert.equal(w.next.isOwn, true, 'e4 is his');
    w.play('e4');
    assert.equal(w.next.isOwn, false, 'e5 is the opponent’s');
});

test('a line taught from Black makes White’s moves the opponent’s', () => {
    // Four of the Scandinavian's eight moves belong to the opponent — the app
    // plays more of this line than Felix does.
    const w = new Walk(scandi);
    assert.equal(w.next.isOwn, false, 'e4 is White’s, and Felix is Black');
    w.play('e4');
    assert.equal(w.next.isOwn, true, 'd5 is his');

    const owned = scandi.moves.filter((_, i) => i % 2 === 1).length;
    assert.equal(owned, 4);
});

test('playing the line’s move advances and returns its text', () => {
    const w = new Walk(italian);
    const step = w.play('e4');
    assert.equal(step.ok, true);
    assert.equal(step.san, 'e4');
    assert.match(step.text.en, /middle/i);
    assert.equal(w.played, 1);
});

test('any other move is refused, and nothing advances', () => {
    // Explain is not a drill: the move simply does not happen.
    const w = new Walk(italian);
    const step = w.play('d4');
    assert.equal(step.ok, false);
    assert.equal(step.expected, 'e4');
    assert.equal(w.played, 0, 'the board must not have moved');
    assert.equal(w.next.san, 'e4', 'still waiting for the same move');
});

test('an illegal move is refused the same way as a wrong one', () => {
    const w = new Walk(italian);
    assert.equal(w.play('Qh9').ok, false);
    assert.equal(w.played, 0);
});

test('the walk ends after the last move and reports the ending', () => {
    const w = new Walk(italian);
    for (const m of italian.moves) w.play(m.san);
    assert.equal(w.done, true);
    assert.equal(w.next, null);
    assert.equal(w.ending, italian.ending);
});

test('playing past the end changes nothing', () => {
    const w = new Walk(italian);
    for (const m of italian.moves) w.play(m.san);
    const step = w.play('d5');
    assert.equal(step.ok, false);
    assert.equal(w.played, italian.moves.length);
});

test('the position is real chess, not a move counter', () => {
    // The walk drives a real game, so the board can render it and legality is
    // still chess.js's answer rather than ours.
    const w = new Walk(italian);
    w.play('e4');
    assert.match(w.fen, /^rnbqkbnr\/pppppppp\/8\/8\/4P3/);
});

test('reset returns a walk to the start', () => {
    const w = new Walk(italian);
    w.play('e4');
    w.play('e5');
    w.reset();
    assert.equal(w.played, 0);
    assert.equal(w.next.san, 'e4');
    assert.equal(w.done, false);
});

test('a line with no move texts cannot be walked', () => {
    // Nine of twelve ship inert. Constructing a walk over one is a programming
    // error, not a state the UI should try to render.
    const bare = OPENINGS.find((o) => !o.moves);
    assert.throws(() => new Walk(bare), /no move texts/i);
});
