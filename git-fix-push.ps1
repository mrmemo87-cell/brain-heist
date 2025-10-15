<#
git-fix-push.ps1
Safe helper to fix "failed to push: tip of your current branch is behind remote".
What it does:
 - creates a local backup branch of your current state
 - fetches origin
 - attempts: git rebase origin/<branch>
 - if conflicts occur, prompts to accept "ours" (local) or "theirs" (remote) for conflicted files (backs them up first)
 - continues the rebase and pushes if successful

USAGE:
  ./git-fix-push.ps1
#>

function Info($m){ Write-Host $m -ForegroundColor Cyan }
function Ok($m){ Write-Host $m -ForegroundColor Green }
function Warn($m){ Write-Host $m -ForegroundColor Yellow }
function Err($m){ Write-Host $m -ForegroundColor Red }

try {
  Info "=== git-fix-push: safe rebase + push helper ==="

  # Ensure we're in a git repo
  git rev-parse --git-dir > $null 2>&1
  if ($LASTEXITCODE -ne 0) {
    Err "Not a git repository. Run this from your repo root."
    exit 1
  }

  $branch = git branch --show-current
  if (-not $branch) {
    Err "Unable to detect current branch."
    exit 1
  }
  Info "Current branch: $branch"

  # Backup branch
  $ts = Get-Date -Format "yyyyMMddHHmmss"
  $backupBranch = "backup_sync_${branch}_$ts"
  git branch $backupBranch
  if ($LASTEXITCODE -ne 0) {
    Warn "Could not create backup branch $backupBranch (it may already exist)."
  } else {
    Ok "Created local backup branch: $backupBranch"
  }

  Info "Fetching origin..."
  git fetch origin
  if ($LASTEXITCODE -ne 0) {
    Err "git fetch failed. Check network/remote and try again."
    exit 1
  }

  Info "Attempting rebase onto origin/$branch..."
  git rebase origin/$branch
  if ($LASTEXITCODE -eq 0) {
    Ok "Rebase succeeded. Pushing to origin/$branch..."
    git push origin $branch
    if ($LASTEXITCODE -eq 0) { Ok "Push successful. Done." } else { Err "Push failed after successful rebase. Inspect remote." }
    exit 0
  }

  Warn "Rebase reported conflicts or failed. Listing conflicted files..."
  $conflicts = git diff --name-only --diff-filter=U
  if (-not $conflicts) {
    Err "No conflicted files found but rebase failed. Run 'git status' to investigate."
    exit 1
  }

  Write-Host "Conflicted files:"
  $conflicts | ForEach-Object { Write-Host " - $_" }

  # Ask user what to do
  Write-Host ""
  Write-Host "Choose how to resolve all conflicts (applies the same choice to every conflicted file):"
  Write-Host "  1) Accept OURS (keep your local changes)"
  Write-Host "  2) Accept THEIRS (use the remote changes)"
  Write-Host "  3) Abort (leave everything as-is)"
  $choice = Read-Host "Enter 1, 2, or 3"

  if ($choice -eq '3') {
    Warn "Aborting rebase. You can manually resolve conflicts and run 'git rebase --continue' later."
    git rebase --abort 2>$null
    exit 0
  }

  # Backup each conflicted file, then apply resolution
  $bakts = Get-Date -Format "yyyyMMddHHmmss"
  foreach ($f in $conflicts) {
    if (Test-Path $f) {
      $bak = "$f.bak.$bakts"
      Copy-Item -Path $f -Destination $bak -Force
      Write-Host "Backed up $f -> $bak"
    }
    if ($choice -eq '1') {
      Info "Accepting OURS for: $f"
      git checkout --ours -- $f
      if ($LASTEXITCODE -ne 0) { Err "git checkout --ours failed on $f"; exit 1 }
    } elseif ($choice -eq '2') {
      Info "Accepting THEIRS for: $f"
      git checkout --theirs -- $f
      if ($LASTEXITCODE -ne 0) { Err "git checkout --theirs failed on $f"; exit 1 }
    } else {
      Err "Invalid choice. Aborting."
      git rebase --abort 2>$null
      exit 1
    }
    git add $f
    if ($LASTEXITCODE -ne 0) { Err "git add failed on $f"; exit 1 }
  }

  Info "All conflicted files resolved as per your choice. Continuing rebase..."
  git rebase --continue
  if ($LASTEXITCODE -ne 0) {
    Err "git rebase --continue failed. Check 'git status' and resolve manually."
    git status
    exit 1
  }

  Ok "Rebase finished. Now pushing to origin/$branch..."
  git push origin $branch
  if ($LASTEXITCODE -ne 0) {
    Err "Push failed after resolving conflicts. You may need to 'git pull --rebase' again or inspect remote."
    git status
    exit 1
  }

  Ok "Push succeeded. All done. Backup branch preserved as: $backupBranch"
  exit 0
}
catch {
  Err "Unexpected error: $_"
  exit 1
}
