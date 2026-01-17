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
echo    [4] RPG Snake
echo    [5] RPG Breakout
echo    [6] Teddy Coaster
echo    [7] Arm Wrestling
echo    [8] Basketball Toss
echo    [9] Shooting Gallery
echo    [10] Submarine Adventure
echo    [11] Flappy Teddy
echo    [12] Jump Rope
echo    [13] Batting Cage
echo    [14] Honey Catch
echo    [15] Beach Ball
echo    [16] Treasure Dig
echo    [17] Honey Fishing
echo    [18] Honey Grid
echo    [19] Cook-Off
echo    [20] Chinchirorin
echo    [21] Exit
echo.
echo  ================================
echo.

set /p choice="  Enter your choice (1-21): "

if "%choice%"=="1" (
    start "" http://localhost:8000/menu.html
) else if "%choice%"=="2" (
    start "" http://localhost:8000/ultimate-tictactoe.html
) else if "%choice%"=="3" (
    start "" http://localhost:8000/tower-defense.html
) else if "%choice%"=="4" (
    start "" http://localhost:8000/snake.html
) else if "%choice%"=="5" (
    start "" http://localhost:8000/breakout.html
) else if "%choice%"=="6" (
    start "" http://localhost:8000/teddy-coaster.html
) else if "%choice%"=="7" (
    start "" http://localhost:8000/arm-wrestling/arm-wrestling.html
) else if "%choice%"=="8" (
    start "" http://localhost:8000/basketball/basketball.html
) else if "%choice%"=="9" (
    start "" http://localhost:8000/shooting-gallery/shooting-gallery.html
) else if "%choice%"=="10" (
    start "" http://localhost:8000/submarine/submarine.html
) else if "%choice%"=="11" (
    start "" http://localhost:8000/flappy-teddy/flappy-teddy.html
) else if "%choice%"=="12" (
    start "" http://localhost:8000/jump-rope/jump-rope.html
) else if "%choice%"=="13" (
    start "" http://localhost:8000/batting-cage/batting-cage.html
) else if "%choice%"=="14" (
    start "" http://localhost:8000/honey-catch/honey-catch.html
) else if "%choice%"=="15" (
    start "" http://localhost:8000/beach-ball/beach-ball.html
) else if "%choice%"=="16" (
    start "" http://localhost:8000/treasure-dig/treasure-dig.html
) else if "%choice%"=="17" (
    start "" http://localhost:8000/fishing/fishing.html
) else if "%choice%"=="18" (
    start "" http://localhost:8000/honey-grid/honey-grid.html
) else if "%choice%"=="19" (
    start "" http://localhost:8000/cook-off/cook-off.html
) else if "%choice%"=="20" (
    start "" http://localhost:8000/chinchirorin/chinchirorin.html
) else if "%choice%"=="21" (
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
