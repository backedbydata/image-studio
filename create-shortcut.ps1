# PowerShell script to create a Windows shortcut for Image Studio
# Run this script to create a shortcut that can be pinned to the taskbar

$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$vbsPath = Join-Path $projectPath "launch-image-studio.vbs"
$iconPath = Join-Path $projectPath "resources\icon.ico"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Image Studio.lnk"

# Create WScript.Shell object
$shell = New-Object -ComObject WScript.Shell

# Create the shortcut
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$vbsPath`""
$shortcut.WorkingDirectory = $projectPath
$shortcut.WindowStyle = 1
$shortcut.Description = "Image Studio - Professional Image Resizing & Cropping"

# Set icon if it exists
if (Test-Path $iconPath) {
    $shortcut.IconLocation = $iconPath
    Write-Host "Icon set to: $iconPath" -ForegroundColor Green
} else {
    Write-Host "Icon not found at: $iconPath" -ForegroundColor Yellow
    Write-Host "The shortcut will use the default icon." -ForegroundColor Yellow
}

# Save the shortcut
$shortcut.Save()

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "Shortcut Created Successfully!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Location: $shortcutPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "TO PIN TO TASKBAR:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Find 'Image Studio.lnk' on your desktop" -ForegroundColor White
Write-Host "  2. Drag it to your taskbar" -ForegroundColor White
Write-Host "     OR" -ForegroundColor Gray
Write-Host "  2. Right-click it -> Show more options -> Pin to taskbar" -ForegroundColor White
Write-Host ""
Write-Host "NOTE: Windows 11 may hide the Pin to taskbar option." -ForegroundColor Yellow
Write-Host "      Just drag the shortcut to the taskbar instead!" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Try to open the desktop folder so user can see the shortcut
Start-Process $desktopPath
