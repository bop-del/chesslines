// The repertoire: what Felix has adopted, and the cards carrying his progress.
//
// A repertoire is **a set of cards, one per position, and a set of adopted
// lines that point at them** — not a copy of the line. The moves themselves
// stay in openings.js, which ships with the app; copying them into storage
// would duplicate the one thing ADR 0009 makes delicate.
//
// Two rules do most of the work here, and both come from ADR 0007:
//
//   **A card exists only where Felix moves.** Only his own moves are ever
//   scheduled, so a card for a position he never answers is a row nothing can
//   read — and it would make any count of progress mean the wrong thing.
//
//   **One card per position, shared across lines.** Seven of the twelve lines
//   start from the same position and five of them pass through 1. e4 e5.
//   Practise it once and it is practised everywhere, because it is the same
//   position and the same answer. A card per line-and-position would quiz him
//   five times on one thing and split his progress five ways.
//
// Dormancy — a card no adopted line points at — is derived here at read time
// and never stored, so a card cannot be wrong about its own state.
//
// Pure logic: no DOM, no localStorage, no file. The edge is js/data/store.js.

import { Chess } from '../vendor/chess.js';
import { key } from './position.js';

// The due day as a number rather than an ISO string (ADR 0008): smaller stored,
// and comparison is `<=`. Day 0 is the Unix epoch, fixed forever — a bug here
// would shift every due date at once, which is why it is one line with a test.
const DAY = 86_400_000;

export const today = (now = new Date()) =>
    Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / DAY);

// The position keys of one line where Felix moves, in order.
//
// The line's own `moves` are walked through a real game, so the key is the one
// the engine produces rather than one assembled from strings — the same source
// the board and the walk use.
export function cardsFor(line) {
    const game = new Chess();
    const keys = [];
    for (const move of line.moves ?? []) {
        if (game.turn() === line.side) keys.push(key(game.fen()));
        game.move(move.san);
    }
    return keys;
}

const card = (k) => ({ key: k, level: 0, best: 0, due: 0, lines: [] });

// One message, thrown from both places a file can be rejected — here and in
// store.js. It is the one string in this layer a child could ever see, so it
// lives in one place ready for i18n rather than being retyped.
export const NOT_A_REPERTOIRE = 'That file is not a chesslines repertoire.';

// The stored shape's version. Read as well as written: a tag nothing checks
// gives false confidence at the migration it exists for. Only version 1 exists,
// so the check is "this is a shape I know", and a future version arriving here
// is refused rather than silently half-read.
export const VERSION = 1;

// Is this a document this build can read? Import runs on a file a child chose
// from a file picker, so "it is an object" is not enough of an answer.
const isDocument = (doc) =>
    !!doc && typeof doc === 'object'
    && (doc.v === undefined || doc.v <= VERSION)
    && Array.isArray(doc.lines) && Array.isArray(doc.cards);

export class Repertoire {
    #lines = new Set();
    #cards = new Map();

    // The adopted line ids. Read-only to callers by convention; `adopt` and
    // `remove` are the only ways in, per the spec's rule that adopting is the
    // only way anything enters the repertoire.
    get lines() {
        return this.#lines;
    }

