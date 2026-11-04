# Portfolio hourly Git sync

- Purpose: back up local changes to the current branch upstream without changing the website or deployment settings.
- Schedule: every 1 hour while this Windows user is logged in; runs independently of Codex. A powered-off PC cannot run it. Missed starts run when available.
- Task: `Portfolio-Git-Auto-Sync` (Windows Task Scheduler).
- Script: `scripts/git-auto-sync.ps1`; repository defaults to the script parent.
- Manual: `Start-ScheduledTask -TaskName Portfolio-Git-Auto-Sync`.
- Dry run (from repository root): `& (Get-ScheduledTask -TaskName Portfolio-Git-Auto-Sync).Actions.Execute -NoProfile -NonInteractive -File (Join-Path $PWD "scripts/git-auto-sync.ps1") -DryRun`.
- The task uses the existing local PowerShell 7 runtime; system execution policy is unchanged. If that runtime is moved or removed, update the task executable. No running Codex session is required.
- Log: `.git/portfolio-scheduled-sync.log`; one rotated copy at 1 MB.
- Disable: `Disable-ScheduledTask -TaskName Portfolio-Git-Auto-Sync`
- Remove: `Unregister-ScheduledTask -TaskName Portfolio-Git-Auto-Sync -Confirm:$false`

No changes means no commit or push. Fetch failure, remote-ahead history, pending Git operation, existing staged work, suspected sensitive files, files above 25 MB, or 10 tracked deletions stop the run. Normal web assets are permitted; new office source documents/archives are blocked. The script uses existing Git credentials without interactive prompts, never stores credentials, never merges, resets, stashes, deletes work, or force pushes. Failed pushes can be retried on the next run. An exclusive per-repository Windows mutex prevents concurrent syncs. A quiet interval catches active edits but cannot coordinate editor saves transactionally; keep work you do not want published outside the repository or ignored. Suspected-content checks are heuristic, not a guarantee against disclosure in images or arbitrary documents. No additional notifications or deployment jobs are installed.

Git commands time out after 60 seconds and end their own child processes. Standard error is kept separate from filename output so line-ending warnings cannot be treated as files. The log records remote, safety and stability checks. Failed runs stop and retry on the next hourly schedule.
