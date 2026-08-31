# Compatibility entry point. The idempotent implementation lives beside this file.

[CmdletBinding()]
param()

try {
    & (Join-Path $PSScriptRoot 'setup-roo-maven-fixed.ps1')
    exit 0
} catch {
    Write-Error $_
    exit 1
}
