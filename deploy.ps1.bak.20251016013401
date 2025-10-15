<#
  deploy.ps1
  - Adds, commits, pushes to current branch
  - Optionally calls `vercel --prod` if you have VERCEL_TOKEN set.
  - Usage: ./deploy.ps1 -Message "my commit message"
#>

param(
  [string]$Message = "deploy: quick update",
  [switch]$SkipPush = $false,
  [switch]$VercelDeploy = $false
)

Write-Host "Running safe deploy script..." -ForegroundColor Cyan

# show git status first
git status --porcelain
if ($LASTEXITCODE -ne 0) {
  Write-Host "git status failed. Are you in a git repo?" -ForegroundColor Red
  exit 1
}

# Confirm
$y = Read-Host "Proceed to add, commit, and push? (y/N)"
if ($y -ne 'y') {
  Write-Host "Aborting." -ForegroundColor Yellow
  exit 0
}

git add -A
git commit -m $Message
if ($LASTEXITCODE -ne 0) {
  Write-Host "Nothing to commit or commit failed. Continuing..." -ForegroundColor Yellow
}

if (-not $SkipPush) {
  git push
  if ($LASTEXITCODE -ne 0) {
    Write-Host "git push failed. Fix and retry." -ForegroundColor Red
    exit 1
  }
  Write-Host "Pushed to remote." -ForegroundColor Green
}

if ($VercelDeploy) {
  if (-not $env:VERCEL_TOKEN) {
    Write-Host "VERCEL_TOKEN not found in environment. Set VERCEL_TOKEN and retry." -ForegroundColor Red
    exit 1
  }
  # install vercel if missing
  if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Vercel CLI not found. Installing..."
    npm i -g vercel
  }
  Write-Host "Running vercel --prod..."
  vercel --prod --confirm
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Vercel deploy failed." -ForegroundColor Red
    exit 1
  }
  Write-Host "Deployed to Vercel." -ForegroundColor Green
}

Write-Host "Done. If you pushed, Vercel (if linked) will auto-deploy on push (if configured)." -ForegroundColor Green
