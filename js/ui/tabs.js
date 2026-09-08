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

// A tab is live when its `live` predicate says so, and a tab with no predicate
// is always live — Openings, the way in. The rule lives here rather than at the
// call site, so a tab's condition and the words stating it sit together.
//
// Mine opens on the first adopt and stays open (#48). Practise is greyed until
// Drill exists; it also needs a card to come due, which is why its condition is
// not Mine's — adopting opens one and not the other (#47).
const TABS = [
    { id: 'openings', label: 'tabs.openings' },
    {
        id: 'mine',
        label: 'tabs.mine',
        when: 'tabs.mineWhen',
        live: (repertoire) => repertoire.lines.size > 0,
    },
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

    // `repertoire` is what the predicates read. It is passed in on every draw
    // rather than held, so the bar cannot go stale against a repertoire that
    // changed while a line was being walked — which is exactly when the first
    // adopt happens.
    render(lang, repertoire) {
        this.#root.replaceChildren(...TABS.map((tab) => this.#tab(tab, lang, repertoire)));
    }

    #tab(tab, lang, repertoire) {
        // A tab with no condition is a live one; a tab with one is live when
        // its predicate says so, and until then it states the condition.
        const live = tab.when === undefined || Boolean(tab.live?.(repertoire));

        const button = document.createElement('button');
        button.className = 'tab';
        button.dataset.tab = tab.id;
        button.disabled = !live;
        // The tab bar is a set of destinations, so it says so to a screen
        // reader rather than reading as three loose buttons. `setAttribute`
        // rather than the reflected properties, matching js/board/Board.js.
        //
        // A tab has to name the panel it opens, or a screen reader announces
        // "tab 1 of 3" and has nothing to move to — a half-built pattern is
        // worse than none. There is one panel, because switching tabs replaces
        // its contents rather than revealing a second region.
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', String(live && tab.id === this.#current));
        button.setAttribute('aria-controls', 'tab-content');

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
                this.render(lang, repertoire);
                this.#onPick?.(tab.id);
            });
        }

        return button;
    }
}
