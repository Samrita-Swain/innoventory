# PowerShell script to fix Prisma generation issues on Windows
Write-Host "Fixing Prisma client generation issues on Windows..." -ForegroundColor Green

# Stop any running Node processes
Write-Host "Stopping Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Clean up problematic directories
Write-Host "Cleaning up build artifacts..." -ForegroundColor Yellow
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\.prisma" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "node_modules\@prisma\client" -ErrorAction SilentlyContinue

# Wait a moment for file handles to release
Start-Sleep -Seconds 2

# Set environment variables for Prisma
$env:PRISMA_QUERY_ENGINE_LIBRARY = ""
$env:PRISMA_QUERY_ENGINE_BINARY = ""
$env:PRISMA_SCHEMA_ENGINE_BINARY = ""
$env:PRISMA_INTROSPECTION_ENGINE_BINARY = ""
$env:PRISMA_FMT_BINARY = ""

# Regenerate Prisma client with verbose output
Write-Host "Regenerating Prisma client..." -ForegroundColor Yellow
npx prisma generate --verbose

if ($LASTEXITCODE -eq 0) {
    Write-Host "Prisma client generated successfully!" -ForegroundColor Green
    Write-Host "You can now run 'npm run dev' to start the development server." -ForegroundColor Green
} else {
    Write-Host "Prisma generation failed. Trying alternative approach..." -ForegroundColor Red
    
    # Try with different approach
    Write-Host "Trying with npm cache clean..." -ForegroundColor Yellow
    npm cache clean --force
    
    # Try again
    npx prisma generate --verbose
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Prisma client generated successfully on second attempt!" -ForegroundColor Green
    } else {
        Write-Host "Please run as Administrator or check file permissions." -ForegroundColor Red
    }
}
