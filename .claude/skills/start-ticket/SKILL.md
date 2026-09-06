---
name: start-ticket
description: Open a ticket for work — check it is startable, claim the card, then open a lane for it and start an agent building in it. Use when the user asks to start, take, pick up or begin a ticket.
disable-model-invocation: true
---

# Start a ticket

The first step of the flow, and the bookend to `/accept-ticket`:

```
/start-ticket   → claims it, opens a lane, and starts /implement in it
/implement      → builds it, in the lane
/accept-ticket  → Boris judges it, in the lane
```

**This session is the launchpad, and it stays on `main`.** It opens lanes and
starts agents in them. It does not check out a feature branch, and it does not
build anything itself.

## Why the launchpad never branches

Measured, not assumed. While the main session sat on `feat/14-move-hint`, a
second session merged #14 — and the main clone's working directory jumped to
`main` with nobody touching it. One ticket, harmless. Several at once, and lanes
pull the ground out from under each other mid-build.

So every ticket lives entirely in its own lane, merge included. `CONTEXT.md`
defines both terms:

- **Launchpad** — this session, in the main clone, always on `main`. Addressable
  as the Herdr agent `launchpad`.
- **Lane** — one ticket's isolated place to work: a git worktree for the files,
  plus a Herdr workspace and agent for the session.

**Both halves are required.** A Herdr pane isolates the session; a worktree
isolates the files. Two agents in two panes of the same clone share a working
directory and a branch — observed while building #14, where `git worktree list`
still showed one entry. A pane alone is not a lane.

## 1. Resolve the ticket

Take the issue number from the argument. **With no argument, ask** — do not
infer one. `/accept-ticket` can infer from the last commit because the work
exists by then; here there is nothing to infer from, and starting the wrong
ticket wastes a whole session.

Read it: `gh issue view <n> --comments`.

## 2. Check it is actually startable

Four gates. Report what you checked; stop on the first failure and say which.

**Is it blocked?** Read the `## Blocked by` section of the body — a list of
`- #30 — reason` lines. Check each blocker with `gh issue view <blocker>
--json state`. Any blocker still open means stop.

> GitHub's native dependency API is **not** populated on this repo — every
> ticket returns `blocked_by: 0` from `issue_dependencies_summary` even when
> its body names a blocker. Parse the body; do not trust the API.

**Is it claimed?** `gh project item-list 3 --owner bop-del --format json`. If
the card is already `In progress`, stop — unless it is a stale claim (clean
tree, nothing pushed, per the board rules), in which case say so and ask
before taking it.

Cross-check `herdr agent list` as well: a lane still running for that ticket is
a live claim whatever the board says, and a card in `In progress` with no lane
is the stale case.

**Is it ready?** A card in `Ideas` or `Needs decision` is not built by an
agent — that is what `/grill-with-docs` is for. Say so and stop.

**Is `main` clean and pushed?** `git status --short --branch`. The lane is cut
from freshly fetched `origin/main`, so unpushed commits here would be missing
from it, and uncommitted changes would be stranded in the launchpad. Report and
let Boris resolve it.

## 3. Claim the card

Move it to `In progress` — option id `a12534d4`, mechanics and field ids in
`docs/agents/issue-tracker.md`. This is the first write, before any git
command.

If the issue is not on the board at all, add it first (`gh project item-add`),
and note that a new item can take a minute to appear in reads.

## 4. Open the lane

Name the branch `<kind>/<n>-<slug>` — `kind` from the issue's label (`feat` for
`feature`, `fix` for `bug`), slug from the title, short.

**Herdr does both halves in one call.** `worktree create` makes the worktree
*and* a workspace with a shell pane already in it. No separate `workspace
create` is needed:

```bash
herdr worktree create --cwd ~/code/chesslines \
  --branch feat/3-drill-loop --base origin/main --no-focus
```

Run `git fetch origin` first, so `origin/main` is the real one.

