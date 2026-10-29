#!/usr/bin/env bash
# Stop: roda o gate do projeto quando há mudanças no working tree.
# Exit 2 devolve a falha ao agente para ele corrigir antes de encerrar.

input="$(cat)"

has_jq=false
if command -v jq >/dev/null 2>&1; then
  has_jq=true
else
  echo "stop-check.sh: jq not found, using a simplified parser. Install jq for exact parsing." >&2
fi

# Evita loop: o agente já está continuando por causa deste hook.
if $has_jq; then
  active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false' 2>/dev/null)"
elif printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  active=true
fi
[ "$active" = "true" ] && exit 0

project_dir="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$project_dir" || exit 0

# Sem mudanças (turno de pergunta e resposta): não roda o gate.
# Código já commitado é coberto pela CI + branch protection, não por este hook.
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

has_check_script() {
  [ -f package.json ] || return 1
  if $has_jq; then
    jq -e '.scripts.check' package.json >/dev/null 2>&1
  else
    grep -Eq '"check"[[:space:]]*:' package.json
  fi
}

if has_check_script; then
  gate=(pnpm check)
elif [ -x scripts/check ]; then
  gate=(./scripts/check)
else
  exit 0
fi

log="$(mktemp)"
trap 'rm -f "$log"' EXIT

if ! "${gate[@]}" >"$log" 2>&1; then
  {
    echo "Gate failed: '${gate[*]}' must pass before you finish. Fix the cause and keep tests and checks at full strength. Last lines:"
    tail -n 40 "$log"
  } >&2
  exit 2
fi

exit 0
