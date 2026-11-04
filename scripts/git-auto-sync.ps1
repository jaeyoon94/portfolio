[CmdletBinding()]
param([string]$RepositoryPath = (Split-Path $PSScriptRoot -Parent), [switch]$DryRun)
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object Text.UTF8Encoding($false)
$OutputEncoding = [Console]::OutputEncoding
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'Never'
$env:GIT_LITERAL_PATHSPECS = '1'
$env:LC_ALL = 'C.UTF-8'
$syncMutex = $null
$ownsMutex = $false
$exitCode = 0
function Git([string[]]$Arguments) {
    $start = New-Object Diagnostics.ProcessStartInfo
    $start.FileName = (Get-Command git.exe).Source
    $start.UseShellExecute = $false
    $start.CreateNoWindow = $true
    $start.RedirectStandardOutput = $true
    $start.RedirectStandardError = $true
    $start.StandardOutputEncoding = [Text.Encoding]::UTF8
    $start.StandardErrorEncoding = [Text.Encoding]::UTF8
    foreach ($argument in (@('-C', $RepositoryPath) + $Arguments)) { $start.ArgumentList.Add($argument) }
    $process = New-Object Diagnostics.Process
    $process.StartInfo = $start
    try {
        [void]$process.Start()
        $output = $process.StandardOutput.ReadToEndAsync()
        $errorOutput = $process.StandardError.ReadToEndAsync()
        if (-not $process.WaitForExit(60000)) {
            $process.Kill($true)
            $process.WaitForExit()
            throw "SYNC FAILED - GIT TIMEOUT (60s): $($Arguments[0])"
        }
        $stdout = $output.GetAwaiter().GetResult()
        $stderr = $errorOutput.GetAwaiter().GetResult()
        if ($process.ExitCode -ne 0) {
            $reason = 'GIT ERROR'
            if ($stderr -match 'Authentication|could not read Username|403|401') { $reason = 'AUTHENTICATION ERROR' }
            elseif ($stderr -match 'resolve host|connect|SSL|timed out') { $reason = 'NETWORK ERROR' }
            throw "SYNC FAILED - $reason ($($Arguments[0]), exit $($process.ExitCode))"
        }
        # Keep diagnostics out of filename/ref output; never print credential/error contents.
        return $stdout.TrimEnd("`r", "`n")
    } finally { $process.Dispose() }
}

