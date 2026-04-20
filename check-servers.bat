@echo off
echo Checking servers...
echo.

echo [1] Checking Backend (port 5000)...
curl -s http://localhost:5000 >nul 2>&1
if %errorlevel% == 0 (
  echo     Backend: RUNNING
) else (
  echo     Backend: NOT RUNNING - Start with: cd backend ^&^& npm start
)

echo.
echo [2] Checking Frontend (port 5174)...
curl -s http://localhost:5174 >nul 2>&1
if %errorlevel% == 0 (
  echo     Frontend: RUNNING
) else (
  echo     Frontend: NOT RUNNING - Start with: npm run dev
)

echo.
pause
