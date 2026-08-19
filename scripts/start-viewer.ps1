$ErrorActionPreference = 'Stop'

$viewerRoot = Split-Path -Parent $PSScriptRoot
$viewerUrl = 'http://localhost:4173/'
$serverTitle = 'ZhangFa local server - close this window to stop'

function Test-ZhangFaViewer {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $viewerUrl -TimeoutSec 1
        return $response.StatusCode -eq 200 -and $response.Content -match 'Novel Project Viewer'
    }
    catch {
        return $false
    }
}

try {
    Set-Location -LiteralPath $viewerRoot

    if (-not (Get-Command node.exe -ErrorAction SilentlyContinue)) {
        throw 'Node.js was not found. Install Node.js 22 or newer first.'
    }

    if (-not (Test-Path -LiteralPath (Join-Path $viewerRoot 'node_modules\vite\package.json'))) {
        Write-Host 'First launch: installing dependencies...' -ForegroundColor Yellow
        & npm.cmd install
        if ($LASTEXITCODE -ne 0) {
            throw 'Dependency installation failed.'
        }
    }

    if (-not (Test-ZhangFaViewer)) {
        $escapedRoot = $viewerRoot.Replace("'", "''")
        $serverCommand = "Set-Location -LiteralPath '$escapedRoot'; `$Host.UI.RawUI.WindowTitle='$serverTitle'; npm.cmd run dev -- --port 4173 --strictPort"
        Start-Process -FilePath 'powershell.exe' -ArgumentList @('-NoProfile', '-NoExit', '-Command', $serverCommand) -WindowStyle Minimized

        $ready = $false
        foreach ($attempt in 1..60) {
            Start-Sleep -Milliseconds 250
            if (Test-ZhangFaViewer) {
                $ready = $true
                break
            }
        }
        if (-not $ready) {
            throw 'The local server did not start within 15 seconds. Check the ZhangFa server window in the taskbar.'
        }
    }

    Start-Process $viewerUrl
    Write-Host "ZhangFa opened: $viewerUrl" -ForegroundColor Green
}
catch {
    Write-Host "Launch failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