Read the ids out of the response rather than predicting them:
`.result.workspace.workspace_id` and `.result.root_pane.pane_id`. Keep the
workspace id — `/accept-ticket` needs it to ask for cleanup.

The worktree lands under `~/.herdr/worktrees/<repo>/<branch-slug>`, not beside
the clone; the slug replaces `/` with `-`, so `feat/15-parallel-lanes` becomes
`feat-15-parallel-lanes`. Take the path from the response, not from that rule.

**Symlink `node_modules` in.** It is not carried over, it is 18MB and
gitignored, and Playwright's Chromium is not in git — without it the lane cannot
run `npm test` at all, let alone `scripts/verify.mjs`:

```bash
ln -s ~/code/chesslines/node_modules <lane-path>/node_modules
```

**Then run the suite in the lane, before handing it to an agent.** A lane that
starts red wastes a whole session, and the failure is usually not the lane: when
this was done by hand for #15, `npm test` failed on the build number, which
turned out to be a real defect in #17. Run `npm test` in the lane path; if it is
red, stop and say so rather than starting an agent on top of it.

## 5. Start the agent in it

```bash
herdr agent start lane<n> --kind claude --pane <root-pane-id> \
  -- --plugin-dir ~/code/mattpocock-skills
```

**The `--` passthrough is not optional.** `herdr agent start` launches a bare
`claude`, and the engineering skills are not registered anywhere persistent —
they are not in `enabledPlugins` in `~/.claude/settings.json` and reach a
session only through `--plugin-dir`. Without it the lane has no `/implement`, no
`/tdd`, no `/code-review`; the first attempt at #15's own lane died on exactly
this, with `/mattpocock-skills:implement` answering "Unknown command".

What hides it: `/start-ticket` and `/accept-ticket` *do* work in a lane, because
they live in `.claude/skills/` inside the repo and are plugin-independent. Only
the shared skills go missing, and only when you reach for one.

Equivalently, `bin/cc-chesslines <lane-path>` does the same thing plus the
GitHub-account check. Prefer it when starting a lane by hand in a shell; the
`agent start` form above is what this skill uses, because Herdr must recognise
the agent in order to name it.

Name it `lane<n>` — stable, and the address `/accept-ticket` messages back from.

Then hand it the ticket:

```bash
herdr agent prompt lane<n> "/mattpocock-skills:implement <n>"
```

**Chain here; do not offer.** The old rule was "offer, never chain", for two
reasons that no longer hold. Chaining used to mean handing `/implement` this
session's whole context — but a lane agent starts cold regardless, and inherits
nothing. And the three writes were said to be worth watching land — but every
one is reversible: card back to `Ready`, `herdr worktree remove --workspace
<id>`, `git branch -D`.

Do not `--wait`. Nothing here waits on anything: a launchpad blocked on one lane
cannot start the next, which is the opposite of the point.

## 6. Hand off

Report, in one short block: the ticket, what the blockers were and that they are
closed, the card's new status, the branch and lane path, the workspace id, and
that the agent is building.

Then **stop, and stay on `main`.** Do not implement anything in this
invocation, and do not follow the lane into its work — the next thing this
session does is open another lane or nothing at all.

The lane will ping for itself when it is done, and `/accept-ticket` runs
**in the lane**, not here.

## What not to do

- Do not claim and then discover the ticket was blocked. Check first; a claim
  you have to undo is noise on the board.
- Do not check out the branch in this clone. The launchpad stays on `main`.
- Do not start an agent without `--plugin-dir`. It will look fine until it
  reaches for a skill.
- Do not skip the `npm test` run in the lane. A red lane is a wasted session.
- Do not bump `js/version.js` here — or anywhere by hand. It is derived
  (`npm run build-number`), which is what stopped every parallel merge
  conflicting on it (#17).
- Do not add trailers to commits in this repo (`CLAUDE.md`).
