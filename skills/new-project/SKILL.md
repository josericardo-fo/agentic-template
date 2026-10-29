---
name: new-project
description: Turn an idea from ~/Developer/Ideas into a scaffolded repo with green gates, using the agentic template (base + modules). Usage /new-project <slug>.
disable-model-invocation: true
---

# New project

Turn idea `<slug>` into a repo at `~/Developer/Projects/<slug>` (or under another parent directory the user names) by applying the template's base and the chosen modules. You run official scaffolders and copy overlays; the user only makes decisions.

**Template root** (`$TPL`): resolve this skill's real path and go two levels up:
`TPL="$(cd "$(dirname "$(realpath ~/.claude/skills/new-project/SKILL.md)")/../.." && pwd)"`; fall back to `~/Developer/Projects/agentic-template`. Done when `$TPL/base/AGENTS.md` exists.

**Cloud boundary.** This skill creates everything on the local machine only: GitHub repos, deploys, Convex cloud projects, Firebase projects and logins all go to the final "next steps for you" list.

## 1. Read the idea

Read `~/Developer/Ideas/ideas/<slug>.md` when it exists (frontmatter `titulo`, `tags`, sections Problema/Ideia/MVP). It may be missing; then the slug and the grill are the input. Done when you know which of the step-2 questions the file already answers.

## 2. Grill what is missing

Ask **one question at a time**, only for answers the idea file does not already settle, leading with your recommendation so the user can accept in a word:

1. Type: web / mobile / both / API / automation.
2. Needs login?
3. Persistent data?
4. Commercial use? (changes hosting: Vercel Hobby → Cloudflare or Vercel Pro)
5. AI features?

An earlier answer can settle a later question: login implies persistent data (`auth-firebase` needs `convex`), so skip question 3 and say why. Done when all five have an answer.

## 3. Propose modules and wait

Map answers to modules in `$TPL/modules/` and present the list with one line of reason each, plus the layout (below). Defaults: web → `web`; mobile → `mobile`; persistent data → `convex`; login → `auth-firebase` (needs `web` + `convex`); public API outside Convex → `api`; schedules/background → `automation`; AI → `ai`. Application order: `web`, `mobile`, `convex`, `auth-firebase`, `api`, `automation`, `ai`.

Done when the user explicitly confirms the list.

## Layout

`$PROJECT` = `<parent>/<slug>`. Module recipes address app directories through these variables:

- **Single app** (exactly one of `web`, `mobile`, `api` creates an app): the app is the repo root. `$WEB`, `$MOBILE` or `$API` = `$PROJECT`.
- **Workspace** (two or more of them): a pnpm workspace with each app under `apps/`: `$WEB=$PROJECT/apps/web`, `$MOBILE=$PROJECT/apps/mobile`, `$API=$PROJECT/apps/api`. `convex/` stays at `$PROJECT/convex`, shared by all apps (each imports `convex/_generated/api` by relative path). The root `check`, `build` and `test:e2e` scripts fan out to the apps.

Every module's `MODULE.md` has a `## Scaffold` section (possibly "None") and steps that state their directory. Record the layout in `docs/adr/0001-stack.md`.

## 4. Build the project

`$PROJECT` must not exist yet; if it does, stop and ask.

1. **Scaffold.**
   - Single app: `mkdir -p "$(dirname "$PROJECT")"`, then run the `## Scaffold` section of the module that creates the app (it creates `$PROJECT`). With no app module, `mkdir -p "$PROJECT"`.
   - Workspace: create the root first, then run each app module's `## Scaffold` (in application order):
     ```bash
     mkdir -p "$PROJECT/apps" && cd "$PROJECT" && printf 'packages:\n  - "apps/*"\n' > pnpm-workspace.yaml
     cd "$PROJECT" && jq -n --arg name "<slug>" '{name: $name, private: true, scripts: {
       check: "pnpm -r --if-present check", build: "pnpm -r --if-present build",
       test: "pnpm -r --if-present test"}}' > package.json
     ```
     With `web` selected, also `npm pkg set scripts.test:e2e="pnpm --filter ./apps/web test:e2e"` and `scripts.dev="pnpm --filter ./apps/web dev"`.

   Done when `$PROJECT` exists and every selected app's `package.json` exists.