    get cards() {
        return [...this.#cards.values()];
    }

    card(k) {
        return this.#cards.get(k) ?? null;
    }

    // Adopt a line: add its id, and add it to the card of every position where
    // he moves. A card that already exists keeps its level, its best level and
    // its due day — a second line reaching a position is not a reason to
    // restart it.
    adopt(line) {
        this.#lines.add(line.id);
        for (const k of cardsFor(line)) {
            const existing = this.#cards.get(k) ?? card(k);
            if (!existing.lines.includes(line.id)) existing.lines.push(line.id);
            this.#cards.set(k, existing);
        }
        return this;
    }

    // Remove a line: drop its id from the repertoire and from every card. No
    // card is deleted and no level is adjusted. Cards left pointing at no
    // adopted line become dormant, which costs nothing and is reversible —
    // tidying up must never cost a nine-year-old practice he has done (#38).
    remove(id) {
        this.#lines.delete(id);
        for (const c of this.#cards.values()) {
            c.lines = c.lines.filter((l) => l !== id);
        }
        return this;
    }

    // Derived, never stored. A card is live if any line pointing at it is
    // adopted; a card the build no longer knows a line for is dormant by the
    // same rule, with no special case.
    isDormant(c) {
        return !c.lines.some((id) => this.#lines.has(id));
    }

    // What Drill would schedule today: live cards that are due. Dormancy is one
    // filter at planning time, which is the whole of what deriving it costs.
    due(day = today()) {
        return this.cards.filter((c) => !this.isDormant(c) && c.due <= day);
    }

    // Record where a card has got to. The ladder itself is not this module's
    // business — it belongs to Drill — so this takes the numbers and stores
    // them, keeping only the invariant that the best level never falls.
    grade(k, { level, best, due }) {
        const c = this.#cards.get(k);
        if (!c) return null;
        if (level !== undefined) c.level = level;
        if (due !== undefined) c.due = due;
        c.best = Math.max(c.best, best ?? 0, c.level);
        return c;
    }

    // Merge a document in. Never replaces, never asks, never refuses a
    // recognisable file (#40).
    //
    // The app cannot tell "restore my backup" from "combine my other device":
    // the file looks identical either way, and asking would put a question to a
    // nine-year-old whose two answers he cannot weigh, at the moment he simply
    // wants his practice back. Merging is right for the combine case by
    // definition, and after a wipe there is nothing to merge with, so it is
    // right for the restore case too.
    //
    // `known` is this build's line list. A line the file names that no longer
    // exists is dropped and its cards import anyway, arriving dormant — cards
    // survive this on their own because they are keyed by position, and a
    // position is a position whoever named it.
    merge(doc, known) {
        if (!isDocument(doc)) throw new Error(NOT_A_REPERTOIRE);
        const ids = new Set(known.map((o) => o.id));

        // Built first, applied at the end. A file a child picked can be
        // anything, and a merge that threw halfway would leave a repertoire
        // that is neither what it was nor what the file says — the one outcome
        // worse than refusing outright.
        const lines = [];
        const cards = [];

        for (const id of doc.lines) {
            if (ids.has(id)) lines.push(id);
        }

        for (const incoming of doc.cards) {
            if (!incoming || typeof incoming.key !== 'string') continue;
            const held = this.#cards.get(incoming.key);
            const mine = held ? { ...held, lines: [...held.lines] } : card(incoming.key);

            // Higher wins on both numbers, independently. Taking the higher
            // best level is not optional: the meter only goes up, and an import
            // that lowered it would break that rule through the back door.
            mine.level = Math.max(mine.level, incoming.level ?? 0);
            mine.best = Math.max(mine.best, incoming.best ?? 0, mine.level);

            // The due day is the one number #40 does not rule on, because it
            // asks only about the two levels. The **earlier** day wins, which
            // is the direction that cannot lose anything: a card that comes up
            // sooner than it strictly needed to costs one extra answer, while
            // one pushed further out disappears from practice silently — and
            // silent loss is the failure this whole map is arranged against.
            // A card new to the store takes the file's day as it stands.
            mine.due = held ? Math.min(mine.due, incoming.due ?? 0) : incoming.due ?? 0;

            for (const id of incoming.lines ?? []) {
                if (ids.has(id) && !mine.lines.includes(id)) mine.lines.push(id);
            }
            cards.push(mine);
        }

        for (const id of lines) this.#lines.add(id);
        for (const c of cards) this.#cards.set(c.key, c);
        return this;
    }

    // The stored form, and the exported file — one shape, so a file is exactly
    // what was in storage and nothing has to agree about two.
    //
    // No dormancy flag: it is derived. No expected move: openings.js has it. No
    // record of when he last exported: that would be the seed of the reminder
    // #41 rules out.
    toJSON() {
        return {
            v: VERSION,
            lines: [...this.#lines],
            cards: this.cards.map((c) => ({
                key: c.key,
                level: c.level,
                best: c.best,
                due: c.due,
                lines: [...c.lines],
            })),
        };
    }

    static from(doc, known) {
        return new Repertoire().merge(doc, known);
    }
}
