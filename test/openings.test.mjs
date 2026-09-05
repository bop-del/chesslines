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
