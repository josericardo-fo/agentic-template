# Issue tracker: Local Markdown

Issues and specs for this repo live as markdown files in `.scratch/`. This is the single home for specs and acceptance criteria.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The spec is `.scratch/<feature-slug>/spec.md`
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## Status

Each ticket body carries `**Status:**` and `**Blocked by:**` lines (as written by `/to-tickets`).

- Status moves `ready-for-agent` → `in-progress` → `done`; edit the `**Status:**` line in place.
- **Frontier**: `ready-for-agent` tickets whose blockers are all `done`. "None (can start immediately)" counts as unblocked.
- **Close**: set `**Status:** done` and append a one-line note under `## Comments`, in the same commit as the code.

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.
