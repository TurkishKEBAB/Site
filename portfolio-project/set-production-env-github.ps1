param(
    [string]$Repo = "",
    [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

function Require-Command {
    param([string]$Name)
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' not found."
    }
}

function Read-SecretValue {
    param([string]$Key)

    $envValue = [Environment]::GetEnvironmentVariable($Key)
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    $secureValue = Read-Host -Prompt "$Key" -AsSecureString
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
    try {
        return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    } finally {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
    }
}

function Read-VariableValue {
    param([string]$Key)

    $envValue = [Environment]::GetEnvironmentVariable($Key)
    if (-not [string]::IsNullOrWhiteSpace($envValue)) {
        return $envValue
    }

    return (Read-Host -Prompt $Key)
}

function Assert-HttpsNoTrailingSlash {
    param(
        [string]$Key,
        [string]$Value
    )

    if (-not $Value.StartsWith("https://")) {
        throw "$Key must start with https://"
    }
    if ($Value.EndsWith("/")) {
        throw "$Key must not end with '/'"
    }
}

Require-Command gh

$authStatus = & gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI auth is not valid. Run: gh auth login -h github.com"
}

$secretKeys = @(
    "RAILWAY_PRODUCTION_MIGRATION_HOOK_URL",
    "RAILWAY_PRODUCTION_DEPLOY_HOOK_URL",
    "VERCEL_TOKEN",
    "VERCEL_ORG_ID",
    "VERCEL_PROJECT_ID",
    "PRODUCTION_SMOKE_ADMIN_EMAIL",
    "PRODUCTION_SMOKE_ADMIN_PASSWORD"
)

$variableKeys = @(
    "PRODUCTION_API_ROOT_URL",
    "PRODUCTION_FRONTEND_URL"
)

$repoArgs = @()
if (-not [string]::IsNullOrWhiteSpace($Repo)) {
    $repoArgs += @("--repo", $Repo)
}

Write-Host "Setting environment secrets for '$Environment'..."
foreach ($key in $secretKeys) {
    $value = Read-SecretValue -Key $key
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$key cannot be empty."
    }

    & gh secret set $key --env $Environment @repoArgs --body $value
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set secret: $key"
    }
}

Write-Host "Setting environment variables for '$Environment'..."
foreach ($key in $variableKeys) {
    $value = Read-VariableValue -Key $key
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "$key cannot be empty."
    }

    Assert-HttpsNoTrailingSlash -Key $key -Value $value

    & gh variable set $key --env $Environment @repoArgs --body $value
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to set variable: $key"
    }
}

Write-Host "Production environment keys are configured successfully."
