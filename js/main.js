// Entry point. Keep it small — wiring only, no logic.

import { Chess } from './vendor/chess.js';
import { Board } from './board/Board.js';
import { BUILD } from './version.js';
import { OPENINGS } from './data/openings.js';
import { nameOf, nameOfLine } from './data/catalogue.js';
import { parse } from './data/pgn.js';
import { key } from './data/position.js';

document.getElementById('build').textContent = BUILD;

const game = new Chess();
const board = new Board(document.getElementById('board'), {
    onMove(move) {
        game.move(move);
        board.render(game);
    },
});

board.flip('w');
document.getElementById('board').classList.add('coords');
board.render(game);

// Exposed for the verification run, which asserts on real game state rather
// than on what the UI claims about itself.
window.chesslines = { game, board, OPENINGS, nameOf, nameOfLine, parse, key };
