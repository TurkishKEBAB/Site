Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$canonicalStart = Join-Path $repoRoot 'portfolio-project\start.ps1'

if (-not (Test-Path $canonicalStart)) {
    throw "Canonical start script not found: $canonicalStart"
}

& $canonicalStart @args
