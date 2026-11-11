# {{PROJECT_NAME}}

{{ONE_PARAGRAPH_PURPOSE}}

Stack: {{STACK_SUMMARY}}. Rationale in `docs/adr/0001-stack.md`.

## Commands

- `scripts/check`: the gate (typecheck + lint + unit tests). The Stop hook and CI run it; it is green before you report done.
- `scripts/fmt <files>…`, `scripts/build`, `scripts/setup`: optional, fixed names; CI and the format hook call them.
- `{{DEV_COMMAND}}`: dev server.
- `{{TEST_COMMAND}}`: unit tests only.
{{EXTRA_COMMANDS}}

## Invariants

- One gate: every new check goes into `scripts/check`.
- Secrets live in `.env.local` (edits blocked for the agent); every new variable goes into `.env.example` with a dummy value.
- Change dependencies through the package manager; lockfiles are blocked for direct edits.
- Tests are the spec: fix the code, keep the assertion.
- Conventional commits, one logical change per commit.
{{EXTRA_INVARIANTS}}

## Workflow

- Small change: plan mode, then implement.
- Large feature: `/to-spec`, then `/to-tickets`, then `/implement` one ticket per session.
- Bug: write the failing test first (`diagnosing-bugs`).
- Feature touching auth, data access or endpoints: run `/security-review` before closing it. The first real screen gets an axe check in an e2e test.
- Record a new ADR in `docs/adr/` when you pick between real alternatives.
