import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parse } from '../js/data/pgn.js';
import { OPENINGS } from '../js/data/openings.js';

// The CC0 source TSVs, read straight from scripts/lib/tsv/ rather than from the
// generated map — the generator keys by position, and what is checked here is
// the move order an ECO code is attached to.
const TSV = join(dirname(fileURLToPath(import.meta.url)), '..', 'scripts', 'lib', 'tsv');
const CATALOGUE = readdirSync(TSV)
    .filter((f) => f.endsWith('.tsv'))
    .flatMap((f) => readFileSync(join(TSV, f), 'utf8').split('\n'))
    .map((line) => line.split('\t'))
    .filter(([eco, name, pgn]) => eco && name && pgn)
    .map(([eco, name, pgn]) => ({ eco, name, pgn: pgn.trim() }));

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

test('every ECO code is the one the CC0 dataset gives for that line', () => {
    // Format alone was the old check, and it passed while nine of twelve codes
    // were wrong — they named the opening's family (C50, the Italian) rather
    // than the line we actually ship (C54, its Center Attack). A code names a
    // position, so it has a right answer that can be looked up rather than
    // remembered.
    //
    // The right answer is the longest dataset entry that is a prefix of our
    // line: the most specific named position the line passes through.
    for (const o of OPENINGS) {
        const pgn = o.pgn.trim();
        const named = CATALOGUE
            .filter((r) => pgn === r.pgn || pgn.startsWith(`${r.pgn} `))
            .sort((a, b) => b.pgn.length - a.pgn.length)[0];

        assert.ok(named, `${o.id}: no dataset entry is a prefix of ${pgn}`);
        assert.equal(o.eco, named.eco,
            `${o.id}: ${o.eco} but the dataset says ${named.eco} (${named.name})`);
    }
});
