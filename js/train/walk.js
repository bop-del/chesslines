// Walking one line, a move at a time.
//
// This is the state of an Explain session and nothing else: which move is due,
// whose it is, and what happens when a move arrives. It holds no DOM and no
// timers — the pause before an opponent's move belongs to the caller (ADR
// 0012), so this stays synchronous and testable.
//
// Legality is still chess.js's answer, not ours: the walk drives a real game,
// so the board renders a real position and a move that is not chess is refused
// by the engine rather than by a string comparison.

import { Chess } from '../vendor/chess.js';

export class Walk {
    #line;
    #game = new Chess();
    #played = 0;

    constructor(line) {
        if (!line?.moves?.length) {
            throw new Error(`${line?.id ?? 'line'}: no move texts, so it cannot be walked`);
        }
        this.#line = line;
    }

    // The move the line is waiting for, or null at the end.
    //
    // `isOwn` is the question the UI actually asks: Felix plays his own moves,
    // and the app plays the opponent's. It is not "is it White's turn" — the
    // Scandinavian is taught from Black, so four of its eight moves are the
    // opponent's and the app plays more of that line than he does.
    get next() {
        const move = this.#line.moves[this.#played];
        if (!move) return null;
        return {
            san: move.san,
            text: { en: move.en, de: move.de },
            isOwn: this.#game.turn() === this.#line.side,
        };
    }

    get played() {
        return this.#played;
    }

    get done() {
        return this.#played >= this.#line.moves.length;
    }

    get fen() {
        return this.#game.fen();
    }

    get game() {
        return this.#game;
    }

    get line() {
        return this.#line;
    }

    get ending() {
        return this.#line.ending;
    }

    // Offer a move.
    //
    // Only the line's move is accepted. Anything else — a legal move that is
    // not this line's, or a move that is not chess at all — is refused
    // identically: the piece does not move and nothing advances. Explain is not
    // a drill, so a refusal records nothing and costs nothing; the caller shows
    // `expected` and lets him try again.
    play(san) {
        const due = this.next;
        if (!due) return { ok: false, expected: null };
        if (san !== due.san) return { ok: false, expected: due.san };

        this.#game.move(due.san);
        this.#played += 1;
        return { ok: true, san: due.san, text: due.text, isOwn: due.isOwn };
    }

    reset() {
        this.#game = new Chess();
        this.#played = 0;
    }
}
