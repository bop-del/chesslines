# ADR 0008 — localStorage plus export, and the 7-day rule

**Status:** accepted
**Date:** 2026-09-05

## Context

The repertoire and its progress are **Felix's data**. There is no server
(ADR 0001), so it lives in the browser — and the target browser is iOS Safari
(ADR 0006), which deletes browser storage on a schedule.

## Decision

**localStorage, one compact key**, with the due date as a day number rather than
an ISO string. Measured at about 2 KB for 150 cards.

**Export and import from day one**, as a JSON file: a Blob plus `<a download>`
to save, `<input type="file">` to restore.

**A PWA is deferred**, with export as the mitigation, and the reason recorded
here so the argument is already written when it comes back.

## Rationale

**The iOS problem, stated plainly.** WebKit's tracking prevention deletes **all
script-writeable storage after 7 days of Safari use without interaction with the
site** — localStorage and IndexedDB alike. Practising twice a week never trips
it. A three-week holiday could, and it would erase a child's practice history.

**"IndexedDB is safer on iOS" is folklore with no primary source.** The 7-day
policy covers both. IndexedDB's async complexity buys nothing here, and 2 KB
does not need a database.

**The only documented defence is Add to Home Screen**, which is explicitly
exempt from the cap. That makes a PWA a *durability* feature rather than a
convenience — a different and stronger argument than the one that deferred it.
It is deferred, not rejected.

**Export is a feature, not a chore.** It is the backup that makes the 7-day risk
survivable — *and* it is how a repertoire Felix built can be kept, moved to
another device, or shown to somebody. The second reason is why it ships on day
one rather than when it is first needed.

**Not URL state**, despite this project's general preference for it: a
repertoire plus progress exceeds the safe ~2,000-character cap and gzip barely
helps at this size. The URL stays right for *sharing a repertoire* later; it is
wrong for carrying daily progress.

## Consequences

**Positive:** No server, no accounts, no privacy surface for a child's data.

**Positive:** A day number keeps the stored form small and comparison trivial.

**Negative:** Storage can vanish, and no automated check can prove otherwise
(ADR 0006). The defence is export plus, eventually, Add to Home Screen.

**Negative:** Export is a manual act. A child will not do it unprompted, so the
app should ask at a sensible moment — a UI question, not a storage one.

**Negative:** The day-number encoding needs a fixed epoch, and a bug there
shifts every due date at once. It gets a unit test.
