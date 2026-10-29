# agentic-template

Template para transformar uma ideia de `~/Developer/Ideas/ideas/` em um repositório com gates verdes e um agente que já tem o ferramental (inclusive de front-end) para que você só tome decisões.

Os módulos são **receitas, não apps copiados**: cada `MODULE.md` diz ao agente quais scaffolders oficiais rodar, em que ordem e quais docs consultar, e traz só os arquivos pequenos que são nossos (trechos de AGENTS.md, `rules/` com `paths:`, jobs de CI, configs de gate). Assim nada fica velho em semanas.

## Como usar

```
/new-project <slug>
```

A skill (`skills/new-project/SKILL.md`, com symlink em `~/.claude/skills/new-project`):

1. Lê `~/Developer/Ideas/ideas/<slug>.md`, se existir.
2. Pergunta só o que falta, uma coisa por vez (tipo, login, dados, uso comercial, IA, stack em mente). Sem stack em mente, propõe os padrões de `defaults.md` (minhas preferências; apague ou troque o arquivo para usar outras) ou, sem ele, recomenda a partir da ideia; ferramenta sem módulo segue o caminho "sem receita" (scaffolder oficial + `scripts/check` próprio + ADR).
3. Propõe os módulos e espera sua confirmação.
4. Cria `~/Developer/Projects/<slug>`: scaffold oficial → `base/` → `MODULE.md` de cada módulo → AGENTS.md preenchido → `docs/adr/0001-stack.md`.
5. Roda o gate até ficar verde, faz `git init` e o primeiro commit.
6. Marca a ideia como `virou-projeto`.
7. Termina com a lista de próximos passos que exigem login (GitHub, Convex na nuvem, Firebase, deploy). A skill nunca faz esses passos.

## Do scaffold à manutenção

```
ideia → /new-project → /to-spec → /to-tickets → loop por ticket → bug.md
```

Depois do scaffold, a spec e os tickets moram no issue tracker, e o status dos tickets é o registro de progresso (não há `PROGRESS.md`). Cada sessão pega um ticket da frontier (pronto e sem bloqueios), segue `/implement`, marca `done` e para. Bugs entram pelo `.github/ISSUE_TEMPLATE/bug.md` e são corrigidos a partir de um teste que falha. Paralelismo (worktrees) só para tickets sem arquivos compartilhados. Detalhes em `base/docs/agents/workflow.md`.

As skills desse fluxo (`to-spec`, `to-tickets`, `implement`, `tdd`, `diagnosing-bugs`, `handoff`, `domain-modeling`, `prototype`, e `web-design-guidelines` para UI) moram em `skills/` e são copiadas para `.claude/skills/` de cada projeto: o fluxo viaja com o repo, sem depender do `~/.claude` de quem clona.

## Camadas

```
┌─────────────────────────────────────────────────────────┐
│ 1. Global (~/.claude)    como você trabalha             │
│    permissões, CLAUDE.md pessoal, skills do dia a dia   │
├─────────────────────────────────────────────────────────┤
│ 2. base/ + skills/       como todo repo é               │
│    AGENTS.md, hooks (format, protect, Stop→check),      │
│    CI, scripts/check, issue template, docs/{adr,agents},│
│    skills do fluxo em .claude/skills/                   │
├─────────────────────────────────────────────────────────┤
│ 3. modules/              tipo de projeto                │
│    toolchain: node (implícito com web/mobile/api)       │
│    web | convex | auth-firebase | mobile | api |        │
│    automation | ai                                      │
├─────────────────────────────────────────────────────────┤
│ 4. docs/adr/ do projeto  decisões daquele projeto       │
└─────────────────────────────────────────────────────────┘
```

Cada camada só contém o que vale para todos os casos dela; o que depende do projeto desce de camada.

