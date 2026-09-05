// German and English, at the edge only.
//
// The rule that must not be broken (ADR 0009): stored data is always English
// SAN. Nothing here is ever written back into a position key, a repertoire or
// an export file — this module exists to turn English SAN into something Felix
// reads, on the way to the screen, and nowhere else.
//
// He is taught K D T L S B at his chess club. An app that showed him `N` for
// knight would work against his coach, which is why this is a feature and not
// a nicety.

const PIECES = { K: 'K', Q: 'D', R: 'T', B: 'L', N: 'S' };

// Translate one SAN move for display.
//
// Only the piece letter moves — never a file. `b` is both the German pawn
// letter and a file, so `Bb5` must become `Lb5` and not `LB5`: the two places a
// piece letter can appear are the front of the move and after a `=`, and
// nothing else in the string is touched.
export function san(move, lang) {
    if (lang !== 'de') return move;
    return move
        .replace(/^[KQRBN]/, (p) => PIECES[p])
        .replace(/=([KQRBN])/, (_, p) => `=${PIECES[p]}`);
}

// A `{en, de}` pair, in the language asked for. Missing data renders as
// nothing rather than as "undefined" on screen.
export function pick(pair, lang) {
    return pair?.[lang] ?? pair?.en ?? '';
}

const UI = {
    en: {
        'explain.showMe': 'Show me',
        'explain.stop': 'Stop',
        'explain.start': 'Start',
        'explain.again': 'Play it again',
        'explain.back': 'All openings',
        'explain.hintOff': 'Hint off',
        'explain.hintOn': 'Hint on',
        'explain.yourMove': 'Your move',
        'explain.notThisMove': 'In this opening the next move is',
        'explain.soon': 'Coming soon',
        'explain.forWhite': 'You play White',
        'explain.forBlack': 'You play Black',
        'list.title': 'Openings',
        'list.white': 'Playing White',
        'list.black': 'Playing Black',
        'lang.toggle': 'Deutsch',
    },
    de: {
        'explain.showMe': 'Zeig es mir',
        'explain.stop': 'Anhalten',
        'explain.start': 'Los',
        'explain.again': 'Nochmal spielen',
        'explain.back': 'Alle Eröffnungen',
        'explain.hintOff': 'Tipp aus',
        'explain.hintOn': 'Tipp an',
        'explain.yourMove': 'Du bist dran',
        'explain.notThisMove': 'In dieser Eröffnung kommt jetzt',
        'explain.soon': 'Kommt noch',
        'explain.forWhite': 'Du spielst Weiß',
        'explain.forBlack': 'Du spielst Schwarz',
        'list.title': 'Eröffnungen',
        'list.white': 'Mit Weiß',
        'list.black': 'Mit Schwarz',
        'lang.toggle': 'English',
    },
};

// A UI string. An unknown key returns itself, so a typo shows up on screen
// instead of leaving a blank where a label should be.
export function t(key, lang) {
    return UI[lang]?.[key] ?? UI.en[key] ?? key;
}

export const LANGUAGES = ['en', 'de'];
