// The edge: localStorage, and the export file.
//
// Everything that can fail lives here, so js/data/repertoire.js stays pure.
// Two failures are real rather than theoretical:
//
//   **A private window refuses the write.** Same `try`/`catch` as the language
//   and hint preferences: the visit still works, it is simply not remembered.
//
//   **Storage can vanish entirely.** WebKit deletes all script-writeable
//   storage after 7 days of Safari use without visiting the site (ADR 0008).
//   Export is the documented defence, which is why it ships with the store
//   rather than later.
//
// `showSaveFilePicker` is unsupported in Safari, so the File System Access API
// is out: export is a Blob plus `<a download>`, import an `<input type="file">`.

import { NOT_A_REPERTOIRE, Repertoire } from './repertoire.js';

// One compact key (ADR 0008), not one per card.
export const KEY = 'repertoire';

const storage = () => (typeof localStorage === 'undefined' ? null : localStorage);

// Read the repertoire. Anything unreadable — nothing stored yet, a browser that
// throws on access, a document this build cannot parse — loads as empty. A
// child opening the app must get an app, never a stack trace.
export function load(known, store = storage()) {
    let text = null;
    try {
        text = store?.getItem(KEY) ?? null;
    } catch {
        return new Repertoire();
    }
    if (!text) return new Repertoire();
    try {
        return Repertoire.from(JSON.parse(text), known);
    } catch {
        return new Repertoire();
    }
}

// Write it. Returns whether it stuck, so a caller that cares can tell — and
// nothing throws, because the app has to work for the visit either way.
export function save(repertoire, store = storage()) {
    try {
        store?.setItem(KEY, JSON.stringify(repertoire.toJSON()));
        return true;
    } catch {
        return false;
    }
}

// `chesslines-YYYY-MM-DD.json` — sortable, and it says when. A fixed name
// leaves Safari to disambiguate with (1), (2), which a month later tells you
// nothing about age or content; a name carrying the day means a same-day
// re-export overwrites instead of accumulating (#41).
//
// The local date, not UTC: the file is named for the day he was practising.
export function filename(now = new Date()) {
    const pad = (n) => String(n).padStart(2, '0');
    return `chesslines-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

// The text of an export file. The stored form exactly, so a file and a store
// never disagree about their shape.
export function toFile(repertoire) {
    return JSON.stringify(repertoire.toJSON());
}

// Read a chosen file. Unlike `load`, this throws on nonsense: he picked this
// file deliberately, and silently importing nothing would look like it worked.
export function parseFile(text, known) {
    let doc;
    try {
        doc = JSON.parse(text);
    } catch {
        throw new Error(NOT_A_REPERTOIRE);
    }
    return Repertoire.from(doc, known);
}

// Hand the file to the browser. A Blob plus a synthetic click on `<a download>`
// — the only mechanism that works in Safari.
export function download(repertoire, doc = globalThis.document, now = new Date()) {
    const blob = new Blob([toFile(repertoire)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = doc.createElement('a');
    a.href = url;
    a.download = filename(now);
    doc.body.append(a);
    a.click();
    a.remove();
    // Revoking immediately is safe once the click has been dispatched, and not
    // revoking leaks the blob for the life of the page.
    URL.revokeObjectURL(url);
    return a.download;
}
