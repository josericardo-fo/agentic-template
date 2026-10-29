#!/usr/bin/env bash
# PreToolUse (Edit|Write): bloqueia edição de arquivos de segredo e lockfiles.

input="$(cat)"

if command -v jq >/dev/null 2>&1; then
  file_path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
else
  # Sem jq: extrai o file_path com sed (suficiente para caminhos sem aspas escapadas).
  echo "protect.sh: jq not found, using a simplified parser. Install jq for exact parsing." >&2
  file_path="$(printf '%s' "$input" | tr -d '\n' |
    sed -n 's/.*"file_path"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')"
fi
[ -n "$file_path" ] || exit 0

name="$(basename "$file_path")"

case "$name" in
  .env.example)
    exit 0
    ;;
  .env | .env.*)
    echo "Blocked: $name holds secrets and must not be edited by the agent. Document new variables in .env.example and ask the user to set the real value." >&2
    exit 2
    ;;
  pnpm-lock.yaml | package-lock.json | yarn.lock | bun.lock | bun.lockb | uv.lock)
    echo "Blocked: $name is a lockfile. Change dependencies through the package manager (pnpm add/remove, uv add/remove) so it regenerates the lockfile." >&2
    exit 2
    ;;
esac

exit 0
