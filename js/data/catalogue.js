// Naming a position.
//
// The map is generated (scripts/build-catalogue.mjs) and keyed by position, so
// a name is found however the position was reached. An unknown position is
// normal — the catalogue names openings, and most positions are not one.

import { MAP } from './catalogue-map.js';
import { key } from './position.js';

export function nameOf(fen) {
    const entry = MAP[key(fen)];
    if (!entry) return null;
    const [eco, name] = entry;
    return { eco, name };
}

// The deepest named position along a line.
//
// A line can run one ply past the last named position into a middlegame nobody
// has named — 3 of the 12 starter openings do. So "what is this position
// called?" is usually the wrong question, and "what is this *line* called?" is
// the right one: walk it and keep the last name found.
//
// `fens` is every position along the line, in order. Returns the deepest
// `{eco, name}` found, or null if the line is unnamed throughout.
export function nameOfLine(fens) {
    let deepest = null;
    for (const fen of fens) {
        const found = nameOf(fen);
        if (found) deepest = found;
    }
    return deepest;
}
