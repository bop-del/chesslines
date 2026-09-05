// Entry point. Keep it small — wiring only, no logic.

import { Chess } from './vendor/chess.js';
import { Board } from './board/Board.js';
import { BUILD } from './version.js';
import { OPENINGS } from './data/openings.js';
import { nameOf, nameOfLine } from './data/catalogue.js';
import { parse } from './data/pgn.js';
import { key } from './data/position.js';
import { Walk } from './train/walk.js';
import { List } from './ui/list.js';
import { Explain } from './ui/explain.js';
import { LANGUAGES, san, t } from './i18n/i18n.js';

document.getElementById('build').textContent = BUILD;

// Language is a per-user preference, defaulting to the browser's. Not in the
// URL: a shared link would carry the sender's language, which is wrong (ADR
// 0009).
const stored = (() => {
    try {
        return localStorage.getItem('lang');
    } catch {
        return null;
    }
})();
let lang = LANGUAGES.includes(stored)
    ? stored
    : (navigator.language ?? 'en').startsWith('de') ? 'de' : 'en';

// The move hint is a per-viewer preference too, defaulting to on, and stored
// the same way and for the same reason as the language: one global value, not
// one per line, and not in the URL — a shared link would carry the sender's
// setting (ADR 0009's reasoning, applied). Nothing in the app ever suggests
// turning it off; that is the no-streak rule, and it is why there is no
// counter anywhere near this.
const hint = (() => {
    try {
        return localStorage.getItem('hint') !== 'off';
    } catch {
        return true;
    }
})();

const listEl = document.getElementById('list-screen');
const listBody = document.getElementById('list');
const explainEl = document.getElementById('explain');
const toggle = document.getElementById('lang');
const boardHome = document.getElementById('board-home');

// The game the list screen shows, and the one the board checks drive directly.
// It is not the game the Explain walk owns — that one is private to the walk.
const game = new Chess();

const board = new Board(document.getElementById('board'), {
    // On the list screen the board is a free board: moves just play, so a child
    // who taps it gets a chessboard rather than a dead surface. Once a line
    // takes the board, Explain owns the move and decides whether to accept it.
    onMove(move) {
        if (explainEl.hidden) {
            game.move(move);
            board.render(game);
            return;
        }
        explain.offer(move);
    },
});
board.root.classList.add('coords');

// The pause before an opponent's move is a parameter, not a constant, so the
// verification run can set it to zero and assert order rather than duration
// (ADR 0012). `?pause=0` is the only way in — nothing in the UI sets it.
const asked = new URLSearchParams(location.search).get('pause');
const pause = asked === null || asked === '' ? 900 : Number(asked);

const explain = new Explain(explainEl, {
    board,
    onBack: () => showList(),
    pause: Number.isFinite(pause) ? pause : 900,
    hint,
    onHint(on) {
        try {
            localStorage.setItem('hint', on ? 'on' : 'off');
        } catch {
            // A private window refuses this. The switch still works for this visit.
        }
    },
});

const list = new List(listBody, {
    onPick: (id) => showLine(OPENINGS.find((o) => o.id === id)),
});

function showList() {
    explain.stop();
    explainEl.hidden = true;
    listEl.hidden = false;
    // Take the board back from the Explain screen and show a fresh position.
    boardHome.append(board.root);
    game.reset();
    board.flip('w');
    board.render(game);
    document.getElementById('list-title').textContent = t('list.title', lang);
    list.render(OPENINGS, lang);
}

function showLine(line) {
    listEl.hidden = true;
    explainEl.hidden = false;
    explain.start(line, lang);
}

toggle.addEventListener('click', () => {
    lang = lang === 'de' ? 'en' : 'de';
    try {
        localStorage.setItem('lang', lang);
    } catch {
        // A private window refuses this. The toggle still works for this visit.
    }
    toggle.textContent = t('lang.toggle', lang);
    explain.setLanguage(lang);
    if (!listEl.hidden) showList();
});

toggle.textContent = t('lang.toggle', lang);
showList();

// Exposed for the verification run, which asserts on real state rather than on
// what the UI claims about itself.
window.chesslines = {
    game, board, OPENINGS, nameOf, nameOfLine, parse, key, Walk, san, t,
    get lang() {
        return lang;
    },
    explain,
    showLine: (id) => showLine(OPENINGS.find((o) => o.id === id)),
    showList,
};
