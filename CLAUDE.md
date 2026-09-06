# chesslines

A static browser app for learning chess openings. Framework-free.

Two users: Boris and his nine-year-old son Felix. Public, so other people may
use it, but **every design trade-off is settled in Felix's favour.**

> **Language: English.** All code, comments, docs, commits, issues and PRs in
> this repo are written in English — it is public. Conversation with Boris may
> be in German; what gets written down is not. The *app itself* is bilingual,
> which is a different thing entirely — see ADR 0009.
>
> **Identity: private account only.** Commits use `Boris Diebold
> <boris.diebold+gh@gmail.com>` (set in this repo's `.git/config`). Never pass
> `-c user.email=...` to git here — the work account must not appear in this
> repo's history.
>
> **No commit trailers.** Do not add `Co-Authored-By:` or `Claude-Session:`
> lines to commits in this repo. They add third-party contributors to the
> public repo and link a private session from it.

## Quick Start

```bash
cc-chesslines                # Claude Code in this repo, with engineering skills
python3 -m http.server 8000  # dev server (own tab) → http://localhost:8000
bin/setup                    # health check: prerequisites + deploy chain
```

No build step. Change a file, reload the browser. That is the whole loop.

## Hard rules

1. **No runtime dependencies.** No npm package in shipped code, no CDN links.
   All imports relative. Third-party code is *vendored* instead (ADR 0002).
2. **No build step.** What is in the repo runs in the browser. No bundler,
   no transpiler, no Tailwind.
3. **Vanilla JS + native ES modules.** No React, Vue, Svelte.
4. **Keep files small.** Split at ~500 lines. `js/vendor/` is exempt — it is
   out of view.
5. **English everywhere** in the repo.
6. **Stored data is always English SAN.** The repertoire, the export file and
   the position keys never see a German piece letter. Translation happens at
   the edge, on the way to the screen, and nowhere else (ADR 0009).

Note there is **no "encode state in the URL" rule** here, unlike sndlab. A
repertoire plus progress exceeds the safe URL length, and a shared link would
carry the sender's language. Progress lives in localStorage (ADR 0008).

### Why

An agent can hold the entire codebase in view, and there is no user state on a
server that can break — which permits aggressive rewrites instead of cautious
edits. Every dependency and every build step erodes that. See ADR 0001.

## Structure

```
index.html
css/
js/
├── main.js          entry point — wiring only, no logic
├── board/           renders a position, reports tap-to-move intent
├── data/            pgn parsing, position keys, the opening catalogue
└── vendor/          third-party, out of view (ADR 0002)
docs/
├── adr/             architecture decisions — ten of them
├── agents/          issue tracker, triage labels, domain docs
└── research/        source notes
scripts/             dev tooling — build-catalogue, verify. Ships to nobody.
test/                node --test over the pure logic
```

## Verification

Two layers, and neither replaces the other.

```bash
npm test             # node --test — the pure logic in js/data/
npm run verify       # Playwright — the real thing, both engines
```

`npm test` covers the position key, the PGN tree and catalogue lookup in
milliseconds, which is what makes test-first practical. `npm run verify` serves
the repo on port 8123 (the dev server keeps 8000, so both run at once) and
asserts what unit tests structurally cannot: that the modules load over HTTP,
the imports resolve, the console is clean, and it all works in **WebKit** as
well as Chromium. It writes `.screenshots/` — `app.png`, `app-selected.png` and a phone-sized
`app-phone.png` — on every run, pass or fail.

**Nothing is verified until both pass and the screenshot has been looked at.**
A green run with an unexamined screenshot is not a verification — the checks
cannot see layout, contrast or whether a nine-year-old could use it.

**Every shipped line must be proved legal.** A mistyped move in a curated
opening is invisible to review and authoritative to a child. `test/openings.test.mjs`
runs the starter list through the engine; the browser run does it again. Add an
opening only with its test passing.

Playwright's WebKit is not iOS Safari. It does not implement Apple's tracking
prevention, so the 7-day storage eviction **cannot be reproduced by any check
here** (ADR 0006). **A real phone is the only proof for anything mobile.**

Adding a feature means adding its checks. Dev tooling lives under `scripts/`
and `test/`; shipped code stays dependency-free (ADR 0005).

## The build number

`js/version.js` holds one string — `b30`, `b31`, … — shown on the page. It
answers one question after a push: *is the tab I am looking at the change I
just made, or a stale copy?* Pages takes 1–3 minutes, and without it the only
way to tell is to guess.

**It is derived, not typed.** `npm run build-number` counts the commits that
touched `index.html`, `css/` or `js/` and writes the result. Run it before
merging shipped changes to `main`. Docs-only, `scripts/`-only and `test/`-only
commits do not move it: the number tracks what is deployed, and one that
changes without the page changing is useless for the one job it has.

**Never edit `js/version.js` by hand.** `npm test` asserts it matches what
history says, so a hand edit fails the suite.

**`js/version.js` itself is excluded from the count**, which is what makes the
number stable: writing it is a commit touching `js/`, so counting it would move
the count again the moment it landed and the value would never settle. Run
`npm run build-number` whenever shipped files changed; running it twice says
"unchanged" the second time.

It used to be bumped by hand, which had two failure modes: a number can be
skipped or duplicated, and every parallel lane edits the same line, so every
parallel merge conflicted on it (#17). A number computed from history cannot do
either — there is nothing to choose.

## Deploy

Push to `main` → GitHub Pages (branch deploy from `/`). No manual step, no
Actions workflow (ADR 0004). Expect 1–3 minutes of CDN latency between push and
visible change — iterate locally, don't deploy to test.

Because there is no CI, `npm test` and `npm run verify` are a **local gate**.
Nothing stops a broken commit reaching Pages except running them first.

## Designing for a nine-year-old

These are decisions, not niceties. The full reasoning is in the design spec.

- **No streak, ever.** Gamification's measured effect decays from d=1.57 within
  an hour to **d=−0.20 over a year**. A progress meter that only goes up, and
  surprise unlocks — never something that can be lost.
- **Feedback names the idea**, not just the verdict: "this develops toward the
  centre", not "correct".
- **Always allow a retry.** A wrong move is shown, explained, and tried again.
- **No engine evaluation.** A −0.3 is meaningless and discouraging to a child.
- **Board oriented to his side.**

## How work flows

Issues are the backlog (`gh issue list`); the board says where each one has got
to. The workflow runs on the Matt Pocock engineering skills plus two that live
in this repo. The main flow, idea → shipped:

```
/superpowers:brainstorming        turn an idea into a design; classifies the
                                  work and writes the spec
/mattpocock-skills:grill-with-docs
                                  interview until the decisions are settled;
                                  writes CONTEXT.md and ADRs as it goes
/mattpocock-skills:to-tickets     split a spec into tickets with blocking edges
                                  — skip it when the work is one coherent
                                  change, which is most of the time here
/start-ticket                     claim the card, open a lane, and start
                                  /implement in it — before any code exists
/mattpocock-skills:implement      build a ticket; drives /tdd, closes with
                                  /code-review
/accept-ticket                    the judgements a verification run cannot
                                  make, walked one at a time, then Done
```

Keep brainstorming, grilling and tickets in **one context window** — the spec
is the first thing that survives a compact. `/implement` then starts fresh per
ticket.

`/start-ticket` and `/accept-ticket` bookend the build and live in
`.claude/skills/`, not the shared engineering skills, because they know about
this board, this verification run and this build number.

### Lanes, and the session that opens them

Tickets run **in parallel, one lane each** (#15). A lane is a git worktree for
the files plus a Herdr workspace and agent for the session; both halves are
required, since a second pane in the same clone shares its working directory
and its branch. `CONTEXT.md` defines **lane** and **launchpad**.

**The session in the main clone is the launchpad, and it stays on `main`.** It
opens lanes and starts agents in them; it never checks out a feature branch.
This is not tidiness: while the main session sat on `feat/14-move-hint`, another
session merged #14 and the main clone's working directory jumped to `main` on
its own. One ticket, harmless — several at once, and lanes pull the ground out
from under each other. So a ticket lives in its lane from claim to merge.

**If you are an agent in a lane, end the build by pinging, not by waiting.**
When both gates pass and the card is in `Needs review`:

```bash
herdr notification show "#<n> ready for review" --sound done
herdr pane send-text "$HERDR_PANE_ID" "/accept-ticket <n>"
```

`send-text` types the command without submitting, so a keystroke starts the
walk and nothing starts it unattended. Do not `herdr agent wait` on anything —
a blocked lane is a session held open for no reason, and blocking the launchpad
would stop it opening the next lane, which is the whole point.

Two things make parallel lanes painless rather than merely possible, and both
were taxes paid deliberately: the build number is derived from history rather
than typed (#17), so lanes cannot conflict on it, and `verify.mjs` asks the OS
for a free port (#18), so two lanes can run the checks at once.

**`/accept-ticket` is the slow step here, and it is meant to be.** In sndlab
the question was "does it sound good", answered in thirty seconds. Here it is
**"does it teach"**, and only Felix can answer it. Expect a card to sit in
`Needs review` until he has used the thing.

On-ramps onto that flow, not steps in it:

```
/mattpocock-skills:wayfinder      an effort too big for one session, where the
                                  route is not yet visible. Plans rather than
                                  builds: its output is decisions, not code.
                                  Adopt (#9) and Drill (#10) are marked for it.
/mattpocock-skills:research       a background agent against primary sources,
                                  writing one sourced Markdown file into
                                  docs/research/. Use it for opening move texts.
/mattpocock-skills:prototype      when a design question needs runnable code
/superpowers:systematic-debugging a bug that resists a first look
```

### Name collisions are real — check the prefix

Two bundles are installed and several skill names appear in both, plus a
personal set in `~/.claude/skills/`. The unprefixed name is not always the one
meant:

- **`/research`** is a personal skill that writes into an Obsidian vault.
  **`/mattpocock-skills:research`** is the one that writes into this repo.
- **`grilling`**, **`tdd`**, **`code-review`** and **`prototype`** exist in
  more than one place.

When a skill seems missing, it is usually the prefix, not the skill.

### Two bundles, one job each

`brainstorming` (Superpowers) and `grill-with-docs` (Pocock) are not rivals:
brainstorming diverges to find the design, grilling converges to settle it.
Running one then the other is the intended path, and the spec they produce
lands in `docs/superpowers/specs/` where both can read it.

Their build steps *are* rivals — `writing-plans` + `executing-plans`
(Superpowers) is the alternative to `to-tickets` + `start-ticket`
(Pocock/local). This repo uses the ticket route, because the board is where
work already lives. A plan document beside it would be a second source of truth
that `gh issue list` cannot see.

## Agent skills

### Issue tracker

GitHub issues on `bop-del/chesslines`, with progress tracked on project board 3
rather than in open/closed state. See `docs/agents/issue-tracker.md`.

### Triage labels

Two axes that do not overlap: **kind** as a label, **status** on the board.
See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — `CONTEXT.md` and `docs/adr/` at the root.
See `docs/agents/domain.md`.
