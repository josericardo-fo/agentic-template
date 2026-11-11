# agentic-template

Skill pessoal `/new-project` do Claude Code: transforma uma ideia num repositório com gate verde e o fluxo de trabalho com agentes já instalado.

## Instalação

```
ln -s ~/Developer/Projects/agentic-template ~/.claude/skills/new-project
```

## Uso

```
/new-project <slug> [diretório-pai]
```

A skill (`SKILL.md`) faz poucas perguntas, propõe a stack de `stack.md`, roda os scaffolders oficiais, copia `base/`, escreve o `scripts/check` real, instala as skills de `mattpocock/skills` no projeto, roda o gate até ficar verde e faz o primeiro commit. Login em nuvem, repo no GitHub e deploy ficam na lista de próximos passos.

## O que tem aqui

- `SKILL.md`: o passo a passo para o agente.
- `stack.md`: minha stack preferida e as pegadinhas que custaram tempo para descobrir. Nada de receitas: o agente usa o scaffolder oficial e a doc atual.
- `base/`: o que todo projeto recebe. AGENTS.md curto, hooks (format, protect, Stop → `scripts/check`), CI e o stub de `scripts/check`.

## Crescer por gatilho

| Gatilho | Ação |
|---|---|
| O mesmo erro aconteceu 2× | Uma linha no AGENTS.md (ou em `stack.md`, se valer para todo projeto) |
| O mesmo prompt foi colado 3× | Uma skill |
| "Tem que acontecer sempre" | Um hook |

Quando um scaffolder mudar e quebrar a skill, corrija aqui, não só no projeto gerado.
