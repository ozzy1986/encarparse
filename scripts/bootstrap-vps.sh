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
APP_DOMAIN="${APP_DOMAIN:-encarparse.ozzy1986.com}"
REMOTE="${SSH_USER}@${SSH_HOST}"
GIT_REMOTE_URL="${GIT_REMOTE_URL:-https://github.com/ozzy1986/encarparse.git}"

ssh -p "$SSH_PORT" "$REMOTE" "set -euo pipefail; mkdir -p '$APP_DIR'; if [ ! -d '$APP_DIR/.git' ]; then git clone '$GIT_REMOTE_URL' '$APP_DIR'; fi"

scp -P "$SSH_PORT" "$ROOT_DIR/infra/nginx/encarparse.ozzy1986.com.conf" "$REMOTE:/etc/nginx/sites-available/${APP_DOMAIN}.conf"
scp -P "$SSH_PORT" "$ROOT_DIR/infra/cron/encarparse-daily" "$REMOTE:/etc/cron.d/encarparse-daily"

ssh -p "$SSH_PORT" "$REMOTE" "set -euo pipefail; ln -sfn '/etc/nginx/sites-available/${APP_DOMAIN}.conf' '/etc/nginx/sites-enabled/${APP_DOMAIN}.conf'; chmod 644 '/etc/nginx/sites-available/${APP_DOMAIN}.conf' '/etc/cron.d/encarparse-daily'; nginx -t; systemctl reload nginx"

echo "VPS bootstrap complete."
