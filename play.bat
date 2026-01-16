@echo off
title TDR Game Collection
color 0A

echo.
echo  ================================
echo      TDR GAME COLLECTION
echo  ================================
echo.
echo  Starting local server...
echo.

:: Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    python3 --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo  ERROR: Python is not installed!
        echo  Please install Python from python.org
        echo.
        echo  Alternatively, you can open tower-defense.html
        echo  directly in your browser - it works without a server.
        echo.
        pause
        exit /b 1
    )
    set PYTHON_CMD=python3
) else (
    set PYTHON_CMD=python
)

:: Start the server in the background
echo  Starting server on http://localhost:8000
echo.
echo  ================================
echo    GAME MENU
echo  ================================
echo.
echo    [1] Open Game Menu (all games)
echo    [2] Ultimate Tic Tac Toe
echo    [3] Tower Defense
echo    [4] Exit
echo.
echo  ================================
echo.

set /p choice="  Enter your choice (1-4): "

if "%choice%"=="1" (
    start "" http://localhost:8000/menu.html
) else if "%choice%"=="2" (
    start "" http://localhost:8000/ultimate-tictactoe.html
) else if "%choice%"=="3" (
    start "" http://localhost:8000/tower-defense.html
) else if "%choice%"=="4" (
    echo  Goodbye!
    exit /b 0
) else (
    echo  Invalid choice, opening menu...
    start "" http://localhost:8000/menu.html
)

echo.
echo  Opening browser...
echo  Server running at http://localhost:8000
echo.
echo  Press Ctrl+C to stop the server when done.
echo.

%PYTHON_CMD% -m http.server 8000
