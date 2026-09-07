import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OPENINGS } from '../js/data/openings.js';
import { Repertoire } from '../js/data/repertoire.js';
import { KEY, load, save, filename, parseFile } from '../js/data/store.js';

const italian = OPENINGS.find((o) => o.id === 'italian-game');

// A localStorage stand-in. Node has none, and the two cases worth testing are
// exactly the ones a real browser makes hard to reach: a private window that
// refuses the write, and storage holding something this build cannot read.
function fake({ refuse = false } = {}) {
    const data = new Map();
    return {
        data,
        getItem: (k) => (data.has(k) ? data.get(k) : null),
        setItem(k, v) {
            if (refuse) throw new DOMException('QuotaExceededError');
            data.set(k, String(v));
        },
        removeItem: (k) => data.delete(k),
    };
}

test('the repertoire is one compact key', () => {
    // ADR 0008: one key, not one per card.
    const store = fake();
    const r = new Repertoire();
    r.adopt(italian);
    save(r, store);
    assert.deepEqual([...store.data.keys()], [KEY]);
});

test('what was saved is what loads back', () => {
    const store = fake();
    const r = new Repertoire();
    r.adopt(italian);
    r.grade(r.cards[0].key, { level: 3, best: 4, due: 11 });
    save(r, store);

    const back = load(OPENINGS, store);
    assert.deepEqual(back.toJSON(), r.toJSON());
});

test('nothing stored yet loads as an empty repertoire', () => {
    const r = load(OPENINGS, fake());
    assert.equal(r.cards.length, 0);
    assert.equal(r.lines.size, 0);
});

test('a refused write does not throw, and the app keeps its repertoire', () => {
    // A private window refuses the write. The visit must still work — the same
    // pattern the language and hint preferences already use.
    const store = fake({ refuse: true });
    const r = new Repertoire();
    r.adopt(italian);
    assert.equal(save(r, store), false);
    assert.equal(r.cards.length > 0, true, 'the in-memory repertoire was lost');
});

test('storage this build cannot read loads as empty rather than throwing', () => {
    const store = fake();
    for (const junk of ['not json at all', '{"cards":', 'null', '{"cards":{}}']) {
        store.data.set(KEY, junk);
        const r = load(OPENINGS, store);
        assert.equal(r.cards.length, 0, `"${junk}" did not load as empty`);
    }
});

test('a store that throws on read leaves the app working', () => {
    const angry = { getItem() { throw new DOMException('SecurityError'); }, setItem() {} };
    const r = load(OPENINGS, angry);
    assert.equal(r.cards.length, 0);
});

test('the export file is named for the day, so a same-day export overwrites', () => {
    // A fixed name leaves Safari to disambiguate with (1), (2), which tells you
    // nothing about age or content a month later (#41).
    assert.equal(filename(new Date('2026-09-08T21:30:00')), 'chesslines-2026-09-08.json');
    assert.equal(filename(new Date('2026-01-03T04:00:00')), 'chesslines-2026-01-03.json');
    assert.equal(
        filename(new Date('2026-09-08T06:00:00')),
        filename(new Date('2026-09-08T23:00:00')),
        'two exports on one day must produce one name',
    );
});

test('the file is the stored form, and reads back as one', () => {
    const r = new Repertoire();
    r.adopt(italian);
    const text = JSON.stringify(r.toJSON());
    assert.deepEqual(parseFile(text, OPENINGS).toJSON(), r.toJSON());
});

test('a file that is not a repertoire is refused with a reason', () => {
    for (const bad of ['', 'null', '[]', '{"hello":1}', 'not json']) {
        assert.throws(() => parseFile(bad, OPENINGS), /repertoire/i, `accepted ${bad}`);
    }
});
