# Workflow

How work moves from idea to merged code, and how bugs are fixed afterwards. The tracker is the progress record: ticket status is the kanban, `git log` is the history, ticket comments are the notes. Status vocabulary and the frontier are defined in `docs/agents/issue-tracker.md`.

## No backlog yet

Run `/to-spec` on the idea, then `/to-tickets` on the spec. Code starts once tickets exist.

## Start of session

1. Read the tracker and list the frontier.
2. `git log --oneline -15`.
3. Run the gate (see `AGENTS.md` › Commands). When it is red, fixing it is the session's first ticket.

Done when the gate is green and you know the frontier.

## Loop: one ticket per session

1. Pick one frontier ticket and set it `in-progress`.
2. Follow `/implement`: `tdd` at the ticket's seams, gate green, `code-review`.
3. Verify every acceptance criterion against running code (e2e when the ticket touches UI).
4. Set the ticket `done` with a one-line note, commit, and stop. Local tracker: the status edit goes in the same commit. GitHub: close the issue after the commit, with its sha in the comment.

A ticket is `done` only after step 3 passes. Acceptance criteria and tests are the spec: when one looks wrong, comment on the ticket and ask; the code changes, the criterion stays.

## Parallelism

One agent, sequential, by default. Run frontier tickets in parallel worktrees only when both hold:

- the tickets share no hotspot (schema, routes, configs, registries);
- branches merge one at a time, with the gate green after each merge.

## Maintenance

- **Bug**: open it with `.github/ISSUE_TEMPLATE/bug.md`. Reproduce it with a failing test (`diagnosing-bugs`, then `tdd`), fix, and keep the test as the regression guard.
- **Small change**: a ticket straight away, no spec.
- **Long session interrupted**: `/handoff`.
