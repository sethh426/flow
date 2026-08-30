param(
  [string]$Root,
  [switch]$Check
)

$ErrorActionPreference = 'Stop'

if ([string]::IsNullOrWhiteSpace($Root)) {
  $Root = Join-Path $PSScriptRoot '../..'
}

$excludedDirectories = @(
  '.git', 'node_modules', '.next', 'out', 'dist', 'build', 'target',
  '.firebase', '.venv', 'venv', '__pycache__'
)

$binaryExtensions = @(
  '.7z', '.aac', '.avi', '.bmp', '.class', '.dll', '.doc', '.docx', '.eot',
  '.exe', '.gif', '.gz', '.ico', '.jar', '.jpeg', '.jpg', '.m4a', '.mov',
  '.mp3', '.mp4', '.otf', '.pdf', '.png', '.ppt', '.pptx', '.pyc', '.so',
  '.tar', '.tgz', '.ttf', '.wav', '.webm', '.webp', '.woff', '.woff2', '.xls',
  '.xlsx', '.zip'
)

$rules = @(
  @{ Name = 'Google API key'; Pattern = 'AIza[0-9A-Za-z_-]{25,}'; Replacement = 'REDACTED_GOOGLE_API_KEY' },
  @{ Name = 'OpenAI API key'; Pattern = 'sk-(?:proj-)?[0-9A-Za-z_-]{20,}'; Replacement = 'REDACTED_OPENAI_API_KEY' },
  @{ Name = 'Anthropic API key'; Pattern = 'sk-ant-[0-9A-Za-z_-]{20,}'; Replacement = 'REDACTED_ANTHROPIC_API_KEY' },
  @{ Name = 'GitHub token'; Pattern = '(?:ghp_[0-9A-Za-z]{20,}|github_pat_[0-9A-Za-z_]{20,})'; Replacement = 'REDACTED_GITHUB_TOKEN' },
  @{ Name = 'Slack token'; Pattern = 'xox[baprs]-[0-9A-Za-z-]{10,}'; Replacement = 'REDACTED_SLACK_TOKEN' },
  @{ Name = 'Apify API token'; Pattern = 'apify_api_[0-9A-Za-z]{20,}'; Replacement = 'REDACTED_APIFY_API_TOKEN' },
  @{ Name = 'Google OAuth refresh token'; Pattern = '1//[0-9A-Za-z_-]{20,}'; Replacement = 'REDACTED_GOOGLE_OAUTH_REFRESH_TOKEN' },
  @{ Name = 'AWS access key'; Pattern = '(?:AKIA|ASIA)[0-9A-Z]{16}'; Replacement = 'REDACTED_AWS_ACCESS_KEY' },
  @{ Name = 'PEM private key'; Pattern = '(?s)-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----.*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'; Replacement = 'REDACTED_PRIVATE_KEY' },
  @{ Name = 'JSON private key'; Pattern = '(?i)("private_key"\s*:\s*)"(?:[^"\\]|\\.)*"'; Replacement = '$1"REDACTED_PRIVATE_KEY"' },
  @{ Name = 'Hard-coded secret assignment'; Pattern = '(?im)(?<prefix>(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*)(?<quote>["''])(?<value>[^"''\r\n]{16,})\k<quote>'; Replacement = '${prefix}${quote}REDACTED_SECRET${quote}' }
)

$rootPath = (Resolve-Path -LiteralPath $Root).Path
$changedFiles = [System.Collections.Generic.List[string]]::new()
$remainingFindings = [System.Collections.Generic.List[string]]::new()

$files = @()
$gitDirectory = Join-Path $rootPath '.git'
if ((Test-Path -LiteralPath $gitDirectory) -and (Get-Command git -ErrorAction SilentlyContinue)) {
  Push-Location $rootPath
  try {
    $relativePaths = @(git ls-files --cached --others --exclude-standard)
  } finally {
    Pop-Location
  }
  $files = @($relativePaths | ForEach-Object {
    $candidate = Join-Path $rootPath $_
    if (Test-Path -LiteralPath $candidate -PathType Leaf) {
      Get-Item -LiteralPath $candidate
    }
  })
} else {
  $files = @(Get-ChildItem -LiteralPath $rootPath -Recurse -File -Force)
}

$files = @($files | Where-Object {
  $relative = $_.FullName.Substring($rootPath.Length).TrimStart(
    [char[]]@([IO.Path]::DirectorySeparatorChar, [IO.Path]::AltDirectorySeparatorChar)
  )
  $segments = $relative -split '[\\/]'
  -not ($segments | Where-Object { $excludedDirectories -contains $_ }) -and
  -not ($binaryExtensions -contains $_.Extension.ToLowerInvariant())
})

foreach ($file in $files) {
  try {
    $content = [IO.File]::ReadAllText($file.FullName)
  } catch {
    continue
  }

  if ($content.Contains([char]0)) {
    continue
  }

  $updated = $content
  foreach ($rule in $rules) {
    $updated = [regex]::Replace($updated, $rule.Pattern, $rule.Replacement)
  }

  if ($updated -cne $content) {
    if ($Check) {
      $remainingFindings.Add($file.FullName.Substring($rootPath.Length + 1))
    } else {
      [IO.File]::WriteAllText($file.FullName, $updated, [Text.UTF8Encoding]::new($false))
      $changedFiles.Add($file.FullName.Substring($rootPath.Length + 1))
    }
  }
}

if ($Check) {
  if ($remainingFindings.Count -gt 0) {
    Write-Error ("Potential secrets remain in {0} files:`n{1}" -f $remainingFindings.Count, ($remainingFindings -join "`n"))
  }
  Write-Output 'Secret-pattern check passed.'
  exit 0
}

Write-Output ("Sanitized {0} files." -f $changedFiles.Count)
$changedFiles | Sort-Object
