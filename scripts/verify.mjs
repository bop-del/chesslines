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
const PORT = 8123; // deliberately not 8000 — the dev server keeps that one
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
    return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

// Assertions read from the real game object, not from what the UI says about
// itself. `window.chesslines` is exposed by main.js for exactly this.
const state = (page) => page.evaluate(() => ({
    fen: window.chesslines.game.fen(),
    turn: window.chesslines.game.turn(),
    history: window.chesslines.game.history(),
}));

const reset = (page) => page.evaluate(() => {
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

    await page.goto(`http://localhost:${PORT}/`, { waitUntil: 'networkidle' });

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
        await reset(page);
        await tap(page, 'e2');
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
