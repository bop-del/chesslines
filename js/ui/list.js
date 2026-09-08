// The list of lines, grouped by the side they are for.
//
// Nine of the twelve ship without move texts. They are shown rather than
// hidden, because a list that grows over time is a promise kept in front of
// him — but they are inert, and say so, since an opening without its texts is
// not what this mode is.
//
// It also marks what he has adopted, on the adopted ones **and only those**
// (#42). This is the one place showing all twelve at once, so it is the only
// place answering "which have I taken?" without a trip to Mine — a question
// asked while choosing what to walk next.
//
// **No counts, and nothing on the un-adopted rows.** A "3 of 12", a filled-in
// row, or a checkmark against nine empty ones is a scoreboard whether it is
// meant as one or not, and that is the no-streak rule broken. Achievement lives
// per-opening in Mine; un-adopted here is the plain state, not a gap.

import { pick, t } from '../i18n/i18n.js';

export class List {
    #root;
    #onPick;

    constructor(root, { onPick }) {
        this.#root = root;
        this.#onPick = onPick;
    }

    // `repertoire` says which rows carry the mark. Passed in on every draw
    // rather than held, for the reason Tabs is: the first adopt happens while a
    // line is being walked, so the list is redrawn against a repertoire that
    // changed since it was last on screen.
    render(lines, lang, repertoire) {
        this.#root.replaceChildren(
            ...['w', 'b'].map((side) => this.#group(lines, side, lang, repertoire)),
        );
    }

    #group(lines, side, lang, repertoire) {
        const section = document.createElement('section');
        section.className = 'group';

        const heading = document.createElement('h2');
        heading.textContent = t(side === 'w' ? 'list.white' : 'list.black', lang);
        section.append(heading);

        const ul = document.createElement('ul');
        ul.className = 'lines';
        for (const line of lines.filter((l) => l.side === side)) {
            ul.append(this.#item(line, lang, repertoire));
        }
        section.append(ul);
        return section;
    }

    #item(line, lang, repertoire) {
        // Matches Walk's own guard — `moves: []` is a natural half-written
        // state, and it must not produce a button that throws when tapped.
        const ready = Boolean(line.moves?.length);
        const li = document.createElement('li');

        const button = document.createElement('button');
        button.className = 'line';
        button.dataset.id = line.id;
        button.disabled = !ready;

        const name = document.createElement('span');
        name.className = 'line-name';
        name.textContent = pick(line.name, lang);

        const idea = document.createElement('span');
        idea.className = 'line-idea';
        idea.textContent = ready ? pick(line.idea, lang) : t('explain.soon', lang);

        button.append(name, idea);

        // A fact, not a score: it appears on the taken ones and nowhere else,
        // and it says the same thing whether one line is adopted or all twelve.
        // The word carries it rather than a tick, so a screen reader reads
        // something and the row does not depend on a glyph rendering.
        if (repertoire?.lines.has(line.id)) {
            const mark = document.createElement('span');
            mark.className = 'line-mark';
            mark.textContent = t('list.mine', lang);
            button.append(mark);
        }

        if (ready) button.addEventListener('click', () => this.#onPick(line.id));

        li.append(button);
        return li;
    }
}
