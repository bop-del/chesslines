# ADR 0004 — Branch deploy instead of an Actions workflow

**Status:** accepted
**Date:** 2026-09-05

*Carried from [sndlab ADR 0002](https://github.com/bop-del/sndlab).*

## Context

sndlab began with a GitHub Actions workflow uploading the repo root as a Pages
artifact. The first push was rejected: an OAuth token may not create files under
`.github/workflows/` without the `workflow` scope. That project dropped the
workflow rather than widen the token.

chesslines is the same shape — static, no build step, deployed from `main` — so
the same question arrives before the first deploy rather than after it.

## Decision

Branch deploy. GitHub Pages serves directly from `main` / root. There is no
Actions workflow. An empty `.nojekyll` in the root disables Jekyll processing.

## Rationale

Without a build step (ADR 0001) a workflow does nothing the branch deploy does
not also do — both upload the repo root. Granting the scope would pay for
ceremony without function.

`.nojekyll` is not optional decoration. Jekyll ignores paths beginning with an
underscore, which would silently 404 any such file. Committing it before the
first deploy avoids debugging a missing file later.

## Consequences

**Positive:** One OAuth scope less. Fewer moving parts. Push equals deploy.

**Negative:** No deploy logs under "Actions" — only the status in Pages
settings. Acceptable for a static project.

**Negative:** The verification run (ADR 0005) is therefore a **local** gate, not
a CI gate. Nothing stops a broken commit reaching Pages except running
`npm run verify` before pushing. Adding CI later is additive and needs the
`workflow` scope: `gh auth refresh -h github.com -s workflow`.

**Negative:** As soon as a build step is needed, the workflow has to come back.

## Alternatives considered

**Cloudflare Pages** — unlimited bandwidth, preview deployments per branch, and
a backend would be one file in `/functions`. Not chosen because the code already
lives on GitHub and Pages is a checkbox there. If server logic ever becomes
necessary, Cloudflare is the intended migration path — new ADR at that point.
