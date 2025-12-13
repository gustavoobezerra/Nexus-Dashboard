@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Nexus Dashboard - Inicio Simples
echo ========================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: Python não está instalado
    echo.
    echo 📥 Baixe e instale Python em:
    echo    https://www.python.org/downloads/
    echo.
    echo ✅ IMPORTANTE: Marque "Add Python to PATH"
    pause
    exit /b 1
)

echo [1/2] Instalando dependências globais...
pip install --quiet flask flask-cors python-dotenv requests 2>nul
if errorlevel 1 (
    echo ⚠️  Tentando com --user...
    pip install --user --quiet flask flask-cors python-dotenv requests
)

echo.
echo [2/2] Iniciando servidor...
echo.
python proxy_server.py

pause
