import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from '../js/vendor/chess.js';
import { key } from '../js/data/position.js';
import { OPENINGS } from '../js/data/openings.js';
import { Repertoire, cardsFor, TODAY } from '../js/data/repertoire.js';

const line = (id) => OPENINGS.find((o) => o.id === id);
const italian = line('italian-game');
const ruy = line('ruy-lopez');
const scandi = line('scandinavian-defense');

// The position after 1. e4 e5 — shared by five of the twelve lines, and the
// concrete case ADR 0007 is about.
const AFTER_E4_E5 = 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -';
const START = key(new Chess().fen());

test('a card exists for every position where he moves, and nowhere else', () => {
    // Half the Italian's nine plies are the opponent's. A card for a position
    // he never answers is a row nothing can read, and it would make any count
    // of progress mean the wrong thing (#35).
    const cards = cardsFor(italian);
    const own = italian.moves.filter((_, i) => i % 2 === 0).length;
    assert.equal(cards.length, own);

    const game = new Chess();
    const keys = [];
    for (const m of italian.moves) {
        if (game.turn() === italian.side) keys.push(key(game.fen()));
        game.move(m.san);
    }
    assert.deepEqual(cards.map((c) => c.key), keys);
});

test('a line taught from Black gets cards for Black’s moves', () => {
    // The Scandinavian's first card is after 1. e4, not before it: White moves
    // first and the app plays that move.
    const cards = cardsFor(scandi);
    assert.notEqual(cards[0].key, START);
    assert.ok(cards[0].key.includes(' b '), `first card is not Black to move: ${cards[0].key}`);
    assert.equal(cards.length, scandi.moves.filter((_, i) => i % 2 === 1).length);
});

test('adopting a line writes its cards, each carrying the line id', () => {
    const r = new Repertoire();
    r.adopt(italian);
    assert.deepEqual([...r.lines], ['italian-game']);
    assert.equal(r.cards.length, cardsFor(italian).length);
    for (const card of r.cards) {
        assert.deepEqual(card.lines, ['italian-game']);
        assert.equal(card.level, 0);
        assert.equal(card.best, 0);
    }
});

test('a position two lines reach is one card carrying both ids', () => {
    // Practise 1. e4 in the Italian and he has practised it in the Ruy Lopez —
    // it is the same position and the same answer (ADR 0007).
    const r = new Repertoire();
    r.adopt(italian);
    r.adopt(ruy);

    const shared = r.card(AFTER_E4_E5);
    assert.ok(shared, 'no card for the position after 1. e4 e5');
    assert.deepEqual(shared.lines.slice().sort(), ['italian-game', 'ruy-lopez']);

    const keys = r.cards.map((c) => c.key);
    assert.equal(new Set(keys).size, keys.length, 'a position produced two cards');
});

test('adopting a second line adds fewer cards than it has moves', () => {
    // The measured reason cards are shared at all: the Ruy Lopez brings its own
    // moves but not its own openings.
    const r = new Repertoire();
    r.adopt(italian);
    const before = r.cards.length;
    r.adopt(ruy);
    assert.ok(
        r.cards.length - before < cardsFor(ruy).length,
        `the Ruy Lopez added ${r.cards.length - before} of its ${cardsFor(ruy).length} cards`,
    );
});

test('adopting the same line twice changes nothing', () => {
    const r = new Repertoire();
    r.adopt(italian);
    const cards = r.cards.length;
    r.adopt(italian);
    assert.equal(r.cards.length, cards);
    assert.deepEqual(r.card(START).lines, ['italian-game']);
});

test('adopting does not disturb progress already made', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(START, { level: 3, best: 3, due: 12 });
    r.adopt(ruy);
    const card = r.card(START);
    assert.equal(card.level, 3, 'a shared card was reset by the second line');
    assert.equal(card.best, 3);
    assert.equal(card.due, 12);
});

