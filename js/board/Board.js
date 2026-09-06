// The board: 64 squares, twelve piece symbols, tap to move.
//
// Deliberately hand-written rather than vendored (ADR 0003). A board bug puts a
// piece on the wrong square and you see it immediately; that visibility is what
// makes this safe to own, and it is the opposite of the engine's failure mode.
//
// Tap-to-move only. There is no drag, by decision, not omission — HTML5
// drag-and-drop does not fire from touch on iPhone at all, and a dropped drag
// on a phone is a small frustration in something meant to encourage. Two taps
// are also unambiguous for a child, and reachable by keyboard and screen reader
// in a way drag never is.

import { overlay, draw } from './arrow.js';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

// chess.js reports pieces as {type: 'k', color: 'w'}; the sprite ids are 'wK'.
const symbolId = ({ color, type }) => color + type.toUpperCase();

export class Board {
    #root;
    #squares = new Map(); // 'e4' → <div>
    #orientation = 'w';
    #selected = null;
    #targets = new Map(); // 'e4' → move object, the legal moves from #selected
    #onMove;
    #arrows; // the SVG overlay the move arrow is drawn into

    // `onMove(move)` is called with the chess.js move object the user chose.
    // The board never mutates game state itself — it renders what it is given
    // and reports intent. Whoever owns the game decides what happens next.
    constructor(root, { onMove } = {}) {
        this.#root = root;
        this.#onMove = onMove;
        this.#build();
    }

    #build() {
        this.#root.classList.add('board');
        this.#root.setAttribute('role', 'grid');
        this.#root.setAttribute('aria-label', 'Chessboard');

        for (const rank of RANKS) {
            for (const file of FILES) {
                const name = file + rank;
                const el = document.createElement('div');
                el.className = 'square';
                el.dataset.square = name;
                // Coordinate labels are drawn by CSS off these, on the edge
                // squares only — the board's left file and bottom rank.
                if (file === 'a') el.dataset.rank = rank;
                if (rank === '1') el.dataset.file = file;
                // Dark squares: a1 is dark, and colour alternates with file+rank.
                const dark = (FILES.indexOf(file) + RANKS.indexOf(rank)) % 2 === 1;
                el.classList.add(dark ? 'dark' : 'light');
                el.setAttribute('role', 'gridcell');
                this.#squares.set(name, el);
                this.#root.append(el);
            }
        }

        // The arrow overlay, last so it paints over the squares. It is out of
        // flow and `pointer-events: none`, so it neither disturbs the grid nor
        // takes the taps that belong to the squares underneath (issue #27).
        this.#arrows = overlay();
        this.#root.append(this.#arrows);

