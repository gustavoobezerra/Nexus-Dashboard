@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   Nexus Dashboard - Servidor Local
echo ========================================
echo.

REM Verifica se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: Python não está instalado ou não está no PATH
    echo.
    echo 📥 Instale Python 3.8+ em: https://www.python.org/downloads/
    echo ✅ Marque a opção "Add Python to PATH" durante a instalação
    pause
    exit /b 1
)

echo [1/4] Verificando ambiente virtual...
if not exist "venv\" (
    echo ⚠️  Ambiente virtual não encontrado. Criando...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erro ao criar ambiente virtual
        pause
        exit /b 1
    )
    echo ✅ Ambiente virtual criado!
)

echo.
echo [2/4] Ativando ambiente virtual...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erro ao ativar ambiente virtual
    pause
    exit /b 1
)

echo.
echo [3/4] Instalando/Verificando dependências...
pip install --quiet --upgrade pip
pip install --quiet flask flask-cors python-dotenv requests

echo.
echo [4/4] Iniciando servidor proxy Flask...
echo.
python proxy_server.py

pause
