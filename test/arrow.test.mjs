import { test } from 'node:test';
import assert from 'node:assert/strict';
import { centre, points, DEFAULTS } from '../js/board/arrow.js';

// The arrow's geometry is pure arithmetic in a 0 0 8 8 viewBox, which is the
// whole reason it was written that way: the shape can be checked here in
// milliseconds, and the browser run is left to answer the questions these
// cannot — whether it reads, and whether it swallows taps.

const parse = (s) => s.split(' ').map((p) => p.split(',').map(Number));

test('a square maps to the centre of its cell', () => {
    assert.deepEqual(centre('a8'), { x: 0.5, y: 0.5 });
    assert.deepEqual(centre('h1'), { x: 7.5, y: 7.5 });
    assert.deepEqual(centre('e4'), { x: 4.5, y: 4.5 });
    assert.deepEqual(centre('e2'), { x: 4.5, y: 6.5 });
});

test('a nonsense square is null rather than a NaN arrow', () => {
    // Silent NaNs would reach the DOM as an invisible polygon, which looks
    // exactly like "the arrow is off" and is the worst way to fail.
    assert.equal(centre('z9'), null);
    assert.equal(centre('e9'), null);
    assert.equal(points('e2', 'z9'), null);
});

test('an arrow to its own square draws nothing', () => {
    // No direction, so no arrow — and dividing by a zero length would produce
    // NaN coordinates rather than an empty result.
    assert.equal(points('e4', 'e4'), null);
});

test('the tip sits short of the destination centre, on the line', () => {
    const p = parse(points('e2', 'e4'));
    // Seven points, and the fourth is the tip.
    assert.equal(p.length, 7);
    const [x, y] = p[3];
    assert.equal(x, 4.5, 'the tip stays on the e-file');
    // e2 is y 6.5 and e4 is y 4.5, so the arrow runs up the board and the tip
    // is held back below e4's centre by `tip`.
    assert.ok(Math.abs(y - (4.5 + DEFAULTS.tip)) < 1e-2, `tip y was ${y}`);
});

test('the shaft is the specified thickness', () => {
    const p = parse(points('e2', 'e4', { width: 0.2 }));
    // A vertical arrow, so the two tail corners differ in x by the full width.
    assert.ok(Math.abs(Math.abs(p[0][0] - p[6][0]) - 0.2) < 1e-2);
});

test('the head is wider than the shaft', () => {
    // Otherwise it is not a head, it is a slightly wider line.
    const p = parse(points('e2', 'e4'));
    const shaft = Math.abs(p[0][0] - p[6][0]);
    const barbs = Math.abs(p[2][0] - p[4][0]);
    assert.ok(barbs > shaft, `barbs ${barbs} should exceed the shaft ${shaft}`);
});

test('a knight move is straight, not an L', () => {
    // Settled in the ticket: the arrow says "from here to there", not "along
    // this path". Nf3 is g1–f3, so the arrow leans one file left as it rises.
    const p = parse(points('g1', 'f3'));
    const tip = p[3];
    const a = centre('g1');
    const b = centre('f3');
    // The tip lies on the straight line g1–f3: the cross product of (b-a) and
    // (tip-a) is zero for any point on it.
    const cross = (b.x - a.x) * (tip[1] - a.y) - (b.y - a.y) * (tip[0] - a.x);
    // The coordinates are rounded to three decimals on the way out, so the
    // tolerance is that rounding and not a hidden slope.
    assert.ok(Math.abs(cross) < 1e-2, `the tip is off the straight line by ${cross}`);
});

test('the head never grows longer than the arrow itself', () => {
    // A one-square move is the shortest there is, and an unclamped head longer
    // than the shaft turns the polygon inside out.
    const p = parse(points('e4', 'e5', { head: 2 }));
    const tip = p[3][1];
    const base = p[2][1];
    const tail = p[0][1];
    assert.ok(tip < base && base < tail, `points out of order: ${tip}, ${base}, ${tail}`);
});

test('every point stays on the board', () => {
    // A corner-to-corner arrow is the extreme case; nothing may spill outside
    // the viewBox, where it would be clipped into a blunt end.
    for (const [from, to] of [['a1', 'h8'], ['h8', 'a1'], ['a1', 'a8'], ['a1', 'b3']]) {
        for (const [x, y] of parse(points(from, to))) {
            assert.ok(x >= 0 && x <= 8 && y >= 0 && y <= 8, `${from}${to}: ${x},${y}`);
        }
    }
});
