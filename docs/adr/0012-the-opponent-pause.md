# ADR 0012 — The opponent's move pauses, and the pause is a parameter

**Status:** accepted
**Date:** 2026-09-05

## Context

In Explain, Felix plays the moves of the side the line is for; the app plays
the opponent's. In the Scandinavian, taught from Black, four of the eight moves
are the opponent's — the app plays more of that line than he does.

Each move carries a text. If the opponent's move lands the instant Felix
finishes his own, its text appears and is replaced while he is still reading
the previous one. The sentence explaining *why the opponent does that* is the
one most likely to be missed, and it is the one that makes the line make sense.

So the opponent's move waits about a second. That is the first time this
project makes behaviour depend on a clock.

## Decision

**The opponent's move is delayed** by a short pause before it plays.

**The pause is a parameter of the Explain module, not a constant inside it.**
The app passes roughly a second; the verification run passes zero.

**The checks assert order, never duration** — that the opponent's move follows
Felix's, that the text is the one belonging to that move — and never that a
particular number of milliseconds elapsed.

## Rationale

**`scripts/verify.mjs` waits for nothing today.** Every check is deterministic:
the page loads, the DOM responds, assertions run. Introducing a real delay into
that would make timing the first source of flakiness in a suite that has none —
and a suite that fails at random is one people stop believing, which is worse
than a slower one.

**Zero in tests is not a weaker check, it is a different one.** What the
assertions can meaningfully verify is *sequence and attribution*: the right
move, with the right text, in the right order. Whether one second is the right
length is a judgement about a child's reading speed, and no assertion has an
opinion about that.

**It follows ADR 0006 rather than fighting it.** The run already cannot judge
whether the app teaches, or how it feels on a phone. Pace belongs to the same
category — the honest place to settle it is Felix using it, not a timer in a
headless browser.

**A parameter costs nothing.** The alternative — a constant read from module
scope — would force the tests to either wait or monkey-patch, and both are
worse than passing a number in.

## Consequences

**Positive:** The suite stays deterministic. No `waitForTimeout` enters the
codebase.

**Positive:** The pause can be tuned, or removed, without touching a test.

**Negative:** The one thing the pause exists for — that the text is readable
before the board moves — is exactly what the checks cannot confirm. It has to
be watched on a real phone, by someone watching a real child.

**Negative:** A number passed from the outside can be passed wrongly. A caller
omitting it should get the app's pace, not zero, so the default belongs with
the app and zero is the deliberate override.

## Alternatives considered

**Let the tests wait the real pause.** Closer to the real thing, and it buys a
slower suite plus the first flaky check. Rejected on the strength of what it
would actually verify: that `setTimeout` works.

**No pause; the opponent moves on Felix's next touch.** Fully deterministic
without any parameter. Rejected because it asks him to tap the board with
nothing to tap for, which is precisely the confusion the pause removes.
