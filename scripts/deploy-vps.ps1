$ErrorActionPreference = "Stop"

function Require-EnvVar([string] $Name) {
  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "Missing $Name environment variable."
  }
  return $value.Trim()
}

function Get-EnvVar([string] $Name, [string] $DefaultValue) {
  $value = [Environment]::GetEnvironmentVariable($Name)
  if ([string]::IsNullOrWhiteSpace($value)) {
    return $DefaultValue
  }
  return $value.Trim()
}

$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

$sshHost = Require-EnvVar "SSH_HOST"
$sshUser = Require-EnvVar "SSH_USER"
$sshPort = Get-EnvVar "SSH_PORT" "22"
$appDir = Get-EnvVar "APP_DIR" "/var/www/encarparse.ozzy1986.com"
$gitRemoteUrl = Get-EnvVar "GIT_REMOTE_URL" "https://github.com/ozzy1986/encarparse.git"

$remote = "$sshUser@$sshHost"

if (Test-Path (Join-Path $root ".git")) {
  $branch = (& git rev-parse --abbrev-ref HEAD).Trim()
  if ($branch -ne "main") {
    throw "Deploy from main only. Current branch: $branch"
  }

  & git push origin main
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
} else {
  Write-Host "Local git repo not found. Skipping git push and deploying via remote pull only."
}

$remoteCmd = @"
set -eu
mkdir -p '$appDir'
cd '$appDir'
if [ ! -d .git ]; then git init -b main; fi
if ! git remote get-url origin >/dev/null 2>&1; then git remote add origin '$gitRemoteUrl'; fi
git fetch origin main
if ! git rev-parse --verify main >/dev/null 2>&1; then
  git checkout -t origin/main
else
  git checkout main
  git pull --ff-only origin main
fi
npm ci
npx prisma migrate deploy
npm run build
if pm2 describe encarparse >/dev/null 2>&1; then
  pm2 restart encarparse --update-env
else
  pm2 start ecosystem.config.cjs --only encarparse
fi
pm2 save
"@

# PowerShell here-strings are CRLF on Windows; strip CR to avoid bash parsing issues.
$remoteCmd = $remoteCmd -replace "`r", ""

& ssh -p $sshPort $remote $remoteCmd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "VPS deploy complete."

