# Workflow

How work moves from idea to merged code, and how bugs are fixed afterwards. The tracker is the progress record: ticket status is the kanban, `git log` is the history, ticket comments are the notes. Status vocabulary and the frontier are defined in `docs/agents/issue-tracker.md`.

## No backlog yet

Run `/to-spec` on the idea, then `/to-tickets` on the spec. Commit both on their own (`docs: spec e tickets de <feature>`) before the first ticket. Code starts once tickets exist.

## Start of session

1. Read the tracker and list the frontier.
2. `git log --oneline -15`.
3. Run the gate (see `AGENTS.md` › Commands). When it is red, fixing it is the session's first ticket.

Done when the gate is green and you know the frontier.

## Loop: one ticket per session

1. Pick one frontier ticket and set it `in-progress`.
2. Follow `/implement`: `tdd` at the ticket's seams, gate green, `code-review` (docs-only tickets skip `tdd` and `code-review`).
3. Verify every acceptance criterion against running code. After your last change, run the gate and, when the ticket touches UI or data flow, the e2e command (see `AGENTS.md` › Commands). Stop any process you started.
4. Set the ticket `done` with a one-line note, commit, and stop. Local tracker: the status edit goes in the same commit. GitHub: close the issue after the commit, with its sha in the comment.

A ticket is `done` only after step 3 passes. Acceptance criteria and tests are the spec: when one looks wrong, comment on the ticket and ask; the code changes, the criterion stays.

## Parallelism

One agent, sequential, by default. Run frontier tickets in parallel worktrees only when both hold:

- the tickets share no hotspot (schema, routes, configs, registries);
- branches merge one at a time, with the gate green after each merge.

## Maintenance

- **Bug** (even a bare symptom in chat): open a ticket in the format of `.github/ISSUE_TEMPLATE/bug.md` (local tracker: `.scratch/bugs/issues/NN-<slug>.md`). Reproduce it with a failing test (`diagnosing-bugs`, then `tdd`), fix, and keep the test as the regression guard. Then Loop steps 3–4: gate and e2e after the last change, close the ticket in the same `fix:` commit.
- **Small change**: a ticket straight away, no spec.
- **Long session interrupted**: `/handoff`.
