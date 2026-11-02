# Portfolio hourly Git sync

- Purpose: back up local changes to the current branch upstream without changing the website or deployment settings.
- Schedule: every 1 hour while this Windows user is logged in; runs independently of Codex. A powered-off PC cannot run it. Missed starts run when available.
- Task: `Portfolio-Git-Auto-Sync` (Windows Task Scheduler).
- Script: `scripts/git-auto-sync.ps1`; repository defaults to the script parent.
- Manual (from repository root): `& ([scriptblock]::Create([IO.File]::ReadAllText((Join-Path $PWD "scripts/git-auto-sync.ps1")))) -RepositoryPath $PWD`
- Dry run: append `-DryRun` to the manual command. The scheduled action uses the same inline loader with absolute repository arguments; it does not change system execution policy.
- Log: `.git/portfolio-scheduled-sync.log`; one rotated copy at 1 MB.
- Disable: `Disable-ScheduledTask -TaskName Portfolio-Git-Auto-Sync`
- Remove: `Unregister-ScheduledTask -TaskName Portfolio-Git-Auto-Sync -Confirm:$false`

No changes means no commit or push. Fetch failure, remote-ahead history, pending Git operation, existing staged work, suspected sensitive files, files above 25 MB, or 10 tracked deletions stop the run. Normal web assets are permitted; new office source documents/archives are blocked. The script uses existing Git credentials without interactive prompts, never stores credentials, never merges, resets, stashes, deletes work, or force pushes. Failed pushes can be retried on the next run. An exclusive per-repository Windows mutex prevents concurrent syncs. A quiet interval catches active edits but cannot coordinate editor saves transactionally; keep work you do not want published outside the repository or ignored. Suspected-content checks are heuristic, not a guarantee against disclosure in images or arbitrary documents. No additional notifications or deployment jobs are installed.
