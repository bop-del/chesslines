# ADR 0006 — iOS is the target, and the verification gap it leaves

**Status:** accepted
**Date:** 2026-09-05

## Context

Felix uses this on an iPhone. That is not a portability note — it decides
several things that would otherwise be open, and it puts a documented limit on
what the verification run can prove.

## Decision

**iOS Safari on a phone is the target device.** Every trade-off is settled for
it: touch-first, phone-sized, no hover, no drag (ADR 0003).

**The verification run uses Playwright's WebKit**, not only Chromium, and both
engines must be green.

**The gap is stated rather than papered over:** Playwright's WebKit is not
Safari, and no desktop browser is iOS. What the run cannot prove is checked by
hand on the actual phone before anything matters.

## Rationale

**WebKit catches the whole class of bug that Chromium hides.** Safari is the
browser that lags — `<dialog>`, `:has()`, date handling, storage policy. A
Chromium-only suite would be green while the target was broken.

**But WebKit is not Safari, and the differences are exactly where this app
lives.** Playwright's WebKit does not implement Apple's Intelligent Tracking
Prevention, so the 7-day storage eviction in ADR 0008 **cannot be reproduced by
any automated check we can run**. It also does not model real touch, iOS Safari's
viewport chrome, Add to Home Screen, or the private-mode storage behaviour.

Writing that down is the point. An agent that believes a green suite means "works
on Felix's phone" will eventually ship something broken and say it verified it.

## Consequences

**Positive:** Two engines from one script; the common WebKit regressions are
caught automatically.

**Negative:** Storage durability is untestable here. ADR 0008 handles it by
design (export as the mitigation) rather than by test.

**Negative:** Layout and touch on a real phone need human eyes. The screenshot
in `.screenshots/` is phone-sized so that review is at least honest about the
viewport.

**Negative:** A real iOS Safari check needs a device or a paid device cloud.
Out of scope; the mitigation is that Boris has the phone in his hand.
