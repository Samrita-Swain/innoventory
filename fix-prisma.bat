@echo off
echo Fixing Prisma client generation issues on Windows...

echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Cleaning up build artifacts...
if exist .next rmdir /s /q .next >nul 2>&1
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma >nul 2>&1

echo Waiting for file handles to release...
timeout /t 3 /nobreak >nul

echo Regenerating Prisma client...
npx prisma generate

if %errorlevel% equ 0 (
    echo Prisma client generated successfully!
    echo You can now run 'npm run dev' to start the development server.
) else (
    echo Prisma generation failed. Trying alternative approach...
    npm cache clean --force
    npx prisma generate
    if %errorlevel% equ 0 (
        echo Prisma client generated successfully on second attempt!
    ) else (
        echo Please run as Administrator or check file permissions.
    )
)

pause