test('removing a line drops its id and keeps every card', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.adopt(ruy);
    const total = r.cards.length;

    r.remove('italian-game');
    assert.deepEqual([...r.lines], ['ruy-lopez']);
    assert.equal(r.cards.length, total, 'removing a line deleted cards');
    assert.deepEqual(r.card(AFTER_E4_E5).lines, ['ruy-lopez']);
});

test('a card no adopted line points at is dormant, and nothing stored says so', () => {
    // Dormancy is derived at read time, so a card cannot be wrong about its own
    // state (#38).
    const r = new Repertoire();
    r.adopt(italian);
    r.remove('italian-game');

    const card = r.card(START);
    assert.equal(r.isDormant(card), true);
    assert.equal('dormant' in card, false, 'dormancy was stored on the card');
    assert.equal(JSON.stringify(r).includes('dormant'), false, 'dormancy reached the stored form');
});

test('a dormant card keeps its level, best level and due day, and wakes unchanged', () => {
    // Tidying up must cost a nine-year-old nothing.
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(START, { level: 4, best: 5, due: 30 });

    r.remove('italian-game');
    const asleep = r.card(START);
    assert.deepEqual(
        [asleep.level, asleep.best, asleep.due],
        [4, 5, 30],
        'removing the line changed the card',
    );

    r.adopt(italian);
    const awake = r.card(START);
    assert.equal(r.isDormant(awake), false);
    assert.deepEqual([awake.level, awake.best, awake.due], [4, 5, 30]);
});

test('a shared card stays live when only one of its lines goes', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.adopt(ruy);
    r.remove('italian-game');
    assert.equal(r.isDormant(r.card(AFTER_E4_E5)), false, 'the Ruy Lopez still needs it');
});

test('only live cards that are due are scheduled', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(START, { level: 1, best: 1, due: TODAY() + 5 });
    const due = r.due(TODAY());
    assert.equal(due.some((c) => c.key === START), false, 'a card due in five days was scheduled');
    assert.ok(due.length > 0, 'nothing was scheduled at all');

    r.remove('italian-game');
    assert.deepEqual(r.due(TODAY()), [], 'dormant cards were scheduled');
});

// ─── Import ──────────────────────────────────────────────────────────────────
// Merge, never ask: the app cannot tell "restore this" from "combine this", and
// merge is the only answer that cannot lose anything (#40).

test('import unions the lines', () => {
    const r = new Repertoire();
    r.adopt(italian);

    const other = new Repertoire();
    other.adopt(ruy);

    r.merge(other.toJSON(), OPENINGS);
    assert.deepEqual([...r.lines].sort(), ['italian-game', 'ruy-lopez']);
});

test('import takes the higher current level and the higher best level', () => {
    // Independently: the meter only goes up, so a file with a lower best level
    // must not lower it through the back door (#39, #40).
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(START, { level: 2, best: 6, due: 10 });

    const file = new Repertoire();
    file.adopt(italian);
    file.grade(START, { level: 5, best: 3, due: 40 });

    r.merge(file.toJSON(), OPENINGS);
    const card = r.card(START);
    assert.equal(card.level, 5, 'the higher current level should win');
    assert.equal(card.best, 6, 'the higher best level should win');
});

test('a card only in the file arrives whole', () => {
    const r = new Repertoire();
    const file = new Repertoire();
    file.adopt(scandi);
    file.grade(file.cards[0].key, { level: 3, best: 4, due: 7 });

    r.merge(file.toJSON(), OPENINGS);
    const card = r.card(file.cards[0].key);
    assert.deepEqual([card.level, card.best, card.due], [3, 4, 7]);
});

test('importing into an empty repertoire is the restore case, and loses nothing', () => {
    const file = new Repertoire();
    file.adopt(italian);
    file.adopt(scandi);
    file.grade(START, { level: 4, best: 4, due: 22 });

    const r = new Repertoire();
    r.merge(file.toJSON(), OPENINGS);
    assert.deepEqual(r.toJSON(), file.toJSON());
});

