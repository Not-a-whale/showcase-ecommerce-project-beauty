param(
  [switch]$DryRun
)

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

$apiCmd = "Set-Location '$repoRoot'; npx nx run api:serve"
$paymentCmd = "Set-Location '$repoRoot'; `$env:PORT='3001'; npx nx run @ecommerce/payment:serve"

if ($DryRun) {
  Write-Host "API cmd: $apiCmd"
  Write-Host "Payment cmd: $paymentCmd"
  exit 0
}

Start-Process powershell -ArgumentList @('-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $apiCmd)
Start-Sleep -Seconds 1
Start-Process powershell -ArgumentList @('-NoExit', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', $paymentCmd)

Write-Host "Started services in two terminal windows:"
Write-Host "- API: http://localhost:3000/api/health"
Write-Host "- Payment: http://localhost:3001/api/health"

