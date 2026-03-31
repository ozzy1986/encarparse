#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

: "${SSH_HOST:?Missing SSH_HOST in .env}"
: "${SSH_USER:?Missing SSH_USER in .env}"

SSH_PORT="${SSH_PORT:-22}"
APP_DIR="${APP_DIR:-/var/www/encarparse.ozzy1986.com}"
REMOTE="${SSH_USER}@${SSH_HOST}"
GIT_REMOTE_URL="${GIT_REMOTE_URL:-https://github.com/ozzy1986/encarparse.git}"

git rev-parse --is-inside-work-tree >/dev/null 2>&1 || {
  echo "Git repository is not initialized."
  exit 1
}

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "Deploy from main only. Current branch: $CURRENT_BRANCH"
  exit 1
fi

git push origin main

ssh -p "$SSH_PORT" "$REMOTE" "set -euo pipefail; mkdir -p '$APP_DIR'; cd '$APP_DIR'; if [ ! -d .git ]; then git init -b main; fi; if ! git remote get-url origin >/dev/null 2>&1; then git remote add origin '$GIT_REMOTE_URL'; fi; git fetch origin main; if ! git rev-parse --verify main >/dev/null 2>&1; then git checkout -t origin/main; else git checkout main; git pull --ff-only origin main; fi; npm ci; npx prisma migrate deploy; npm run build; if pm2 describe encarparse >/dev/null 2>&1; then pm2 restart encarparse --update-env; else pm2 start ecosystem.config.cjs --only encarparse; fi; pm2 save"

echo "VPS deploy complete."
