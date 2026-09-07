// The three tabs on the list screen: Openings, Mine, Practise.
//
// Openings is live and is the way in. The other two are greyed, and each
// **states the condition that opens it** rather than merely being disabled —
// "Mine — once you add an opening" (#28, #47).
//
// The condition names an act, never a clock. Practise's real condition is that
// something is due, and saying so would be a locked door with no key: waiting
// is not something a nine-year-old can go and do. Adopting is. So both greyed
// tabs name adopting, which is the one door he can actually open.
//
// Nothing here counts, accumulates or announces. A greyed tab carrying a
// number, or a bar filling toward an unlock, is the announced reward the
// spec measures decaying to d=-0.20 over a year — a tab stating its route is
// a different object, and this module must stay the second one.
//
// The pattern is the one the nine text-less openings already use: shown rather
// than hidden, dashed, plainly not ready (css/explain.css).

import { t } from '../i18n/i18n.js';

// Openings is the only live tab this build has. Mine and Practise are greyed
// until Adopt (#48) and Drill exist; when they arrive, they gain a `live`
// predicate here rather than a special case at the call site.
const TABS = [
    { id: 'openings', label: 'tabs.openings' },
    { id: 'mine', label: 'tabs.mine', when: 'tabs.mineWhen' },
    { id: 'practise', label: 'tabs.practise', when: 'tabs.practiseWhen' },
];

export class Tabs {
    #root;
    #onPick;
    #current = 'openings';

    constructor(root, { onPick } = {}) {
        this.#root = root;
        this.#onPick = onPick;
    }

    get current() {
        return this.#current;
    }

    render(lang) {
        this.#root.replaceChildren(...TABS.map((tab) => this.#tab(tab, lang)));
    }

    #tab(tab, lang) {
        // A tab with no condition is a live one. Today that is Openings alone.
        const live = tab.when === undefined;

        const button = document.createElement('button');
        button.className = 'tab';
        button.dataset.tab = tab.id;
        button.disabled = !live;
        // The tab bar is a set of destinations, so it says so to a screen
        // reader rather than reading as three loose buttons.
        button.role = 'tab';
        button.ariaSelected = String(live && tab.id === this.#current);

        const label = document.createElement('span');
        label.className = 'tab-label';
        label.textContent = t(tab.label, lang);
        button.append(label);

        if (!live) {
            const when = document.createElement('span');
            when.className = 'tab-when';
            when.textContent = t(tab.when, lang);
            button.append(when);
        }

        if (live) {
            button.addEventListener('click', () => {
                this.#current = tab.id;
                this.render(lang);
                this.#onPick?.(tab.id);
            });
        }

        return button;
    }
}
