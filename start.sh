#!/usr/bin/env bash
set -euo pipefail

script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$script_dir"

export PORT="${PORT:-8080}"
if [[ ! -x "Prototype frontend/node_modules/.bin/vite" ]]; then
  (cd "Prototype frontend" && npm ci)
fi
(cd "Prototype frontend" && npm run build)

echo "Starting TCG Market at http://127.0.0.1:${PORT}"
exec node server.mjs