2. **Base.** Copy `$TPL/base/` into `$PROJECT` with these merges for files the scaffolder already wrote at the root:
   - `AGENTS.md`: the base file wins; append any managed block from the scaffolder's version (e.g. `<!-- BEGIN:nextjs-agent-rules -->` … `<!-- END:… -->`) verbatim at the end.
   - `.gitignore`: keep the scaffolder's file and append the base entries.
   - `README.md`: replace with a short PT-BR README (title, one-paragraph purpose, how to run).
   - Everything else: base file wins. Keep `.claude/hooks/*.sh` executable.

   Then, in `$PROJECT`: when `package.json` exists, pin pnpm for CI with `npm pkg set packageManager="pnpm@$(pnpm -v)"`; when it does not, delete the `npm` entry from `.github/dependabot.yml`. Done when `CLAUDE.md` is `@AGENTS.md`, `.nvmrc` exists, and `jq -r .packageManager package.json` prints `pnpm@…` (Node projects).
3. **Modules.** For each selected module, in the order above, read `$TPL/modules/<name>/MODULE.md` and execute its steps **literally**, with `$MOD=$TPL/modules/<name>` and the layout variables. App modules already ran their `## Scaffold` in 4.1. Each step's "Done when" holds before the next step starts. When a step fails because a tool changed, fix the command following the module's "Docs to consult", then fix the `MODULE.md` in `$TPL` too, so the next run works. Collect each module's "Next steps for the user".
4. **AGENTS.md.** Fill every `{{PLACEHOLDER}}` from the idea, the grill answers and each module's `agents-snippet.md`. Delete placeholder lines with no content. Done when `grep -c '{{' AGENTS.md` prints `0` and the file stays under ~60 lines plus tool-managed blocks.
5. **ADR.** Write `docs/adr/0001-stack.md` from `docs/adr/0000-template.md`: context from the idea, the modules chosen, the layout, alternatives left out (e.g. Supabase/Neon, Clerk, TanStack Start), hosting (Vercel Hobby for personal, Cloudflare or Vercel Pro for commercial), and the trigger to revisit. Done when the file has no template placeholders left.

## 5. Gate until green

Run the project gate (`pnpm check`, or `./scripts/check`) and `pnpm build` when present, from `$PROJECT`. Fix and re-run until both exit 0. Fix causes; tests and checks keep their strength.

Then:

```bash
cd "$PROJECT" && git init -q && git add -A && git commit -q -m "chore: scaffold from agentic-template"
```

Done when `git status --porcelain` is empty.

## 6. Update the idea

Skip when the idea file does not exist.

- In `~/Developer/Ideas/ideas/<slug>.md` frontmatter: `status: virou-projeto` and `projeto: <absolute $PROJECT path>`.
- In `~/Developer/Ideas/README.md` index table, set the idea's Status column to `virou-projeto`; when the idea has no row, add one in the table's format.

Done when both files show `virou-projeto`.

## 7. Hand off

End with a numbered **"Próximos passos para você"** list (PT-BR), containing only what applies:

1. `gh repo create <slug> --private --source "$PROJECT" --push`.
2. After the repo exists, switch the tracker to GitHub if wanted: `mv docs/agents/issue-tracker.github.md docs/agents/issue-tracker.md` and update the `### Issue tracker` line in `AGENTS.md`.
3. Every module's collected "Next steps for the user" (e.g. `npx convex dev`, Firebase console + smoke test, Vercel/Cloudflare setup).

If the `web` module was applied, close by offering the UI decision workflow from `.claude/rules/frontend.md`: brief (4 questions + 2–3 references) → 3 directions via `prototype` → the user picks → tokens locked in `DESIGN.md`.
