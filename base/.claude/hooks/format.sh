#!/usr/bin/env bash
# PostToolUse (Edit|Write): formata o arquivo editado com o formatter do projeto.
# Nunca falha a chamada da ferramenta e fica em silêncio no sucesso.

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file_path="$(jq -r '.tool_input.file_path // empty' 2>/dev/null)"

[ -n "$file_path" ] && [ -f "$file_path" ] || exit 0
cd "$project_dir" || exit 0

if [ -f biome.json ] || [ -f biome.jsonc ]; then
  if [ -x node_modules/.bin/biome ]; then
    node_modules/.bin/biome format --write --no-errors-on-unmatched \
      --files-ignore-unknown=true "$file_path" >/dev/null 2>&1
  fi
elif [ -f pyproject.toml ] && grep -q '^\[tool\.ruff' pyproject.toml; then
  case "$file_path" in
    *.py | *.pyi)
      if command -v uv >/dev/null 2>&1; then
        uv run --quiet ruff format "$file_path" >/dev/null 2>&1
      elif command -v ruff >/dev/null 2>&1; then
        ruff format "$file_path" >/dev/null 2>&1
      fi
      ;;
  esac
fi

exit 0