test('a line this build does not know is dropped, and its cards import anyway', () => {
    // openings.js ships with the app. An older export can name a line that no
    // longer exists — refusing would lose everything on a wiped device, which
    // is the case export exists for (#40).
    const file = new Repertoire();
    file.adopt(italian);
    const doc = file.toJSON();
    doc.lines.push('kings-head-gambit');
    doc.cards[0].lines.push('kings-head-gambit');
    doc.cards.push({ key: 'k7/8/8/8/8/8/8/K7 w - -', level: 3, best: 3, due: 9, lines: ['kings-head-gambit'] });

    const r = new Repertoire();
    r.merge(doc, OPENINGS);

    assert.deepEqual([...r.lines], ['italian-game'], 'the unknown line was adopted');
    const orphan = r.card('k7/8/8/8/8/8/8/K7 w - -');
    assert.ok(orphan, 'the unknown line’s card was refused');
    assert.equal(orphan.level, 3, 'its progress was lost');
    assert.equal(r.isDormant(orphan), true, 'it should arrive dormant');
    assert.deepEqual(orphan.lines, [], 'the unknown id survived on the card');
});

test('import wakes a card whose line the file brings back', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(START, { level: 3, best: 3, due: 8 });
    r.remove('italian-game');
    assert.equal(r.isDormant(r.card(START)), true);

    const file = new Repertoire();
    file.adopt(italian);
    r.merge(file.toJSON(), OPENINGS);

    assert.equal(r.isDormant(r.card(START)), false);
    assert.equal(r.card(START).level, 3, 'the local progress was overwritten');
});

test('a malformed file is refused rather than half-applied', () => {
    const r = new Repertoire();
    r.adopt(italian);
    const before = r.toJSON();
    for (const bad of [null, {}, { lines: 'italian-game' }, { cards: {} }, 'chesslines']) {
        assert.throws(() => r.merge(bad, OPENINGS), /repertoire/i, `accepted ${JSON.stringify(bad)}`);
    }
    assert.deepEqual(r.toJSON(), before, 'a refused import changed the repertoire');
});

// ─── The stored form ─────────────────────────────────────────────────────────

test('the stored form round-trips through JSON', () => {
    const r = new Repertoire();
    r.adopt(italian);
    r.adopt(scandi);
    r.grade(START, { level: 2, best: 3, due: 19 });

    const back = Repertoire.from(JSON.parse(JSON.stringify(r.toJSON())), OPENINGS);
    assert.deepEqual(back.toJSON(), r.toJSON());
});

test('every stored move is English SAN', () => {
    // ADR 0009's rule, asserted on the whole stored document: a German piece
    // letter must never reach a position key or an export file.
    const r = new Repertoire();
    for (const o of OPENINGS) r.adopt(o);
    const text = JSON.stringify(r.toJSON());
    assert.equal(/[DTLS][a-h1-8]/.test(text), false, `German notation in the stored form: ${text.slice(0, 200)}`);
});

test('the stored form carries no record of when he last exported', () => {
    // That would be the seed of the reminder #41 rules out.
    const r = new Repertoire();
    r.adopt(italian);
    const text = JSON.stringify(r.toJSON()).toLowerCase();
    for (const word of ['exported', 'lastexport', 'streak', 'seen', 'history']) {
        assert.equal(text.includes(word), false, `the stored form mentions "${word}"`);
    }
});

test('the stored form stays small', () => {
    // ~90 bytes a card was the measured figure the storage decision rests on.
    const r = new Repertoire();
    for (const o of OPENINGS) r.adopt(o);
    const bytes = JSON.stringify(r.toJSON()).length;
    assert.ok(bytes / r.cards.length < 200, `${Math.round(bytes / r.cards.length)} bytes a card`);
});
