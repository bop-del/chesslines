// The move arrow: one SVG line with a head, drawn over the board.
//
// The board is 64 divs and an arrow from e2 to e4 has to cross squares, so it
// cannot live in one of them. One SVG at board size sits on top instead
// (issue #27). This is the bill ADR 0003 said would arrive: a hand-written
// board owes its own arrows.
//
// Two things make the geometry simple enough to be obviously right.
//
// **A viewBox of 0 0 8 8.** One unit is one square, so the centre of a square
// is (file + 0.5, rank + 0.5) and every measurement below — thickness, head
// size, the gap at each end — is a fraction of a square. The SVG scales with
// the board, so the arrow keeps its proportion from a 375px phone to the 40rem
// cap without a resize listener, the same trick `cqi` plays for the hint ring.
//
// **No counter-rotation when the board flips.** The coordinate labels need one
// (text has an up); an arrow does not. Playing Black rotates the board 180°
// and the arrow rotates with it, which is correct — it still points from the
// piece to its destination, seen from Black's side.
//
// Straight for every move, knights included. `Nf3` runs g1–f3 in an L, and the
// straight arrow crosses a square the knight never occupies. Lichess draws it
// straight anyway: the arrow says *from here to there*, not *along this path*.
// One rule beats a special case with eight orientations.

const SVG = 'http://www.w3.org/2000/svg';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Square name to viewBox centre. Rank 8 is row 0, matching the DOM order the
// board builds in — so the unflipped board and this share one idea of "top".
export function centre(name) {
    const file = FILES.indexOf(name[0]);
    const rank = Number(name[1]);
    if (file < 0 || !(rank >= 1 && rank <= 8)) return null;
    return { x: file + 0.5, y: 8 - rank + 0.5 };
}

// The shape of an arrow, in square units. Every variant on arrows.html is one
// of these; these are the ones chosen from it — the "Thin" variant, picked on
// the phone against the real board in both themes (issue #27).
//
// Thin rather than the middle weight, and the reason is the pieces: a nine-
// year-old is looking at a board, not at a diagram of one, and the arrow's job
// is to point without becoming the thing he looks at. The quiet line was the
// one that still left the knight on g1 readable underneath it.
export const DEFAULTS = {
    width: 0.10, // shaft thickness
    head: 0.32, // length of the head along the arrow
    spread: 0.24, // half-width of the head, so the full base is twice this
    // A gap at each end. Flush with the square centre the head buries itself in
    // the destination piece, and the tail starts under the piece it is about to
    // move — both ends read better held back a little.
    tail: 0.30,
    tip: 0.18,
    // How far the shaft bows sideways at its midpoint, in squares. Zero is the
    // straight arrow this ships with; arrows.html offers a bowed variant
    // because the ticket names "straight against slightly curved" as one of
    // the axes to choose along. A curve does not make a knight's move any more
    // truthful — it still does not follow the L — but it reads as a gesture
    // rather than a ruler, which is a different thing to like or dislike.
    bow: 0,
};

// Build the overlay element. Empty until `draw` is called.
//
// `pointer-events: none` is set here rather than left to CSS: the overlay
// covers all 64 squares, and a stylesheet that failed to load would turn the
// board into a surface that looks tappable and is not. The one property the
// board cannot work without is not delegated.
export function overlay() {
    const svg = document.createElementNS(SVG, 'svg');
    svg.setAttribute('class', 'arrows');
    svg.setAttribute('viewBox', '0 0 8 8');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.pointerEvents = 'none';
    return svg;
}

