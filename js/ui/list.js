// The list of lines, grouped by the side they are for.
//
// Nine of the twelve ship without move texts. They are shown rather than
// hidden, because a list that grows over time is a promise kept in front of
// him — but they are inert, and say so, since an opening without its texts is
// not what this mode is.

import { pick, t } from '../i18n/i18n.js';

export class List {
    #root;
    #onPick;

    constructor(root, { onPick }) {
        this.#root = root;
        this.#onPick = onPick;
    }

    render(lines, lang) {
        this.#root.replaceChildren(
            ...['w', 'b'].map((side) => this.#group(lines, side, lang)),
        );
    }

    #group(lines, side, lang) {
        const section = document.createElement('section');
        section.className = 'group';

        const heading = document.createElement('h2');
        heading.textContent = t(side === 'w' ? 'list.white' : 'list.black', lang);
        section.append(heading);

        const ul = document.createElement('ul');
        ul.className = 'lines';
        for (const line of lines.filter((l) => l.side === side)) {
            ul.append(this.#item(line, lang));
        }
        section.append(ul);
        return section;
    }

    #item(line, lang) {
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
        if (ready) button.addEventListener('click', () => this.#onPick(line.id));

        li.append(button);
        return li;
    }
}
