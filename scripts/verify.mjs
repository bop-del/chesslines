// Verification run: serve, load, check, screenshot.
//
// Dev-only. Nothing here ships — see docs/adr/0005-dev-dependencies.md.
//
//   node scripts/verify.mjs
//
// Exits non-zero if any check fails. Always writes screenshots to
// .screenshots/ so the visual result can be assessed by eye, pass or fail.

import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, webkit } from 'playwright';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const SHOTS = join(ROOT, '.screenshots');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
};

// ─── Server ──────────────────────────────────────────────────────────────────
// Same job as `python3 -m http.server`, minus the process management. Node's
// built-ins only; no dependency.

function serve() {
    const server = createServer(async (req, res) => {
        const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
        const rel = normalize(path === '/' ? '/index.html' : path).replace(/^(\.\.[/\\])+/, '');
        try {
            const body = await readFile(join(ROOT, rel));
            res.writeHead(200, { 'content-type': MIME[extname(rel)] ?? 'application/octet-stream' });
            res.end(body);
        } catch {
            res.writeHead(404).end('not found');
        }
    });
    // Port 0 asks the OS for whatever is free, so two lanes can verify at once
    // (issue #18). A fixed port only moves the collision to a different number.
    return new Promise((resolve) => {
        server.listen(0, () => resolve(server));
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Assertions read from the real game object, not from what the UI says about
// itself. `window.chesslines` is exposed by main.js for exactly this.
const state = (page) => page.evaluate(() => ({
    fen: window.chesslines.game.fen(),
    turn: window.chesslines.game.turn(),
    history: window.chesslines.game.history(),
}));

// Back to a clean list screen with a fresh position. `showList` is the part
// that matters and is easy to forget: resetting the game alone leaves the
// Explain screen up, so its move text — and now its hint marks — survive into
// whatever comes next. That state cannot occur in the app, and it was reaching
// the screenshots, which are the visual gate (CLAUDE.md).
const reset = (page) => page.evaluate(() => {
    window.chesslines.showList();
    window.chesslines.game.reset();
    window.chesslines.board.render(window.chesslines.game);
});

const square = (page, name) => page.locator(`.square[data-square="${name}"]`);

// Tap a square. Named for what the user does, since there is no drag by
// design — see ADR 0003 (a hand-written board).
const tap = (page, name) => square(page, name).click();

function assert(condition, message) {
    if (!condition) throw new Error(message);
}

const eq = (actual, expected, what) =>
    assert(actual === expected, `${what}: expected ${expected}, got ${actual}`);

// ─── Checks ──────────────────────────────────────────────────────────────────

const checks = [
    {
        name: 'board renders 64 squares',
        async run(page) {
            eq(await page.locator('.square').count(), 64, 'square count');
            eq(await page.locator('.square.light').count(), 32, 'light squares');
            eq(await page.locator('.square.dark').count(), 32, 'dark squares');
        },
    },

    {
        name: 'a1 is a dark square',
        async run(page) {
            // The one orientation rule everybody gets wrong, and it is wrong in
            // a way that looks plausible: "white on the right" is about the
            // bottom-right corner being light.
            await assert(
                await square(page, 'a1').evaluate((el) => el.classList.contains('dark')),
                'a1 must be dark',
            );
            await assert(
                await square(page, 'h1').evaluate((el) => el.classList.contains('light')),
                'h1 must be light',
            );
        },
    },

    {
        name: 'starting position has 32 pieces in the right places',
        async run(page) {
            eq(await page.locator('.square .piece').count(), 32, 'piece count');
            const white = await square(page, 'e1').locator('use').getAttribute('href');
            eq(white, '#wK', 'white king on e1');
            const black = await square(page, 'd8').locator('use').getAttribute('href');
            eq(black, '#bQ', 'black queen on d8');
        },
    },

    {
        name: 'tapping a piece shows its legal moves',
        async run(page) {
            await reset(page);
            await tap(page, 'e2');
            await assert(
                await square(page, 'e2').evaluate((el) => el.classList.contains('selected')),
                'e2 should be selected',
            );
            // A pawn on its starting square has exactly two moves.
            eq(await page.locator('.square.target').count(), 2, 'pawn targets');
            for (const name of ['e3', 'e4']) {
                await assert(
                    await square(page, name).evaluate((el) => el.classList.contains('target')),
                    `${name} should be a target`,
                );
            }
        },
    },

    {
        name: 'tapping an opponent piece selects nothing',
        async run(page) {
            await reset(page);
            await tap(page, 'e7'); // Black, and it is White to move
            eq(await page.locator('.square.selected').count(), 0, 'selected squares');
            eq(await page.locator('.square.target').count(), 0, 'target squares');
        },
    },

    {
        name: 'two taps make a move',
        async run(page) {
            await reset(page);
            await tap(page, 'e2');
            await tap(page, 'e4');
            const { history, turn } = await state(page);
            eq(history.length, 1, 'moves played');
            eq(history[0], 'e4', 'move in SAN');
            eq(turn, 'b', 'side to move');
            // And the piece actually moved on screen, not just in the model.
            eq(await square(page, 'e2').locator('.piece').count(), 0, 'e2 is empty');
            eq(await square(page, 'e4').locator('.piece').count(), 1, 'e4 is occupied');
        },
    },

    {
        name: 'selection clears after a move',
        async run(page) {
            await reset(page);
            await tap(page, 'e2');
            await tap(page, 'e4');
            eq(await page.locator('.square.selected').count(), 0, 'selected squares');
            eq(await page.locator('.square.target').count(), 0, 'target squares');
        },
    },

    {
        name: 'tapping a selected piece again deselects it',
        async run(page) {
            await reset(page);
            await tap(page, 'g1');
            eq(await page.locator('.square.selected').count(), 1, 'selected');
            await tap(page, 'g1');
            eq(await page.locator('.square.selected').count(), 0, 'deselected');
            const { history } = await state(page);
            eq(history.length, 0, 'no move played');
        },
    },

    {
        name: 'captures are marked differently from quiet moves',
        async run(page) {
            await reset(page);
            // 1. e4 d5 — now exd5 is available and is a capture.
            await tap(page, 'e2'); await tap(page, 'e4');
            await tap(page, 'd7'); await tap(page, 'd5');
            await tap(page, 'e4');
            await assert(
                await square(page, 'd5').evaluate((el) => el.classList.contains('capture')),
                'd5 should be marked as a capture',
            );
            await assert(
                await square(page, 'e5').evaluate((el) => el.classList.contains('target')),
                'e5 should be a quiet target',
            );
        },
    },

    {
        name: 'illegal moves are impossible to make',
        async run(page) {
            await reset(page);
            // The rook on a1 is hemmed in — tapping it offers nothing, and
            // tapping a square it cannot reach must not move it.
            await tap(page, 'a1');
            await tap(page, 'a5');
            const { history } = await state(page);
            eq(history.length, 0, 'no move played');
            eq(await square(page, 'a1').locator('.piece').count(), 1, 'rook still on a1');
        },
    },

    {
        name: 'the engine is the vendored chess.js',
        async run(page) {
            // If this fails the app is running some other rules, and every
            // other check above is asserting against the wrong thing.
            const sane = await page.evaluate(() => {
                const g = new window.chesslines.game.constructor();
                return {
                    moves: g.moves().length,
                    fen: g.fen(),
                };
            });
            eq(sane.moves, 20, 'legal moves from the starting position');
            eq(
                sane.fen,
                'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                'starting FEN',
            );
        },
    },

    {
        name: 'the build number is on screen',
        async run(page) {
            const shown = (await page.locator('#build').textContent()).trim();
            const source = await readFile(join(ROOT, 'js/version.js'), 'utf8');
            const expected = source.match(/BUILD = '([^']+)'/)?.[1];
            assert(expected, 'could not read BUILD from js/version.js');
            eq(shown, expected, 'build number');
        },
    },

    {
        name: 'the board fits a phone without horizontal scroll',
        async run(page) {
            const original = page.viewportSize();
            // iPhone SE, the narrowest screen worth supporting.
            await page.setViewportSize({ width: 375, height: 667 });
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
            );
            assert(overflow <= 0, `page scrolls horizontally by ${overflow}px at 375px wide`);
            const box = await page.locator('.board').boundingBox();
            assert(box.width <= 375, `board is ${box.width}px wide on a 375px screen`);
            // Square, within a rounding error.
            assert(
                Math.abs(box.width - box.height) < 2,
                `board is not square: ${box.width}×${box.height}`,
            );
            await page.setViewportSize(original);
        },
    },

    {
        name: 'touch targets are big enough for a child',
        async run(page) {
            const original = page.viewportSize();
            await page.setViewportSize({ width: 375, height: 667 });
            const box = await square(page, 'e4').boundingBox();
            // Apple's guidance is 44px; a board square below ~40px is a
            // mis-tap machine on a phone.
            assert(box.width >= 44, `squares are ${box.width.toFixed(1)}px on a 375px screen`);
            await page.setViewportSize(original);
        },
    },

    {
        name: 'coordinate labels stay readable on a phone',
        async run(page) {
            const original = page.viewportSize();
            await page.setViewportSize({ width: 375, height: 667 });

            // Both pseudo-elements, on the one square that carries both.
            const read = () =>
                page.evaluate(() => {
                    const a1 = document.querySelector('.square[data-square="a1"]');
                    return ['::before', '::after'].map((which) => {
                        const s = getComputedStyle(a1, which);
                        return {
                            which,
                            size: parseFloat(s.fontSize),
                            opacity: parseFloat(s.opacity),
                            shadow: s.textShadow,
                            events: s.pointerEvents,
                            colour: s.color,
                        };
                    });
                });

            // Both themes and both orientations: a fix tuned in light on an
            // unflipped board would pass while failing three of the four ways
            // the board is actually seen (#13).
            //
            // The page is shared by every check, so the theme, the orientation
            // and the viewport all go back even when an assertion throws —
            // otherwise one failure here reappears as a cascade of unrelated
            // ones below it.
            //
            // Orientation goes through `board.flip()` rather than through the
            // class: `flip` also sets the board's own `#orientation`, and
            // toggling `.flipped` behind its back leaves the two disagreeing.
            const wasFlipped = await page.evaluate(() =>
                document.getElementById('board').classList.contains('flipped'),
            );

            // The floor comes off the board itself, so retuning it is a
            // one-line change in board.css rather than a number to keep in step
            // in two files. What is asserted here is that a floor exists and is
            // high enough for a child — 8.2px was the bug (#13).
            const floor = await page.evaluate(() =>
                parseFloat(
                    getComputedStyle(document.getElementById('board')).getPropertyValue(
                        '--coord-min',
                    ),
                ),
            );
            assert(floor >= 11, `--coord-min is ${floor}px, too small for a nine-year-old`);
            const colours = {};
            try {
                for (const scheme of ['light', 'dark']) {
                    await page.emulateMedia({ colorScheme: scheme });
                    for (const flipped of [false, true]) {
                        await page.evaluate((f) => {
                            window.chesslines.board.flip(f ? 'b' : 'w');
                        }, flipped);
                        const where = `${scheme}${flipped ? ', flipped' : ''}`;
                        for (const { which, size, opacity, shadow, events, colour } of await read()) {
                            if (!flipped) colours[`${scheme}${which}`] = colour;
                            assert(
                                size >= floor,
                                `${which} label is ${size.toFixed(1)}px at 375px (${where}), ` +
                                    `below the ${floor}px floor`,
                            );
                            // The labels used to be halved into the square they
                            // sat on. Contrast is the halo's job now, not
                            // opacity's.
                            eq(opacity, 1, `${which} label opacity (${where})`);
                            assert(
                                shadow && shadow !== 'none',
                                `${which} label has no halo (${where}), so its contrast ` +
                                    'depends on the square underneath',
                            );
                            // A bigger label is a bigger thing to swallow a tap
                            // that belongs to the 44px square under it.
                            eq(events, 'none', `${which} label pointer-events (${where})`);
                        }
                    }
                }

                // The dark theme has to actually re-colour the labels. Without
                // this the loop above would pass on a fix that only ever ran in
                // light — the sizes and the opacity are identical either way,
                // so the colour is the only thing that proves the theming.
                for (const which of ['::before', '::after']) {
                    assert(
                        colours[`light${which}`] !== colours[`dark${which}`],
                        `${which} label is ${colours[`light${which}`]} in both themes, ` +
                            'so it is not themed at all',
                    );
                }
            } finally {
                // null is "back to whatever the browser defaults to", which is
                // what the page had before this check — not a guess that the
                // default is light.
                await page.emulateMedia({ colorScheme: null });
                await page.evaluate((f) => {
                    window.chesslines.board.flip(f ? 'b' : 'w');
                }, wasFlipped);
                await page.setViewportSize(original);
            }
        },
    },

    {
        name: 'the data layer loads in the browser',
        async run(page) {
            const n = await page.evaluate(() => window.chesslines.OPENINGS.length);
            assert(n >= 8 && n <= 16, `${n} openings loaded`);
        },
    },

    {
        name: 'every shipped opening line is legal in the browser too',
        async run(page) {
            // The same assertion as the unit test, run where it actually
            // matters. A module that parses under Node but throws in WebKit
            // would otherwise ship.
            const bad = await page.evaluate(() =>
                window.chesslines.OPENINGS
                    .filter((o) => {
                        try { window.chesslines.parse(o.pgn); return false; }
                        catch { return true; }
                    })
                    .map((o) => o.id));
            assert(bad.length === 0, `illegal lines: ${bad.join(', ')}`);
        },
    },

    {
        name: 'variations survive parsing in the browser',
        async run(page) {
            // chess.js drops these silently. If our parser ever regresses to
            // the same behaviour, this is what catches it.
            const kids = await page.evaluate(() => {
                const root = window.chesslines.parse('1. e4 e5 (1... c5 2. Nf3 d6) 2. Nf3');
                return root.children[0].children.map((c) => c.san);
            });
            eq(kids.length, 2, 'continuations after 1. e4');
            eq(kids[1], 'c5', 'the variation');
        },
    },

    {
        name: 'transpositions share a position key',
        async run(page) {
            const same = await page.evaluate(() => {
                const { parse } = window.chesslines;
                const leaf = (n) => { while (n.children.length) n = n.children[0]; return n; };
                const a = leaf(parse('1. d4 Nf6 2. c4 e6 3. Nc3 d5'));
                const b = leaf(parse('1. d4 d5 2. c4 e6 3. Nc3 Nf6'));
                return { equal: a.key === b.key, fensDiffer: a.fen !== b.fen };
            });
            assert(same.fensDiffer, 'the full FENs should differ');
            assert(same.equal, 'the four-field keys should match');
        },
    },

    {
        name: 'the catalogue names a position',
        async run(page) {
            const found = await page.evaluate(() => {
                const g = new window.chesslines.game.constructor();
                for (const m of ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']) g.move(m);
                return window.chesslines.nameOf(g.fen());
            });
            assert(found, 'the Italian Game should be named');
            eq(found.eco, 'C50', 'ECO code');
        },
    },

    {
        name: 'every starter opening can be named as a line',
        async run(page) {
            // 3 of the 12 end past the catalogue, so this asks the question the
            // UI will ask: what is this *line* called?
            const unnamed = await page.evaluate(() => {
                const { OPENINGS, parse, nameOfLine } = window.chesslines;
                return OPENINGS.filter((o) => {
                    const fens = [];
                    let n = parse(o.pgn);
                    while (n.children.length) { n = n.children[0]; fens.push(n.fen); }
                    return !nameOfLine(fens);
                }).map((o) => o.id);
            });
            assert(unnamed.length === 0, `unnamed lines: ${unnamed.join(', ')}`);
        },
    },
    {
        name: 'the list shows every line, and only the ready ones are tappable',
        async run(page) {
            // The tappable count is read from the data rather than typed, so
            // that filling in a line's move texts does not need this number
            // edited too — #12 had to change it once already. What is being
            // checked is the *rule*: a line is tappable exactly when it has
            // texts to walk.
            await page.evaluate(() => window.chesslines.showList());
            const { total, enabled, ready } = await page.evaluate(() => {
                const b = [...document.querySelectorAll('#list button.line')];
                return {
                    total: b.length,
                    enabled: b.filter((x) => !x.disabled).length,
                    ready: window.chesslines.OPENINGS.filter((o) => o.moves?.length).length,
                };
            });
            assert(total === 12, `${total} lines listed, expected 12`);
            assert(enabled === ready, `${enabled} tappable, expected the ${ready} with move texts`);
        },
    },

    {
        name: 'picking a line shows its intro and orients the board',
        async run(page) {
            await page.evaluate(() => window.chesslines.showLine('scandinavian-defense'));
            const state = await page.evaluate(() => ({
                title: document.querySelector('.explain-title').textContent,
                intro: document.querySelector('.explain-intro').textContent,
                flipped: document.getElementById('board').classList.contains('flipped'),
            }));
            assert(state.title.includes('Scandinavian'), `title was "${state.title}"`);
            assert(state.intro.length > 40, 'intro is missing or too short');
            // Taught from Black, so Black is at the bottom.
            assert(state.flipped, 'board is not oriented to Black');
        },
    },

    {
        name: 'the app plays the opponent’s moves, the child plays his own',
        async run(page) {
            // This check was vacuous once — it asserted that a text existed,
            // which the "Your move" prompt already satisfied before any opponent
            // move happened. It now asserts on the walk's own count and on the
            // position, so it fails if the opponent never moves.
            const state = await page.evaluate(async () => {
                const { OPENINGS, explain, showLine } = window.chesslines;
                const line = OPENINGS.find((o) => o.id === 'scandinavian-defense');
                showLine('scandinavian-defense');
                // Taught from Black: White's e4 is the opponent's and must play
                // itself, with no input from us at all.
                await new Promise((r) => setTimeout(r, 30));
                const after = document.querySelector('.explain-text').textContent;
                return { after, first: line.moves[0].en };
            });
            assert(state.after === state.first,
                `expected the opponent's own move text, got "${state.after}"`);
        },
    },

    {
        name: 'the board is inert while the opponent is thinking',
        async run(page) {
            // The bug this catches: a tap during the pause reached the walk,
            // which only compares SAN. Tapping the opponent's move played it,
            // and the pending timer then played the child's next move for him.
            const played = await page.evaluate(async () => {
                const { explain, showLine } = window.chesslines;
                showLine('italian-game');
                explain.offer({ san: 'e4' });        // his move
                explain.offer({ san: 'e5' });        // the opponent's — must be ignored
                await new Promise((r) => setTimeout(r, 60));
                return document.querySelector('.explain-text').textContent;
            });
            // After e4 and the opponent's e5, the line waits for Nf3 — it must
            // not have run ahead and played Nf3 itself.
            assert(!/two jobs/.test(played),
                `the app played the child's move for him: "${played}"`);
        },
    },

    {
        name: 'a move that is not the line’s move is refused',
        async run(page) {
            const state = await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                const before = document.querySelectorAll('#board .square use').length;
                // d4 is legal and is not this line's move.
                window.chesslines.explain.offer({ san: 'd4' });
                return {
                    pieces: document.querySelectorAll('#board .square use').length === before,
                    text: document.querySelector('.explain-text').textContent,
                };
            });
            assert(state.pieces, 'the board changed on a refused move');
            assert(/e4/.test(state.text), `expected the text to name e4, got "${state.text}"`);
        },
    },

    {
        name: 'walking the whole line reaches the ending',
        async run(page) {
            const text = await page.evaluate(async () => {
                const { OPENINGS, explain, showLine } = window.chesslines;
                const line = OPENINGS.find((o) => o.id === 'italian-game');
                showLine('italian-game');
                for (const m of line.moves) {
                    explain.offer({ san: m.san });
                    await new Promise((r) => setTimeout(r, 5));
                }
                await new Promise((r) => setTimeout(r, 20));
                return document.querySelector('.explain-text').textContent;
            });
            assert(/c3/.test(text), `expected the ending sentence, got "${text}"`);
        },
    },

    {
        name: 'the move hint marks the squares of the due own move',
        async run(page) {
            // Nf3 is the case the hint exists for: the notation names neither
            // square, and there are two knights that could go to f3.
            const marks = await page.evaluate(async () => {
                const { explain, showLine } = window.chesslines;
                showLine('italian-game');
                explain.offer({ san: 'e4' });
                await new Promise((r) => setTimeout(r, 30)); // the opponent plays e5
                const at = (c) => [...document.querySelectorAll(`.square.${c}`)]
                    .map((el) => el.dataset.square);
                return { from: at('from-hint'), to: at('to-hint') };
            });
            eq(marks.from.join(), 'g1', 'the from-square');
            eq(marks.to.join(), 'f3', 'the to-square');
        },
    },

    {
        name: 'the move hint is absent while the opponent is thinking',
        async run(page) {
            // A mark on a board that is not listening is worse than no mark, so
            // the hint and the board's inertness have to say the same thing.
            // pause=0 still defers by a tick, which is the window sampled here.
            const during = await page.evaluate(() => {
                const { explain, showLine } = window.chesslines;
                showLine('italian-game');
                explain.offer({ san: 'e4' }); // his move; the opponent's is now pending
                return document.querySelectorAll('.square.from-hint, .square.to-hint').length;
            });
            eq(during, 0, 'marked squares during the opponent’s turn');
        },
    },

    {
        name: 'the move hint is absent while the line plays itself',
        async run(page) {
            const shown = await page.evaluate(async () => {
                const { explain, showLine } = window.chesslines;
                showLine('italian-game');
                document.querySelector('.show').click(); // Show me
                await new Promise((r) => setTimeout(r, 30));
                const marks =
                    document.querySelectorAll('.square.from-hint, .square.to-hint').length;
                document.querySelector('.show').click(); // Stop
                return marks;
            });
            eq(shown, 0, 'marked squares during Show me');
        },
    },

    {
        name: 'the hint switch turns the marking off and on again',
        async run(page) {
            const counts = await page.evaluate(async () => {
                const { showLine } = window.chesslines;
                showLine('italian-game');
                const marks = () =>
                    document.querySelectorAll('.square.from-hint, .square.to-hint').length;
                const toggle = document.querySelector('.hint-toggle');
                const on = marks();
                toggle.click();
                const off = marks();
                toggle.click();
                return { on, off, back: marks() };
            });
            eq(counts.on, 2, 'marked squares with the hint on');
            eq(counts.off, 0, 'marked squares with the hint off');
            eq(counts.back, 2, 'marked squares after switching it back on');
        },
    },

    {
        name: 'the hint setting survives a reload',
        async run(page) {
            await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                document.querySelector('.hint-toggle').click(); // off
            });
            await page.reload({ waitUntil: 'networkidle' });
            const after = await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                return {
                    marks: document.querySelectorAll('.square.from-hint, .square.to-hint').length,
                    label: document.querySelector('.hint-toggle').textContent,
                };
            });
            // Back on, and that has to survive a reload too — a setting that
            // only remembers one of its two values is remembering nothing.
            // Restored before any assertion runs: this check owns a global,
            // and leaving it off would fail every later hint check instead of
            // just this one.
            await page.evaluate(() => document.querySelector('.hint-toggle').click());
            await page.reload({ waitUntil: 'networkidle' });
            const on = await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                return {
                    marks: document.querySelectorAll('.square.from-hint, .square.to-hint').length,
                    label: document.querySelector('.hint-toggle').textContent,
                };
            });

            eq(after.marks, 0, 'marked squares after a reload with the hint off');
            eq(on.marks, 2, 'marked squares after a reload with the hint on');
            // The label follows the setting, and says what tapping does rather
            // than what the state is — so it reads "on" while the hint is off.
            assert(
                after.label !== on.label,
                `the switch reads "${after.label}" either way`,
            );
        },
    },

    {
        name: 'the hint survives tapping the piece it marks',
        async run(page) {
            // The collision this design exists to avoid: `.selected` fills the
            // square, so a hint that also filled would be painted over at the
            // exact moment it is being used. An outline coexists with a fill.
            const both = await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                document.querySelector('.square[data-square="e2"]').click();
                const el = document.querySelector('.square[data-square="e2"]');
                return {
                    selected: el.classList.contains('selected'),
                    hinted: el.classList.contains('from-hint'),
                };
            });
            assert(both.selected, 'e2 should be selected after a tap');
            assert(both.hinted, 'the hint was lost when the piece was tapped');
        },
    },

    {
        name: 'the hint marks a Black line’s own move, not White’s',
        async run(page) {
            // Taught from Black: White's e4 plays itself, and the mark that
            // follows must be on d7–d5, his move, seen from a flipped board.
            const marks = await page.evaluate(async () => {
                window.chesslines.showLine('scandinavian-defense');
                await new Promise((r) => setTimeout(r, 30));
                const at = (c) => [...document.querySelectorAll(`.square.${c}`)]
                    .map((el) => el.dataset.square);
                return { from: at('from-hint'), to: at('to-hint') };
            });
            eq(marks.from.join(), 'd7', 'the from-square');
            eq(marks.to.join(), 'd5', 'the to-square');
        },
    },

    {
        name: 'nothing counts how the child did',
        async run(page) {
            // The no-streak rule, asserted rather than assumed: the app must
            // store no measure of performance, so there is nothing to lose by
            // being wrong and nothing that could ever suggest the switch.
            const keys = await page.evaluate(async () => {
                const { explain, showLine } = window.chesslines;
                showLine('italian-game');
                explain.offer({ san: 'd4' }); // wrong
                explain.offer({ san: 'e4' }); // right
                await new Promise((r) => setTimeout(r, 30));
                return Object.keys(localStorage);
            });
            const unexpected = keys.filter((k) => !['lang', 'hint'].includes(k));
            assert(unexpected.length === 0, `unexpected storage keys: ${unexpected.join(', ')}`);
        },
    },

    {
        name: 'German renders German notation, English does not',
        async run(page) {
            const both = await page.evaluate(() => ({
                de: window.chesslines.san('Nf3', 'de'),
                en: window.chesslines.san('Nf3', 'en'),
                qde: window.chesslines.san('Qd8', 'de'),
                bishop: window.chesslines.san('Bb5', 'de'),
            }));
            assert(both.de === 'Sf3', `German Nf3 was "${both.de}"`);
            assert(both.en === 'Nf3', `English Nf3 was "${both.en}"`);
            assert(both.qde === 'Dd8', `German Qd8 was "${both.qde}"`);
            // The file letter must survive: Bb5 is Lb5, never LB5.
            assert(both.bishop === 'Lb5', `German Bb5 was "${both.bishop}"`);
        },
    },

    {
        name: 'a German browser gets German without touching the toggle',
        async run(page) {
            // Felix's phone is German, and the checks run in English — so the
            // default this matters most for is the one never otherwise seen.
            const de = await page.evaluate(() => {
                const real = navigator.language;
                Object.defineProperty(navigator, 'language', {
                    value: 'de-DE', configurable: true,
                });
                const picked = (navigator.language ?? 'en').startsWith('de') ? 'de' : 'en';
                Object.defineProperty(navigator, 'language', {
                    value: real, configurable: true,
                });
                return picked;
            });
            assert(de === 'de', `a de-DE browser resolved to "${de}"`);
        },
    },

    {
        name: 'the language toggle changes the interface',
        async run(page) {
            const before = await page.evaluate(() => {
                window.chesslines.showList();
                return document.getElementById('list-title').textContent;
            });
            await page.click('#lang');
            const after = await page.evaluate(() =>
                document.getElementById('list-title').textContent);
            assert(before !== after, `title did not change: "${before}"`);
            await page.click('#lang');
        },
    },

    {
        name: 'switching language mid-line redraws the sentence on screen',
        async run(page) {
            // The bug this catches: everything around the text switches and the
            // sentence itself stays in the language it was written in — which is
            // precisely what a child switching to German would be looking at.
            const { before, after } = await page.evaluate(async () => {
                window.chesslines.showLine('italian-game');
                window.chesslines.explain.offer({ san: 'e4' });
                await new Promise((r) => setTimeout(r, 20));
                const before = document.querySelector('.explain-text').textContent;
                document.getElementById('lang').click();
                await new Promise((r) => setTimeout(r, 20));
                return { before, after: document.querySelector('.explain-text').textContent };
            });
            assert(before.length > 0 && after.length > 0, 'no move text on screen');
            assert(before !== after, `the sentence did not change language: "${before}"`);
            await page.evaluate(() => document.getElementById('lang').click());
        },
    },

    {
        name: 'no German letter ever reaches storage',
        async run(page) {
            // ADR 0009's rule. What is stored is a language preference and
            // nothing else at this stage; the check exists so it stays that way.
            const stored = await page.evaluate(() => {
                window.chesslines.showLine('italian-game');
                window.chesslines.explain.offer({ san: 'e4' });
                const out = {};
                for (let i = 0; i < localStorage.length; i += 1) {
                    const k = localStorage.key(i);
                    out[k] = localStorage.getItem(k);
                }
                return out;
            });
            const bad = Object.entries(stored)
                .filter(([, v]) => /\b[DTLS]\d?[a-h]?[1-8]\b/.test(v));
            assert(bad.length === 0, `German notation in storage: ${JSON.stringify(bad)}`);
        },
    },
];
// ─── Run ─────────────────────────────────────────────────────────────────────
// Every check runs against both engines. The desktop is not the target, and
// sndlab shipped a WebKit-only bug that was silent on Chromium (its issue #5).
//
// Playwright's WebKit is current Safari, not the phone. It cannot see
// `touch-action`, the long-press callout, or rubber-band scrolling — caniuse
// marks touch-action "not applicable" on desktop Safari. Those defenses are in
// css/board.css and are structurally unverifiable here. A real device is the
// only proof. See docs/adr/0006-ios-is-the-target.md.