// The arrow as a single polygon: a shaft that stops where the head begins, and
// a triangle on the end. One path rather than a line plus a marker, because a
// marker scales with the stroke width and a fat shaft then grows a head out of
// proportion to it — the two have to be specified independently.
export function points(from, to, style = {}) {
    const { width, head, spread, tail, tip } = { ...DEFAULTS, ...style };
    const a = centre(from);
    const b = centre(to);
    if (!a || !b) return null;

    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const length = Math.hypot(dx, dy);
    if (length === 0) return null;

    // Unit vector along the arrow, and its perpendicular.
    const ux = dx / length;
    const uy = dy / length;
    const px = -uy;
    const py = ux;

    // Start and end, held back from the square centres.
    const x0 = a.x + ux * tail;
    const y0 = a.y + uy * tail;
    const x1 = b.x - ux * tip;
    const y1 = b.y - uy * tip;

    // Where the shaft stops and the head starts. A knight move is 2.24 squares
    // and the shortest possible move is 1, so on a short arrow the head could
    // otherwise be longer than the whole thing — clamped to half the drawn
    // length, which keeps a shaft visible on every legal move.
    const drawn = Math.hypot(x1 - x0, y1 - y0);
    const headLength = Math.min(head, drawn / 2);
    const bx = x1 - ux * headLength;
    const by = y1 - uy * headLength;

    const w = width / 2;
    const at = (x, y, offset) => `${(x + px * offset).toFixed(3)},${(y + py * offset).toFixed(3)}`;

    return [
        at(x0, y0, w), // tail, one side
        at(bx, by, w), // shaft meets head
        at(bx, by, spread), // head, one barb
        `${x1.toFixed(3)},${y1.toFixed(3)}`, // the tip
        at(bx, by, -spread), // the other barb
        at(bx, by, -w),
        at(x0, y0, -w),
    ].join(' ');
}

// The same outline as a path, so the shaft can bow. `bow: 0` gives exactly the
// straight polygon above; anything else pulls the two shaft edges sideways at
// their midpoint with one quadratic each, which keeps the shaft an even
// thickness along the curve because both edges bow by the same amount.
//
// The head stays a straight triangle and stays aimed along the chord. Bending
// it too would point it away from the square it is naming, which is the one
// thing the arrow must not do.
export function path(from, to, style = {}) {
    const shape = { ...DEFAULTS, ...style };
    const flat = points(from, to, shape);
    if (!flat) return null;

    const p = flat.split(' ').map((s) => s.split(',').map(Number));
    if (!shape.bow) return `M${p.map((q) => q.join(',')).join('L')}Z`;

    const a = centre(from);
    const b = centre(to);
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    const px = -(b.y - a.y) / length;
    const py = (b.x - a.x) / length;

    // One control point per shaft edge, at the midpoint of that edge, pushed
    // out by twice the bow — a quadratic passes half way to its control point,
    // so doubling it makes `bow` the sagitta the caller actually asked for.
    const bend = ([x0, y0], [x1, y1]) => {
        const cx = (x0 + x1) / 2 + px * shape.bow * 2;
        const cy = (y0 + y1) / 2 + py * shape.bow * 2;
        return `Q${cx.toFixed(3)},${cy.toFixed(3)} ${x1.toFixed(3)},${y1.toFixed(3)}`;
    };

    // p[0]→p[1] is one shaft edge, p[5]→p[6] the other, and the head is p[2..4].
    return [
        `M${p[0].join(',')}`,
        bend(p[0], p[1]),
        `L${p[2].join(',')}L${p[3].join(',')}L${p[4].join(',')}L${p[5].join(',')}`,
        bend(p[5], p[6]),
        'Z',
    ].join('');
}

// Draw one arrow into an overlay, replacing whatever was there. Called with no
// squares it clears — the same contract as `Board.showMove`, and for the same
// reason: the board keeps no memory of whether an arrow was due.
export function draw(svg, from, to, style = {}) {
    svg.replaceChildren();
    if (!from || !to) return null;
    const d = path(from, to, style);
    if (!d) return null;

    const el = document.createElementNS(SVG, 'path');
    el.setAttribute('d', d);
    el.setAttribute('class', 'arrow');
    // Rounding the corners softens the barbs, which at this size otherwise read
    // as needles on a phone.
    el.setAttribute('stroke-linejoin', 'round');
    svg.append(el);
    return el;
}
