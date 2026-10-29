# web → AGENTS.md

Values for the base placeholders:

- `{{CHECK_COMMAND}}`: `pnpm check`
- `{{DEV_COMMAND}}`: `pnpm dev` (http://localhost:3000)
- `{{TEST_COMMAND}}`: `pnpm test`

Add to `{{EXTRA_COMMANDS}}`:

```markdown
- `pnpm test:e2e`: Playwright e2e + axe accessibility scan (starts the dev server itself).
- `pnpm build`: production build; CI runs it after the gate.
```

Add to `{{EXTRA_INVARIANTS}}`:

```markdown
- Visual decisions are locked in `DESIGN.md`. Read it before any UI change; propose a change there before diverging from it.
```
