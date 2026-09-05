// PGN with variations, into a tree.
//
// chess.js parses PGN but silently discards variations — loading
// `1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3 Nc6` gives a history of four moves and
// no error. A repertoire is mostly variations, so the parser is ours. chess.js
// is still what decides whether a move is legal and what its SAN is.
//
// The grammar is small: SAN moves, parentheses, {comments}, $NAGs, move numbers
// and a result marker. The one rule that matters is that a variation is an
// alternative to the move *before* it — so on '(' we rewind one ply, and on ')'
// we restore where we were.

import { Chess } from '../vendor/chess.js';
import { key } from './position.js';

const node = (san, fen) => ({ san, fen, key: key(fen), children: [] });

export function parse(pgn) {
    const game = new Chess();
    const root = node(null, game.fen());

    // `cursor` is where the next move attaches; `parent` is the node before it,
    // which is what a variation branches from.
    let cursor = root;
    let parent = root;
    const stack = [];

    for (const token of tokenise(pgn)) {
        if (token === '(') {
            // Rewind one ply: the variation is a sibling of `cursor`.
            stack.push([cursor, parent, game.fen()]);
            game.load(parent.fen);
            cursor = parent;
            continue;
        }

        if (token === ')') {
            const [c, p, fen] = stack.pop();
            cursor = c;
            parent = p;
            game.load(fen);
            continue;
        }

        // A move. chess.js validates it; an illegal one throws, which is what
        // we want — a typo in a repertoire must never pass quietly.
        let move;
        try {
            move = game.move(token);
        } catch {
            move = null;
        }
        if (!move) throw new Error(`Illegal move in PGN: ${token}`);

        const child = node(move.san, game.fen());
        cursor.children.push(child);
        parent = cursor;
        cursor = child;
    }

    return root;
}

// Strip everything that is not a move or a bracket, and split the rest.
function* tokenise(pgn) {
    const body = pgn
        .replace(/\[[^\]]*\]/g, ' ')       // tag pairs
        .replace(/\{[^}]*\}/g, ' ')        // comments
        .replace(/;[^\n]*/g, ' ')          // rest-of-line comments
        .replace(/\$\d+/g, ' ')            // NAGs
        .replace(/\d+\.(\.\.)?/g, ' ')     // move numbers, incl. "1..."
        .replace(/([()])/g, ' $1 ');       // brackets become their own tokens

    for (const token of body.split(/\s+/)) {
        if (!token) continue;
        if (token === '1-0' || token === '0-1' || token === '1/2-1/2' || token === '*') continue;
        yield token;
    }
}