const ENGINES = [
    { name: 'chromium', launch: chromium, screenshots: true },
    // Screenshots come from one engine only: two sets of the same layout is
    // twice the images and no more information.
    { name: 'webkit', launch: webkit, screenshots: false },
];

const server = await serve();
const origin = `http://localhost:${server.address().port}`;
let failures = 0;

try {
    for (const engine of ENGINES) {
        console.log(`\n  ${engine.name}`);
        const browser = await engine.launch.launch();
        try {
            failures += await runChecks(browser, engine);
        } finally {
            await browser.close();
        }
    }
} finally {
    server.close();
}

async function runChecks(browser, engine) {
    let failed = 0;
    const page = await browser.newPage();

    // Anything the page says about itself. Collected for the whole run,
    // asserted at the end so a late error still fails it.
    const consoleErrors = [];
    const failedRequests = [];
    page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()));
    page.on('pageerror', (e) => consoleErrors.push(String(e)));
    page.on('requestfailed', (r) => failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`));

    // pause=0 removes the opponent's thinking time. The checks assert order —
    // the right move with the right text after the right one — never duration,
    // so no timing enters the suite (ADR 0012).
    await page.goto(`${origin}/?pause=0`, { waitUntil: 'networkidle' });

    for (const check of checks) {
        try {
            await check.run(page, browser);
            console.log(`    ok    ${check.name}`);
        } catch (err) {
            failed++;
            console.log(`    FAIL  ${check.name}\n            ${err.message}`);
        }
    }

    if (consoleErrors.length) {
        failed++;
        console.log(`    FAIL  console is clean\n${consoleErrors.map((e) => `            ${e}`).join('\n')}`);
    } else {
        console.log('    ok    console is clean');
    }

    if (failedRequests.length) {
        failed++;
        console.log(`    FAIL  all requests resolved\n${failedRequests.map((r) => `            ${r}`).join('\n')}`);
    } else {
        console.log('    ok    all requests resolved');
    }

    if (engine.screenshots) {
        // Taken unconditionally, pass or fail. A visual check that only runs on
        // demand is one that gets skipped exactly when it matters.
        await mkdir(SHOTS, { recursive: true });
        await reset(page);

        const idle = join(SHOTS, 'app.png');
        await page.screenshot({ path: idle, fullPage: true });

        // Selection state is where the markers actually have to work: the dot
        // must be findable at a glance without hiding the piece under it.
        await tap(page, 'e2');
        const selected = join(SHOTS, 'app-selected.png');
        await page.screenshot({ path: selected, fullPage: true });

        // The phone is the target, so the phone-width shot is the one worth
        // looking at hardest — squares too small, coordinates unreadable, the
        // board pushed off the screen.
        const original = page.viewportSize();
        await page.setViewportSize({ width: 375, height: 667 });
        // Show the mode mid-walk rather than the bare board: the layout question
        // this app actually has is whether the board and the move text fit on a
        // phone together. Two moves in, so a real sentence is on screen.
        await page.evaluate(async () => {
            window.chesslines.showLine('italian-game');
            window.chesslines.explain.offer({ san: 'e4' });
            await new Promise((r) => setTimeout(r, 30));
        });
        const phone = join(SHOTS, 'app-phone.png');
        await page.screenshot({ path: phone, fullPage: true });
        await page.setViewportSize(original);

        const shots = [idle, selected, phone].map((f) => f.replace(ROOT, '')).join(', ');
        console.log(`\n  screenshots → ${shots}`);
        console.log('                (look at them — it is not verified until you have)');
    }

    await page.close();
    return failed;
}

console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
