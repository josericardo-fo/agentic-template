---
name: new-project
description: Bootstrap a new repo from an idea or a slug — short grill, official scaffolders, minimal base, real gate, workflow skills, first commit.
argument-hint: "<slug> [parent-dir]"
disable-model-invocation: true
---

# New project

Create `<parent>/<slug>` (parent defaults to `~/Developer/Projects`; use another parent when the user names one). It must not exist yet; if it does, stop and ask. Call it `$PROJECT`. Base files: `BASE="$(realpath "${CLAUDE_SKILL_DIR}")/base"`. Stack preferences and gotchas: `${CLAUDE_SKILL_DIR}/stack.md`; read it first.

**Cloud boundary.** Everything stays on this machine. GitHub repos, deploys, cloud projects and logins go to the final next-steps list.

1. **Idea.** Read `~/Developer/Ideas/ideas/<slug>.md` when it exists (`titulo`, `tags`, Problema/Ideia/MVP). Done when you know which step-2 questions it already answers.
2. **Grill.** One question at a time, only what is still open, recommendation first so the user can accept in a word: type (web/mobile/API/automation), login, persistent data, AI, stack in mind. Propose the `stack.md` defaults, with one line of reason each, and wait for explicit confirmation. Done when the stack is confirmed.
3. **Scaffold.** `mkdir -p` the parent, then run each tool's official scaffolder, checking its current docs via context7. Several apps become a pnpm workspace under `apps/` (see `stack.md`). Done when `$PROJECT` exists with its app files.
4. **Base.** Copy `$BASE/.` into `$PROJECT`. `AGENTS.md`: the base file wins, and the scaffolder's managed blocks (e.g. `<!-- BEGIN:nextjs-agent-rules -->` to `END`) go verbatim at the end. `.gitignore`: keep the scaffolder's, append the base entries. `README.md`: short, PT-BR (title, purpose, how to run). Keep hooks executable. Done when `CLAUDE.md` is `@AGENTS.md`.
5. **Gate.** Replace the stub `scripts/check` with the real gate (typecheck + lint + unit tests); add `scripts/fmt`, `build`, `setup` when the stack has them; add the toolchain steps to `.github/workflows/ci.yml` at its marker comment. Set up each remaining tool from `stack.md` gotchas and official docs. Done when `scripts/check` runs the real tools.
6. **Docs.** Fill every `{{PLACEHOLDER}}` in `AGENTS.md` (delete lines left empty). Write `docs/adr/0001-stack.md` with five headings: Context, Decision, Alternatives, Hosting, When to revisit. Done when `grep -c '{{' AGENTS.md` prints `0` and `AGENTS.md` has at most ~40 lines outside tool-managed blocks.
7. **Workflow skills.** In `$PROJECT` run:
   ```bash
   npx -y skills add mattpocock/skills -a claude-code -y -s setup-matt-pocock-skills -s to-spec -s to-tickets -s implement -s tdd -s diagnosing-bugs -s handoff -s prototype -s domain-modeling
   ```
   Then follow the installed `.claude/skills/setup-matt-pocock-skills/SKILL.md`, answering: local markdown tracker in `.scratch/`, single-context domain docs. Its `## Agent skills` block must end up in `AGENTS.md` (`CLAUDE.md` is only `@AGENTS.md`); move it there (above the managed blocks) if it landed elsewhere. When offline, skip, continue and report it. Done when `.claude/skills/implement/SKILL.md` and `docs/agents/issue-tracker.md` exist, or the skip is reported.
8. **Green and commit.** Run `./scripts/check` and `./scripts/build` (when present) until both exit 0; fix causes, keep tests and checks as strong as they were. Then `git init -q && git add -A && git commit -q -m "chore: scaffold inicial"`. Done when `git status --porcelain` is empty.
9. **Idea and hand-off.** When the idea file exists, set its frontmatter `status: virou-projeto` and `projeto: <absolute $PROJECT>`, and the same Status in the `~/Developer/Ideas/README.md` index row (add the row when missing). End with a numbered "Próximos passos para você" list in PT-BR, only what applies: `gh repo create <slug> --private --source "$PROJECT" --push`; cloud logins and setup (Convex, Firebase smoke test, Vercel); `npx skills update -p` to refresh workflow skills (or the step-7 command when skipped). Offer to start with `/to-spec`.