| Módulo | Tipo | O que traz |
|---|---|---|
| `node` | toolchain | Node (`.nvmrc`) + pnpm (`packageManager`), `scripts/{check,build,setup,fmt}`, steps de CI, Dependabot `npm`; aplicado automaticamente com `web`, `mobile` ou `api` |
| `web` | completo | Next.js + TS strict + Tailwind v4 + shadcn/ui + Biome + Vitest + Playwright/axe, `rules/frontend.md`, `DESIGN.md` |
| `convex` | completo | Banco, funções, crons, arquivos e vetores; deployment local anônimo (sem login) |
| `auth-firebase` | completo | Firebase Auth no cliente, Convex valida o token via OIDC (com smoke test obrigatório) |
| `mobile` | receita | Expo + EAS, NativeWind v4, RN Reusables, `@expo/ui`, Maestro |
| `api` | receita | Hono, só quando HTTP actions do Convex não bastam |
| `automation` | receita | Crons do Convex; n8n/Coolify no homelab para serviços longos |
| `ai` | receita | Vercel AI SDK / Claude Agent SDK, limite de gasto, evals mínimos |

## Contrato de comandos

A base não conhece nenhuma stack: hooks e CI só chamam comandos com nome fixo em `scripts/`. Quem decide a ferramenta é um módulo de toolchain (hoje, `node`); sem ele, o projeto escreve os scripts com as próprias ferramentas e registra no ADR.

| Comando | Obrigatório | Semântica |
|---|---|---|
| `scripts/check` | sim | gate completo (typecheck + lint + testes unitários); exit ≠ 0 = falha. A base traz um stub que só avisa e sai 0 |
| `scripts/fmt <arquivo>…` | não | formata os arquivos dados; silencioso; nunca falha (chamado pelo hook de format) |
| `scripts/build` | não | build de produção (CI roda depois do gate) |
| `scripts/setup` | não | instala dependências (CI roda depois dos steps de toolchain) |

## Layout do repositório

- **Um app só** (web, mobile ou API): o app fica na raiz do repo.
- **Dois ou mais apps** (ex.: web + mobile): workspace pnpm com `apps/web`, `apps/mobile`, `apps/api`; `convex/` fica na raiz e é compartilhado. O `pnpm check` da raiz roda o `check` de cada app (`pnpm -r`).
- As `rules/` cobrem os dois layouts pelo `paths:` (`frontend.md` casa `app/**` e `apps/web/**`). A regra de mobile vem com `apps/mobile/**`; num projeto só mobile a receita troca o `paths:` por `src/**` na cópia (o Expo usa `src/app/`), sem colidir com o `app/` do Next.
- Specs e critérios de aceite moram no issue tracker (padrão: `.scratch/<feature>/spec.md`), não em `docs/`.

## Como adicionar ou atualizar um módulo

1. Crie `modules/<nome>/MODULE.md` seguindo o formato dos existentes: **Docs to consult**, **Scaffold** (o comando que cria o diretório do app, ou "None"), **Steps** (cada um com "Done when" e com o diretório explícito: `$PROJECT`, `$WEB`, `$MOBILE`, `$API`), **Next steps for the user**. Escreva em inglês (é para o agente).
2. Coloque arquivos de overlay em `modules/<nome>/overlay/` (copiados para a raiz do projeto), regras em `modules/<nome>/rules/*.md` com frontmatter `paths:`, e o que entra no AGENTS.md em `agents-snippet.md`.
3. Registre o módulo na ordem de aplicação (seção 3) de `skills/new-project/SKILL.md` e, se ele virar o padrão para alguma necessidade, em `defaults.md`.
4. Valide com um dry-run em `/tmp` (nunca em `~/Developer/Projects`): rode a skill até `./scripts/check` e `./scripts/build` passarem.

Quando um scaffolder mudar (flag nova, comando renomeado), o agente que esbarrar nisso deve corrigir o `MODULE.md` aqui, não só o projeto gerado.

## Crescer por gatilho

Nada entra de antemão. O setup de cada projeto (e deste template) cresce assim:

| Gatilho | Ação |
|---|---|
| O mesmo erro aconteceu 2× | Uma linha no AGENTS.md |
| O mesmo prompt foi colado 3× | Uma skill |
| "Tem que acontecer sempre" | Um hook |
| A regra só vale para uma pasta | `.claude/rules/*.md` com `paths:` |

Contexto da decisão: `~/Developer/Ideas/research/agentic-dev-research.md`.

## Pendências conhecidas

- Login real com Firebase não testado (exige um projeto Firebase; ver o smoke test em `modules/auth-firebase/MODULE.md`).
- O passo de NativeWind / RN Reusables do módulo `mobile` ainda não foi exercitado.
- O plugin do Expo depende de um marketplace oficial atualizado.
