#!/usr/bin/env bash
# PostToolUse (Edit|Write): formata o arquivo editado delegando a scripts/fmt, se existir.
# Nunca falha a chamada da ferramenta e fica em silêncio no sucesso.

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
file_path="$(jq -r '.tool_input.file_path // empty' 2>/dev/null)"

[ -n "$file_path" ] && [ -f "$file_path" ] || exit 0
cd "$project_dir" || exit 0

if [ -x scripts/fmt ]; then
  ./scripts/fmt "$file_path" >/dev/null 2>&1
fi

exit 0
