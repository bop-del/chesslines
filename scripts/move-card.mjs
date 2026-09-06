// Move a ticket's card on the board.
//
// The board is a separate system from the issue, and nothing links them: a PR
// merging with `Closes #n` closes the issue and leaves the card where it was.
// Card #14 sat in `In progress` for a day after its PR had merged (#22).
//
// `/accept-ticket` used to close that gap by *confirming* the card read `Done`,
// which catches a miss but cannot prevent one — it only ever runs when someone
// remembered to run it. This is the same step as a command, so landing a lane
// performs it instead of remembering it.
//
//   node scripts/move-card.mjs <issue> [status]
//
// Status defaults to `Done` and takes any column name from the table below.
// Re-running is safe: a card already in the target column is left alone.

import { execFileSync } from 'node:child_process';

// From docs/agents/issue-tracker.md, which is the source of truth for these.
// Adding or renaming a column mints new ids for *every* option, so if one of
// these is rejected, re-read the field and fix both places:
//   gh project field-list 3 --owner bop-del --format json
const PROJECT = '3';
const OWNER = 'bop-del';
const PROJECT_ID = 'PVT_kwHODNi2i84Bifsp';
const STATUS_FIELD = 'PVTSSF_lAHODNi2i84BifspzhhXkZI';

const STATUS = {
    'Ideas': '7d9f8335',
    'Needs decision': '654f427e',
    'Ready': '184ddde5',
    'In progress': 'a12534d4',
    'Needs review': '53d6bd04',
    'Done': 'bafab4de',
};

function gh(...args) {
    return execFileSync('gh', args, { encoding: 'utf8' });
}

function die(message) {
    console.error(message);
    process.exit(1);
}

export function main(argv) {
    const issue = argv[0];
    const target = argv[1] ?? 'Done';

    if (!/^\d+$/.test(issue ?? '')) {
        die('usage: node scripts/move-card.mjs <issue> [status]');
    }

    const option = STATUS[target];
    if (!option) {
        die(`unknown status '${target}' — one of: ${Object.keys(STATUS).join(', ')}`);
    }

    const board = JSON.parse(gh('project', 'item-list', PROJECT, '--owner', OWNER, '--format', 'json'));
    const card = board.items.find((item) => String(item.content?.number) === issue);

    // A missing card is the failure worth being loud about: it looks exactly
    // like a successful no-op, and the ticket it was meant to track is the one
    // nobody is looking at.
    if (!card) {
        die(`#${issue} has no card on project ${PROJECT} — add it with 'gh project item-add'`);
    }

    if (card.status === target) {
        console.log(`#${issue} is already ${target}`);
        return;
    }

    gh(
        'project', 'item-edit',
        '--id', card.id,
        '--project-id', PROJECT_ID,
        '--field-id', STATUS_FIELD,
        '--single-select-option-id', option,
    );

    console.log(`#${issue}: ${card.status ?? 'no status'} → ${target}`);
}

main(process.argv.slice(2));
