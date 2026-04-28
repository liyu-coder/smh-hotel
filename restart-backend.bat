@echo off
echo Stopping any process on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    echo Killing process %%a
    taskkill /PID %%a /F 2>nul
)
timeout /t 2 /nobreak >nul
echo Starting backend...
cd backend
npm start
pause
