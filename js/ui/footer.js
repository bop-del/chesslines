// The footer: export and import, below the tab content.
//
// It belongs to the **screen**, not to any tab (#44). The two controls act on
// the whole repertoire rather than on what a tab is showing, and repeating them
// per tab would be the same control appearing three times, which is three
// things to a child. It also keeps import reachable with nothing adopted —
// import exists to restore a device with nothing on it, and Mine is greyed
// then, so the footer is the only place it can live.
//
// These are a **parent's tool** (#41): always present, never behind a mode, and
// at the bottom, so reaching them means deliberately scrolling past everything
// Felix cares about. Styled like the language button — muted, transparent
// border, smaller than the openings — because the pattern for "an adult's
// control, present but not calling to a child" already exists in this codebase.
//
// Nothing here records when he last exported. That would be the seed of the
// reminder #41 rules out.

import { t } from '../i18n/i18n.js';

export class Footer {
    #root;
    #onExport;
    #onImport;
    #export;
    #import;
    #input;
    #message;
    #lang = 'en';

    constructor(root, { onExport, onImport }) {
        this.#root = root;
        this.#onExport = onExport;
        this.#onImport = onImport;
        this.#build();
    }

    #build() {
        this.#export = document.createElement('button');
        this.#export.className = 'footer-control';
        this.#export.id = 'export';
        this.#export.addEventListener('click', () => this.#onExport());

        // A label rather than a button: `<input type="file">` is the only way to
        // read a chosen file, and Safari has no `showSaveFilePicker` to replace
        // it (js/data/store.js). The input itself is hidden, so the label is
        // what is styled and what is tapped.
        this.#import = document.createElement('label');
        this.#import.className = 'footer-control';
        this.#import.id = 'import';

        this.#input = document.createElement('input');
        this.#input.type = 'file';
        this.#input.accept = 'application/json,.json';
        this.#input.className = 'footer-file';
        this.#input.addEventListener('change', () => this.#chose());
        this.#import.append(this.#input);

        // Only ever holds a failure. A successful import says nothing — the
        // openings simply are what the file says, and announcing it would be
        // the celebration the no-streak rule forbids.
        this.#message = document.createElement('p');
        this.#message.className = 'footer-message';
        this.#message.hidden = true;
        // Politely, not assertively: a failure is not an interruption.
        this.#message.role = 'status';

        this.#root.replaceChildren(this.#export, this.#import, this.#message);
    }

    async #chose() {
        const file = this.#input.files?.[0];
        // Resetting first, so picking the same file twice fires `change` twice.
        // Without this, a failed import cannot be retried with the same file.
        this.#input.value = '';
        if (!file) return;
        this.#message.hidden = true;
        try {
            await this.#onImport(await file.text());
        } catch {
            // The store's own message is a sentence about a file, and it is not
            // translated; the footer's is, because this is the one string in
            // this path a child could read. Nothing distinguishes "unreadable
            // file" from "not a repertoire" here — both mean "that was the
            // wrong file", and a nine-year-old can act on only that much.
            this.#message.textContent = t('footer.importFailed', this.#lang);
            this.#message.hidden = false;
        }
    }

    // Redrawing the screen clears a failure. The message is about the file he
    // just picked, not about the app, so it must not survive walking a line and
    // coming back — and it must not be the thing a fresh visit opens on.
    clear() {
        this.#message.hidden = true;
        this.#message.textContent = '';
    }

    render(lang) {
        this.#lang = lang;
        this.#export.textContent = t('footer.export', lang);
        // The input is a child of the label, so setting textContent would
        // remove it. The label's own text is a node beside it.
        const text = t('footer.import', lang);
        const existing = [...this.#import.childNodes].find((n) => n.nodeType === Node.TEXT_NODE);
        if (existing) existing.nodeValue = text;
        else this.#import.append(document.createTextNode(text));
        // A message on screen is retranslated rather than left in the language
        // it was written in: switching language redraws everything else, and a
        // sentence that did not change would be the one thing that lied.
        if (!this.#message.hidden) this.#message.textContent = t('footer.importFailed', lang);
    }
}
