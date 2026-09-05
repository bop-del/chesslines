import { test } from 'node:test';
import assert from 'node:assert/strict';
import { san, t, pick } from '../js/i18n/i18n.js';

test('German uses German piece letters', () => {
    // The reason this exists: Felix is taught K D T L S B at his club, and an
    // app that showed him N for knight would work against his coach.
    assert.equal(san('Nf3', 'de'), 'Sf3');
    assert.equal(san('Qd8', 'de'), 'Dd8');
    assert.equal(san('Rae1', 'de'), 'Tae1');
    assert.equal(san('Bg5', 'de'), 'Lg5');
    assert.equal(san('Kxe2', 'de'), 'Kxe2');
});

test('English is returned untouched', () => {
    for (const m of ['Nf3', 'Qd8', 'Rae1', 'Bg5', 'O-O', 'exd5', 'e8=Q+']) {
        assert.equal(san(m, 'en'), m);
    }
});

test('only the piece letter changes — files, ranks and marks survive', () => {
    // b is a file letter as well as the German pawn letter. Translating the
    // square would turn Bb5 into Lb5 and then, wrongly, into LB5.
    assert.equal(san('Bb5', 'de'), 'Lb5');
    assert.equal(san('Nbd7', 'de'), 'Sbd7');
    assert.equal(san('Qxb7+', 'de'), 'Dxb7+');
    assert.equal(san('Rxd8#', 'de'), 'Txd8#');
});

test('castling and pawn moves carry no piece letter', () => {
    assert.equal(san('O-O', 'de'), 'O-O');
    assert.equal(san('O-O-O', 'de'), 'O-O-O');
    assert.equal(san('e4', 'de'), 'e4');
    assert.equal(san('exd5', 'de'), 'exd5');
});

test('promotion names the German piece too', () => {
    assert.equal(san('e8=Q', 'de'), 'e8=D');
    assert.equal(san('bxa1=N+', 'de'), 'bxa1=S+');
});

test('UI strings come back in the asked-for language', () => {
    assert.equal(typeof t('explain.showMe', 'en'), 'string');
    assert.notEqual(t('explain.showMe', 'en'), t('explain.showMe', 'de'));
});

test('a missing key returns the key rather than empty space', () => {
    // A wrong key should be visible in the UI, not silently blank.
    assert.equal(t('no.such.key', 'en'), 'no.such.key');
});

test('pick returns the field for the language', () => {
    const named = { en: 'Italian Game', de: 'Italienische Partie' };
    assert.equal(pick(named, 'de'), 'Italienische Partie');
    assert.equal(pick(named, 'en'), 'Italian Game');
    assert.equal(pick(undefined, 'de'), '');
});
