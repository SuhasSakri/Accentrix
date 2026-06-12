@echo off
echo Starting Accentrix AI Pronunciation Coach...
echo.

echo [1/3] Starting AI Service (Python - Port 8000)...
start "Accentrix AI Service" cmd /k "cd ai-service && python main.py"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API (Node.js - Port 3001)...
start "Accentrix Backend" cmd /k "cd backend && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend (React - Port 5173)...
start "Accentrix Frontend" cmd /k "npm run dev"

echo.
echo ✅ All services starting in separate windows!
echo.
echo Once all services are running, open: http://localhost:5173
echo.
pause
