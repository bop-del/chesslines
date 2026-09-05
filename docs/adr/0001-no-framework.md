# ADR 0001 — No framework, no build step

**Status:** accepted
**Date:** 2026-09-05

*Carried from [sndlab ADR 0001](https://github.com/bop-del/sndlab), amended for
vendoring.*

## Context

This is a browser chess application. The conventional choice would be a
framework (React, Svelte) plus a bundler (Vite) — component model, HMR,
tree-shaking.

A secondary goal of the project is fast iteration with agents (Claude Code).
That shifts the trade-off, exactly as it did in sndlab.

## Decision

Vanilla JavaScript with native ES modules. Handwritten CSS. No bundler, no
transpiler, no runtime dependencies. What is in the repo runs in the browser.

**Amendment for chesslines:** this project needs chess legality and SAN parsing,
which is genuinely hard to get right and dangerous to get wrong. That code is
*vendored* rather than depended on — see ADR 0002. Vendoring keeps the claim
above literally true: `js/vendor/chess.js` is a file in this repo, served
unmodified by GitHub Pages, not an npm install.

## Rationale

**An agent can hold the whole project in view.** No build configuration that can
go wrong, no abstraction layer between code and result, no `node_modules` with
hidden behaviour. That is the most common reason agents get things wrong — and
it disappears here.

**The browser is a serious runtime now.** ES modules, `<dialog>`, CSS grid,
localStorage — all native. Nothing this app does needs a compiler.

**Client-side compute is free and unlimited.** The load sits with the user;
static hosting costs nothing and still runs in ten years. This app has no
server, no accounts and no database, so there is nothing else to pay for.

## Consequences

**Positive:** Push equals deploy. No migrations, no staging, no production
state. Breaking things is consequence-free, which permits aggressive rewrites.

**Positive:** A nine-year-old's practice history lives in his browser and
nowhere else. No server means no data to leak.

**Negative:** No component model — UI structure has to be disciplined by hand.
The mitigation is the same as sndlab's: split at ~500 lines.

**Negative:** No tree-shaking, no minification. Irrelevant at this size; the
generated catalogue map is the only large asset, and it is ~61 KB gzipped by
design (ADR 0005).

## Alternatives considered

**Vite without a framework** — would give HMR and bundling at low configuration
cost. Rejected because a build step undermines the core claim: what is in the
repo runs. A reload is fast enough.