        // One listener on the board rather than 64 on the squares. Click covers
        // taps too — iOS synthesises it, and the 350ms delay is long gone for
        // pages declaring width=device-width.
        this.#root.addEventListener('click', (e) => {
            const el = e.target.closest('.square');
            if (el) this.#tap(el.dataset.square);
        });
    }

    // Render a position. `game` is a chess.js instance; the board reads from it
    // but never writes to it.
    render(game) {
        this.#game = game;
        for (const [name, el] of this.#squares) {
            const piece = game.get(name);
            el.replaceChildren();
            el.classList.toggle('occupied', Boolean(piece));
            if (!piece) {
                el.removeAttribute('aria-label');
                continue;
            }
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('class', 'piece');
            svg.setAttribute('viewBox', '0 0 45 45');
            svg.setAttribute('aria-hidden', 'true');
            const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
            use.setAttribute('href', `#${symbolId(piece)}`);
            svg.append(use);
            el.append(svg);
            el.setAttribute('aria-label', `${name} ${describe(piece)}`);
        }
        this.#clearSelection();
    }

    #game = null;

    // The whole interaction, in one place: first tap selects, second tap moves.
    #tap(name) {
        // Second tap on a legal target — that is a move.
        const move = this.#targets.get(name);
        if (move) {
            this.#clearSelection();
            this.#onMove?.(move);
            return;
        }

        // Tapping the selected piece again deselects it. Forgiving, and a child
        // will do it constantly.
        if (this.#selected === name) {
            this.#clearSelection();
            return;
        }

        this.#select(name);
    }

    #select(name) {
        this.#clearSelection();
        if (!this.#game) return;

        const piece = this.#game.get(name);
        // Only the side to move can be picked up. Tapping the opponent's piece
        // does nothing rather than erroring — silence is the right feedback.
        if (!piece || piece.color !== this.#game.turn()) return;

        const moves = this.#game.moves({ square: name, verbose: true });
        if (moves.length === 0) return;

        this.#selected = name;
        this.#squares.get(name)?.classList.add('selected');

        for (const move of moves) {
            // Promotions arrive as four moves to the same square. Keep the first
            // and let whoever handles onMove ask which piece — the board should
            // not own that dialog.
            if (this.#targets.has(move.to)) continue;
            this.#targets.set(move.to, move);
            const el = this.#squares.get(move.to);
            el?.classList.add(move.captured ? 'capture' : 'target');
        }
    }

    #clearSelection() {
        if (this.#selected) this.#squares.get(this.#selected)?.classList.remove('selected');
        for (const name of this.#targets.keys()) {
            this.#squares.get(name)?.classList.remove('target', 'capture');
        }
        this.#selected = null;
        this.#targets.clear();
    }

    // Mark squares — the trainer uses this to show the move it expected after a
    // mistake, which is the moment the app has to be clearest.
    highlight(squares, className = 'hint') {
        for (const el of this.#squares.values()) el.classList.remove('hint', 'wrong');
        for (const name of squares) this.#squares.get(name)?.classList.add(className);
    }

    // The move hint: mark the next own move, its origin quietly and its
    // destination strongly (issue #14). Two weights rather than one, because
    // "which piece" and "where to" are two questions and only the second one
    // should shout.
    //
    // Deliberately *not* the `.hint` class above, despite the name. That one
    // fills the square, and a fill collides with `.selected` — tapping the
    // piece would paint over the mark at the exact moment it is being used.
    // These two are outlines, so they coexist with a fill and with a dot on
    // the same square. See CONTEXT.md.
    //
    // Called with no arguments, it clears. There is no state to keep: every
    // render is followed by whoever owns the board deciding whether a hint is
    // due, so the board never has to remember whether one was.
    // The arrow joins the rings rather than replacing them (issue #27). Two
    // rings leave the reader to connect two marks; the arrow says *this piece
    // goes there* directly. The from-ring is what still answers "which piece"
    // when the arrow is short, so it stays.
    // `rings` and `style` exist for arrows.html and nothing else: the variants
    // page has to show the same move with six different arrows, and with the
    // rings on and off, through the real board rather than a rebuild of it —
    // a variant judged against a board of its own would prove nothing. The app
    // passes neither and gets the shipped treatment.
    // `rings` is 'both', 'from' or 'none'; 'from' is the ticket's open question
    // made visible — the arrow may be strong enough that a to-ring on the same
    // square is one mark too many, while the from-ring still answers "which
    // piece". The app passes neither option and gets the shipped treatment.
    showMove(from, to, { rings = 'both', style } = {}) {
        for (const el of this.#squares.values()) {
            el.classList.remove('from-hint', 'to-hint');
        }
        if (from && rings !== 'none') this.#squares.get(from)?.classList.add('from-hint');
        if (to && rings === 'both') this.#squares.get(to)?.classList.add('to-hint');
        draw(this.#arrows, from, to, style);
    }

    // The arrow overlay, so the variants page can colour it per board. Not used
    // by the app, which themes it from one token in base.css.
    get arrows() {
        return this.#arrows;
    }

    // Playing Black means seeing the board from Black's side. Rotating the
    // container and counter-rotating the pieces keeps one DOM order and one
    // source of truth for square positions.
    flip(colour) {
        this.#orientation = colour;
        this.#root.classList.toggle('flipped', colour === 'b');
    }

    // The board's element, so a screen can move the board into its own layout
    // rather than each screen building a board of its own.
    get root() {
        return this.#root;
    }

    get orientation() {
        return this.#orientation;
    }
}

function describe({ color, type }) {
    const names = { k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' };
    return `${color === 'w' ? 'white' : 'black'} ${names[type]}`;
}
