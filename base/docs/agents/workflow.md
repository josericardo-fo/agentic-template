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

1. Pick one frontier ticket and set it `in-progress` (local tracker: a working-tree edit only; it is committed as `done` in step 4).
2. Follow `/implement`: `tdd` at the ticket's seams, gate green, `code-review` (docs-only tickets skip `tdd` and `code-review`). The seams are the ones in the spec's Testing Decisions: they were agreed with the user when the spec was written, so `tdd`'s "confirm with the user" step is already satisfied. Ask only when the ticket needs a seam the spec does not list.
3. Verify the ticket is done. This checklist is the definition of done; each item points at the rule that details it:
   - every acceptance criterion holds in running code;
   - the gate is green after your last change and, when the ticket touches UI or data flow, the e2e command too (see `AGENTS.md` › Commands);
   - UI changes: "Verify before claiming done" and step 4 of the UI flow in `.claude/rules/frontend.md`;
   - `docs/architecture.md` updated when modules or boundaries changed, `GLOSSARY.md` when a domain term appeared;
   - every `code-review` finding or known gap you did not fix becomes either a new `ready-for-agent` ticket in the tracker (always, when it contradicts the spec) or a one-line dismissal with its reason; both go in the ticket's closing note. Nothing is left only in a chat or report;
   - every process you started is stopped.
4. Set the ticket `done` with a one-line note, commit, and stop. Local tracker: the status edit and any new tickets from step 3 go in the same commit. GitHub: close the issue after the commit, with its sha in the comment.

A ticket is `done` only after step 3 passes. Acceptance criteria and tests are the spec: when one looks wrong, comment on the ticket and ask; the code changes, the criterion stays.

## Parallelism

One agent, sequential, by default. Run frontier tickets in parallel worktrees only when both hold:

- the tickets share no hotspot (schema, routes, configs, registries);
- branches merge one at a time, with the gate green after each merge.

## Maintenance

- **Bug** (even a bare symptom in chat): open a ticket in the format of `.github/ISSUE_TEMPLATE/bug.md` (local tracker: `.scratch/bugs/issues/NN-<slug>.md`). Reproduce it with a failing test (`diagnosing-bugs`, then `tdd`), fix, and keep the test as the regression guard. Then Loop steps 3–4: the done checklist, close the ticket in the same `fix:` commit.
- **Small change**: a ticket straight away, no spec.
- **Long session interrupted**: `/handoff`.
