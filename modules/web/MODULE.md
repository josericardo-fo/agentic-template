# Module: web

Next.js (App Router) + TypeScript strict + Tailwind v4 + shadcn/ui + Biome + Vitest + Playwright with axe. Package manager: pnpm.

Variables (defined in the skill's "Layout"): `$MOD` is this module's directory, `$PROJECT` the repo root, `$WEB` the web app's directory (`$PROJECT` in a single-app project, `$PROJECT/apps/web` in a workspace). Every step runs in `$WEB` unless it says otherwise.

## Docs to consult

Versions move faster than training data. Read the version-matched docs before writing code against an API:

- `node_modules/next/dist/docs/`: Next.js docs bundled with the installed version (testing guides under `01-app/02-guides/testing/`).
- https://ui.shadcn.com/docs/cli and https://ui.shadcn.com/docs/skills
- When a command below fails because a flag changed, read the tool's `--help`, adapt, and **update this recipe** in the template repo.

## Scaffold

Creates `$WEB`, which must not exist yet. Run from its parent (`dirname "$WEB"`):

```bash
cd "$(dirname "$WEB")" && pnpm dlx create-next-app@latest "$(basename "$WEB")" --ts --tailwind --biome --app --no-src-dir \
  --import-alias "@/*" --use-pnpm --disable-git --no-react-compiler --no-agent-feedback --yes
```

In a workspace, `create-next-app` installs as a standalone project: it writes `$WEB/pnpm-workspace.yaml` (build-script allowlists such as `ignoredBuiltDependencies`), `$WEB/pnpm-lock.yaml` and `$WEB/node_modules`. Fold them into the root:

```bash
cd "$WEB" && sed '/^packages:/,/^[^ ]/{/^packages:/d;/^  /d;}' pnpm-workspace.yaml >> "$PROJECT/pnpm-workspace.yaml"
rm -rf "$WEB/pnpm-workspace.yaml" "$WEB/pnpm-lock.yaml" "$WEB/node_modules"
cd "$PROJECT" && pnpm install
```

With `--no-agent-feedback`, `create-next-app` writes no `AGENTS.md`; the first `next dev` (also run by `pnpm test:e2e`) adds a managed `nextjs-agent-rules` block to `$WEB/AGENTS.md` and re-adds it when missing. Commit it. Single-app: the skill's base merge keeps that block. Workspace: leave `$WEB/AGENTS.md` in place and add `$WEB/CLAUDE.md` containing `@AGENTS.md`, so Claude Code loads the block for files under `$WEB`.

Done when `$WEB/package.json` lists `next`; in a workspace, also when `$PROJECT/pnpm-lock.yaml` exists and `find "$PROJECT/apps" -maxdepth 2 -name 'pnpm-*.yaml'` prints nothing.

## Steps (after the base is applied)

1. **shadcn/ui** with the default preset (Base UI primitives):
   ```bash
   cd "$WEB" && pnpm dlx shadcn@latest init -d --no-monorepo
   ```
   Done when `$WEB/components.json` and `$WEB/lib/utils.ts` exist.
2. **shadcn agent skill**, at the repo root so Claude Code finds it:
   ```bash
   cd "$PROJECT" && pnpm dlx skills add shadcn/ui --skill shadcn --agent claude-code -y
   ```
   It also writes `$PROJECT/skills-lock.json`; commit it (it pins the skill version). Done when `$PROJECT/.claude/skills/shadcn/SKILL.md` exists.
3. **Test tooling**:
   ```bash
   cd "$WEB" && pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom \
     @playwright/test @axe-core/playwright
   cd "$WEB" && pnpm exec playwright install chromium
   ```
   Path aliases (`@/…`) resolve through Vite's native `resolve.tsconfigPaths` in `vitest.config.mts`; no plugin needed. Done when both commands exit 0.
4. **Overlay files**:
   ```bash
   cp -R "$MOD/overlay/." "$WEB/"
   mkdir -p "$PROJECT/.claude/rules" && cp "$MOD/rules/"*.md "$PROJECT/.claude/rules/"
   ```
   Brings `vitest.config.mts`, `playwright.config.ts`, `e2e/home.spec.ts`, `lib/utils.test.ts`, `DESIGN.md` (into `$WEB`) and `.claude/rules/frontend.md` (into `$PROJECT`; its `paths:` already cover both layouts). Done when `$WEB/playwright.config.ts` and `$PROJECT/.claude/rules/frontend.md` exist.
5. **TypeScript**: add `"noUncheckedIndexedAccess": true` to `compilerOptions` in `$WEB/tsconfig.json` (`strict` is already on). Done when `jq .compilerOptions.noUncheckedIndexedAccess "$WEB/tsconfig.json"` prints `true`.
6. **Biome scope**: in `$WEB/biome.json`, add each of these entries to `files.includes` when absent, so vendored skills and test output stay out of lint: `"!.claude"`, `"!playwright-report"`, `"!test-results"`. (The convex module owns `"!convex/_generated"`.) Done when each entry appears exactly once.
7. **Scripts**:
   ```bash
   cd "$WEB" && npm pkg set scripts.typecheck="next typegen && tsc --noEmit" \
     scripts.lint="biome check" scripts.test="vitest run" \
     scripts.test:e2e="playwright test" \
     scripts.check="pnpm typecheck && pnpm lint && pnpm test"
   ```
   `next typegen` generates the route types (`LayoutProps`, `PageProps`) that `tsc` needs on a fresh clone. Done when `jq .scripts.check "$WEB/package.json"` prints the command.
8. **Normalize generated files** (shadcn output does not match Biome's format): `cd "$WEB" && pnpm exec biome check --write`. Done when it exits 0.
9. **.gitignore** (`$PROJECT/.gitignore`): add `playwright-report/`, `test-results/`, `blob-report/` when absent (no leading `/`, so they match inside `apps/web` too). Done when each entry appears once.
10. **CI**: append the job in `$MOD/ci-e2e.yml` under `jobs:` in `$PROJECT/.github/workflows/ci.yml` (indent it to the job level). Workspace: add `defaults: { run: { working-directory: apps/web } }` to the job and set the artifact `path` to `apps/web/playwright-report/` (`.nvmrc` and the lockfile stay at the root). Done when `ci.yml` has an `e2e` job.
11. **AGENTS.md**: merge `$MOD/agents-snippet.md` into the placeholders of `$PROJECT/AGENTS.md`. Done when its placeholders for commands are filled.

Done when `./scripts/check` and `./scripts/build` both exit 0 in `$PROJECT`. `pnpm test:e2e` is the e2e + accessibility gate; run it once when the browser download is available.

## Next steps for the user

- Deploy is a manual step. Default for personal projects: **Vercel Hobby** (Next.js without friction, preview per PR). Hobby forbids commercial use: for a commercial project use **Cloudflare** (Workers via OpenNext) or **Vercel Pro**. Record the choice in `docs/adr/0001-stack.md`. Workspace: set the Vercel project's root directory to `apps/web`.

## UI decisions

The human-decision workflow (brief → 3 directions → pick → lock tokens → per-screen build) lives in `.claude/rules/frontend.md` and loads whenever UI files are touched. `DESIGN.md` is where the chosen direction gets locked.
