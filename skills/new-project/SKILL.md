---
name: new-project
description: Turn an idea from ~/Developer/Ideas into a scaffolded repo with green gates, using the agentic template (base + modules).
argument-hint: "<slug>"
disable-model-invocation: true
---

# New project

Turn idea `<slug>` into a repo at `~/Developer/Projects/<slug>` (or under another parent directory the user names) by applying the template's base and the chosen modules. You run official scaffolders and copy overlays; the user only makes decisions.

**Template root** (`$TPL`): the plugin root, two levels above this skill's directory (works for the installed plugin, `--plugin-dir` and a symlinked skill):
`TPL="$(cd "$(realpath "${CLAUDE_SKILL_DIR}")/../.." && pwd)"`. Done when `$TPL/base/AGENTS.md` exists.

**Cloud boundary.** This skill creates everything on the local machine only: GitHub repos, deploys, Convex cloud projects, Firebase projects and logins all go to the final "next steps for you" list.

**Defaults** (`$TPL/defaults.md`, optional): the template owner's preferred stack. Read it when it exists. Without it, recommend each tool from the idea and the available modules.

## 1. Read the idea

Read `~/Developer/Ideas/ideas/<slug>.md` when it exists (frontmatter `titulo`, `tags`, sections Problema/Ideia/MVP). It may be missing; then the slug and the grill are the input. Done when you know which of the step-2 questions the file already answers.

## 2. Grill what is missing

Ask **one question at a time**, only for answers the idea file does not already settle, leading with your recommendation so the user can accept in a word:

1. Type: web / mobile / both / API / automation.
2. Needs login?
3. Persistent data?
4. Commercial use? (can change hosting)
5. AI features?
6. Stack in mind? With **Defaults**, recommend "no, use the defaults"; without them, recommend a stack from the idea. Note each tool the user names.

An earlier answer can settle a later question: login implies persistent data (`auth-firebase` needs `convex`), so skip question 3 and say why. Done when all six have an answer.

## 3. Propose modules and wait

Map answers to modules in `$TPL/modules/` and present the list with one line of reason each, plus the layout (below). Use the tools the user named; fill every other need from **Defaults**, or with your recommendation when there are none. A named tool with no module in `$TPL/modules/` goes in a separate "no recipe" list and follows the no-recipe path in 4.3. Whenever `web`, `mobile` or `api` is selected, add the `node` toolchain module automatically (list it with the others, no question). Application order: `node`, `web`, `mobile`, `convex`, `auth-firebase`, `api`, `automation`, `ai`.

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

   Then install the workflow skills from their upstream sources with the `skills` CLI, so the project gets a `skills-lock.json` and can update them later. The CLI writes plain files into `.claude/skills/` and adds no project dependency; it only needs Node on this machine:
   ```bash
   cd "$PROJECT" && npx -y skills add mattpocock/skills -a claude-code -y \
     -s diagnosing-bugs -s domain-modeling -s handoff -s implement -s prototype -s tdd -s to-spec -s to-tickets
   # only when web or mobile is selected:
   cd "$PROJECT" && npx -y skills add vercel-labs/agent-skills -a claude-code -y -s web-design-guidelines
   ```
   When `npx` is unavailable or the install fails (offline), skip it, keep going and note it for the hand-off.

   Done when `CLAUDE.md` is `@AGENTS.md`, `scripts/check` is executable and either `.claude/skills/implement/SKILL.md` exists or the skipped install is noted.
3. **Modules.** For each selected module, in the order above, read `$TPL/modules/<name>/MODULE.md` and execute its steps **literally**, with `$MOD=$TPL/modules/<name>` and the layout variables. App modules already ran their `## Scaffold` in 4.1. Each step's "Done when" holds before the next step starts. When a step fails because a tool changed, fix the command following the module's "Docs to consult", then fix the `MODULE.md` in `$TPL` too, so the next run works. Collect each module's "Next steps for the user".

   **No-recipe path**, for each tool in the "no recipe" list and for a language with no toolchain module (e.g. Python, Go): set it up with its official scaffolder or docs, replace the base's stub `scripts/check` with the real gate (typecheck + lint + unit tests), add `scripts/fmt`/`build`/`setup` when the tools have them, and record the choice in `docs/adr/0001-stack.md`.
4. **AGENTS.md.** Fill every `{{PLACEHOLDER}}` from the idea, the grill answers and each module's `agents-snippet.md`. Delete placeholder lines with no content. Done when `grep -c '{{' AGENTS.md` prints `0` and the file stays under ~60 lines, not counting tool-managed blocks (e.g. `nextjs-agent-rules`, `convex-ai-start`).
5. **ADR.** Write `docs/adr/0001-stack.md` from `docs/adr/0000-template.md`: context from the idea, the modules chosen, the layout, alternatives left out (from **Defaults** when listed there), hosting (the user's choice, else **Defaults**, else your recommendation), and the trigger to revisit. Done when the file has no template placeholders left.

## 5. Gate until green

Run the project gate `./scripts/check` and `./scripts/build` when present, from `$PROJECT`. Fix and re-run until both exit 0. Fix causes; tests and checks keep their strength.

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
3. Skills: when installed with the CLI, `npx skills update -p` refreshes them from upstream; when the install was skipped, say the workflow skills are missing and give the step-4.2 commands to run once Node is available.
4. Every module's collected "Next steps for the user" (e.g. `npx convex dev`, Firebase console + smoke test, Vercel/Cloudflare setup).

If the `web` module was applied, close by offering the UI decision workflow from `.claude/rules/frontend.md`: brief (4 questions + 2–3 references) → 3 directions via `prototype` → the user picks → tokens locked in `DESIGN.md`.

Then offer the path from idea to code: `/to-spec` from the idea → `/to-tickets` on the spec → work the frontier one ticket per session, following `docs/agents/workflow.md` in `$PROJECT`.
