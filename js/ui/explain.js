// Explain: walk a line, one move at a time.
//
// Felix plays his own moves; the app plays the opponent's. The opponent waits
// before moving, so the text explaining *why* it does that is not replaced
// while the previous one is still being read.
//
// That pause is a constructor parameter and not a constant (ADR 0012): the app
// passes about a second, the verification run passes zero. The checks assert
// order — the right move, with the right text, after the right one — never a
// duration, so no timing enters the suite.

import { Walk } from '../train/walk.js';
import { pick, san, t } from '../i18n/i18n.js';

export class Explain {
    #root;
    #board;
    #onBack;
    #pause;
    #walk = null;
    #lang = 'en';
    #showing = false;
    #timer = null;
    #shown = null; // the {en, de} pair on screen, so a language switch can redraw it
    #els = {};

    constructor(root, { board, onBack, pause = 900 }) {
        this.#root = root;
        this.#board = board;
        this.#onBack = onBack;
        this.#pause = pause;
        this.#build();
    }

    #build() {
        const el = (tag, className, parent) => {
            const node = document.createElement(tag);
            if (className) node.className = className;
            parent?.append(node);
            return node;
        };

        const head = el('div', 'explain-head', this.#root);
        this.#els.back = el('button', 'back', head);
        this.#els.title = el('h2', 'explain-title', head);
        this.#els.side = el('p', 'explain-side', head);
        this.#els.intro = el('p', 'explain-intro', this.#root);

        // The move text sits *above* the board. Below it, on a phone, reading
        // the sentence pushes the position out of view — and the sentence is
        // about the position, so they have to be seen together.
        this.#els.text = el('p', 'explain-text', this.#root);
        this.#els.text.setAttribute('aria-live', 'polite');
        this.#els.slot = el('div', 'explain-board', this.#root);

        const controls = el('div', 'explain-controls', this.#root);
        this.#els.show = el('button', 'show', controls);
        this.#els.again = el('button', 'again', controls);

        this.#els.back.addEventListener('click', () => this.#onBack());
        this.#els.show.addEventListener('click', () => this.#toggleShow());
        this.#els.again.addEventListener('click', () => this.#restart());
    }

    // Called by whoever owns the board, with the move the user tapped.
    //
    // The board is inert while it is not his turn. Without that guard a tap
    // during the opponent's pause reaches the walk, which only compares SAN and
    // does not care whose move it is: tapping the opponent's move would play it,
    // and the timer already pending would then play his *next* move for him. He
    // would lose his turn to the app.
    offer(move) {
        if (!this.#walk || this.#showing) return;
        if (this.#timer !== null) return;
        if (!this.#walk.next?.isOwn) return;
        const step = this.#walk.play(move.san);

        if (!step.ok) {
            if (step.expected) {
                this.#say(`${t('explain.notThisMove', this.#lang)} ${san(step.expected, this.#lang)}.`);
            }
            return;
        }

        this.#afterMove(step);
    }

    start(line, lang) {
        this.#stopTimer();
        this.#lang = lang;
        this.#walk = new Walk(line);
        this.#showing = false;

        this.#els.title.textContent = pick(line.name, lang);
        this.#els.side.textContent = t(line.side === 'w' ? 'explain.forWhite' : 'explain.forBlack', lang);
        this.#els.intro.textContent = pick(line.intro, lang);
        this.#els.intro.hidden = false;

        this.#els.slot.append(this.#board.root);
        this.#board.flip(line.side);
        this.#board.render(this.#walk.game);

        this.#labels();
        this.#say(t('explain.yourMove', this.#lang));
        this.#advance();
    }

    stop() {
        this.#stopTimer();
        this.#walk = null;
        this.#showing = false;
    }

    setLanguage(lang) {
        this.#lang = lang;
        if (!this.#walk) return;
        const line = this.#walk.line;
        this.#els.title.textContent = pick(line.name, lang);
        this.#els.side.textContent = t(line.side === 'w' ? 'explain.forWhite' : 'explain.forBlack', lang);
        this.#els.intro.textContent = pick(line.intro, lang);
        // The sentence on screen has to follow too. Without this the move text
        // stays in the language it was written in while everything around it
        // switches — which is exactly what a child switching to German sees.
        if (this.#shown) this.#els.text.textContent = pick(this.#shown, lang);
        this.#labels();
    }

    #labels() {
        this.#els.back.textContent = t('explain.back', this.#lang);
        this.#els.show.textContent = t(this.#showing ? 'explain.stop' : 'explain.showMe', this.#lang);
        this.#els.again.textContent = t('explain.again', this.#lang);
        this.#els.again.hidden = !this.#walk?.done;
    }

    #afterMove(step) {
        // The intro has done its job once the line is moving, and it is five
        // lines tall on a phone. Fold it away rather than push the board down.
        this.#els.intro.hidden = true;
        this.#board.render(this.#walk.game);
        this.#say(step.text);
        this.#advance();
    }

    // Drive whatever the walk needs next: the ending, the opponent's move after
    // its pause, or nothing at all while it is Felix's turn.
    #advance() {
        this.#labels();

        if (this.#walk.done) {
            this.#showing = false;
            this.#stopTimer();
            // The ending is appended rather than scheduled. Scheduling it would
            // replace the last move's sentence after one pause — the very thing
            // the pause exists to prevent.
            const ending = pick(this.#walk.ending, this.#lang);
            if (ending) this.#els.text.textContent += ` ${ending}`;
            return;
        }

        if (!this.#walk.next.isOwn || this.#showing) {
            this.#later(() => this.#playForward());
        }
    }

    #playForward() {
        if (!this.#walk || this.#walk.done) return;
        const step = this.#walk.play(this.#walk.next.san);
        if (step.ok) this.#afterMove(step);
    }

    #toggleShow() {
        if (!this.#walk) return;
        if (this.#walk.done) return this.#restart();

        this.#showing = !this.#showing;
        this.#labels();
        if (this.#showing) this.#later(() => this.#playForward());
        else this.#stopTimer();
    }

    #restart() {
        this.#stopTimer();
        this.#showing = false;
        this.#walk.reset();
        this.#els.intro.hidden = false;
        this.#board.render(this.#walk.game);
        this.#say(t('explain.yourMove', this.#lang));
        this.#advance();
    }

    // Pass a {en, de} pair where one exists, so a language switch can redraw it;
    // a plain string is a UI message and has already been translated.
    #say(text) {
        if (typeof text === 'string') {
            this.#shown = null;
            this.#els.text.textContent = text;
            return;
        }
        this.#shown = text;
        this.#els.text.textContent = pick(text, this.#lang);
    }

    // The one place a clock is involved. A zero pause still defers by a tick,
    // so the caller never re-enters the walk from inside its own move handler.
    #later(fn) {
        this.#stopTimer();
        this.#timer = setTimeout(() => {
            this.#timer = null;
            fn();
        }, this.#pause);
    }

    #stopTimer() {
        if (this.#timer !== null) {
            clearTimeout(this.#timer);
            this.#timer = null;
        }
    }
}
