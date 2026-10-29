# {{PROJECT_NAME}}

{{ONE_PARAGRAPH_PURPOSE}}

Stack: {{STACK_SUMMARY}}. Rationale in `docs/adr/0001-stack.md`.

## Commands

- `scripts/check`: the gate (typecheck + lint + unit tests). The Stop hook and CI run the same command; it is green before you report done.
- `scripts/fmt <files>…` (optional, run by the format hook), `scripts/build` and `scripts/setup` (optional, run by CI): fixed names; the toolchain lives inside them.
- `{{DEV_COMMAND}}`: dev server.
- `{{TEST_COMMAND}}`: unit tests only.
{{EXTRA_COMMANDS}}

## Invariants

- One gate: every new check goes into `scripts/check`, so the Stop hook and CI run it too.
- Secrets live in `.env.local` (edits blocked for the agent). Document every new variable, with a dummy value, in `.env.example`.
- Change dependencies through the package manager; lockfiles are blocked for direct edits.
- Tests are the spec: fix the code, keep the assertion. A test change needs its own reason in the commit message.
- Conventional commits (`feat:`, `fix:`, `chore:`…), one logical change per commit.
- A bug report, even a bare symptom, follows `docs/agents/workflow.md` › Maintenance: ticket, failing test, fix, commit.
{{EXTRA_INVARIANTS}}

## Where things live

- `docs/architecture.md`: module map and boundaries. Read it before a change that crosses modules.
- `docs/adr/`: decisions. Record a new ADR when you pick between real alternatives.
- `.claude/rules/`: path-scoped rules, loaded automatically for matching files.

## Agent skills

### Issue tracker

Issues, specs and acceptance criteria live in the issue tracker (default: markdown under `.scratch/<feature>/`, spec in `spec.md`). See `docs/agents/issue-tracker.md`.

### Workflow

Starting a session, picking a ticket, running agents in parallel, or fixing a bug: see `docs/agents/workflow.md`.

### Domain docs

Single-context: `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
