# export_mcp_nordstrom.ps1
# PowerShell script to zip and export your entire mcp-nordstrom backend workspace

$source = "c:\Users\sethp\Downloads\mcp-nordstrom"
$dest = "c:\Users\sethp\Desktop\mcp-nordstrom-backup.zip"

if (Test-Path $dest) { Remove-Item $dest }
Compress-Archive -Path "$source\*" -DestinationPath $dest
Write-Host "Exported mcp-nordstrom to $dest"