try {
    $RepositoryPath = (Resolve-Path -LiteralPath $RepositoryPath).Path
    $gitDir = Git @('rev-parse','--absolute-git-dir')
    $logPath = Join-Path $gitDir 'portfolio-scheduled-sync.log'
    function Log([string]$Message) {
        if ((Test-Path -LiteralPath $logPath) -and (Get-Item -LiteralPath $logPath).Length -gt 1MB) {
            Move-Item -LiteralPath $logPath -Destination ($logPath + '.1') -Force
        }
        $line = "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz') $Message"
        Add-Content -LiteralPath $logPath -Value $line -Encoding UTF8
        Write-Output $line
    }
    $hashProvider = [Security.Cryptography.SHA256]::Create()
    try { $lockId = [BitConverter]::ToString($hashProvider.ComputeHash([Text.Encoding]::UTF8.GetBytes($RepositoryPath.ToLowerInvariant()))).Replace('-','') } finally { $hashProvider.Dispose() }
    $syncMutex = New-Object Threading.Mutex($false, ('Local\PortfolioGitSync-' + $lockId))
    try { $ownsMutex = $syncMutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $ownsMutex = $true }
    if (-not $ownsMutex) { Write-Output 'SYNC BLOCKED - ALREADY RUNNING'; exit 0 }
    # Windows releases the mutex after process termination; no stale lock file remains.
    $branch = Git @('symbolic-ref','--short','HEAD')
    Log "START Branch=$branch DryRun=$DryRun"
    foreach ($marker in @('MERGE_HEAD','CHERRY_PICK_HEAD','REVERT_HEAD','rebase-merge','rebase-apply','index.lock')) {
        if (Test-Path -LiteralPath (Join-Path $gitDir $marker)) { throw 'SYNC BLOCKED - GIT OPERATION IN PROGRESS' }
    }
    $upstream = Git @('rev-parse','--abbrev-ref','@{upstream}')
    $remote = Git @('config','--get',"branch.$branch.remote")
    $remoteBranch = Git @('config','--get',"branch.$branch.merge")
    if ($remote -eq '.' -or -not $remoteBranch.StartsWith('refs/heads/')) { throw 'SYNC BLOCKED - INVALID UPSTREAM' }
    $remoteUrl = Git @('remote','get-url',$remote)
    if ($remoteUrl -match 'https?://[^/]+@') { throw 'SYNC BLOCKED - POSSIBLE SENSITIVE FILE: remote credentials' }
    Log 'REMOTE CHECK START'
    Git @('fetch','--quiet',$remote) | Out-Null
    Log 'REMOTE CHECK OK'
    $behind = [int](Git @('rev-list','--count',"HEAD..$upstream"))
    if ($behind -gt 0) { throw 'SYNC BLOCKED - REMOTE CONFLICT' }
    if (Git @('diff','--cached','--name-only')) { throw 'SYNC BLOCKED - EXISTING STAGED CHANGES' }
    # Match case exactly and preserve spaces/non-ASCII names. Git emits one path per line here.
    $env:GIT_CONFIG_COUNT = '1'; $env:GIT_CONFIG_KEY_0 = 'core.quotepath'; $env:GIT_CONFIG_VALUE_0 = 'false'
    $tracked = Git @('diff','--name-only','HEAD','--')
    $untracked = Git @('ls-files','--others','--exclude-standard')
    $paths = @((($tracked + "`n" + $untracked) -split "`n") | Where-Object { $_ } | Sort-Object -Unique)
    $ahead = [int](Git @('rev-list','--count',"$upstream..HEAD"))
    if ($paths.Count -eq 0 -and $ahead -eq 0) { Log 'NO CHANGES'; exit 0 }
    function CheckFiles {
        $deleted = @((Git @('diff','--name-only','--diff-filter=D','HEAD','--')) -split "`n" | Where-Object { $_ })
        if ($deleted.Count -ge 10) { throw 'SYNC BLOCKED - MASS DELETION DETECTED' }
        foreach ($relative in $paths) {
            if ($relative -match '[\r\n]' -or $relative -match '(^|/)(\.env($|\.)|credentials?[^/]*|secrets?[^/]*|service[-_]?account[^/]*|id_rsa|id_ed25519|config\.local[^/]*|local\.config[^/]*|node_modules|dist|build|\.cache|\.vscode|\.idea)(/|$)' -or $relative -match '\.(pem|key|pfx|p12|tmp|temp|log|bak|zip|psd|pptx|docx|xlsx|mp4|mov)$') {
                throw "SYNC BLOCKED - POSSIBLE SENSITIVE FILE: $relative"
            }
            $full = Join-Path $RepositoryPath $relative
            if (-not (Test-Path -LiteralPath $full -PathType Leaf)) { continue }
            if ((Get-Item -LiteralPath $full).Length -gt 25MB) { throw "SYNC BLOCKED - LARGE FILE: $relative" }
            if ($relative -match '\.(html|css|js|cjs|mjs|json|md|txt|ps1|yml|yaml|toml|svg)$' -or $relative -eq '.gitignore') {
                $text = [IO.File]::ReadAllText($full)
                # Do not print matching content: log path and reason only.
                $secretPatterns = @('gh[pousr]_[A-Za-z0-9]{30,}', 'github_pat_[A-Za-z0-9_]{40,}', 'AKIA[0-9A-Z]{16}', '-----BEGIN (RSA |OPENSSH |EC )?PRIVATE KEY-----', '(?i)(api[_-]?key|access[_-]?token|password|client[_-]?secret)\s*[=:]\s*["''][A-Za-z0-9_./+=-]{16,}["'']', '(?i)https?://(?:localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(?:1[6-9]|2\d|3[01])\.\d+\.\d+|[^/\s"'']+\.(?:local|internal))(?=[:/\s"''])', '(?i)[A-Z]:[\\/]+Users[\\/]+[^\\/\s"'']+')
                foreach ($pattern in $secretPatterns) { if ($text -match $pattern) { throw "SYNC BLOCKED - POSSIBLE SENSITIVE FILE: $relative" } }
            }
        }
        # Also inspect local commits left over after an earlier failed push.
        if ($ahead -gt 0) {
            $outgoing = Git @('log','--format=','--name-only',"$upstream..HEAD")
            if ($outgoing -match '(?im)(^|/)(\.env($|\.)|credentials?[^/]*|secrets?[^/]*|service[-_]?account[^/]*)(/|$)|\.(pem|key|pfx|p12)$') { throw 'SYNC BLOCKED - POSSIBLE SENSITIVE FILE IN OUTGOING COMMIT' }
        }
    }
    Log 'SAFETY CHECK START'
    CheckFiles
    Log 'SAFETY CHECK OK'
    # Require a stable full working-tree snapshot and a quiet interval. Never lock or rewrite editor files.
    function FileHash([string]$full) {
        $stream = [IO.File]::OpenRead($full)
        $sha = [Security.Cryptography.SHA256]::Create()
        try { return [BitConverter]::ToString($sha.ComputeHash($stream)) } finally { $sha.Dispose(); $stream.Dispose() }
    }
    function Snapshot {
        $status = Git @('status','--porcelain','--untracked-files=all')
        $lines = foreach ($relative in $paths) {
            $full = Join-Path $RepositoryPath $relative
            if (Test-Path -LiteralPath $full -PathType Leaf) { "$relative $(FileHash $full)" } else { "$relative DELETED" }
        }
        return $status + ($lines -join "`n")
    }
    Log 'STABILITY CHECK START'
    $before = Snapshot
    Start-Sleep -Seconds 5
    if ($before -cne (Snapshot)) { throw 'SYNC BLOCKED - FILES CHANGING' }
    Log "CHANGES Files=$($paths.Count) Ahead=$ahead Upstream=$upstream"
    if ($DryRun) { Log 'DRY RUN PASS - WOULD COMMIT CHANGES AND PUSH TO EXISTING UPSTREAM'; exit 0 }
    if ($paths.Count -gt 0) {
        Git @('add','-A','--') | Out-Null
        # Detect edits during staging; leave staged content intact for inspection if interrupted.
        CheckFiles
        if ((Git @('diff','--name-only','--')) -or (Git @('ls-files','--others','--exclude-standard'))) { throw 'SYNC BLOCKED - FILES CHANGED DURING STAGING' }
        if (Git @('diff','--cached','--name-only')) {
            Git @('commit','-m',('chore: portfolio auto-sync ' + (Get-Date -Format 'yyyy-MM-dd HH:mm:ss zzz'))) | Out-Null
            Log ('COMMIT OK ' + (Git @('rev-parse','HEAD')))
        }
    }
    # Fetch once more to reject races with remote updates. Never merge/rebase/force.
    Git @('fetch','--quiet',$remote) | Out-Null
    if ([int](Git @('rev-list','--count',"HEAD..$upstream")) -gt 0) { throw 'SYNC BLOCKED - REMOTE CONFLICT' }
    if ([int](Git @('rev-list','--count',"$upstream..HEAD")) -gt 0) {
        Git @('push','--porcelain',$remote,"HEAD:$remoteBranch") | Out-Null
        $head = Git @('rev-parse','HEAD')
        $remoteHead = (Git @('ls-remote','--heads',$remote,$remoteBranch)) -split '\s+'
        if ($remoteHead[0] -ne $head) { throw 'REMOTE VERIFICATION FAILED' }
        Log "PUSH OK Verified=$head"
    } else { Log 'NO CHANGES' }
} catch {
    $exitCode = 1
    if (Get-Command Log -ErrorAction SilentlyContinue) { Log $_.Exception.Message } else { Write-Output 'SYNC FAILED - repository unavailable' }
} finally {
    if ($null -ne $syncMutex) { if ($ownsMutex) { $syncMutex.ReleaseMutex() }; $syncMutex.Dispose() }
}
exit $exitCode
