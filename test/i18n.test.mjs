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

test('every tab and footer string exists in both languages', () => {
    // The tabs and the footer are chrome: a missing key would render as the key
    // itself on the list screen, which is the one screen every visit starts on.
    const keys = [
        'tabs.openings', 'tabs.mine', 'tabs.practise',
        'tabs.mineWhen', 'tabs.practiseWhen',
        'footer.export', 'footer.import', 'footer.importFailed',
        'explain.adopt', 'explain.adopted', 'list.mine',
    ];
    for (const key of keys) {
        for (const lang of ['en', 'de']) {
            assert.notEqual(t(key, lang), key, `${key} missing in ${lang}`);
        }
        assert.notEqual(t(key, 'en'), t(key, 'de'), `${key} is untranslated`);
    }
});

test('the two greyed tabs state two conditions, not one repeated', () => {
    // The first draft gave both "once you add an opening", which is false for
    // Practise: adopting opens Mine, and he could adopt, come back, and find
    // Practise still grey. Two tabs side by side saying the same words are one
    // condition duplicated rather than two routes.
    for (const lang of ['en', 'de']) {
        assert.notEqual(
            t('tabs.mineWhen', lang),
            t('tabs.practiseWhen', lang),
            `both greyed tabs state the same condition in ${lang}`,
        );
    }
});

test('a greyed tab names an action, never a clock', () => {
    // #47: "a greyed tab states a path he can act on, never a clock." Practise
    // is the one that could go wrong — its real condition is due-ness, and
    // saying so would be a locked door with no key.
    for (const lang of ['en', 'de']) {
        const practise = t('tabs.practiseWhen', lang).toLowerCase();
        for (const clock of ['due', 'fällig', 'tomorrow', 'morgen', 'wait', 'warte']) {
            assert.ok(!practise.includes(clock), `practise condition mentions "${clock}" in ${lang}`);
        }
    }
});

test('the adopt control says where the line goes, in his own words', () => {
    // "Add to my openings" / "In my openings" — the wording maps onto the Mine
    // tab without translation (#42). "Adopt" is not a word Felix owns, "Save"
    // sounds like a file, and "Learn this" promises a lesson that has not
    // happened; each names something other than the place the line lands. So
    // both labels have to carry the possessive and the word for an opening.
    const MINE = { en: 'my', de: 'meine' };
    for (const lang of ['en', 'de']) {
        const openings = t('tabs.openings', lang).toLowerCase();
        for (const key of ['explain.adopt', 'explain.adopted']) {
            const label = t(key, lang).toLowerCase();
            assert.ok(label.includes(MINE[lang]), `${key} is not possessive in ${lang}`);
            assert.ok(
                label.includes(openings.slice(0, -1)),
                `${key} does not name the openings in ${lang}`,
            );
        }
    }
});

test('the adopt control offers an act and then states a fact', () => {
    // Tapping turns the button into a statement, and that change *is* the whole
    // feedback (#42). Two labels that read the same would make the one piece of
    // feedback the design has invisible.
    for (const lang of ['en', 'de']) {
        assert.notEqual(
            t('explain.adopt', lang),
            t('explain.adopted', lang),
            `the two adopt labels are identical in ${lang}`,
        );
    }
});

test('nothing in the adopt control counts', () => {
    // The control cannot promise "4 new positions": a card is shared, so
    // adopting a second line may add nothing new (#48). A label that never
    // counted anything cannot mis-promise.
    for (const lang of ['en', 'de']) {
        for (const key of ['explain.adopt', 'explain.adopted']) {
            assert.ok(!/\d/.test(t(key, lang)), `${key} carries a number in ${lang}`);
        }
    }
});
